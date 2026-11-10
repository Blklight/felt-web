import { cn } from "@/lib/utils";

type Look = { base: string; edge: string; inner: string; text: string };

function look(value: number): Look {
  if (value >= 1000)
    return {
      base: "#7c5cff",
      edge: "#faf6ea",
      inner: "#5b3fd1",
      text: "#ffffff",
    };
  if (value >= 500)
    return {
      base: "#2a1d6e",
      edge: "#7cf4ff",
      inner: "#1d1450",
      text: "#7cf4ff",
    };
  if (value >= 100)
    return {
      base: "#14110f",
      edge: "#faf6ea",
      inner: "#26211d",
      text: "#faf6ea",
    };
  if (value >= 25)
    return {
      base: "#17493a",
      edge: "#faf6ea",
      inner: "#0f3a2c",
      text: "#faf6ea",
    };
  if (value >= 5)
    return {
      base: "#b3261e",
      edge: "#faf6ea",
      inner: "#8f1d17",
      text: "#faf6ea",
    };
  return {
    base: "#faf6ea",
    edge: "#14110f",
    inner: "#efe8d6",
    text: "#14110f",
  };
}

const label = (value: number) =>
  value >= 1000 ? `${value / 1000}K` : String(value);

export function Chip({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const { base, edge, inner, text } = look(value);
  const shown = label(value);
  return (
    <svg
      role="img"
      aria-label={String(value)}
      viewBox="0 0 64 64"
      className={cn("size-9 drop-shadow-[0_2px_2px_rgb(0_0_0/0.5)]", className)}
    >
      <circle cx="32" cy="32" r="31" fill={base} />
      <circle
        cx="32"
        cy="32"
        r="26.5"
        fill="none"
        stroke={edge}
        strokeWidth="6"
        strokeDasharray="10.4 10.4"
      />
      <circle
        cx="32"
        cy="32"
        r="20"
        fill={inner}
        stroke={edge}
        strokeWidth="1.2"
      />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dy="0.35em"
        fontFamily="var(--font-barlow), sans-serif"
        fontWeight="700"
        fontSize={shown.length > 2 ? 15 : 18}
        fill={text}
      >
        {shown}
      </text>
    </svg>
  );
}
