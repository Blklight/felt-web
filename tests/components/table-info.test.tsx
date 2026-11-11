import { act, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ActionLog } from "@/components/table/action-log";
import { Seat } from "@/components/table/seat";
import { Table } from "@/components/table/table";
import { pokerTable } from "@/dev/fixtures";
import type { LogEntry, TableView } from "@/dev/view-types";
import { useLanguageStore } from "@/store/useLanguageStore";

const [, mara, theo] = pokerTable(3).seats;

beforeEach(() => {
  act(() => useLanguageStore.setState({ language: "en" }));
});

describe("Seat badges", () => {
  it("shows the small and big blind", () => {
    const { unmount } = render(<Seat seat={{ ...theo, blind: "small" }} />);
    expect(screen.getByRole("img", { name: "Small blind" })).toHaveTextContent(
      "SB",
    );
    unmount();
    render(<Seat seat={{ ...theo, blind: "big" }} />);
    expect(screen.getByRole("img", { name: "Big blind" })).toHaveTextContent(
      "BB",
    );
  });

  it("flags a player who is all-in", () => {
    render(<Seat seat={{ ...mara, status: "all-in" }} />);
    expect(screen.getByText("All-in")).toBeInTheDocument();
  });

  it("shows no blind badge otherwise", () => {
    render(<Seat seat={{ ...theo, isDealer: false }} />);
    expect(
      screen.queryByRole("img", { name: /blind/ }),
    ).not.toBeInTheDocument();
  });
});

const entries: LogEntry[] = [
  { id: 1, seat: 2, kind: "blind", amount: 25 },
  { id: 2, seat: 1, kind: "call", amount: 50 },
  { id: 3, seat: 0, kind: "raise", amount: 300 },
  { id: 4, seat: 2, kind: "fold" },
  { id: 5, seat: 1, kind: "check" },
  { id: 6, seat: 1, kind: "win", amount: 650 },
];

describe("ActionLog", () => {
  it("tells what each player did, oldest first", () => {
    render(<ActionLog entries={entries} seats={pokerTable(3).seats} you={0} />);
    const items = within(screen.getByRole("log")).getAllByRole("listitem");
    expect(items.map((i) => i.textContent)).toEqual([
      "Theo posts the blind of 25",
      "Mara calls 50",
      "You raise to 300",
      "Theo folds",
      "Mara checks",
      "Mara wins 650",
    ]);
  });

  it("keeps only the latest entries", () => {
    const many = Array.from(
      { length: 12 },
      (_, i): LogEntry => ({ id: i + 1, seat: 1, kind: "check" }),
    );
    render(<ActionLog entries={many} seats={pokerTable(3).seats} />);
    expect(
      within(screen.getByRole("log")).getAllByRole("listitem"),
    ).toHaveLength(8);
  });

  it("speaks Portuguese", () => {
    act(() => useLanguageStore.setState({ language: "pt-br" }));
    render(
      <ActionLog entries={entries.slice(1, 2)} seats={pokerTable(3).seats} />,
    );
    expect(screen.getByText("Mara pagou 50")).toBeInTheDocument();
  });
});

describe("Table announcements", () => {
  const announcer = () => document.querySelector("[aria-live='polite']");

  it("tells the player it is their turn", () => {
    render(<Table view={pokerTable(3)} />);
    expect(announcer()).toHaveTextContent("Your turn");
  });

  it("reads the latest action when it is someone else's turn", () => {
    const base = pokerTable(3);
    const view: TableView = {
      ...base,
      seats: base.seats.map((s) => ({ ...s, isTurn: s.seat === 1 })),
      you: { seat: 0, legalActions: [] },
      log: entries.slice(0, 2),
    };
    render(<Table view={view} />);
    expect(announcer()).toHaveTextContent("Mara calls 50");
  });
});
