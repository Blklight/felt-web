import type { Point } from "@/components/cards/card-motion";
import { PlayingCard } from "@/components/cards/playing-card";
import type { CardBackVariant, CardSkin } from "@/components/cards/skins";
import type { CardCode } from "@/dev/view-types";
import { keyedCards } from "@/lib/cards";
import { cn } from "@/lib/utils";

type Props = {
  cards: CardCode[];
  skin?: CardSkin;
  back?: CardBackVariant;
  from?: Point;
  dealDelay?: number;
  className?: string;
  cardClassName?: string;
};

export function Hand({
  cards,
  skin,
  back,
  from,
  dealDelay = 0,
  className,
  cardClassName,
}: Props) {
  return (
    <div className={cn("flex -space-x-5", className)}>
      {keyedCards(cards).map(({ code, key }, i) => (
        <PlayingCard
          key={key}
          code={code}
          skin={skin}
          back={back}
          delay={dealDelay + i * 0.08}
          from={from}
          className={cn("w-11 sm:w-16", cardClassName)}
        />
      ))}
    </div>
  );
}
