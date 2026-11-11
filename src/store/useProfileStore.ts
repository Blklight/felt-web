import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { newRecoveryCode } from "@/lib/recovery-code";

// shortcut: stands in for the account on felt-server (GET/PATCH/DELETE /v1/me), until the API exists; the recovery code is the account token.
type Profile = {
  name: string;
  avatarId: string;
  balance: number;
  recoveryCode: string;
};

type ProfileState = Profile & {
  setName: (name: string) => void;
  setAvatar: (avatarId: string) => void;
  importCode: (code: string) => void;
  reset: () => void;
};

export const freshProfile = (): Profile => ({
  name: "Player",
  avatarId: "a1",
  balance: 5000,
  recoveryCode: newRecoveryCode(),
});

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...freshProfile(),
      setName: (name) => set({ name }),
      setAvatar: (avatarId) => set({ avatarId }),
      importCode: (recoveryCode) => set({ recoveryCode }),
      reset: () => set(freshProfile()),
    }),
    { name: "profile-storage", storage: createJSONStorage(() => localStorage) },
  ),
);
