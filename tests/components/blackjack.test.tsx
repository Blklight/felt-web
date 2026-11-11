import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ActionBar } from "@/components/table/action-bar";
import { Seat } from "@/components/table/seat";
import { Table } from "@/components/table/table";
import { blackjackTable } from "@/dev/fixtures";
import { handTotal, useBlackjackScript } from "@/dev/use-blackjack-script";
import { useLanguageStore } from "@/store/useLanguageStore";

beforeEach(() => {
  act(() => useLanguageStore.setState({ language: "en" }));
});

const me = blackjackTable.seats[0];

describe("betting with chips", () => {
  it("adds chips to the minimum bet and confirms it", async () => {
    const onAction = vi.fn();
    render(
      <ActionBar
        actions={[{ type: "bet", min: 10, max: 500 }]}
        mode="chips"
        defaultOpen
        onAction={onAction}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Add 25" }));
    await userEvent.click(screen.getByRole("button", { name: "Bet 35" }));
    expect(onAction).toHaveBeenCalledWith({ type: "bet", amount: 35 });
  });
});

describe("blackjack seat", () => {
  it("shows the hand total", () => {
    render(<Seat seat={{ ...me, total: 16 }} />);
    expect(screen.getByLabelText("Total 16")).toHaveTextContent("16");
  });

  it.each([
    [{ kind: "win", amount: 100 }, "Won +100"],
    [{ kind: "blackjack", amount: 150 }, "Blackjack! +150"],
    [{ kind: "push" }, "Push"],
    [{ kind: "lose" }, "Lost"],
    [{ kind: "bust" }, "Bust"],
  ] as const)("shows the outcome %j", (outcome, text) => {
    render(<Seat seat={{ ...me, outcome }} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe("blackjack table", () => {
  it("asks for bets in the betting phase", () => {
    render(
      <Table
        view={{
          ...blackjackTable,
          phase: "betting",
          board: [],
          seats: blackjackTable.seats.map((s) => ({ ...s, cards: [] })),
        }}
      />,
    );
    expect(screen.getByText("Place your bets")).toBeInTheDocument();
  });

  it("shows the dealer total", () => {
    render(<Table view={{ ...blackjackTable, dealerTotal: 10 }} />);
    expect(screen.getByText("Dealer: 10")).toBeInTheDocument();
  });
});

describe("handTotal (dev dealer)", () => {
  it.each([
    [["Ah", "Kd"], 21],
    [["Ah", "Ad", "9c"], 21],
    [["Ts", "9h", "5c"], 24],
    [["Ah", "6d"], 17],
    [["Ah", "6d", "Kc"], 17],
  ] as const)("%j totals %i", (cards, total) => {
    expect(handTotal([...cards])).toBe(total);
  });
});

const advance = (ms: number) => {
  for (let elapsed = 0; elapsed < ms; elapsed += 250) {
    act(() => vi.advanceTimersByTime(250));
  }
};

describe("useBlackjackScript", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("waits for the player's bet, deals, lets them play and settles the round", () => {
    const { result } = renderHook(() => useBlackjackScript(1000));
    expect(result.current.view.phase).toBe("betting");
    expect(result.current.view.you.legalActions[0]).toMatchObject({
      type: "bet",
      min: 10,
    });

    act(() => result.current.act({ type: "bet", amount: 50 }));
    expect(result.current.view.phase).toBe("dealing");
    expect(result.current.view.seats[0].cards).toHaveLength(2);
    expect(result.current.view.board).toEqual([
      result.current.view.board[0],
      "??",
    ]);

    advance(8000);
    const view = result.current.view;
    if (view.phase === "players") {
      expect(view.you.legalActions.map((a) => a.type)).toEqual(
        expect.arrayContaining(["hit", "stand"]),
      );
      act(() => result.current.act({ type: "stand" }));
    }

    advance(20000);
    expect(["results", "betting"]).toContain(result.current.view.phase);
    const settled = result.current.view;
    if (settled.phase === "results") {
      expect(settled.seats[0].outcome).toBeDefined();
      expect(settled.board).not.toContain("??");
    }
  });

  it("starts a new round after the results", () => {
    const { result } = renderHook(() => useBlackjackScript(1000));
    act(() => result.current.act({ type: "bet", amount: 50 }));
    advance(8000);
    if (result.current.view.phase === "players")
      act(() => result.current.act({ type: "stand" }));
    advance(40000);
    expect(result.current.view.phase).toBe("betting");
    expect(result.current.round).toBeGreaterThan(0);
  });
});
