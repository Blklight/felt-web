"use client";

import { Chip } from "@/components/chips/chip";
import { useFormatNumber } from "@/i18n/use-format-number";

const DENOMINATIONS = [1000, 500, 100, 25, 5, 1];
const MAX_CHIPS = 6;

export function breakdown(amount: number): number[] {
  const chips: number[] = [];
  let rest = amount;
  for (const d of DENOMINATIONS) {
    while (rest >= d && chips.length < MAX_CHIPS) {
      chips.push(d);
      rest -= d;
    }
  }
  return chips;
}

export function ChipStack({ amount }: { amount: number }) {
  const format = useFormatNumber();
  if (amount <= 0) return null;
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-5">
        {breakdown(amount).map((value, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: chips of equal value repeat
          <Chip key={i} value={value} />
        ))}
      </div>
      <span className="font-mono text-xs text-bone">{format(amount)}</span>
    </div>
  );
}
