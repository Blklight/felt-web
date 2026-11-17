"use client";

import type { HandInfo } from "@/dev/view-types";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

export function HandBadge({
  hand,
  className,
}: {
  hand?: HandInfo;
  className?: string;
}) {
  const t = useT();
  if (!hand) return null;
  const name = t(`hand.${hand.rank}`);
  return (
    <p
      key={hand.rank}
      className={cn(
        "text-balance font-bold text-[9px] text-neon-cyan uppercase leading-tight tracking-wider animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none",
        className,
      )}
    >
      <span aria-hidden="true">{name}</span>
      <span className="sr-only">{t("hand.yours", { hand: name })}</span>
    </p>
  );
}
