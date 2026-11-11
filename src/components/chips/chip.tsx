import { cn } from "@/lib/utils";

type Look = { base: string; edge: string; inner: string; text: string };

const LOOKS: [min: number, look: Look][] = [
  [
    1000,
    { base: "#8f6bff", edge: "#faf6ea", inner: "#3a1fa8", text: "#ffffff" },
  ],
  [
    500,
    { base: "#4a35b5", edge: "#7cf4ff", inner: "#150c45", text: "#7cf4ff" },
  ],
  [
    100,
    { base: "#4a423a", edge: "#faf6ea", inner: "#0a0807", text: "#faf6ea" },
  ],
  [25, { base: "#22896a", edge: "#faf6ea", inner: "#0a3528", text: "#faf6ea" }],
  [5, { base: "#e0453a", edge: "#faf6ea", inner: "#7a120d", text: "#faf6ea" }],
  [0, { base: "#faf6ea", edge: "#14110f", inner: "#d2c6a6", text: "#14110f" }],
];

const look = (value: number): Look =>
  (LOOKS.find(([min]) => value >= min) ?? LOOKS[LOOKS.length - 1])[1];

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
