import { PlayingCard } from "@/components/cards/playing-card";
import type { CardCode } from "@/dev/view-types";

type Props = { cards: CardCode[]; slots?: number; fourColor?: boolean };

export function Board({ cards, slots = 5, fourColor }: Props) {
  const empty = Math.max(0, slots - cards.length);
  return (
    <div className="flex gap-1.5">
      {cards.map((code, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: positional board slots
        <PlayingCard key={i} code={code} fourColor={fourColor} />
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
          key={i}
          aria-hidden="true"
          className="aspect-[64/90] w-14 rounded-md border border-bone/20 border-dashed"
        />
      ))}
    </div>
  );
}
