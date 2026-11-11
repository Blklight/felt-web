"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BetSlider } from "@/components/chips/bet-slider";
import { Chip } from "@/components/chips/chip";
import { Button } from "@/components/ui/button";
import type { LegalAction } from "@/dev/view-types";
import type { MessageKey } from "@/i18n/dictionaries";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

type Chosen = { type: LegalAction["type"]; amount?: number };
type Props = {
  actions: LegalAction[];
  onAction: (action: Chosen) => void;
  pot?: number;
  step?: number;
  mode?: "slider" | "chips";
  defaultOpen?: boolean;
};

const CHIP_VALUES = [5, 25, 100, 500, 1000];

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

const BUTTON =
  "h-11 flex-1 text-sm font-bold transition-transform motion-safe:active:scale-[0.97]";

export function ActionBar({
  actions,
  onAction,
  pot = 0,
  step = 25,
  mode = "slider",
  defaultOpen = false,
}: Props) {
  const t = useT();
  const format = useFormatNumber();
  const [open, setOpen] = useState(defaultOpen);
  const [picked, setPicked] = useState<number | null>(null);

  const raise = actions.find((a) => a.type === "raise");
  const min = raise?.min ?? 0;
  const max = raise?.max ?? 0;
  const clamp = (value: number) => Math.min(max, Math.max(min, value));
  const amount = clamp(picked ?? min);
  const ranged = raise !== undefined && min < max;

  if (actions.length === 0) return null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3 rounded-xl border border-bone/20 bg-card-ink p-3 text-bone">
      {ranged && open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex flex-col gap-3"
        >
          <output className="text-center font-bungee text-3xl text-neon-cyan leading-none">
            {format(amount)}
          </output>
          {mode === "chips" ? (
            <div className="flex justify-center gap-2">
              {CHIP_VALUES.filter((value) => value <= max).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={t("chip.add", { value })}
                  className="rounded-full outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-neon-cyan"
                  onClick={() => setPicked(clamp(amount + value))}
                >
                  <Chip value={value} className="size-12" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="border-bone/40 bg-transparent text-bone"
                aria-label={t("stepper.less")}
                onClick={() => setPicked(clamp(amount - step))}
              >
                <MinusIcon />
              </Button>
              <BetSlider
                min={min}
                max={max}
                value={amount}
                onChange={setPicked}
              />
              <Button
                variant="outline"
                size="icon"
                className="border-bone/40 bg-transparent text-bone"
                aria-label={t("stepper.more")}
                onClick={() => setPicked(clamp(amount + step))}
              >
                <PlusIcon />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            {(
              [
                ["preset.min", min],
                ["preset.half", Math.round(pot / 2)],
                ["preset.pot", pot],
                ["action.allIn", max],
              ] as const
            ).map(([key, value]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="flex-1 border-bone/40 bg-transparent text-bone"
                onClick={() => setPicked(clamp(value))}
              >
                {t(key)}
              </Button>
            ))}
          </div>
          <Button
            className="h-11 w-full bg-neon-violet font-bold text-sm text-white hover:bg-neon-violet/90"
            onClick={() => onAction({ type: "raise", amount })}
          >
            {t("action.raiseTo", { amount: format(amount) })}
          </Button>
        </motion.div>
      )}
      <div className="flex gap-2">
        {actions.map((action) => {
          if (action.type === "raise") {
            return ranged ? (
              <Button
                key="raise"
                aria-expanded={open}
                className={cn(
                  BUTTON,
                  "bg-neon-violet text-white hover:bg-neon-violet/90 neon-glow",
                )}
                onClick={() => setOpen((v) => !v)}
              >
                {t("action.raise")}
              </Button>
            ) : (
              <Button
                key="raise"
                className={cn(
                  BUTTON,
                  "bg-neon-violet text-white hover:bg-neon-violet/90",
                )}
                onClick={() => onAction({ type: "raise", amount: max })}
              >
                {t("action.allIn")}
              </Button>
            );
          }
          return (
            <Button
              key={action.type}
              variant={action.type === "fold" ? "outline" : "default"}
              className={cn(
                BUTTON,
                action.type === "fold"
                  ? "border-bone/50 bg-transparent text-bone hover:bg-bone/10"
                  : "bg-bone text-card-ink hover:bg-bone/90",
              )}
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
    </div>
  );
}
