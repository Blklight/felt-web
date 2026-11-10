import type { CSSProperties } from "react";
import type { Suit } from "@/dev/view-types";

export type CardSkin = "classic" | "fantasy" | "noir" | "vice";
export type CardBackVariant = "ink" | "neon" | "vice" | "suits";

export const CARD_SKINS: CardSkin[] = ["classic", "fantasy", "noir", "vice"];
export const CARD_BACKS: CardBackVariant[] = ["ink", "neon", "vice", "suits"];

const INK = "var(--color-card-ink)";
const BONE = "var(--color-bone)";
const RED = "var(--color-suit-red)";
const VICE_LIGHT = "#fff6ea";
const VICE_CYAN = "var(--color-neon-cyan)";

const SUIT_FILL: Record<CardSkin, Record<Suit, string>> = {
  classic: { s: INK, c: INK, h: RED, d: RED },
  fantasy: { h: RED, d: "#c026d3", c: INK, s: "#1d4ed8" },
  noir: { s: BONE, c: BONE, h: "#ff5a4f", d: "#ff5a4f" },
  vice: { h: VICE_LIGHT, d: VICE_LIGHT, s: VICE_CYAN, c: VICE_CYAN },
};

const VICE_RED =
  "linear-gradient(155deg, #ff7a45 0%, #e8336d 55%, #a3126b 100%)";
const VICE_DARK =
  "linear-gradient(155deg, #3b1a78 0%, #1a0b3d 55%, #07030f 100%)";

export const suitFill = (suit: Suit, skin: CardSkin) => SUIT_FILL[skin][suit];

export function faceStyle(skin: CardSkin, suit: Suit): CSSProperties {
  const red = suit === "h" || suit === "d";
  if (skin === "noir") return { backgroundColor: INK };
  if (skin === "vice") {
    return {
      backgroundColor: red ? "#e8336d" : "#1a0b3d",
      backgroundImage: red ? VICE_RED : VICE_DARK,
    };
  }
  return { backgroundColor: BONE };
}

type CenterValue = {
  font: string;
  size: number;
  y: number;
  tenSize: number;
  tenY: number;
  tenSpacing: number;
};

const BUNGEE: CenterValue = {
  font: "var(--font-bungee-shade), sans-serif",
  size: 68,
  y: 90,
  tenSize: 52,
  tenY: 84.3,
  tenSpacing: -4,
};
const MONOTON: CenterValue = {
  font: "var(--font-monoton), sans-serif",
  size: 62,
  y: 88,
  tenSize: 44,
  tenY: 82,
  tenSpacing: -2,
};

export const centerValue = (skin: CardSkin) =>
  skin === "vice" ? MONOTON : BUNGEE;
