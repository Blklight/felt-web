"use client";

import useMeasure from "react-use-measure";
import { Deck } from "@/components/cards/deck";
import { Hand } from "@/components/cards/hand";
import { ChipStack } from "@/components/chips/chip-stack";
import { Board } from "@/components/table/board";
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

const BOX: Record<TableShape, string> = {
  chamfer: "aspect-square max-w-xl sm:aspect-[4/3]",
  round: "aspect-[4/5] max-w-3xl sm:aspect-[16/10]",
  stadium: "aspect-[3/4] max-w-4xl sm:aspect-[16/9]",
  halfmoon: "aspect-[4/5] max-w-3xl sm:aspect-[28/15]",
};

function toward(from: Point, to: Point, amount: number): Point {
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
  };
}

export function Table({ view, animateDeal = false }: Props) {
  const t = useT();
  const [boxRef, bounds] = useMeasure();
  const width = bounds.width || 640;
  const height = bounds.height || 360;
  const look = useCardLook(view.boardSkinId, view.boardBackId);
  const count = view.seats.length;
  const shape = tableShape(view.game, count);
  const slots = seatPositions(shape, count);
  const viewer = view.seats.findIndex((s) => s.seat === view.you.seat);
  const anchor = shape === "halfmoon" ? Math.floor(count / 2) : 0;
  const slotOf = (i: number) =>
    slots[(i - Math.max(viewer, 0) + anchor + count) % count];
  const focus: Point =
    shape === "halfmoon" ? { x: 50, y: 40 } : { x: 50, y: 50 };
  const deck = deckPosition(shape);
  const offsetFromDeck = (at: Point): Point | undefined =>
    animateDeal
      ? {
          x: ((deck.x - at.x) / 100) * width,
          y: ((deck.y - at.y) / 100) * height,
        }
      : undefined;
  const seatStep = 0.12;
  const boardDelay = count * 2 * seatStep + 0.3;

  return (
    <div className="mx-auto w-full px-10 py-14 sm:px-8 sm:py-12">
      <div
        ref={boxRef}
        data-shape={shape}
        className={cn("table relative mx-auto w-full", BOX[shape])}
      >
        <div className="table-rim" />
        <div className="table-felt felt-surface" />
        <div className="table-line" />
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${deck.x}%`, top: `${deck.y}%` }}
        >
          <Deck />
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
                from={offsetFromDeck(focus)}
                dealDelay={boardDelay}
              />
            </>
          ) : (
            <Hand
              cards={view.board}
              skin={look.skin}
              back={look.back}
              from={offsetFromDeck({ x: 50, y: 18 })}
              dealDelay={boardDelay}
            />
          )}
          <Timer secondsLeft={view.secondsLeft} />
        </div>
        {view.seats.map((seat, i) => {
          if (seat.bet <= 0) return null;
          const at = toward(slotOf(i), focus, 0.32);
          return (
            <div
              key={`bet-${seat.seat}`}
              role="img"
              aria-label={t("seat.bet", { name: seat.name })}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${at.x}%`, top: `${at.y}%` }}
            >
              <ChipStack amount={seat.bet} />
            </div>
          );
        })}
        {view.seats.map((seat, i) => {
          const at = slotOf(i);
          return (
            <div
              key={seat.seat}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${at.x}%`, top: `${at.y}%` }}
            >
              <Seat
                seat={seat}
                isYou={view.you.seat === seat.seat}
                from={offsetFromDeck(at)}
                dealDelay={i * seatStep}
                dealStep={count * seatStep}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
