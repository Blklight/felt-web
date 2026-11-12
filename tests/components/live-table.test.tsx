import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiveTable } from "@/components/screens/live-table";
import { blackjackTable, pokerTable, spectatorTable } from "@/dev/fixtures";
import type { TableView } from "@/dev/view-types";
import { useLanguageStore } from "@/store/useLanguageStore";
import { renderWithQuery } from "../helpers/query";

const socket = vi.hoisted(() => ({
  state: { view: null, fatal: null } as {
    view: TableView | null;
    fatal: string | null;
  },
  send: vi.fn(),
  retry: vi.fn(),
}));

vi.mock("@/net/use-table-socket", () => ({
  useTableSocket: () => ({
    ...socket.state,
    send: socket.send,
    retry: socket.retry,
  }),
}));

vi.mock("@/net/queries", () => ({
  ME_KEY: ["me"],
  useMe: () => ({ data: { balance: 5000 } }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  socket.state = { view: null, fatal: null };
  act(() => useLanguageStore.setState({ language: "en" }));
});

const watching: TableView = {
  ...spectatorTable,
  seats: spectatorTable.seats.map((seat, i) =>
    i < 2 ? seat : { ...seat, status: "empty", name: "", cards: [] },
  ),
  buyIn: { min: 1000, max: 5000 },
};

describe("LiveTable", () => {
  it("shows a skeleton until the first snapshot arrives", () => {
    renderWithQuery(<LiveTable code="KQ7XZ" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("explains a room that does not exist", () => {
    socket.state = { view: null, fatal: "ROOM_NOT_FOUND" };
    renderWithQuery(<LiveTable code="KQ7XZ" />);
    expect(screen.getByText("This room does not exist.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to lobby" }),
    ).toBeInTheDocument();
  });

  it("sends sit with the chosen buy-in", async () => {
    socket.state = { view: watching, fatal: null };
    renderWithQuery(<LiveTable code="KQ7XZ" />);
    expect(screen.getByText("5,000")).toBeInTheDocument();
    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sit at seat/ })[0] as HTMLElement,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Sit with 1,000" }),
    );
    expect(socket.send).toHaveBeenCalledWith({
      t: "sit",
      seat: 2,
      buyIn: 1000,
    });
  });

  it("sends the chosen action and the leave request", async () => {
    socket.state = { view: pokerTable(3), fatal: null };
    renderWithQuery(<LiveTable code="KQ7XZ" />);
    await userEvent.click(screen.getByRole("button", { name: "Fold" }));
    expect(socket.send).toHaveBeenCalledWith({
      t: "action",
      action: { type: "fold", amount: undefined },
    });
    await userEvent.click(screen.getByRole("button", { name: "Leave table" }));
    await userEvent.click(screen.getByRole("button", { name: "Leave" }));
    expect(socket.send).toHaveBeenCalledWith({ t: "stand" });
  });

  it("plays blackjack with the same screen", async () => {
    socket.state = { view: blackjackTable, fatal: null };
    renderWithQuery(<LiveTable code="KQ7XZ" />);
    await userEvent.click(screen.getByRole("button", { name: "Stand" }));
    expect(socket.send).toHaveBeenCalledWith({
      t: "action",
      action: { type: "stand", amount: undefined },
    });
  });
});
