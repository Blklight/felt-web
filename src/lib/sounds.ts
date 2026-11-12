import { Howl } from "howler";
import { useSoundStore } from "@/store/useSoundStore";

const range = (name: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${name}-${i + 1}`);

// Kenney Casino Audio (CC0) in public/audio. Several takes per sound so repeats don't sound mechanical.
const FILES = {
  shuffle: ["card-shuffle"],
  deal: range("card-slide", 8),
  flip: range("card-place", 4),
  bet: range("chip-lay", 3),
  collect: range("chips-collide", 4),
  payout: range("chips-stack", 6),
  turn: ["card-fan-1"],
  hurry: ["chips-handle-1"],
  win: ["chips-handle-5"],
  lose: range("card-shove", 4),
} as const;

export type Sound = keyof typeof FILES;

const howls = new Map<string, Howl>();

// shortcut: .ogg only, so older Safari (< 17.4) stays silent; add .m4a copies if players report it.
export function playSound(sound: Sound) {
  if (typeof window === "undefined" || !("AudioContext" in window)) return;
  if (useSoundStore.getState().muted) return;
  const names = FILES[sound];
  const name = names[Math.floor(Math.random() * names.length)];
  let howl = howls.get(name);
  if (!howl) {
    howl = new Howl({ src: [`/audio/${name}.ogg`], volume: 0.6 });
    howls.set(name, howl);
  }
  howl.play();
}
