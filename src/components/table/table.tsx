"use client";

import { useEffect, useRef, useState } from "react";
import { Deck } from "@/components/cards/deck";
import { Hand } from "@/components/cards/hand";
import { ChipFlight } from "@/components/chips/chip-flight";
import { ChipStack } from "@/components/chips/chip-stack";
import { Board } from "@/components/table/board";
import { dealSchedule } from "@/components/table/deal-schedule";
import { Pot } from "@/components/table/pot";
import { Seat } from "@/components/table/seat";
import {
  deckPosition,
  type Point,
  seatPositions,
  type TableShape,
  tableShape,
} from "@/components/table/seat-positions";
import { Timer } from "@/components/table/timer";
import type { TableView } from "@/dev/view-types";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { useCardLook } from "@/store/useCardSkinStore";

type Props = { view: TableView; animateDeal?: boolean };

type Flight = {
  id: number;
  kind: "collect" | "payout";
  amount: number;
  from: Point;
  to: Point;
};

const BOX: Record<TableShape, string> = {
  chamfer: "aspect-square max-w-xl sm:aspect-[4/3]",
  round: "aspect-[4/5] max-w-3xl sm:aspect-[16/10]",
  stadium: "aspect-[3/4] max-w-4xl sm:aspect-[16/9]",
  halfmoon: "aspect-[4/5] max-w-3xl sm:aspect-[28/15]",
};

const DEAL_STEP = 0.16;
const POT_POINT: Point = { x: 50, y: 36 };

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

function toward(from: Point, to: Point, amount: number): Point {
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
  };
}

function layout(view: TableView) {
  const count = view.seats.length;
  const shape = tableShape(view.game, count);
  const slots = seatPositions(shape, count);
  const viewer = Math.max(
    view.seats.findIndex((s) => s.seat === view.you.seat),
    0,
  );
  const anchor = shape === "halfmoon" ? Math.floor(count / 2) : 0;
  const focus: Point =
    shape === "halfmoon" ? { x: 50, y: 40 } : { x: 50, y: 50 };
  const slotOf = (i: number) => slots[(i - viewer + anchor + count) % count];
  const betOf = (i: number) => toward(slotOf(i), focus, 0.32);
  return { shape, slotOf, betOf };
}

function flightsBetween(
  before: TableView,
  now: TableView,
  nextId: () => number,
): Flight[] {
  if (before.seats.length !== now.seats.length) return [];
  const { betOf, slotOf } = layout(now);
  const potBefore = sum(before.pots);
  const potNow = sum(now.pots);
  const flights: Flight[] = [];
  if (potNow > potBefore) {
    now.seats.forEach((seat, i) => {
      const bet = before.seats[i].bet;
      if (bet > 0 && seat.bet === 0) {
        flights.push({
          id: nextId(),
          kind: "collect",
          amount: bet,
          from: betOf(i),
          to: POT_POINT,
        });
      }
    });
  }
  if (potBefore > 0 && potNow === 0) {
    const gains = now.seats.map(
      (seat, i) => seat.stack - before.seats[i].stack,
    );
    const winner = gains.indexOf(Math.max(...gains));
    if (gains[winner] > 0) {
      flights.push({
        id: nextId(),
        kind: "payout",
        amount: potBefore,
        from: POT_POINT,
        to: slotOf(winner),
      });
    }
  }
  return flights;
}

const percent = (p: Point) => ({ left: `${p.x}%`, top: `${p.y}%` });

export function Table({ view, animateDeal = false }: Props) {
  const t = useT();
  const look = useCardLook(view.boardSkinId, view.boardBackId);
  const { shape, slotOf, betOf } = layout(view);
  const deck = deckPosition(shape);
  const deckRef = useRef<HTMLDivElement>(null);
  const dealFrom = animateDeal ? deckRef : undefined;
  const [schedule] = useState(() => dealSchedule(view, DEAL_STEP));

  const previous = useRef(view);
  const ids = useRef(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  useEffect(() => {
    const before = previous.current;
    previous.current = view;
    if (before === view) return;
    const next = flightsBetween(before, view, () => ++ids.current);
    if (next.length > 0) setFlights((current) => [...current, ...next]);
  }, [view]);

  return (
    <div className="mx-auto w-full px-10 py-14 sm:px-8 sm:py-12">
      <div
        data-shape={shape}
        className={cn("table relative mx-auto w-full", BOX[shape])}
      >
        <div className="table-rim" />
        <div className="table-felt felt-surface" />
        <div className="table-line" />
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={percent(deck)}
        >
          <Deck ref={deckRef} />
        </div>
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center gap-3",
            shape === "halfmoon" ? "justify-start pt-[7%]" : "justify-center",
          )}
        >
          {view.game === "poker" ? (
            <>
              <Pot pots={view.pots} />
              <Board
                cards={view.board}
                skin={look.skin}
                back={look.back}
                faceDown
                dealFrom={dealFrom}
                dealDelays={schedule.board}
              />
            </>
          ) : (
            <Hand
              cards={view.board}
              skin={look.skin}
              back={look.back}
              dealFrom={dealFrom}
              dealDelays={schedule.board}
            />
          )}
          <Timer secondsLeft={view.secondsLeft} />
        </div>
        {view.seats.map((seat, i) => {
          if (seat.bet <= 0) return null;
          return (
            <div
              key={`bet-${seat.seat}-${seat.bet}`}
              role="img"
              aria-label={t("seat.bet", { name: seat.name })}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={percent(betOf(i))}
            >
              <ChipStack amount={seat.bet} />
            </div>
          );
        })}
        {view.seats.map((seat, i) => (
          <div
            key={seat.seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={percent(slotOf(i))}
          >
            <Seat
              seat={seat}
              isYou={view.you.seat === seat.seat}
              dealFrom={dealFrom}
              dealDelays={schedule.seats[i]}
            />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-0">
          {flights.map((flight) => (
            <FlightAt
              key={flight.id}
              flight={flight}
              onDone={() =>
                setFlights((current) =>
                  current.filter((f) => f.id !== flight.id),
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FlightAt({ flight, onDone }: { flight: Flight; onDone: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  useEffect(() => {
    const parent = box.current?.parentElement;
    setSize({
      width: parent?.clientWidth ?? 0,
      height: parent?.clientHeight ?? 0,
    });
  }, []);
  const px = (p: Point) => ({
    x: ((size?.width ?? 0) * p.x) / 100,
    y: ((size?.height ?? 0) * p.y) / 100,
  });
  return (
    <div ref={box} className="absolute inset-0">
      {size && (
        <ChipFlight
          kind={flight.kind}
          amount={flight.amount}
          from={px(flight.from)}
          to={px(flight.to)}
          onComplete={onDone}
        />
      )}
    </div>
  );
}
