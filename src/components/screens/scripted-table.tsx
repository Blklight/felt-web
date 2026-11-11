"use client";

import { useState } from "react";
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
import {
  BLACKJACK_BUY_IN,
  blackjackWatchingView,
  useBlackjackScript,
} from "@/dev/use-blackjack-script";
import { BUY_IN, useHandScript, watchingView } from "@/dev/use-hand-script";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";
import { useConnectionStore } from "@/store/useConnectionStore";

const START_BALANCE = 2500;

export function ScriptedTable({
  game = "poker",
}: {
  game?: "poker" | "blackjack";
}) {
  const blackjack = game === "blackjack";
  const limits = blackjack ? BLACKJACK_BUY_IN : BUY_IN;
  const t = useT();
  const format = useFormatNumber();
  const [balance, setBalance] = useState(START_BALANCE);
  const [buyIn, setBuyIn] = useState<number | null>(null);
  const [picking, setPicking] = useState<number | null>(null);
  const status = useConnectionStore((state) => state.status);
  useOnlineWatcher();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <ConnectionBanner
        onRetry={() => useConnectionStore.setState({ status: "connecting" })}
      />
      {status === "connecting" ? (
        <TableSkeleton />
      ) : buyIn === null ? (
        <>
          <p className="text-muted-foreground text-sm">
            {t("table.spectating")}
          </p>
          <Table
            view={blackjack ? blackjackWatchingView() : watchingView()}
            onSit={setPicking}
          />
          <p className="text-muted-foreground text-sm">
            {t("buyIn.balance", { amount: format(balance) })}
          </p>
          <BuyInDialog
            open={picking !== null}
            onOpenChange={(open) => !open && setPicking(null)}
            seat={picking ?? 0}
            min={limits.min}
            max={limits.max}
            balance={balance}
            onConfirm={(amount) => {
              setBalance((b) => b - amount);
              setBuyIn(amount);
              setPicking(null);
            }}
          />
        </>
      ) : (
        <Playing
          blackjack={blackjack}
          buyIn={buyIn}
          onLeave={(stack) => {
            setBalance((b) => b + stack);
            setBuyIn(null);
          }}
        />
      )}
    </div>
  );
}

type PlayingProps = { buyIn: number; onLeave: (stack: number) => void };

function Playing({
  blackjack,
  ...props
}: PlayingProps & { blackjack: boolean }) {
  return blackjack ? (
    <BlackjackPlaying {...props} />
  ) : (
    <PokerPlaying {...props} />
  );
}

function BlackjackPlaying({ buyIn, onLeave }: PlayingProps) {
  const connected = useConnectionStore((state) => state.status === "open");
  const { view, dealKey, act } = useBlackjackScript(buyIn);
  const stack = view.seats.find((s) => s.seat === view.you.seat)?.stack ?? 0;
  return (
    <>
      <Table key={dealKey} view={view} animateDeal={view.phase !== "betting"} />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <LeaveButton stack={stack} onLeave={() => onLeave(stack)} />
      </div>
      <ActionBar
        key={view.phase}
        actions={view.you.legalActions}
        mode="chips"
        defaultOpen={view.phase === "betting"}
        onAction={act}
        disabled={!connected}
      />
      <ActionLog
        entries={view.log ?? []}
        seats={view.seats}
        you={view.you.seat}
      />
    </>
  );
}

function PokerPlaying({ buyIn, onLeave }: PlayingProps) {
  const connected = useConnectionStore((state) => state.status === "open");
  const { view, hand } = useHandScript(buyIn);
  const stack = view.seats.find((s) => s.seat === view.you.seat)?.stack ?? 0;
  return (
    <>
      <Table key={hand} view={view} animateDeal />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <HandBadge hand={view.you.hand} />
        <HandRankings current={view.you.hand?.rank} />
        <LeaveButton stack={stack} onLeave={() => onLeave(stack)} />
      </div>
      <ActionBar
        actions={view.you.legalActions}
        pot={view.pots.reduce((a, b) => a + b, 0)}
        onAction={() => {}}
        disabled={!connected}
      />
      <ActionLog
        entries={view.log ?? []}
        seats={view.seats}
        you={view.you.seat}
      />
    </>
  );
}
