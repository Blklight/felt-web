"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ActionBar } from "@/components/table/action-bar";
import { ActionLog } from "@/components/table/action-log";
import { BuyInDialog } from "@/components/table/buy-in-dialog";
import {
  ConnectionBanner,
  useOnlineWatcher,
} from "@/components/table/connection-banner";
import { HandBadge } from "@/components/table/hand-badge";
import { HandRankings } from "@/components/table/hand-rankings";
import { LeaveButton } from "@/components/table/leave-button";
import { Table } from "@/components/table/table";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";
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

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ConnectionBanner onRetry={retry} />
      {!view ? (
        <TableSkeleton />
      ) : seat === null ? (
        <>
          <p className="text-muted-foreground text-sm">
            {t("table.spectating")}
          </p>
          <Table view={view} onSit={setPicking} />
          <p className="text-muted-foreground text-sm">
            {t("buyIn.balance", { amount: format(balance) })}
          </p>
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
        <>
          <Table
            key={view.handId}
            view={view}
            animateDeal={view.phase !== "waiting" && view.phase !== "betting"}
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!blackjack && <HandBadge hand={view.you.hand} />}
            {!blackjack && <HandRankings current={view.you.hand?.rank} />}
            <LeaveButton stack={stack} onLeave={() => send({ t: "stand" })} />
          </div>
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
          <ActionLog
            entries={view.log ?? []}
            seats={view.seats}
            you={view.you.seat}
          />
        </>
      )}
    </div>
  );
}
