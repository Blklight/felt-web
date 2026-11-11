"use client";

import { motion } from "motion/react";
import type { Ref } from "react";
import { CardBack } from "@/components/cards/card-back";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

const LAYERS = [0, 1, 2, 3, 4, 5, 6, 7];
const THICKNESS = 0.9;
const SPLIT = 34;
const RIFFLE_SECONDS = 0.9;
const RIFFLES = 2;
export const SHUFFLE_SECONDS = RIFFLE_SECONDS * RIFFLES;

// One riffle: the two halves slide apart, then drop back one card at a time, alternating sides.
function riffle(n: number) {
  const side = n % 2 === 0 ? -1 : 1;
  const rest = { x: n * THICKNESS, y: -n * THICKNESS };
  const drop = 0.38 + n * 0.055;
  return {
    animate: {
      x: [rest.x, side * SPLIT, side * SPLIT, rest.x, rest.x],
      y: [rest.y, rest.y + 4, rest.y - 6, rest.y, rest.y],
      rotate: [0, side * 7, side * 3, 0, 0],
    },
    transition: {
      duration: RIFFLE_SECONDS,
      repeat: RIFFLES - 1,
      times: [0, 0.3, drop, Math.min(drop + 0.12, 0.98), 1],
      ease: "easeInOut" as const,
    },
  };
}

export function Deck({
  shuffling = false,
  className,
  ref,
}: {
  shuffling?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  const t = useT();
  return (
    <div
      ref={ref}
      role="img"
      aria-label={t("deck.label")}
      data-shuffling={shuffling ? "true" : undefined}
      className={cn("relative aspect-[5/7] w-10 sm:w-14", className)}
    >
      {LAYERS.map((n) => {
        const motionProps = shuffling
          ? riffle(n)
          : {
              animate: { x: n * THICKNESS, y: -n * THICKNESS, rotate: 0 },
              transition: { duration: 0.2 },
            };
        return (
          <motion.div
            key={n}
            initial={false}
            className="absolute inset-0"
            style={{ zIndex: n }}
            {...motionProps}
          >
            <CardBack decorative className="w-full" />
          </motion.div>
        );
      })}
    </div>
  );
}
