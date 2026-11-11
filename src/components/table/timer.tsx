"use client";

import { useT } from "@/i18n/use-t";

export function Timer({ secondsLeft }: { secondsLeft: number | null }) {
  const t = useT();
  if (secondsLeft === null) return null;
  return (
    <span
      role="timer"
      className="rounded-full border border-neon-cyan px-2 py-0.5 tabular-nums text-xs text-neon-cyan"
    >
      {t("timer.seconds", { seconds: secondsLeft })}
    </span>
  );
}
