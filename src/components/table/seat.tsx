"use client";

import type { Point } from "@/components/cards/card-motion";
import { Hand } from "@/components/cards/hand";
import type { SeatView } from "@/dev/view-types";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { useCardLook } from "@/store/useCardSkinStore";

type Props = {
  seat: SeatView;
  isYou?: boolean;
  from?: Point;
  dealDelay?: number;
};

export function Seat({ seat, isYou = false, from, dealDelay }: Props) {
  const t = useT();
  const format = useFormatNumber();
  const look = useCardLook(seat.skinId, seat.backId);

  if (seat.status === "empty") {
    return (
      <fieldset
        aria-label={t("seat.free")}
        className="flex h-12 w-[72px] items-center justify-center rounded-md border border-bone/30 border-dashed bg-card-ink/60 text-center text-[11px] text-bone/70 sm:w-20"
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
        "relative flex w-[72px] flex-col items-center text-bone transition-opacity duration-300 sm:w-20",
        seat.status === "folded" && "opacity-50",
      )}
    >
      <Hand
        cards={seat.cards}
        skin={look.skin}
        back={look.back}
        from={from}
        dealDelay={dealDelay}
        className="relative z-10 -mb-3 -space-x-3"
        cardClassName="w-9 sm:w-11"
      />
      <div
        className={cn(
          "w-full rounded-md border border-bone/40 bg-card-ink px-1.5 pt-3.5 pb-1 text-center transition-[border-color,box-shadow] duration-300",
          seat.isTurn && "neon-glow neon-pulse border-neon-violet",
          isYou && !seat.isTurn && "border-bone",
        )}
      >
        <p
          className="truncate font-semibold text-[11px] leading-tight"
          title={seat.name}
        >
          {seat.name}
        </p>
        <p className="tabular-nums text-[11px] text-bone/80 leading-tight">
          {format(seat.stack)}
        </p>
      </div>
      {seat.isDealer && (
        <span
          role="img"
          aria-label={t("seat.dealer")}
          className="absolute -top-1 -right-2 z-20 flex size-5 items-center justify-center rounded-full bg-bone font-bold text-[10px] text-card-ink"
        >
          D
        </span>
      )}
    </fieldset>
  );
}
