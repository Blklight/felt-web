import { PlayingCard } from "@/components/cards/playing-card";
import type { CardCode } from "@/dev/view-types";
import { keyedCards } from "@/lib/cards";
import { cn } from "@/lib/utils";

type Props = {
  cards: CardCode[];
  fourColor?: boolean;
  className?: string;
  cardClassName?: string;
};

export function Hand({ cards, fourColor, className, cardClassName }: Props) {
  return (
    <div className={cn("flex -space-x-5", className)}>
      {keyedCards(cards).map(({ code, key }) => (
        <PlayingCard
          key={key}
          code={code}
          fourColor={fourColor}
          className={cn("w-11 sm:w-16", cardClassName)}
        />
      ))}
    </div>
  );
}
