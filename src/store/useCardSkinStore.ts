import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CardSkin } from "@/components/cards/skins";

type CardSkinState = {
  skin: CardSkin;
  setSkin: (skin: CardSkin) => void;
};

export const useCardSkinStore = create<CardSkinState>()(
  persist(
    (set) => ({
      skin: "classic",
      setSkin: (skin) => set({ skin }),
    }),
    {
      name: "card-skin-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
