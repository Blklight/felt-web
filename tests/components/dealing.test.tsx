import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hand } from "@/components/cards/hand";
import { TableCard } from "@/components/cards/table-card";
import { Board } from "@/components/table/board";
import { dealSchedule } from "@/components/table/deal-schedule";
import { Table } from "@/components/table/table";
import { blackjackTable, pokerTable } from "@/dev/fixtures";
import { HAND_STEPS, useHandScript } from "@/dev/use-hand-script";
import type { TableView } from "@/dev/view-types";
import { useLanguageStore } from "@/store/useLanguageStore";

const deckRef = () => ({ current: document.createElement("div") });

beforeEach(() => {
  act(() => useLanguageStore.setState({ language: "en" }));
});

describe("TableCard", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("flies face down from the deck and turns over after landing", () => {
    render(<TableCard code="As" dealFrom={deckRef()} dealDelay={0.4} />);
    expect(
      screen.queryByRole("img", { name: "Ace of spades" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Face-down card" }),
    ).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(
      screen.getByRole("img", { name: "Ace of spades" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Face-down card" }),
    ).not.toBeInTheDocument();
  });

  it("keeps an unknown card face down after landing", () => {
    render(<TableCard code="??" dealFrom={deckRef()} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(
      screen.getByRole("img", { name: "Face-down card" }),
    ).toBeInTheDocument();
  });

  it("turns over in place when its value arrives, without remounting", () => {
    const { container, rerender } = render(<TableCard code="??" />);
    const before = container.firstElementChild;
    rerender(<TableCard code="Qh" />);
    expect(container.firstElementChild).toBe(before);
    expect(
      screen.getByRole("img", { name: "Queen of hearts" }),
    ).toBeInTheDocument();
  });

  it("is face up right away when it is not being dealt", () => {
    render(<TableCard code="Kd" />);
    expect(
      screen.getByRole("img", { name: "King of diamonds" }),
    ).toBeInTheDocument();
  });
});

describe("Hand and Board keep their slots", () => {
  it("reveals an opponent's card in the same slot at showdown", () => {
    const { container, rerender } = render(<Hand cards={["??", "??"]} />);
    const slot = container.firstElementChild?.firstElementChild;
    rerender(<Hand cards={["Qh", "Jh"]} />);
    expect(container.firstElementChild?.firstElementChild).toBe(slot);
    expect(
      screen.getByRole("img", { name: "Queen of hearts" }),
    ).toBeInTheDocument();
  });

  it("shows face-down cards for the board cards not revealed yet", () => {
    render(<Board cards={["7h", "Td", "2c"]} faceDown />);
    expect(
      screen.getByRole("img", { name: "Seven of hearts" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Face-down card" })).toHaveLength(
      2,
    );
  });

  it("shows empty spots when the board is not dealt face down", () => {
    render(<Board cards={["7h"]} />);
    expect(
      screen.queryAllByRole("img", { name: "Face-down card" }),
    ).toHaveLength(0);
  });
});

describe("dealSchedule", () => {
  it("deals one card per player at a time, starting left of the dealer, then the board", () => {
    const view = pokerTable(4);
    const { seats, board } = dealSchedule(view, 0.1);
    const dealer = view.seats.findIndex((s) => s.isDealer);
    const first = (dealer + 1) % 4;
    expect(seats[first][0]).toBe(0);
    expect(seats[dealer][0]).toBeCloseTo(0.3);
    expect(seats[first][1]).toBeCloseTo(0.4);
    const lastHole = Math.max(...seats.flat());
    expect(Math.min(...board)).toBeGreaterThan(lastHole);
    expect(board).toHaveLength(5);
  });

  it("skips empty seats and gives the blackjack dealer a card after each round", () => {
    const { seats, board } = dealSchedule(blackjackTable, 0.1);
    const empty = blackjackTable.seats.findIndex((s) => s.status === "empty");
    expect(seats[empty]).toEqual([]);
    const active = blackjackTable.seats.filter(
      (s) => s.status !== "empty",
    ).length;
    expect(board[0]).toBeCloseTo(active * 0.1);
    expect(board[1]).toBeCloseTo((2 * active + 1) * 0.1);
  });
});

describe("Table chip flights", () => {
  it("sends bets to the pot when they are collected", () => {
    const before: TableView = { ...pokerTable(3), pots: [100] };
    const after: TableView = {
      ...before,
      pots: [150],
      seats: before.seats.map((s) => ({ ...s, bet: 0 })),
    };
    const { container, rerender } = render(<Table view={before} />);
    expect(container.querySelectorAll("[data-flight]")).toHaveLength(0);
    rerender(<Table view={after} />);
    expect(container.querySelectorAll("[data-flight='collect']")).toHaveLength(
      1,
    );
  });

  it("sends the pot to the winner when it is paid", () => {
    const before = pokerTable(3);
    const after: TableView = {
      ...before,
      pots: [],
      seats: before.seats.map((s, i) =>
        i === 2 ? { ...s, stack: s.stack + 300 } : s,
      ),
    };
    const { container, rerender } = render(<Table view={before} />);
    rerender(<Table view={after} />);
    expect(container.querySelectorAll("[data-flight='payout']")).toHaveLength(
      1,
    );
  });
});

describe("useHandScript", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function Probe() {
    const { view, hand } = useHandScript();
    return (
      <p>
        {hand}|{view.phase}|{view.board.length}|
        {view.pots.reduce((a, b) => a + b, 0)}
      </p>
    );
  }

  it("plays a whole hand in poker order and starts the next one", () => {
    render(<Probe />);
    expect(screen.getByText(/^0\|preflop\|0\|/)).toBeInTheDocument();
    const phases: string[] = [];
    for (const step of HAND_STEPS) {
      act(() => vi.advanceTimersByTime(step.wait * 1000));
      phases.push(screen.getByText(/\|/).textContent ?? "");
    }
    const order = phases
      .map((p) => p.split("|")[1])
      .filter((p, i, all) => i === 0 || p !== all[i - 1]);
    expect(order).toEqual([
      "preflop",
      "flop",
      "turn",
      "river",
      "showdown",
      "preflop",
    ]);
    expect(phases.at(-1)?.startsWith("1|preflop|0|")).toBe(true);
  });
});
