"use client";

import { Chip } from "@/components/chips/chip";
import { useFormatNumber } from "@/i18n/use-format-number";

const DENOMINATIONS = [1000, 500, 100, 25, 5, 1];
const MAX_CHIPS = 6;
const LIFT = 4;

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
  const chips = breakdown(amount);
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="relative w-9"
        style={{ height: `${36 + (chips.length - 1) * LIFT}px` }}
      >
        {chips.map((value, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: chips of equal value repeat
            key={i}
            className="absolute left-0"
            style={{ bottom: `${i * LIFT}px`, zIndex: i }}
          >
            <Chip value={value} />
          </span>
        ))}
      </div>
      <span className="font-bold text-bone text-sm tabular-nums">
        {format(amount)}
      </span>
    </div>
  );
}
