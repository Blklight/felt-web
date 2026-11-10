import { PlayingCard } from "@/components/cards/playing-card";
import type { CardCode } from "@/dev/view-types";

type Props = { cards: CardCode[]; fourColor?: boolean };

export function Hand({ cards, fourColor }: Props) {
  return (
    <div className="flex -space-x-5">
      {cards.map((code, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: cards may repeat as hidden ("??") and have no stable id
        <PlayingCard key={i} code={code} fourColor={fourColor} />
      ))}
    </div>
  );
}
