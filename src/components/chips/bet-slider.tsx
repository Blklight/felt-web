"use client";

import { Slider } from "@/components/ui/slider";
import { useT } from "@/i18n/use-t";

type Props = {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
};

export function BetSlider({ min, max, value, onChange }: Props) {
  const t = useT();
  return (
    <Slider
      aria-label={t("action.raise")}
      min={min}
      max={max}
      value={[value]}
      onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
    />
  );
}
