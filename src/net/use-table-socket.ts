"use client";

import { useEffect, useRef, useState } from "react";
import type { TableView } from "@/dev/view-types";
import { useServerError } from "@/i18n/use-server-error";
import type { ClientMessage } from "@/net/protocol";
import { openTableSocket, type TableSocket } from "@/net/socket";
import { useConnectionStore } from "@/store/useConnectionStore";
import { useProfileStore } from "@/store/useProfileStore";

// The room as the server describes it. `view` stays null until the first snapshot.
export function useTableSocket(code: string) {
  const token = useProfileStore((state) => state.token);
  const [view, setView] = useState<TableView | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const socket = useRef<TableSocket | null>(null);
  const showError = useServerError();
  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  useEffect(() => {
    if (!token) return;
    setView(null);
    setFatal(null);
    const opened = openTableSocket({
      code,
      token,
      onView: setView,
      onError: (error) => showErrorRef.current(error),
      onFatal: (error) => {
        if (error === "UNAUTHORIZED") useProfileStore.getState().clear();
        setFatal(error);
      },
    });
    socket.current = opened;
    return () => {
      opened.close();
      socket.current = null;
      useConnectionStore.setState({ status: "open", attempt: 0, retryIn: 0 });
    };
  }, [code, token]);

  return {
    view,
    fatal,
    send: (message: ClientMessage) => socket.current?.send(message),
    retry: () => socket.current?.retry(),
  };
}
