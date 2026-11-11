import type { TableView } from "@/dev/view-types";
import { type ClientMessage, PING, PROTOCOL_VERSION } from "@/net/protocol";
import { useConnectionStore } from "@/store/useConnectionStore";

const PING_MS = 15_000;
const MAX_BACKOFF_MS = 15_000;

// Errors that end the connection for good: retrying cannot fix them.
const FATAL = new Set(["UNAUTHORIZED", "ROOM_NOT_FOUND", "FORBIDDEN_ORIGIN"]);

export type TableSocketOptions = {
  code: string;
  token: string;
  onView: (view: TableView, you?: { playerId: string; name: string }) => void;
  onError: (code: string) => void;
  onFatal: (code: string) => void;
};

export type TableSocket = {
  send: (message: ClientMessage) => void;
  retry: () => void;
  close: () => void;
};

export const socketUrl = (code: string) =>
  `${(process.env.NEXT_PUBLIC_API_URL ?? "").replace(/^http/, "ws")}/v1/rooms/${code}/ws`;

type ServerEvent =
  | {
      t: "welcome";
      seq: number;
      you: { playerId: string; name: string };
      view: TableView;
    }
  | { t: "view"; seq: number; view: TableView }
  | { t: "error"; code: string }
  | { t: "pong" };

const setConnection = (
  state: Partial<ReturnType<typeof useConnectionStore.getState>>,
) => useConnectionStore.setState(state);

// One connection to a room: hello, ping, snapshots ordered by seq, reconnect with backoff.
export function openTableSocket(options: TableSocketOptions): TableSocket {
  let ws: WebSocket | null = null;
  let ready = false; // true once `welcome` arrived
  let stopped = false;
  let attempt = 0;
  let lastSeq = -1;
  let ping: ReturnType<typeof setInterval> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let countdown: ReturnType<typeof setInterval> | undefined;

  const clearTimers = () => {
    clearInterval(ping);
    clearTimeout(retryTimer);
    clearInterval(countdown);
  };

  const connect = () => {
    clearTimers();
    setConnection({
      status: attempt === 0 ? "connecting" : "reconnecting",
      attempt,
      retryIn: 0,
    });
    const socket = new WebSocket(socketUrl(options.code));
    ws = socket;
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          t: "hello",
          v: PROTOCOL_VERSION,
          token: options.token,
        }),
      );
      ping = setInterval(() => socket.send(PING), PING_MS);
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(String(event.data)) as ServerEvent;
      if (message.t === "welcome") {
        ready = true;
        attempt = 0;
        lastSeq = message.seq;
        setConnection({ status: "open", attempt: 0, retryIn: 0 });
        options.onView(message.view, message.you);
      } else if (message.t === "view") {
        if (message.seq < lastSeq) return; // an older snapshot never replaces a newer one
        lastSeq = message.seq;
        options.onView(message.view);
      } else if (message.t === "error") {
        if (FATAL.has(message.code)) {
          stopped = true;
          options.onFatal(message.code);
        } else options.onError(message.code);
      }
    };
    socket.onclose = () => {
      ready = false;
      clearTimers();
      if (stopped) return;
      attempt += 1;
      const delay = Math.min(1000 * 2 ** (attempt - 1), MAX_BACKOFF_MS);
      let left = Math.ceil(delay / 1000);
      setConnection({ status: "reconnecting", attempt, retryIn: left });
      countdown = setInterval(() => {
        left = Math.max(0, left - 1);
        setConnection({ retryIn: left });
      }, 1000);
      retryTimer = setTimeout(connect, delay);
    };
  };

  connect();

  return {
    send: (message) => {
      if (ws && ready) ws.send(JSON.stringify(message));
    },
    retry: () => {
      if (stopped) return;
      if (ws) ws.onclose = null; // the old socket must not schedule its own reconnect
      ws?.close();
      connect();
    },
    close: () => {
      stopped = true;
      clearTimers();
      ws?.close();
    },
  };
}
