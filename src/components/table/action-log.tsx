"use client";

import type { LogEntry, SeatView } from "@/dev/view-types";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";

const VISIBLE = 8;

export function useLogText() {
  const t = useT();
  const format = useFormatNumber();
  return (entry: LogEntry, seats: SeatView[], you: number | null) => {
    const amount = entry.amount === undefined ? "" : format(entry.amount);
    if (entry.seat === you) return t(`log.you.${entry.kind}`, { amount });
    const name = seats.find((s) => s.seat === entry.seat)?.name ?? "";
    return t(`log.${entry.kind}`, { name, amount });
  };
}

type Props = { entries: LogEntry[]; seats: SeatView[]; you?: number | null };

export function ActionLog({ entries, seats, you = null }: Props) {
  const t = useT();
  const text = useLogText();
  return (
    <div className="w-full max-w-xl rounded-lg border border-border p-3">
      <p className="mb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
        {t("log.title")}
      </p>
      <ol
        role="log"
        aria-label={t("log.title")}
        className="flex flex-col gap-0.5 text-sm"
      >
        {entries.slice(-VISIBLE).map((entry) => (
          <li key={entry.id}>{text(entry, seats, you)}</li>
        ))}
      </ol>
    </div>
  );
}
