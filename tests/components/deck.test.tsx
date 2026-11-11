import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Deck } from "@/components/cards/deck";
import { Hand } from "@/components/cards/hand";
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

describe("Hand dealing from a point", () => {
  it("starts each card displaced by the given offset", () => {
    const { container } = render(
      <Hand cards={["As", "Kd"]} from={{ x: 120, y: -40 }} />,
    );
    const first = container.querySelector("[data-skin]") as HTMLElement;
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
