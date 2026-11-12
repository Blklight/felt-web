import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SoundState = { muted: boolean; toggle: () => void };

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      muted: false,
      toggle: () => set((state) => ({ muted: !state.muted })),
    }),
    { name: "sound-storage", storage: createJSONStorage(() => localStorage) },
  ),
);
