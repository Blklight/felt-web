import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Deck } from "@/components/cards/deck";
import { ChipFlight } from "@/components/chips/chip-flight";
import {
  deckPosition,
  seatPositions,
  tableShape,
} from "@/components/table/seat-positions";
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
  const near = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot((a.x - b.x) * (16 / 9), a.y - b.y);

  it.each([
    2, 3, 4, 5, 6,
  ])("keeps the deck away from every bet and seat with %i players", (n) => {
    const shape = tableShape("poker", n);
    const deck = deckPosition(shape, n);
    expect(deck.x).toBeGreaterThanOrEqual(0);
    expect(deck.x).toBeLessThanOrEqual(100);
    expect(deck.y).toBeGreaterThanOrEqual(0);
    expect(deck.y).toBeLessThanOrEqual(100);
    for (const seat of seatPositions(shape, n)) {
      const bet = {
        x: seat.x + (50 - seat.x) * 0.32,
        y: seat.y + (50 - seat.y) * 0.32,
      };
      expect(near(deck, bet)).toBeGreaterThan(18);
      expect(near(deck, seat)).toBeGreaterThan(18);
    }
  });

  it("keeps the deck out of the board in the middle", () => {
    for (const n of [2, 3, 4, 5, 6]) {
      const deck = deckPosition(tableShape("poker", n), n);
      const insideBoard =
        deck.x > 30 && deck.x < 70 && deck.y > 40 && deck.y < 60;
      expect(insideBoard).toBe(false);
    }
  });

  it("puts the half-moon deck by the dealer", () => {
    expect(deckPosition("halfmoon", 5)).toEqual({ x: 76, y: 14 });
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
