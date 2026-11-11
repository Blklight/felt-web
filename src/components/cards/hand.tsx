import { PlayingCard } from "@/components/cards/playing-card";
import type { CardBackVariant, CardSkin } from "@/components/cards/skins";
import type { CardCode } from "@/dev/view-types";
import { keyedCards } from "@/lib/cards";
import { cn } from "@/lib/utils";

type Props = {
  cards: CardCode[];
  skin?: CardSkin;
  back?: CardBackVariant;
  className?: string;
  cardClassName?: string;
};

export function Hand({ cards, skin, back, className, cardClassName }: Props) {
  return (
    <div className={cn("flex -space-x-5", className)}>
      {keyedCards(cards).map(({ code, key }) => (
        <PlayingCard
          key={key}
          code={code}
          skin={skin}
          back={back}
          className={cn("w-11 sm:w-16", cardClassName)}
        />
      ))}
    </div>
  );
}
