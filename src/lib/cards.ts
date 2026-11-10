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
