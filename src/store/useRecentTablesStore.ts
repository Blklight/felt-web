import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type RecentTable = { code: string; game: "poker" | "blackjack" };

const KEEP = 5;

type RecentTablesState = {
  tables: RecentTable[];
  visit: (code: string, game: RecentTable["game"]) => void;
  clear: () => void;
};

export const useRecentTablesStore = create<RecentTablesState>()(
  persist(
    (set) => ({
      tables: [],
      visit: (code, game) =>
        set((state) => ({
          tables: [
            { code, game },
            ...state.tables.filter((t) => t.code !== code),
          ].slice(0, KEEP),
        })),
      clear: () => set({ tables: [] }),
    }),
    {
      name: "recent-tables-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
