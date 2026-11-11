import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { openTableSocket, socketUrl } from "@/net/socket";
import { useConnectionStore } from "@/store/useConnectionStore";

class FakeSocket {
  static all: FakeSocket[] = [];
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  constructor(readonly url: string) {
    FakeSocket.all.push(this);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.onclose?.();
  }
  receive(message: unknown) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
}

const view = { handId: 1, phase: "waiting" };
const welcome = {
  t: "welcome",
  seq: 4,
  you: { playerId: "p1", name: "Ana" },
  view,
};

function start() {
  const events = { onView: vi.fn(), onError: vi.fn(), onFatal: vi.fn() };
  const table = openTableSocket({
    code: "KQ7XZ",
    token: "T".repeat(43),
    ...events,
  });
  const ws = FakeSocket.all[0] as FakeSocket;
  return { ...events, table, ws };
}

beforeEach(() => {
  vi.useFakeTimers();
  FakeSocket.all = [];
  vi.stubGlobal("WebSocket", FakeSocket);
  useConnectionStore.setState({ status: "open", attempt: 0, retryIn: 0 });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("openTableSocket", () => {
  it("builds a ws url from the API url", () => {
    expect(socketUrl("KQ7XZ")).toMatch(/^(ws|wss)?:?.*\/v1\/rooms\/KQ7XZ\/ws$/);
  });

  it("says hello first (token in the message, never the url) and pings", () => {
    const { ws } = start();
    expect(useConnectionStore.getState().status).toBe("connecting");
    ws.onopen?.();
    expect(JSON.parse(ws.sent[0] as string)).toEqual({
      t: "hello",
      v: 1,
      token: "T".repeat(43),
    });
    expect(ws.url).not.toContain("TTTT");
    vi.advanceTimersByTime(15_000);
    expect(ws.sent[1]).toBe(JSON.stringify({ t: "ping" }));
  });

  it("opens on welcome and drops snapshots older than the last one", () => {
    const { ws, onView } = start();
    ws.onopen?.();
    ws.receive(welcome);
    expect(useConnectionStore.getState().status).toBe("open");
    expect(onView).toHaveBeenCalledWith(view, welcome.you);
    ws.receive({ t: "view", seq: 6, view: { ...view, handId: 6 } });
    ws.receive({ t: "view", seq: 5, view: { ...view, handId: 5 } });
    expect(onView).toHaveBeenCalledTimes(2);
    expect(onView).toHaveBeenLastCalledWith({ ...view, handId: 6 });
  });

  it("sends only after welcome", () => {
    const { ws, table } = start();
    ws.onopen?.();
    table.send({ t: "stand" });
    expect(ws.sent).toHaveLength(1); // hello only
    ws.receive(welcome);
    table.send({ t: "stand" });
    expect(ws.sent[1]).toBe(JSON.stringify({ t: "stand" }));
  });

  it("reports errors, and stops for good on fatal ones", () => {
    const { ws, onError, onFatal } = start();
    ws.onopen?.();
    ws.receive(welcome);
    ws.receive({ t: "error", code: "NOT_YOUR_TURN" });
    expect(onError).toHaveBeenCalledWith("NOT_YOUR_TURN");
    ws.receive({ t: "error", code: "UNAUTHORIZED" });
    expect(onFatal).toHaveBeenCalledWith("UNAUTHORIZED");
    ws.close();
    vi.advanceTimersByTime(60_000);
    expect(FakeSocket.all).toHaveLength(1);
  });

  it("reconnects with growing backoff and a countdown", () => {
    const { ws } = start();
    ws.onopen?.();
    ws.receive(welcome);
    ws.close();
    expect(useConnectionStore.getState()).toMatchObject({
      status: "reconnecting",
      attempt: 1,
      retryIn: 1,
    });
    vi.advanceTimersByTime(1000);
    expect(FakeSocket.all).toHaveLength(2);
    FakeSocket.all[1]?.close(); // second failure: wait 2 s
    expect(useConnectionStore.getState().retryIn).toBe(2);
    vi.advanceTimersByTime(1999);
    expect(FakeSocket.all).toHaveLength(2);
    vi.advanceTimersByTime(1);
    expect(FakeSocket.all).toHaveLength(3);
  });

  it("retry connects right away without a second reconnect timer", () => {
    const { ws, table } = start();
    ws.close();
    table.retry();
    expect(FakeSocket.all).toHaveLength(2);
    vi.advanceTimersByTime(20_000);
    expect(FakeSocket.all).toHaveLength(2);
  });

  it("close ends everything", () => {
    const { ws, table } = start();
    ws.onopen?.();
    table.close();
    vi.advanceTimersByTime(60_000);
    expect(FakeSocket.all).toHaveLength(1);
  });
});
