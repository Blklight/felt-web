import { cn } from "@/lib/utils";

function tier(value: number): string {
  if (value >= 1000) return "bg-neon-violet text-white";
  if (value >= 500) return "bg-card-ink text-bone ring-bone";
  if (value >= 100) return "bg-suit-red text-bone";
  if (value >= 25) return "bg-felt text-bone ring-bone";
  return "bg-bone text-card-ink";
}

export function Chip({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full font-mono text-[9px] font-bold ring-2 ring-inset ring-white/40 shadow",
        tier(value),
        className,
      )}
    >
      {value}
    </span>
  );
}
