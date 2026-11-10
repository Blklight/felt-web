import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CardBackVariant, CardSkin } from "@/components/cards/skins";

type CardSkinState = {
  skin: CardSkin;
  setSkin: (skin: CardSkin) => void;
  back: CardBackVariant;
  setBack: (back: CardBackVariant) => void;
};

export const useCardSkinStore = create<CardSkinState>()(
  persist(
    (set) => ({
      skin: "classic",
      setSkin: (skin) => set({ skin }),
      back: "ink",
      setBack: (back) => set({ back }),
    }),
    {
      name: "card-skin-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
