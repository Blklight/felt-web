"use client";

import { Hand } from "@/components/cards/hand";
import { ChipStack } from "@/components/chips/chip-stack";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { SeatView } from "@/dev/view-types";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

type Props = { seat: SeatView; isYou?: boolean; fourColor?: boolean };

export function Seat({ seat, isYou = false, fourColor }: Props) {
  const t = useT();
  const format = useFormatNumber();

  if (seat.status === "empty") {
    return (
      <fieldset
        aria-label={t("seat.free")}
        className="flex h-16 w-24 items-center justify-center rounded-lg border border-bone/20 border-dashed text-bone/60 text-xs"
      >
        {t("seat.free")}
      </fieldset>
    );
  }

  return (
    <fieldset
      aria-label={seat.name}
      aria-current={seat.isTurn ? "true" : undefined}
      className={cn(
        "flex w-28 flex-col items-center gap-1 rounded-xl bg-black/40 p-2 text-bone",
        seat.isTurn && "neon-glow neon-pulse",
        seat.status === "folded" && "opacity-50",
        isYou && "ring-1 ring-bone/40",
      )}
    >
      <Hand cards={seat.cards} fourColor={fourColor} />
      <div className="flex w-full items-center gap-1.5">
        <Avatar size="sm">
          <AvatarFallback>{seat.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-xs" title={seat.name}>
            {seat.name}
          </p>
          <p className="font-mono text-[11px] text-bone/80">
            {format(seat.stack)}
          </p>
        </div>
        {seat.isDealer && (
          <span
            role="img"
            aria-label={t("seat.dealer")}
            className="flex size-5 items-center justify-center rounded-full bg-bone font-bold text-[10px] text-card-ink"
          >
            D
          </span>
        )}
      </div>
      <ChipStack amount={seat.bet} />
    </fieldset>
  );
}
