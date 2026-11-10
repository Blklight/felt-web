"use client";

import { motion } from "motion/react";
import { CardBack } from "@/components/cards/card-back";
import {
  FLIP_IN,
  fromPoint,
  type Point,
  withDelay,
} from "@/components/cards/card-motion";
import {
  type CardBackVariant,
  type CardSkin,
  centerValue,
  faceStyle,
  suitFill,
} from "@/components/cards/skins";
import { SUIT_PATHS } from "@/components/cards/suits";
import type { CardCode } from "@/dev/view-types";
import { useT } from "@/i18n/use-t";
import { parseCard } from "@/lib/cards";
import { cn } from "@/lib/utils";
import { useCardSkinStore } from "@/store/useCardSkinStore";

type Props = {
  code: CardCode;
  skin?: CardSkin;
  back?: CardBackVariant;
  className?: string;
  delay?: number;
  from?: Point;
};

const INDEX_FONT = "var(--font-barlow), sans-serif";

export function PlayingCard({
  code,
  skin,
  back,
  className,
  delay = 0,
  from,
}: Props) {
  const t = useT();
  const storedSkin = useCardSkinStore((state) => state.skin);
  const activeSkin = skin ?? storedSkin;
  const card = parseCard(code);
  if (card.hidden)
    return (
      <CardBack
        variant={back}
        className={className}
        delay={delay}
        from={from}
      />
    );

  const fill = suitFill(card.suit, activeSkin);
  const label = t("card.label", {
    rank: t(`rank.${card.rank}`),
    suit: t(`suit.${card.suit}`),
  });
  const rank = card.rank === "T" ? "10" : card.rank;
  const ten = rank === "10";
  const center = centerValue(activeSkin);

  const corner = (rotated: boolean) => (
    <g transform={rotated ? "rotate(180 50 70)" : undefined}>
      <text
        x="9"
        y="24"
        fontFamily={INDEX_FONT}
        fontWeight="700"
        fontSize={ten ? 17 : 20}
        fill={fill}
      >
        {rank}
      </text>
      <svg
        x="7"
        y="27"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={fill}
        aria-hidden="true"
        data-suit-fill={fill}
      >
        <path d={SUIT_PATHS[card.suit]} />
      </svg>
    </g>
  );

  return (
    <motion.div
      data-skin={activeSkin}
      {...fromPoint(withDelay(FLIP_IN, delay), from)}
      style={{ ...faceStyle(activeSkin, card.suit), transformPerspective: 700 }}
      className={cn(
        "texture-item background-texture relative aspect-[5/7] w-20 overflow-hidden rounded-lg shadow-md",
        className,
      )}
    >
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 100 140"
        className="block size-full"
      >
        {corner(false)}
        {corner(true)}
        <text
          x="48"
          y={ten ? center.tenY : center.y}
          textAnchor="middle"
          fontFamily={center.font}
          fontSize={ten ? center.tenSize : center.size}
          letterSpacing={ten ? center.tenSpacing : 0}
          fill={fill}
        >
          {rank}
        </text>
      </svg>
    </motion.div>
  );
}
