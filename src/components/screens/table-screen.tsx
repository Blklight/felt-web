"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ScriptedTable } from "@/components/screens/scripted-table";
import { useT } from "@/i18n/use-t";
import { isValidRoomCode } from "@/lib/room-code";
import { useRecentTablesStore } from "@/store/useRecentTablesStore";

export function TableScreen({
  code,
  game = "poker",
}: {
  code: string | null;
  game?: "poker" | "blackjack";
}) {
  const t = useT();
  const valid = code !== null && isValidRoomCode(code);
  const visit = useRecentTablesStore((state) => state.visit);
  useEffect(() => {
    if (valid && code) visit(code, game);
  }, [valid, code, game, visit]);

  if (!code || !valid) {
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
      <ScriptedTable game={game} />
    </div>
  );
}

export function TableRoute() {
  const params = useSearchParams();
  const game = params.get("game") === "blackjack" ? "blackjack" : "poker";
  return <TableScreen code={params.get("code")} game={game} />;
}
