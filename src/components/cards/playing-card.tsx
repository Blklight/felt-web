"use client";

import { CardBack } from "@/components/cards/card-back";
import { SUIT_PATHS, suitFill } from "@/components/cards/suits";
import type { CardCode } from "@/dev/view-types";
import { useT } from "@/i18n/use-t";
import { parseCard } from "@/lib/cards";
import { cn } from "@/lib/utils";

type Props = { code: CardCode; fourColor?: boolean; className?: string };

export function PlayingCard({ code, fourColor = false, className }: Props) {
  const t = useT();
  const card = parseCard(code);
  if (card.hidden) return <CardBack className={className} />;

  const fill = suitFill(card.suit, fourColor);
  const label = t("card.label", {
    rank: t(`rank.${card.rank}`),
    suit: t(`suit.${card.suit}`),
  });
  const rank = card.rank === "T" ? "10" : card.rank;
  const isFace = card.rank === "J" || card.rank === "Q" || card.rank === "K";

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 64 90"
      className={cn("aspect-[64/90] w-14 rounded-md shadow-md", className)}
    >
      <rect
        width="64"
        height="90"
        rx="6"
        fill="var(--color-bone)"
        stroke="#00000022"
      />
      <text
        x="6"
        y="16"
        fontSize="13"
        fontWeight="700"
        fontFamily="Georgia, serif"
        fill={fill}
      >
        {rank}
      </text>
      <g transform="translate(6 19) scale(.3)" data-suit-fill={fill}>
        <path d={SUIT_PATHS[card.suit]} fill={fill} />
      </g>
      {isFace ? (
        <g>
          <rect
            x="14"
            y="26"
            width="36"
            height="38"
            rx="4"
            fill="none"
            stroke={fill}
            strokeWidth="1.500"
          />
          <text
            x="32"
            y="53"
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fontFamily="Georgia, serif"
            fill={fill}
          >
            {card.rank}
          </text>
        </g>
      ) : (
        <g transform="translate(20 33) scale(1)">
          <path d={SUIT_PATHS[card.suit]} fill={fill} />
        </g>
      )}
      <g transform="rotate(180 32 45)">
        <text
          x="6"
          y="16"
          fontSize="13"
          fontWeight="700"
          fontFamily="Georgia, serif"
          fill={fill}
        >
          {rank}
        </text>
        <g transform="translate(6 19) scale(.3)">
          <path d={SUIT_PATHS[card.suit]} fill={fill} />
        </g>
      </g>
    </svg>
  );
}
