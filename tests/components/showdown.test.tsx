import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { HandBadge } from "@/components/table/hand-badge";
import { HAND_RANKS, HandRankings } from "@/components/table/hand-rankings";
import { Table } from "@/components/table/table";
import { pokerTable } from "@/dev/fixtures";
import type { TableView } from "@/dev/view-types";
import { useLanguageStore } from "@/store/useLanguageStore";

beforeEach(() => {
  act(() => useLanguageStore.setState({ language: "en" }));
});

describe("HandRankings", () => {
  it("lists the ten hands from strongest to weakest", async () => {
    render(<HandRankings />);
    await userEvent.click(
      screen.getByRole("button", { name: "Hand rankings" }),
    );
    const items = within(
      screen.getByRole("list", { name: "Hand rankings" }),
    ).getAllByRole("listitem");
    expect(items).toHaveLength(10);
    expect(items[0]).toHaveTextContent("Royal flush");
    expect(items[9]).toHaveTextContent("High card");
    expect(HAND_RANKS[0]).toBe("royal-flush");
  });

  it("shows five example cards for each hand", async () => {
    render(<HandRankings />);
    await userEvent.click(
      screen.getByRole("button", { name: "Hand rankings" }),
    );
    const items = within(
      screen.getByRole("list", { name: "Hand rankings" }),
    ).getAllByRole("listitem");
    for (const item of items) {
      expect(within(item).getAllByRole("img")).toHaveLength(5);
    }
  });

  it("marks the player's current hand", async () => {
    render(<HandRankings current="two-pair" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Hand rankings" }),
    );
    const items = within(
      screen.getByRole("list", { name: "Hand rankings" }),
    ).getAllByRole("listitem");
    expect(items[7]).toHaveAttribute("aria-current", "true");
    expect(items.filter((i) => i.hasAttribute("aria-current"))).toHaveLength(1);
  });
});

describe("HandBadge", () => {
  it("names the player's best hand", () => {
    render(
      <HandBadge
        hand={{ rank: "pair", cards: ["Qh", "Qs", "As", "Kd", "7h"] }}
      />,
    );
    expect(screen.getByText("Your hand: Pair")).toBeInTheDocument();
  });

  it("shows nothing without a hand", () => {
    const { container } = render(<HandBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it("speaks Portuguese", () => {
    act(() => useLanguageStore.setState({ language: "pt-br" }));
    render(
      <HandBadge
        hand={{ rank: "full-house", cards: ["Kh", "Kd", "Kc", "7s", "7h"] }}
      />,
    );
    expect(screen.getByText("Sua mão: Full house")).toBeInTheDocument();
  });
});

describe("Showdown result", () => {
  const view: TableView = (() => {
    const base = pokerTable(3);
    return {
      ...base,
      phase: "showdown",
      board: ["7h", "Td", "2c", "Qs", "4d"],
      seats: base.seats.map((s, i) =>
        i === 1 ? { ...s, cards: ["Qh", "Jh"] } : s,
      ),
      result: {
        winners: [
          {
            seat: 1,
            amount: 400,
            hand: { rank: "pair", cards: ["Qh", "Qs", "Jh", "Td", "7h"] },
          },
        ],
      },
    };
  })();

  it("announces who won and with what", () => {
    render(<Table view={view} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Mara wins 400 with Pair",
    );
  });

  it("marks the winning seat", () => {
    render(<Table view={view} />);
    expect(screen.getByRole("group", { name: "Mara" })).toHaveAttribute(
      "data-winner",
      "true",
    );
    expect(screen.getByRole("group", { name: "You" })).not.toHaveAttribute(
      "data-winner",
    );
  });

  it("lifts the five winning cards and dims the rest", () => {
    const { container } = render(<Table view={view} />);
    const win = container.querySelectorAll("[data-highlight='win']");
    expect(win).toHaveLength(5);
    expect(
      container.querySelectorAll("[data-highlight='dim']").length,
    ).toBeGreaterThan(0);
  });

  it("highlights nothing before the showdown", () => {
    const { container } = render(<Table view={pokerTable(3)} />);
    expect(container.querySelectorAll("[data-highlight]")).toHaveLength(0);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
