"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { DEAL_IN, withDelay } from "@/components/cards/card-motion";
import type { CardBackVariant } from "@/components/cards/skins";
import { SUIT_PATHS } from "@/components/cards/suits";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";
import { useCardSkinStore } from "@/store/useCardSkinStore";

type Props = { variant?: CardBackVariant; className?: string; delay?: number };

const VALUE_FONT = "var(--font-bungee-shade), sans-serif";
const NEON_FONT = "var(--font-monoton), sans-serif";
const INDEX_FONT = "var(--font-barlow), sans-serif";
const BONE = "var(--color-bone)";
const CYAN = "var(--color-neon-cyan)";

function Frame({ color }: { color: string }) {
  return (
    <>
      <rect
        x="6"
        y="6"
        width="88"
        height="128"
        rx="6"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
      />
      <rect
        x="10"
        y="10"
        width="80"
        height="120"
        rx="4"
        fill="none"
        stroke={color}
        strokeWidth="0.6"
      />
    </>
  );
}

function Ink() {
  return (
    <>
      <Frame color={BONE} />
      <text
        x="48"
        y="90"
        textAnchor="middle"
        fontFamily={VALUE_FONT}
        fontSize="78"
        fill={BONE}
      >
        f
      </text>
    </>
  );
}

function Neon() {
  return (
    <>
      <Frame color={CYAN} />
      <g
        fill={CYAN}
        fontFamily={INDEX_FONT}
        fontWeight="700"
        fontSize="10"
        letterSpacing="4"
        textAnchor="middle"
      >
        <text x="50" y="22">
          FELT
        </text>
        <text x="50" y="125">
          FELT
        </text>
      </g>
      <text
        x="50"
        y="86"
        textAnchor="middle"
        fontFamily={NEON_FONT}
        fontSize="62"
        fill={CYAN}
      >
        F
      </text>
    </>
  );
}

const SLATS = [
  [70, 1.4],
  [75, 2.2],
  [80.5, 3],
  [86.5, 3.8],
] as const;
const GRID_ROWS = [101, 107, 115, 125];
const GRID_FAN = [-6, -4, -2, 0, 2, 4, 6];

function Vice() {
  const id = useId();
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd166" />
          <stop offset="1" stopColor="#ff3d8b" />
        </linearGradient>
        <mask id={`${id}-slats`}>
          <rect x="20" y="40" width="60" height="60" fill="white" />
          {SLATS.map(([y, h]) => (
            <rect key={y} x="20" y={y} width="60" height={h} fill="black" />
          ))}
        </mask>
      </defs>
      <Frame color="#fff6ea" />
      <text
        x="50"
        y="25"
        textAnchor="middle"
        fontFamily={INDEX_FONT}
        fontWeight="700"
        fontSize="9"
        letterSpacing="4"
        fill="#fff6ea"
      >
        FELT
      </text>
      <circle
        cx="50"
        cy="66"
        r="24"
        fill={`url(#${id}-sun)`}
        mask={`url(#${id}-slats)`}
      />
      <line
        x1="14"
        y1="96"
        x2="86"
        y2="96"
        stroke="#ff9ed2"
        strokeWidth="1.2"
      />
      <g stroke="#ff9ed2" strokeWidth="0.7" opacity="0.7">
        {GRID_ROWS.map((y) => (
          <line key={y} x1="14" y1={y} x2="86" y2={y} />
        ))}
        {GRID_FAN.map((k) => (
          <line key={k} x1={50 + k * 2} y1="96" x2={50 + k * 12} y2="126" />
        ))}
      </g>
    </>
  );
}

const SUIT_ORDER = ["s", "h", "d", "c"] as const;
const SUIT_TILES = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 5 }, (_, col) => ({
    key: `${row}-${col}`,
    suit: SUIT_ORDER[(row + col) % 4],
    x: 14 + col * 18 + (row % 2 ? 9 : 0),
    y: 16 + row * 15,
  })),
)
  .flat()
  .filter(({ x }) => x >= 14 && x <= 80);

function Suits() {
  return (
    <>
      <Frame color={BONE} />
      {SUIT_TILES.map(({ key, suit, x, y }) => (
        <svg
          key={key}
          x={x - 5}
          y={y - 5}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill={BONE}
          opacity="0.28"
          aria-hidden="true"
        >
          <path d={SUIT_PATHS[suit]} />
        </svg>
      ))}
      <rect
        x="30"
        y="48"
        width="40"
        height="44"
        rx="6"
        fill="var(--color-felt-deep)"
        stroke={BONE}
        strokeWidth="1.4"
      />
      <text
        x="49"
        y="82"
        textAnchor="middle"
        fontFamily={VALUE_FONT}
        fontSize="38"
        fill={BONE}
      >
        f
      </text>
    </>
  );
}

const BODY = { ink: Ink, neon: Neon, vice: Vice, suits: Suits } as const;

const WRAPPER: Record<CardBackVariant, string> = {
  ink: "bg-card-ink",
  neon: "bg-back-violet",
  vice: "bg-[#3b1a78]",
  suits: "bg-felt",
};

const VICE_BACKGROUND =
  "linear-gradient(180deg, #2a0f5c 0%, #7a1f7e 45%, #ff4d8d 80%, #ff9a4d 100%)";

export function CardBack({ variant, className, delay = 0 }: Props) {
  const t = useT();
  const storedBack = useCardSkinStore((state) => state.back);
  const active = variant ?? storedBack;
  const Body = BODY[active];
  return (
    <motion.div
      data-back={active}
      {...withDelay(DEAL_IN, delay)}
      style={
        active === "vice" ? { backgroundImage: VICE_BACKGROUND } : undefined
      }
      className={cn(
        "texture-item background-texture relative aspect-[5/7] w-20 overflow-hidden rounded-lg shadow-md",
        WRAPPER[active],
        className,
      )}
    >
      <svg
        role="img"
        aria-label={t("card.hidden")}
        viewBox="0 0 100 140"
        className="block size-full"
      >
        <Body />
      </svg>
    </motion.div>
  );
}
