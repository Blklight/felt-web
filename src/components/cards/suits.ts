import type { Suit } from "@/dev/view-types";

export const SUIT_PATHS: Record<Suit, string> = {
  h: "M12 21.5C5 15.5 2 12 2 8.2 2 5.3 4.2 3.2 6.9 3.2c2.1 0 4 1.2 5.1 3.1 1.1-1.9 3-3.1 5.1-3.1C19.8 3.2 22 5.3 22 8.2 22 12 19 15.5 12 21.5Z",
  d: "M12 1.5C14 6.5 17.5 10 22 12c-4.5 2-8 5.5-10 10.5C10 17.5 6.5 14 2 12c4.5-2 8-5.5 10-10.5Z",
  s: "M12 1.5S3 8.5 3 14c0 3 2.3 5 5 5 1.3 0 2.5-.6 3.2-1.6-.2 2.6-.9 4.1-2.7 5.1h7c-1.8-1-2.5-2.5-2.7-5.1.7 1 1.9 1.6 3.2 1.6 2.7 0 5-2 5-5C21 8.5 12 1.5 12 1.5Z",
  c: "M12 1.5c-2.5 0-4 1.9-4 4 0 1.7.8 2.9 2.2 3.9C9.5 9.1 8.8 9 8 9c-2.5 0-4.5 1.9-4.5 4.3S5.5 17.6 8 17.6c1.4 0 2.6-.6 3.3-1.5-.1 3.4-1 5.2-3 6.4h7.4c-2-1.2-2.9-3-3-6.4.7.9 1.9 1.5 3.3 1.5 2.5 0 4.5-1.9 4.5-4.3S18.5 9 16 9c-.8 0-1.5.1-2.2.4 1.4-1 2.2-2.2 2.2-3.9 0-2.1-1.5-4-4-4Z",
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
