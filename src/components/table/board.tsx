import { PlayingCard } from "@/components/cards/playing-card";
import type { CardCode } from "@/dev/view-types";
import { keyedCards } from "@/lib/cards";

type Props = { cards: CardCode[]; slots?: number; fourColor?: boolean };

export function Board({ cards, slots = 5, fourColor }: Props) {
  const empty = Array.from(
    { length: Math.max(0, slots - cards.length) },
    (_, n) => cards.length + n,
  );
  return (
    <div className="flex gap-1.5">
      {keyedCards(cards).map(({ code, key }) => (
        <PlayingCard
          key={key}
          code={code}
          fourColor={fourColor}
          className="w-8 sm:w-14"
        />
      ))}
      {empty.map((slot) => (
        <div
          key={slot}
          aria-hidden="true"
          className="aspect-[64/90] w-8 rounded-md sm:w-14 border border-bone/20 border-dashed"
        />
      ))}
    </div>
  );
}
