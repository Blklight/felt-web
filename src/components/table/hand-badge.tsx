"use client";

import type { HandInfo } from "@/dev/view-types";
import { useT } from "@/i18n/use-t";

export function HandBadge({ hand }: { hand?: HandInfo }) {
  const t = useT();
  if (!hand) return null;
  return (
    <span className="rounded-full border border-neon-violet/60 bg-card-ink px-3 py-1 font-semibold text-bone text-sm">
      {t("hand.yours", { hand: t(`hand.${hand.rank}`) })}
    </span>
  );
}
