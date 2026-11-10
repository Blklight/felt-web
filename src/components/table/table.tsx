"use client";

import { Hand } from "@/components/cards/hand";
import { Board } from "@/components/table/board";
import { Pot } from "@/components/table/pot";
import { Seat } from "@/components/table/seat";
import { seatPositions } from "@/components/table/seat-positions";
import { Timer } from "@/components/table/timer";
import type { TableView } from "@/dev/view-types";

type Props = { view: TableView; fourColor?: boolean };

export function Table({ view, fourColor }: Props) {
  const positions = seatPositions(view.seats.length);
  return (
    <div className="felt-surface relative mx-auto aspect-[4/5] w-full max-w-4xl overflow-hidden rounded-[50%/40%] border-4 border-felt-rim shadow-inner sm:aspect-[3/2]">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        {view.game === "poker" ? (
          <>
            <Pot pots={view.pots} />
            <Board cards={view.board} fourColor={fourColor} />
          </>
        ) : (
          <Hand cards={view.board} fourColor={fourColor} />
        )}
        <Timer secondsLeft={view.secondsLeft} />
      </div>
      {view.seats.map((seat, i) => (
        <div
          key={seat.seat}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }}
        >
          <Seat
            seat={seat}
            isYou={view.you.seat === seat.seat}
            fourColor={fourColor}
          />
        </div>
      ))}
    </div>
  );
}
