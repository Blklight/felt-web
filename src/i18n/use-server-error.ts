"use client";

import { toast } from "sonner";
import type { MessageKey } from "@/i18n/dictionaries";
import { useT } from "@/i18n/use-t";

const KNOWN = [
  "NOT_YOUR_TURN",
  "ILLEGAL_ACTION",
  "INSUFFICIENT_FUNDS",
  "SEAT_TAKEN",
  "ROOM_NOT_FOUND",
  "ROOM_FULL",
  "RATE_LIMITED",
  "UNAUTHORIZED",
] as const;

export type ServerErrorCode = (typeof KNOWN)[number];

export function useServerError() {
  const t = useT();
  return (code: string) => {
    const known = (KNOWN as readonly string[]).includes(code);
    const key = (known ? `error.${code}` : "error.UNKNOWN") as MessageKey;
    toast.error(t(key));
  };
}
