"use client";

import { ActionBar } from "@/components/table/action-bar";
import { HandBadge } from "@/components/table/hand-badge";
import { HandRankings } from "@/components/table/hand-rankings";
import { Table } from "@/components/table/table";
import { useHandScript } from "@/dev/use-hand-script";

export function ScriptedTable() {
  const { view, hand } = useHandScript();
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Table key={hand} view={view} animateDeal />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <HandBadge hand={view.you.hand} />
        <HandRankings current={view.you.hand?.rank} />
      </div>
      <ActionBar
        actions={view.you.legalActions}
        pot={view.pots.reduce((a, b) => a + b, 0)}
        onAction={() => {}}
      />
    </div>
  );
}
