"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ActionBar } from "@/components/table/action-bar";
import { Table } from "@/components/table/table";
import { pokerTable } from "@/dev/fixtures";
import { useT } from "@/i18n/use-t";
import { isValidRoomCode } from "@/lib/room-code";

export function TableScreen({ code }: { code: string | null }) {
  const t = useT();
  const view = pokerTable(4);

  if (!code || !isValidRoomCode(code)) {
    return (
      <div className="m-auto flex flex-col items-center gap-3 text-center">
        <p>{t("table.noCode")}</p>
        <Link href="/" className="underline">
          {t("table.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="tabular-nums text-muted-foreground text-sm">
        {t("table.room", { code })}
      </h1>
      <Table view={view} />
      <ActionBar
        actions={view.you.legalActions}
        pot={view.pots.reduce((a, b) => a + b, 0)}
        onAction={() => {}}
      />
    </div>
  );
}

export function TableRoute() {
  return <TableScreen code={useSearchParams().get("code")} />;
}
