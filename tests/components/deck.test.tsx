import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Deck } from "@/components/cards/deck";
import { ChipFlight } from "@/components/chips/chip-flight";
import { deckPosition } from "@/components/table/seat-positions";
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
