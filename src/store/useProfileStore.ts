import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// The account lives on felt-server (GET/PATCH/DELETE /v1/me). Only its id and token are kept here;
// the token is also the recovery code.
type ProfileState = {
  playerId: string | null;
  token: string | null;
  setAccount: (playerId: string, token: string) => void;
  clear: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      playerId: null,
      token: null,
      setAccount: (playerId, token) => set({ playerId, token }),
      clear: () => set({ playerId: null, token: null }),
    }),
    { name: "felt-account", storage: createJSONStorage(() => localStorage) },
  ),
);
