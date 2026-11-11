import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Language } from "@/i18n/dictionaries";

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "pt-br",
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "lang-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
