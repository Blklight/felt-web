"use client";

import { Slider } from "@/components/ui/slider";
import { useFormatNumber } from "@/i18n/use-format-number";
import { useT } from "@/i18n/use-t";

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
};

export function BetSlider({ min, max, value, onChange }: Props) {
  const t = useT();
  const format = useFormatNumber();
  return (
    <div className="flex w-full min-w-40 items-center gap-3">
      <Slider
        aria-label={t("action.raise")}
        min={min}
        max={max}
        value={[value]}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
      />
      <output className="min-w-14 text-right font-mono text-neon-cyan text-sm">
        {format(value)}
      </output>
    </div>
  );
}
