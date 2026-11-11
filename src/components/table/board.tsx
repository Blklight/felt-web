import { PlayingCard } from "@/components/cards/playing-card";
import type { CardCode } from "@/dev/view-types";
import { keyedCards } from "@/lib/cards";

type Props = { cards: CardCode[]; slots?: number };

export function Board({ cards, slots = 5 }: Props) {
  const empty = Array.from(
    { length: Math.max(0, slots - cards.length) },
    (_, n) => cards.length + n,
  );
  return (
    <div className="flex gap-1.5">
      {keyedCards(cards).map(({ code, key }) => (
        <PlayingCard key={key} code={code} className="w-10 sm:w-16" />
      ))}
      {empty.map((slot) => (
        <div
          key={slot}
          aria-hidden="true"
          className="aspect-[5/7] w-8 rounded-md sm:w-14 border border-bone/20 border-dashed"
        />
      ))}
    </div>
  );
}
