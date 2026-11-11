import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CardBackVariant, CardSkin } from "@/components/cards/skins";

type CardSkinState = {
  skin: CardSkin;
  setSkin: (skin: CardSkin) => void;
  back: CardBackVariant;
  setBack: (back: CardBackVariant) => void;
  overrideOthers: boolean;
  setOverrideOthers: (value: boolean) => void;
};

export const useCardSkinStore = create<CardSkinState>()(
  persist(
    (set) => ({
      skin: "classic",
      setSkin: (skin) => set({ skin }),
      back: "ink",
      setBack: (back) => set({ back }),
      overrideOthers: false,
      setOverrideOthers: (overrideOthers) => set({ overrideOthers }),
    }),
    {
      name: "card-skin-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useCardLook(skin: CardSkin, back: CardBackVariant) {
  const overrideOthers = useCardSkinStore((state) => state.overrideOthers);
  return overrideOthers ? { skin: undefined, back: undefined } : { skin, back };
}
