import { act, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Table } from "@/components/table/table";
import { blackjackTable, pokerTable } from "@/dev/fixtures";
import { useCardSkinStore } from "@/store/useCardSkinStore";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("Table", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it.each([
    2, 3, 4, 5, 6,
  ] as const)("renders every seat for %i players", (n) => {
    render(<Table view={pokerTable(n)} />);
    expect(screen.getAllByRole("group")).toHaveLength(n);
  });

  it("still renders free seats", () => {
    render(<Table view={blackjackTable} />);
    expect(screen.getAllByRole("group")).toHaveLength(
      blackjackTable.seats.length,
    );
    expect(screen.getAllByText("Free seat")).toHaveLength(2);
  });

  it("shows the pot and the board cards", () => {
    render(<Table view={pokerTable(4)} />);
    expect(screen.getByText("300")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Seven of hearts" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("timer")).toBeInTheDocument();
  });

  it.each([
    [pokerTable(2), "chamfer"],
    [pokerTable(4), "round"],
    [pokerTable(6), "stadium"],
    [blackjackTable, "halfmoon"],
  ] as const)("uses the %# shape for its game and seat count", (view, shape) => {
    const { container } = render(<Table view={view} />);
    expect(container.querySelector("[data-shape]")).toHaveAttribute(
      "data-shape",
      shape,
    );
  });

  it("seats the viewer at the bottom center whichever seat number they have", () => {
    const base = pokerTable(4);
    const view = { ...base, you: { ...base.you, seat: 2 } };
    render(<Table view={view} />);
    const slot = screen.getByRole("group", { name: "Theo" }).parentElement;
    expect(slot?.style.left).toBe("50%");
  });

  it("shows each player's bet on the felt", () => {
    render(<Table view={pokerTable(3)} />);
    expect(screen.getByLabelText("Mara's stake")).toHaveTextContent("50");
  });

  describe("skins", () => {
    const cardsOf = (name: string) =>
      within(screen.getByRole("group", { name })).getAllByRole("img");
    const skinOf = (el: HTMLElement | undefined) =>
      el?.parentElement?.getAttribute("data-skin");
    const dealerCard = () =>
      screen
        .getAllByRole("img", { name: "King of clubs" })
        .find((el) => !el.closest("fieldset"));

    beforeEach(() => {
      act(() =>
        useCardSkinStore.setState({
          skin: "classic",
          back: "ink",
          overrideOthers: false,
        }),
      );
    });

    it("draws each player's face-up cards in that player's skin", () => {
      render(<Table view={blackjackTable} />);
      expect(skinOf(cardsOf("Mara")[0])).toBe("noir");
      expect(skinOf(cardsOf("Ines")[0])).toBe("vice");
      expect(skinOf(cardsOf("You")[0])).toBe("classic");
    });

    it("draws shared cards in the table skin", () => {
      render(<Table view={{ ...blackjackTable, boardSkinId: "fantasy" }} />);
      expect(skinOf(dealerCard())).toBe("fantasy");
    });

    it("draws the poker board in the table skin", () => {
      render(<Table view={{ ...pokerTable(4), boardSkinId: "vice" }} />);
      const boardCard = screen.getByRole("img", { name: "Seven of hearts" });
      expect(skinOf(boardCard)).toBe("vice");
    });

    it("draws a hidden card with its owner's back", () => {
      const { container } = render(<Table view={pokerTable(3)} />);
      const group = screen.getByRole("group", { name: "Theo" });
      expect(group.querySelector("[data-back='vice']")).not.toBeNull();
      expect(container.querySelector("[data-back='neon']")).not.toBeNull();
    });

    it("uses my own skin and back everywhere when the preference is on", () => {
      act(() =>
        useCardSkinStore.setState({
          skin: "fantasy",
          back: "suits",
          overrideOthers: true,
        }),
      );
      const { container } = render(<Table view={blackjackTable} />);
      expect(skinOf(cardsOf("Mara")[0])).toBe("fantasy");
      expect(skinOf(dealerCard())).toBe("fantasy");
      expect(
        container.querySelectorAll("[data-back]:not([data-back='suits'])"),
      ).toHaveLength(0);
    });
  });
});
