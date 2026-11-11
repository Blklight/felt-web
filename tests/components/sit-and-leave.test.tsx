import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ScriptedTable } from "@/components/screens/scripted-table";
import { BuyInDialog } from "@/components/table/buy-in-dialog";
import { LeaveButton } from "@/components/table/leave-button";
import { Seat } from "@/components/table/seat";
import { Table } from "@/components/table/table";
import { pokerTable } from "@/dev/fixtures";
import type { TableView } from "@/dev/view-types";
import { useLanguageStore } from "@/store/useLanguageStore";

beforeEach(() => {
  act(() => useLanguageStore.setState({ language: "en" }));
});

const free = {
  ...pokerTable(3).seats[2],
  seat: 4,
  status: "empty" as const,
  name: "",
  cards: [],
};

describe("free seats", () => {
  it("can be taken when the player is not seated", async () => {
    const onSit = vi.fn();
    render(<Seat seat={free} onSit={onSit} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Sit at seat 5" }),
    );
    expect(onSit).toHaveBeenCalledWith(4);
  });

  it("are just a label otherwise", () => {
    render(<Seat seat={free} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Free seat")).toBeInTheDocument();
  });
});

const spectating = (): TableView => {
  const base = pokerTable(4);
  return {
    ...base,
    phase: "waiting",
    board: [],
    pots: [],
    secondsLeft: null,
    seats: base.seats.map((s, i) =>
      i === 0 || i === 3
        ? { ...s, status: "empty", name: "", cards: [], bet: 0 }
        : { ...s, cards: [], bet: 0, isTurn: false },
    ),
    you: { seat: null, legalActions: [] },
    buyIn: { min: 1000, max: 5000 },
  };
};

describe("Table while waiting", () => {
  it("says it is waiting and how many seats are taken", () => {
    render(<Table view={spectating()} />);
    expect(screen.getByText("Waiting for players")).toBeInTheDocument();
    expect(screen.getByText("2 of 4 seats taken")).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("offers the free seats to a spectator", async () => {
    const onSit = vi.fn();
    render(<Table view={spectating()} onSit={onSit} />);
    const buttons = screen.getAllByRole("button", { name: /^Sit at seat/ });
    expect(buttons).toHaveLength(2);
    await userEvent.click(buttons[0]);
    expect(onSit).toHaveBeenCalled();
  });
});

describe("BuyInDialog", () => {
  it("starts at the minimum and confirms it", async () => {
    const onConfirm = vi.fn();
    render(
      <BuyInDialog
        open
        seat={2}
        min={1000}
        max={5000}
        balance={2500}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Balance: 2,500")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Sit with 1,000" }),
    );
    expect(onConfirm).toHaveBeenCalledWith(1000);
  });

  it("never offers more than the balance", async () => {
    const onConfirm = vi.fn();
    render(
      <BuyInDialog
        open
        seat={2}
        min={1000}
        max={5000}
        balance={2500}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Max" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Sit with 2,500" }),
    );
    expect(onConfirm).toHaveBeenCalledWith(2500);
  });

  it("explains when the balance is below the minimum", () => {
    render(
      <BuyInDialog
        open
        seat={2}
        min={1000}
        max={5000}
        balance={600}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Your balance is below the minimum buy-in of 1,000."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sit with 1,000" }),
    ).toBeDisabled();
  });
});

describe("LeaveButton", () => {
  it("asks first and says the chips go back to the balance", async () => {
    const onLeave = vi.fn();
    render(<LeaveButton stack={1850} onLeave={onLeave} />);
    await userEvent.click(screen.getByRole("button", { name: "Leave table" }));
    expect(
      screen.getByText("Your 1,850 chips go back to your balance."),
    ).toBeInTheDocument();
    expect(onLeave).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Leave" }));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("warns that leaving waits for the hand to end", async () => {
    render(<LeaveButton stack={1850} inHand onLeave={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Leave table" }));
    expect(
      screen.getByText("You will leave when this hand ends."),
    ).toBeInTheDocument();
  });
});

describe("table screen flow", () => {
  it("starts watching, sits with a buy-in, then can leave back to watching", async () => {
    render(<ScriptedTable />);
    expect(
      screen.getByText("You are watching. Pick a free seat to play."),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getAllByRole("button", { name: /^Sit at seat/ })[0],
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Sit with 1,000" }),
    );
    expect(
      screen.queryByText("You are watching. Pick a free seat to play."),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Leave table" }));
    await userEvent.click(screen.getByRole("button", { name: "Leave" }));
    expect(
      screen.getByText("You are watching. Pick a free seat to play."),
    ).toBeInTheDocument();
  });
});
