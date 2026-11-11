"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CardBack } from "@/components/cards/card-back";
import { PlayingCard } from "@/components/cards/playing-card";
import type { CardBackVariant, CardSkin } from "@/components/cards/skins";
import type { CardCode } from "@/dev/view-types";
import { cn } from "@/lib/utils";

export const FLIGHT_SECONDS = 0.45;
const FLIP_SECONDS = 0.45;

type Props = {
  code: CardCode;
  skin?: CardSkin;
  back?: CardBackVariant;
  className?: string;
  dealFrom?: RefObject<HTMLElement | null>;
  dealDelay?: number;
};

export function TableCard({
  code,
  skin,
  back,
  className,
  dealFrom,
  dealDelay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [landed, setLanded] = useState(!dealFrom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the flight runs once, when the card is dealt
  useLayoutEffect(() => {
    const card = ref.current;
    const deck = dealFrom?.current;
    if (!dealFrom || !card || !deck || reduce) return;
    card.style.transform = "";
    const a = card.getBoundingClientRect();
    const b = deck.getBoundingClientRect();
    const x = b.left + b.width / 2 - (a.left + a.width / 2);
    const y = b.top + b.height / 2 - (a.top + a.height / 2);
    const scale = a.width > 0 ? b.width / a.width : 1;
    card.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale})`;
    card.style.zIndex = "40";
    const flight = animate(
      card,
      { x: [x, 0], y: [y, 0], scale: [scale, 1] },
      { delay: dealDelay, duration: FLIGHT_SECONDS, ease: [0.2, 0.8, 0.3, 1] },
    );
    flight.then(() => {
      card.style.zIndex = "";
    });
    return () => {
      flight.stop();
      card.style.transform = "";
      card.style.zIndex = "";
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: landing is scheduled once, when the card is dealt
  useEffect(() => {
    if (landed) return;
    const id = setTimeout(
      () => setLanded(true),
      (dealDelay + FLIGHT_SECONDS) * 1000,
    );
    return () => clearTimeout(id);
  }, []);

  const faceUp = code !== "??" && landed;

  return (
    <div
      ref={ref}
      className={cn(
        "relative aspect-[5/7] w-20 [perspective:800px]",
        className,
      )}
    >
      <motion.div
        className="relative size-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: faceUp ? 0 : 180 }}
        transition={{ duration: FLIP_SECONDS, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {faceUp && <PlayingCard code={code} skin={skin} className="w-full" />}
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardBack variant={back} decorative={faceUp} className="w-full" />
        </div>
      </motion.div>
    </div>
  );
}
