"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LiveTable } from "@/components/screens/live-table";
import { useT } from "@/i18n/use-t";
import { isValidRoomCode } from "@/lib/room-code";

export function TableScreen({ code }: { code: string | null }) {
  const t = useT();
  const valid = code !== null && isValidRoomCode(code);

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
      <LiveTable code={code} />
    </div>
  );
}

export function TableRoute() {
  return <TableScreen code={useSearchParams().get("code")} />;
}
