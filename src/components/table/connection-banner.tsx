"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useT } from "@/i18n/use-t";
import { useConnectionStore } from "@/store/useConnectionStore";

export function useOnlineWatcher() {
  useEffect(() => {
    const offline = () => useConnectionStore.setState({ status: "offline" });
    const online = () =>
      useConnectionStore.setState({ status: "reconnecting", retryIn: 0 });
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);
}

export function ConnectionBanner({ onRetry }: { onRetry?: () => void }) {
  const t = useT();
  const { status, attempt, retryIn } = useConnectionStore();
  if (status === "open") return null;

  const message =
    status === "connecting"
      ? t("conn.connecting")
      : status === "offline"
        ? t("conn.offline")
        : t("conn.reconnecting", { seconds: retryIn, attempt });

  return (
    <output className="flex w-full max-w-3xl items-center justify-between gap-3 rounded-lg border border-suit-red/50 bg-suit-red/10 px-4 py-2 text-sm">
      <span className="flex items-center gap-2">
        {status !== "offline" && (
          <Spinner aria-hidden="true" className="size-4" />
        )}
        {message}
      </span>
      {status === "reconnecting" && onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          {t("conn.retry")}
        </Button>
      )}
    </output>
  );
}
