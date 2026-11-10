import type { CardCode, Rank, Suit } from "@/dev/view-types";

export type ParsedCard =
  | { hidden: true }
  | { hidden: false; rank: Rank; suit: Suit };

export function parseCard(code: CardCode): ParsedCard {
  if (code === "??") return { hidden: true };
  return { hidden: false, rank: code[0] as Rank, suit: code[1] as Suit };
}

export function suitColor(suit: Suit): "red" | "black" {
  return suit === "h" || suit === "d" ? "red" : "black";
}

export function keyedCards(
  cards: CardCode[],
): { code: CardCode; key: string }[] {
  const seen = new Map<CardCode, number>();
  return cards.map((code) => {
    const n = (seen.get(code) ?? 0) + 1;
    seen.set(code, n);
    return { code, key: `${code}#${n}` };
  });
}
