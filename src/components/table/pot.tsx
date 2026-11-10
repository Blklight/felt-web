"use client";

import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";

export function Pot({ pots }: { pots: number[] }) {
  const t = useT();
  const format = useFormatNumber();
  const total = pots.reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col items-center font-mono">
      <span className="text-[10px] text-bone/70 uppercase tracking-widest">
        {t("pot")}
      </span>
      <span className="text-neon-cyan text-lg [text-shadow:0_0_8px_var(--color-neon-cyan)]">
        {format(total)}
      </span>
    </div>
  );
}
