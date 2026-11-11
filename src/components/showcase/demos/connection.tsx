"use client";

import { useEffect } from "react";
import { ActionBar } from "@/components/table/action-bar";
import { ConnectionBanner } from "@/components/table/connection-banner";
import { TableSkeleton } from "@/components/table/table-skeleton";
import { Button } from "@/components/ui/button";
import { useServerError } from "@/i18n/use-server-error";
import {
  type ConnectionStatus,
  useConnectionStore,
} from "@/store/useConnectionStore";

const ERRORS = [
  "NOT_YOUR_TURN",
  "ILLEGAL_ACTION",
  "INSUFFICIENT_FUNDS",
  "SEAT_TAKEN",
  "ROOM_NOT_FOUND",
  "ROOM_FULL",
  "RATE_LIMITED",
  "UNAUTHORIZED",
  "SOMETHING_NEW",
];

const STATUSES: ConnectionStatus[] = [
  "open",
  "connecting",
  "reconnecting",
  "offline",
];

// Simulates the socket backing off: 1s, 2s, 4s… up to 30s between attempts.
function useFakeBackoff() {
  const { status, retryIn, attempt } = useConnectionStore();
  useEffect(() => {
    if (status !== "reconnecting") return;
    const id = setTimeout(() => {
      if (retryIn > 1) useConnectionStore.setState({ retryIn: retryIn - 1 });
      else
        useConnectionStore.setState({
          attempt: attempt + 1,
          retryIn: Math.min(2 ** (attempt + 1), 30),
        });
    }, 1000);
    return () => clearTimeout(id);
  }, [status, retryIn, attempt]);
}

export function ConnectionDemo() {
  const status = useConnectionStore((state) => state.status);
  const showError = useServerError();
  useFakeBackoff();

  const set = (next: ConnectionStatus) =>
    useConnectionStore.setState(
      next === "reconnecting"
        ? { status: next, attempt: 1, retryIn: 2 }
        : { status: next },
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={s === status ? "default" : "outline"}
            aria-pressed={s === status}
            onClick={() => set(s)}
          >
            {s}
          </Button>
        ))}
      </div>
      <ConnectionBanner onRetry={() => set("connecting")} />
      {status === "connecting" ? (
        <TableSkeleton />
      ) : (
        <ActionBar
          actions={[
            { type: "fold" },
            { type: "call", amount: 50 },
            { type: "raise", min: 100, max: 1000 },
          ]}
          disabled={status !== "open"}
          onAction={() => showError("NOT_YOUR_TURN")}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {ERRORS.map((code) => (
          <Button
            key={code}
            size="sm"
            variant="outline"
            onClick={() => showError(code)}
          >
            {code}
          </Button>
        ))}
      </div>
    </div>
  );
}
