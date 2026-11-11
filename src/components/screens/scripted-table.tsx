"use client";

import { useState } from "react";
import { ActionBar } from "@/components/table/action-bar";
import { ActionLog } from "@/components/table/action-log";
import { BuyInDialog } from "@/components/table/buy-in-dialog";
import { HandBadge } from "@/components/table/hand-badge";
import { HandRankings } from "@/components/table/hand-rankings";
import { LeaveButton } from "@/components/table/leave-button";
import { Table } from "@/components/table/table";
import { BUY_IN, useHandScript, watchingView } from "@/dev/use-hand-script";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";

const START_BALANCE = 2500;

export function ScriptedTable() {
  const t = useT();
  const format = useFormatNumber();
  const [balance, setBalance] = useState(START_BALANCE);
  const [buyIn, setBuyIn] = useState<number | null>(null);
  const [picking, setPicking] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {buyIn === null ? (
        <>
          <p className="text-muted-foreground text-sm">
            {t("table.spectating")}
          </p>
          <Table view={watchingView()} onSit={setPicking} />
          <p className="text-muted-foreground text-sm">
            {t("buyIn.balance", { amount: format(balance) })}
          </p>
          <BuyInDialog
            open={picking !== null}
            onOpenChange={(open) => !open && setPicking(null)}
            seat={picking ?? 0}
            min={BUY_IN.min}
            max={BUY_IN.max}
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

function Playing({
  buyIn,
  onLeave,
}: {
  buyIn: number;
  onLeave: (stack: number) => void;
}) {
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
      />
      <ActionLog
        entries={view.log ?? []}
        seats={view.seats}
        you={view.you.seat}
      />
    </>
  );
}
