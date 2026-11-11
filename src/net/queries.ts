"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiFailure, getMe } from "@/net/api";
import { useProfileStore } from "@/store/useProfileStore";

export const ME_KEY = ["me"] as const;

// The profile is the server's; 401 means the account is gone, so the stored token is dropped.
export function useMe() {
  const token = useProfileStore((state) => state.token);
  return useQuery({
    queryKey: ME_KEY,
    enabled: token !== null,
    retry: false,
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        if (error instanceof ApiFailure && error.status === 401) {
          useProfileStore.getState().clear();
        }
        throw error;
      }
    },
  });
}
