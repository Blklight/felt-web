import { PlayingCard } from "@/components/cards/playing-card";
import type { CardCode } from "@/dev/view-types";
import { keyedCards } from "@/lib/cards";

type Props = { cards: CardCode[]; fourColor?: boolean };

export function Hand({ cards, fourColor }: Props) {
  return (
    <div className="flex -space-x-5">
      {keyedCards(cards).map(({ code, key }) => (
        <PlayingCard
          key={key}
          code={code}
          fourColor={fourColor}
          className="w-11 sm:w-16"
        />
      ))}
    </div>
  );
}
