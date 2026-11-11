"use client";

import { motion } from "motion/react";
import type { Ref } from "react";
import { CardBack } from "@/components/cards/card-back";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

const LAYERS = [0, 1, 2, 3];

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
        const side = n % 2 ? -1 : 1;
        const top = n >= LAYERS.length - 2;
        return (
          <motion.div
            key={n}
            initial={false}
            className="absolute inset-0"
            animate={
              shuffling && top
                ? {
                    x: [n * 1.5, n * 1.5 + side * 22, n * 1.5],
                    y: -n * 1.5,
                    rotate: [0, side * 9, 0],
                  }
                : { x: n * 1.5, y: -n * 1.5, rotate: 0 }
            }
            transition={
              shuffling
                ? { duration: 0.5, repeat: 3, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          >
            <CardBack decorative className="w-full" />
          </motion.div>
        );
      })}
    </div>
  );
}
