"use client";

import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

export type CardBackVariant = "ink" | "neon";

type Props = { variant?: CardBackVariant; className?: string };

const VALUE_FONT = "var(--font-bungee-shade), sans-serif";
const NEON_FONT = "var(--font-monoton), sans-serif";
const INDEX_FONT = "var(--font-barlow), sans-serif";

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

export function CardBack({ variant = "ink", className }: Props) {
  const t = useT();
  const neon = variant === "neon";
  return (
    <div
      data-back={variant}
      className={cn(
        "texture-item background-texture relative aspect-[5/7] w-20 overflow-hidden rounded-lg shadow-md",
        neon ? "bg-back-violet" : "bg-card-ink",
        className,
      )}
    >
      <svg
        role="img"
        aria-label={t("card.hidden")}
        viewBox="0 0 100 140"
        className="block size-full"
      >
        {neon ? (
          <>
            <Frame color="var(--color-neon-cyan)" />
            <g
              fill="var(--color-neon-cyan)"
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
              fill="var(--color-neon-cyan)"
            >
              F
            </text>
          </>
        ) : (
          <>
            <Frame color="var(--color-bone)" />
            <text
              x="48"
              y="90"
              textAnchor="middle"
              fontFamily={VALUE_FONT}
              fontSize="78"
              fill="var(--color-bone)"
            >
              f
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
