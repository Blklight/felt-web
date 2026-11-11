import { isAxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import type { Profile } from "@/net/protocol";
import type { ApiResponse } from "@/types/api.types";

export class ApiFailure extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly fields: Record<string, string> = {},
  ) {
    super(code);
  }
}

async function call<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    return (await request).data.data as T;
  } catch (error) {
    if (isAxiosError<ApiResponse<unknown>>(error) && error.response) {
      const { error: body } = error.response.data ?? {};
      throw new ApiFailure(
        body?.code ?? "UNKNOWN",
        error.response.status,
        body?.fields,
      );
    }
    throw new ApiFailure("NETWORK", 0);
  }
}

export type Account = { playerId: string; token: string; profile: Profile };

export const createAccount = (body: { name: string; avatarId?: string }) =>
  call<Account>(apiClient.post("/v1/accounts", body));

// `token` is for checking a recovery code before it replaces the stored one.
export const getMe = (token?: string) =>
  call<Profile>(
    apiClient.get("/v1/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  );

export const patchMe = (
  body: Partial<Pick<Profile, "name" | "avatarId" | "skinId" | "backId">>,
) => call<Profile>(apiClient.patch("/v1/me", body));

export const deleteMe = () => call<null>(apiClient.delete("/v1/me"));

export type RoomInfo = {
  code: string;
  game: "poker" | "blackjack";
  seats: number;
  taken: number;
};

export const createRoom = (
  game: RoomInfo["game"],
  config?: Record<string, unknown>,
) => call<{ code: string }>(apiClient.post("/v1/rooms", { game, config }));

export const getRoom = (code: string) =>
  call<RoomInfo>(apiClient.get(`/v1/rooms/${code}`));
