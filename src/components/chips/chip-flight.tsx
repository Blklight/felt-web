"use client";

import { motion } from "motion/react";
import { ChipStack } from "@/components/chips/chip-stack";
import type { Point } from "@/components/table/seat-positions";

type Props = {
  amount: number;
  from: Point;
  to: Point;
  onComplete?: () => void;
  kind?: "collect" | "payout";
};

export function ChipFlight({
  amount,
  from,
  to,
  onComplete,
  kind = "collect",
}: Props) {
  return (
    <motion.div
      data-flight={kind}
      className="pointer-events-none absolute top-0 left-0 z-30"
      initial={{ x: from.x, y: from.y, opacity: 1, scale: 1 }}
      animate={{ x: to.x, y: to.y, opacity: [1, 1, 0], scale: [1, 1.05, 0.85] }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <ChipStack amount={amount} />
      </div>
    </motion.div>
  );
}
