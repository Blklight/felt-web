"use client";

import type { RefObject } from "react";
import { Hand } from "@/components/cards/hand";
import { PlayerAvatar } from "@/components/player-avatar";
import type { CardCode, SeatView } from "@/dev/view-types";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { useCardLook } from "@/store/useCardSkinStore";

type Props = {
  seat: SeatView;
  isYou?: boolean;
  dealFrom?: RefObject<HTMLElement | null>;
  dealDelays?: number[];
  winner?: boolean;
  highlight?: (code: CardCode) => "win" | "dim" | undefined;
  onSit?: (seat: number) => void;
};

export function Seat({
  seat,
  isYou = false,
  dealFrom,
  dealDelays,
  winner = false,
  highlight,
  onSit,
}: Props) {
  const t = useT();
  const format = useFormatNumber();
  const look = useCardLook(seat.skinId, seat.backId);

  if (seat.status === "empty") {
    return (
      <fieldset
        aria-label={t("seat.free")}
        className="flex h-12 w-[72px] items-center justify-center rounded-md border border-bone/30 border-dashed bg-card-ink/60 text-center text-[11px] text-bone/70 sm:w-20"
      >
        {onSit ? (
          <button
            type="button"
            aria-label={t("seat.sitAt", { n: seat.seat + 1 })}
            onClick={() => onSit(seat.seat)}
            className="size-full rounded-md font-semibold text-neon-cyan outline-none transition-colors hover:bg-neon-cyan/10 focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            {t("seat.sit")}
          </button>
        ) : (
          t("seat.free")
        )}
      </fieldset>
    );
  }

  return (
    <fieldset
      aria-label={seat.name}
      aria-current={seat.isTurn ? "true" : undefined}
      data-winner={winner ? "true" : undefined}
      className={cn(
        "relative flex w-[72px] flex-col items-center text-bone transition-opacity duration-300 sm:w-20",
        seat.status === "folded" && "opacity-50",
      )}
    >
      <Hand
        cards={seat.cards}
        skin={look.skin}
        back={look.back}
        dealFrom={dealFrom}
        dealDelays={dealDelays}
        highlight={highlight}
        className={cn(
          "relative z-10 -mb-3 -space-x-3",
          isYou && "sm:-space-x-5",
        )}
        cardClassName={isYou ? "w-9 sm:w-16 lg:w-20" : "w-9 sm:w-11 lg:w-14"}
      />
      {seat.total !== undefined && (
        <span
          role="img"
          aria-label={t("seat.total", { total: seat.total })}
          className="absolute top-1 -right-3 z-20 flex size-6 items-center justify-center rounded-full border border-bone/50 bg-card-ink font-bold text-[11px] text-bone tabular-nums"
        >
          {seat.total}
        </span>
      )}
      {seat.outcome && (
        <span
          className={cn(
            "absolute -top-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 font-bold text-[11px]",
            seat.outcome.kind === "win" || seat.outcome.kind === "blackjack"
              ? "bg-neon-cyan text-card-ink"
              : seat.outcome.kind === "push"
                ? "bg-bone text-card-ink"
                : "bg-suit-red text-white",
          )}
        >
          {t(`outcome.${seat.outcome.kind}`, {
            amount: format(seat.outcome.amount ?? 0),
          })}
        </span>
      )}
      <div
        className={cn(
          "w-full rounded-md border border-bone/40 bg-card-ink px-1.5 pt-3.5 pb-1 text-center transition-[border-color,box-shadow] duration-300",
          seat.isTurn && "neon-glow neon-pulse border-neon-violet",
          isYou && !seat.isTurn && "border-bone",
          winner && "border-neon-cyan shadow-[0_0_16px_var(--color-neon-cyan)]",
        )}
      >
        <p
          className="flex items-center justify-center gap-1 truncate font-semibold text-[11px] leading-tight"
          title={seat.name}
        >
          <PlayerAvatar id={seat.avatarId} className="size-3.5" />
          <span className="truncate">{seat.name}</span>
        </p>
        <p className="tabular-nums text-[11px] text-bone/80 leading-tight">
          {format(seat.stack)}
        </p>
        {seat.status === "all-in" && (
          <p className="mt-0.5 rounded-sm bg-neon-violet font-bold text-[10px] text-white uppercase tracking-wide">
            {t("seat.allIn")}
          </p>
        )}
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
      {seat.blind && (
        <span
          role="img"
          aria-label={t(
            seat.blind === "small" ? "seat.smallBlind" : "seat.bigBlind",
          )}
          className="absolute -top-1 -left-2 z-20 flex h-5 min-w-5 items-center justify-center rounded-full border border-neon-cyan bg-card-ink px-1 font-bold text-[9px] text-neon-cyan"
        >
          {seat.blind === "small" ? "SB" : "BB"}
        </span>
      )}
    </fieldset>
  );
}
