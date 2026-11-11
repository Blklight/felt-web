import { create } from "zustand";

export type ConnectionStatus =
  | "connecting"
  | "open"
  | "reconnecting"
  | "offline";

type ConnectionState = {
  status: ConnectionStatus;
  attempt: number;
  retryIn: number;
};

export const useConnectionStore = create<ConnectionState>()(() => ({
  status: "open",
  attempt: 0,
  retryIn: 0,
}));
