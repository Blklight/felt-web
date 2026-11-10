"use client";

import { useState } from "react";
import { BetSlider } from "@/components/chips/bet-slider";
import { Button } from "@/components/ui/button";
import type { LegalAction } from "@/dev/view-types";
import type { MessageKey } from "@/i18n/dictionaries";
import { useT } from "@/i18n/use-t";

type Chosen = { type: LegalAction["type"]; amount?: number };
type Props = { actions: LegalAction[]; onAction: (action: Chosen) => void };

const LABELS: Record<LegalAction["type"], MessageKey> = {
  fold: "action.fold",
  check: "action.check",
  call: "action.call",
  raise: "action.raise",
  "all-in": "action.allIn",
  hit: "action.hit",
  stand: "action.stand",
  double: "action.double",
};

export function ActionBar({ actions, onAction }: Props) {
  const t = useT();
  const raise = actions.find((a) => a.type === "raise");
  const min = raise?.min ?? 0;
  const max = raise?.max ?? 0;
  const [picked, setPicked] = useState<number | null>(null);
  const amount = Math.min(max, Math.max(min, picked ?? min));

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {actions.map((action) => {
        if (action.type === "raise") {
          if (min >= max) {
            return (
              <Button
                key="raise"
                onClick={() => onAction({ type: "raise", amount: max })}
              >
                {t("action.allIn")}
              </Button>
            );
          }
          return (
            <div key="raise" className="flex flex-wrap items-center gap-2">
              <BetSlider
                min={min}
                max={max}
                value={amount}
                onChange={setPicked}
              />
              <Button onClick={() => onAction({ type: "raise", amount })}>
                {t("action.raise")}
              </Button>
            </div>
          );
        }
        return (
          <Button
            key={action.type}
            variant={action.type === "fold" ? "outline" : "default"}
            onClick={() =>
              onAction(
                action.amount === undefined
                  ? { type: action.type }
                  : { type: action.type, amount: action.amount },
              )
            }
          >
            {t(LABELS[action.type], { amount: action.amount ?? "" }).trim()}
          </Button>
        );
      })}
    </div>
  );
}
