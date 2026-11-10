import type { Suit } from "@/dev/view-types";

export const SUIT_PATHS: Record<Suit, string> = {
  h: "M12 21C4 14 1 10 1 6.5A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 11 1.5C23 10 20 14 12 21Z",
  d: "M12 1 21 12 12 23 3 12Z",
  s: "M12 1C12 1 2 9 2 15a5 5 0 0 0 9 2.5C10.800 20 10 21.500 8 23h8c-2-1.500-2.800-3-3-5.500A5 5 0 0 0 22 15C22 9 12 1 12 1Z",
  c: "M12 1a5 5 0 0 0-2.500 9.500A5 5 0 1 0 11 17c-.2 3-1 4.500-3 6h8c-2-1.500-2.800-3-3-6a5 5 0 1 0 1.500-6.500A5 5 0 0 0 12 1Z",
};

const DEFAULT_FILL: Record<Suit, string> = {
  s: "var(--color-card-ink)",
  c: "var(--color-card-ink)",
  h: "var(--color-suit-red)",
  d: "var(--color-suit-red)",
};

const FOUR_COLOR_FILL: Record<Suit, string> = {
  s: "var(--color-card-ink)",
  h: "var(--color-suit-red)",
  d: "#1d4ed8",
  c: "#15803d",
};

export function suitFill(suit: Suit, fourColor: boolean): string {
  return (fourColor ? FOUR_COLOR_FILL : DEFAULT_FILL)[suit];
}
