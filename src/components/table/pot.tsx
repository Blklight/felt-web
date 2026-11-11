"use client";

import { motion } from "motion/react";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";

export function Pot({ pots }: { pots: number[] }) {
  const t = useT();
  const format = useFormatNumber();
  const total = pots.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return (
    <div className="flex flex-col items-center tabular-nums">
      <span className="text-[10px] text-bone/70 uppercase tracking-widest">
        {t("pot")}
      </span>
      <motion.span
        key={total}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="text-neon-cyan text-lg [text-shadow:0_0_8px_var(--color-neon-cyan)]"
      >
        {format(total)}
      </motion.span>
    </div>
  );
}
