"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ActionBar } from "@/components/table/action-bar";
import { ActionLog, ActionLogSheet } from "@/components/table/action-log";
import { BuyInDialog } from "@/components/table/buy-in-dialog";
import {
  ConnectionBanner,
  useOnlineWatcher,
} from "@/components/table/connection-banner";
import { HandBadge } from "@/components/table/hand-badge";
import { HandRankings } from "@/components/table/hand-rankings";
import { LeaveButton } from "@/components/table/leave-button";
import { soundsBetween, Table } from "@/components/table/table";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";
import { playSound } from "@/lib/sounds";
import { ME_KEY, useMe } from "@/net/queries";
import { useTableSocket } from "@/net/use-table-socket";
import { useConnectionStore } from "@/store/useConnectionStore";
import { useRecentTablesStore } from "@/store/useRecentTablesStore";

// The table as the server sees it: every state comes from the socket, every move goes back through it.
export function LiveTable({ code }: { code: string }) {
  const t = useT();
  const format = useFormatNumber();
  const queryClient = useQueryClient();
  const { view, fatal, send, retry } = useTableSocket(code);
  const balance = useMe().data?.balance ?? 0;
  const connected = useConnectionStore((state) => state.status === "open");
  const visit = useRecentTablesStore((state) => state.visit);
  const [picking, setPicking] = useState<number | null>(null);
  useOnlineWatcher();

  const game = view?.game;
  const seat = view?.you.seat ?? null;
  useEffect(() => {
    if (game) visit(code, game);
  }, [code, game, visit]);
  // Sitting and leaving move chips between the balance and the table.
  // biome-ignore lint/correctness/useExhaustiveDependencies: refetch when the seat changes
  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ME_KEY });
  }, [seat, queryClient]);

  // Here and not in Table, which remounts every hand and would miss changes across hands.
  const previous = useRef(view);
  useEffect(() => {
    const before = previous.current;
    previous.current = view;
    if (before && view && before !== view)
      for (const sound of soundsBetween(before, view)) playSound(sound);
  }, [view]);

  if (fatal) {
    return (
      <div className="m-auto flex flex-col items-center gap-3 text-center">
        <p>
          {t(
            fatal === "ROOM_NOT_FOUND"
              ? "error.ROOM_NOT_FOUND"
              : "error.UNAUTHORIZED",
          )}
        </p>
        <Link href="/" className="underline">
          {t("table.back")}
        </Link>
      </div>
    );
  }

  const stack = view?.seats.find((s) => s.seat === seat)?.stack ?? 0;
  const blackjack = view?.game === "blackjack";

  const log = view && {
    entries: view.log ?? [],
    seats: view.seats,
    you: view.you.seat,
  };

  // Below xl both columns use display:contents: their children share one column, and order-first lifts the header.
  return (
    <div className="flex w-full flex-col items-center gap-3 [--table-offset:22rem] xl:grid xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start xl:gap-6 xl:[--table-offset:9rem]">
      <div className="contents xl:flex xl:h-[calc(100dvh-7rem)] xl:min-w-0 xl:flex-col xl:items-center xl:justify-center xl:gap-3 xl:[container-type:size]">
        <ConnectionBanner onRetry={retry} />
        {!view ? (
          <TableSkeleton />
        ) : seat === null ? (
          <>
            <Table view={view} onSit={setPicking} />
            <BuyInDialog
              open={picking !== null}
              onOpenChange={(open) => !open && setPicking(null)}
              seat={picking ?? 0}
              min={view.buyIn?.min ?? 0}
              max={view.buyIn?.max ?? 0}
              balance={balance}
              onConfirm={(amount) => {
                send({ t: "sit", seat: picking ?? 0, buyIn: amount });
                setPicking(null);
              }}
            />
          </>
        ) : (
          <Table
            key={view.handId}
            view={view}
            animateDeal={view.phase !== "waiting" && view.phase !== "betting"}
          />
        )}
      </div>
      <aside className="contents xl:sticky xl:top-4 xl:flex xl:flex-col xl:gap-3">
        <div className="order-first flex w-full max-w-xl flex-col gap-3 rounded-lg border border-border p-3 xl:order-none xl:max-w-none">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-semibold tabular-nums">
              {t("table.room", { code })}
            </h1>
            {view && seat !== null && (
              <LeaveButton stack={stack} onLeave={() => send({ t: "stand" })} />
            )}
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-muted-foreground text-sm">
              {t("table.balance")}
            </span>
            <span className="font-bungee text-2xl tabular-nums">
              {format(balance)}
            </span>
          </div>
          {view && seat === null && (
            <p className="text-muted-foreground text-sm">
              {t("table.spectating")}
            </p>
          )}
          {view && seat !== null && (
            <div className="flex flex-wrap items-center gap-2">
              {!blackjack && <HandBadge hand={view.you.hand} />}
              {!blackjack && <HandRankings current={view.you.hand?.rank} />}
              {log && <ActionLogSheet {...log} className="xl:hidden" />}
            </div>
          )}
        </div>
        {view && seat !== null && (
          <div className="w-full max-w-xl xl:max-w-none">
            <ActionBar
              key={blackjack ? view.phase : undefined}
              actions={view.you.legalActions}
              mode={blackjack ? "chips" : undefined}
              defaultOpen={
                blackjack &&
                (view.phase === "betting" || view.phase === "waiting")
              }
              pot={blackjack ? undefined : view.pots.reduce((a, b) => a + b, 0)}
              onAction={(action) => send({ t: "action", action })}
              disabled={!connected}
            />
          </div>
        )}
        {log && <ActionLog {...log} className="hidden max-w-none xl:block" />}
      </aside>
    </div>
  );
}
