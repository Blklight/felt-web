import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionBar } from "@/components/table/action-bar";
import { Seat } from "@/components/table/seat";
import { Table } from "@/components/table/table";
import { blackjackTable } from "@/dev/fixtures";
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
