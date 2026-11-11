"use client";

import { PlayingCard } from "@/components/cards/playing-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CardCode, HandRank } from "@/dev/view-types";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

export const HAND_RANKS: HandRank[] = [
  "royal-flush",
  "straight-flush",
  "four-of-a-kind",
  "full-house",
  "flush",
  "straight",
  "three-of-a-kind",
  "two-pair",
  "pair",
  "high-card",
];

const EXAMPLES: Record<HandRank, CardCode[]> = {
  "royal-flush": ["As", "Ks", "Qs", "Js", "Ts"],
  "straight-flush": ["9h", "8h", "7h", "6h", "5h"],
  "four-of-a-kind": ["Qc", "Qd", "Qh", "Qs", "2c"],
  "full-house": ["Kh", "Kd", "Kc", "7s", "7h"],
  flush: ["Ad", "Jd", "8d", "6d", "3d"],
  straight: ["Tc", "9d", "8h", "7s", "6c"],
  "three-of-a-kind": ["8s", "8h", "8d", "Kc", "4s"],
  "two-pair": ["Jh", "Jc", "5d", "5s", "Ac"],
  pair: ["Qh", "Qs", "9c", "6d", "3h"],
  "high-card": ["Ah", "Jd", "9s", "6c", "2h"],
};

export function HandRankings({ current }: { current?: HandRank }) {
  const t = useT();
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        {t("hand.rankings")}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("hand.rankings")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("hand.desc.royal-flush")}
          </SheetDescription>
        </SheetHeader>
        <ol
          aria-label={t("hand.rankings")}
          className="flex flex-col gap-3 px-4 pb-6"
        >
          {HAND_RANKS.map((rank, i) => (
            <li
              key={rank}
              aria-current={rank === current ? "true" : undefined}
              className={cn(
                "flex flex-col gap-2 rounded-lg border border-border p-3",
                rank === current && "border-neon-violet neon-glow",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">
                  {i + 1}. {t(`hand.${rank}`)}
                </span>
                <span className="text-muted-foreground text-xs">
                  {t(`hand.desc.${rank}`)}
                </span>
              </div>
              <div className="flex gap-1">
                {EXAMPLES[rank].map((code) => (
                  <PlayingCard key={code} code={code} className="w-9" />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}
