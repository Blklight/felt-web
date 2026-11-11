import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Deck } from "@/components/cards/deck";
import { Hand } from "@/components/cards/hand";
import { ChipFlight } from "@/components/chips/chip-flight";
import { Board } from "@/components/table/board";
import { deckPosition } from "@/components/table/seat-positions";
import { Table } from "@/components/table/table";
import { pokerTable } from "@/dev/fixtures";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("Deck", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it("is one labeled image, not a pile of face-down cards for screen readers", () => {
    render(<Deck />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("img", { name: "Deck" })).toBeInTheDocument();
  });

  it("marks itself as shuffling while the shuffle animation runs", () => {
    const { container, rerender } = render(<Deck />);
    expect(container.firstElementChild).not.toHaveAttribute("data-shuffling");
    rerender(<Deck shuffling />);
    expect(container.firstElementChild).toHaveAttribute(
      "data-shuffling",
      "true",
    );
  });
});

describe("deckPosition", () => {
  it("places the deck inside the table, differently for the half-moon", () => {
    for (const shape of ["chamfer", "round", "stadium", "halfmoon"] as const) {
      const { x, y } = deckPosition(shape);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
    expect(deckPosition("halfmoon")).not.toEqual(deckPosition("round"));
  });
});

describe("Hand dealing from a point", () => {
  it("starts each card displaced by the given offset", () => {
    const { container } = render(
      <Hand cards={["As", "Kd"]} from={{ x: 120, y: -40 }} />,
    );
    const first = container.querySelector("[data-back]") as HTMLElement;
    expect(first.style.transform).toContain("120px");
  });
});

describe("cards are visible from the first frame", () => {
  it("never starts a dealt card at zero opacity", () => {
    const { container } = render(
      <Hand cards={["As", "??"]} from={{ x: 80, y: -30 }} dealDelay={0.5} />,
    );
    const cards = container.querySelectorAll("[data-skin], [data-back]");
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      expect((card as HTMLElement).style.opacity).not.toBe("0");
    }
  });

  it("also keeps a card without an origin visible", () => {
    const { container } = render(<Hand cards={["As", "??"]} />);
    for (const card of container.querySelectorAll("[data-skin], [data-back]")) {
      expect((card as HTMLElement).style.opacity).not.toBe("0");
    }
  });
});

describe("dealing sequence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => useLanguageStore.setState({ language: "en" }));
  });
  afterEach(() => vi.useRealTimers());

  it("flies cards face down, then turns the ones that have a value", () => {
    render(<Hand cards={["As", "??"]} from={{ x: 80, y: -30 }} />);
    expect(
      screen.queryByRole("img", { name: "Ace of spades" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Face-down card" })).toHaveLength(
      2,
    );
    act(() => vi.advanceTimersByTime(3000));
    expect(
      screen.getByRole("img", { name: "Ace of spades" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Face-down card" })).toHaveLength(
      1,
    );
  });

  it("never rotates a dealt card sideways", () => {
    const { container } = render(
      <Hand cards={["??"]} from={{ x: 80, y: -30 }} />,
    );
    const card = container.querySelector("[data-back]") as HTMLElement;
    expect(card.style.transform).not.toMatch(/rotate\(-?[1-9]/);
  });

  it("deals the board face down too, then turns it", () => {
    render(
      <Board
        cards={["7h", "Td", "2c"]}
        from={{ x: 0, y: -60 }}
        dealDelay={1}
      />,
    );
    expect(
      screen.queryByRole("img", { name: "Seven of hearts" }),
    ).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5000));
    expect(
      screen.getByRole("img", { name: "Seven of hearts" }),
    ).toBeInTheDocument();
  });

  it("shows the player's own cards face down until they land when the table deals", () => {
    render(<Table view={pokerTable(4)} animateDeal />);
    expect(
      screen.queryByRole("img", { name: "Ace of spades" }),
    ).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(6000));
    expect(
      screen.getByRole("img", { name: "Ace of spades" }),
    ).toBeInTheDocument();
  });

  it("does not deal unless asked: face-up cards are there from the start", () => {
    render(<Table view={pokerTable(4)} />);
    expect(
      screen.getByRole("img", { name: "Ace of spades" }),
    ).toBeInTheDocument();
  });
});

describe("ChipFlight", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it("shows the amount that is moving", () => {
    render(
      <ChipFlight amount={1200} from={{ x: 0, y: 0 }} to={{ x: 100, y: 50 }} />,
    );
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });
});
