import type { Suit } from "@/dev/view-types";

export type CardSkin = "classic" | "four-color" | "fantasy" | "noir";

export const CARD_SKINS: CardSkin[] = [
  "classic",
  "four-color",
  "fantasy",
  "noir",
];

const INK = "var(--color-card-ink)";
const BONE = "var(--color-bone)";
const RED = "var(--color-suit-red)";

const SUIT_FILL: Record<CardSkin, Record<Suit, string>> = {
  classic: { s: INK, c: INK, h: RED, d: RED },
  "four-color": { s: INK, h: RED, d: "#1d4ed8", c: "#15803d" },
  fantasy: { h: RED, d: "#c2570a", c: INK, s: "#1d4ed8" },
  noir: { s: BONE, c: BONE, h: "#ff5a4f", d: "#ff5a4f" },
};

const FACE: Record<CardSkin, string> = {
  classic: BONE,
  "four-color": BONE,
  fantasy: BONE,
  noir: INK,
};

export const suitFill = (suit: Suit, skin: CardSkin) => SUIT_FILL[skin][suit];
export const faceColor = (skin: CardSkin) => FACE[skin];
