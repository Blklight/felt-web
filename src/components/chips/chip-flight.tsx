"use client";

import { motion } from "motion/react";
import type { Point } from "@/components/cards/card-motion";
import { ChipStack } from "@/components/chips/chip-stack";

type Props = {
  amount: number;
  from: Point;
  to: Point;
  onComplete?: () => void;
};

export function ChipFlight({ amount, from, to, onComplete }: Props) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 left-0 z-30"
      initial={{ x: from.x, y: from.y, opacity: 1, scale: 1 }}
      animate={{ x: to.x, y: to.y, opacity: [1, 1, 0], scale: [1, 1.05, 0.85] }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    >
      <ChipStack amount={amount} />
    </motion.div>
  );
}
