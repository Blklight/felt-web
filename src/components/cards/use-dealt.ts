"use client";

import { useEffect, useState } from "react";
import type { Point } from "@/components/cards/card-motion";
import type { CardCode } from "@/dev/view-types";

const FLIGHT = 0.5;
const SETTLE = 0.15;

export function useDealt(
  cards: CardCode[],
  from: Point | undefined,
  delay: number,
  step: number,
) {
  const flying = from !== undefined;
  const [landed, setLanded] = useState(!flying);

  useEffect(() => {
    if (!flying) return;
    const last = delay + Math.max(cards.length - 1, 0) * step;
    const id = setTimeout(
      () => setLanded(true),
      (last + FLIGHT + SETTLE) * 1000,
    );
    return () => clearTimeout(id);
  }, [flying, delay, step, cards.length]);

  return {
    cards: landed ? cards : cards.map((): CardCode => "??"),
    from: landed ? undefined : from,
  };
}
