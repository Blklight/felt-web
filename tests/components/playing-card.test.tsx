import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CardBack } from "@/components/cards/card-back";
import { Hand } from "@/components/cards/hand";
import { PlayingCard } from "@/components/cards/playing-card";
import { useCardSkinStore } from "@/store/useCardSkinStore";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("PlayingCard", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it("names a face-up card in English", () => {
    render(<PlayingCard code="As" />);
    expect(
      screen.getByRole("img", { name: "Ace of spades" }),
    ).toBeInTheDocument();
  });

  it("names a face-up card in Portuguese", () => {
    act(() => useLanguageStore.setState({ language: "pt-br" }));
    render(<PlayingCard code="As" />);
    expect(
      screen.getByRole("img", { name: "Ás de espadas" }),
    ).toBeInTheDocument();
  });

  it("hides rank and suit for a face-down card", () => {
    const { container } = render(<PlayingCard code="??" />);
    expect(
      screen.getByRole("img", { name: "Face-down card" }),
    ).toBeInTheDocument();
    expect(container.querySelector("[data-suit-fill]")).toBeNull();
  });

  it("uses the ink back by default and the neon back on request", () => {
    const { container, rerender } = render(<CardBack />);
    expect(container.querySelector("[data-back='ink']")).not.toBeNull();
    rerender(<CardBack variant="neon" />);
    expect(container.querySelector("[data-back='neon']")).not.toBeNull();
    expect(
      screen.getByRole("img", { name: "Face-down card" }),
    ).toBeInTheDocument();
  });

  it("wraps the back in both texture layers", () => {
    render(<CardBack />);
    const wrapper = screen.getByRole("img", {
      name: "Face-down card",
    }).parentElement;
    expect(wrapper).toHaveClass("texture-item", "background-texture");
  });

  describe("skins", () => {
    const fill = (
      code: "As" | "Th" | "Td" | "Tc",
      skin?: "classic" | "four-color" | "fantasy" | "noir",
    ) => {
      const { container, unmount } = render(
        <PlayingCard code={code} skin={skin} />,
      );
      const value = container
        .querySelector("[data-suit-fill]")
        ?.getAttribute("data-suit-fill");
      unmount();
      return value;
    };

    it("classic: red hearts and diamonds, ink spades and clubs", () => {
      expect(fill("Th", "classic")).toBe("var(--color-suit-red)");
      expect(fill("Td", "classic")).toBe("var(--color-suit-red)");
      expect(fill("As", "classic")).toBe("var(--color-card-ink)");
      expect(fill("Tc", "classic")).toBe("var(--color-card-ink)");
    });

    it("four-color: diamonds are blue and clubs green", () => {
      expect(fill("Td", "four-color")).toBe("#1d4ed8");
      expect(fill("Tc", "four-color")).toBe("#15803d");
    });

    it("fantasy: hearts red, diamonds orange, clubs black, spades blue", () => {
      expect(fill("Th", "fantasy")).toBe("var(--color-suit-red)");
      expect(fill("Td", "fantasy")).toBe("#c2570a");
      expect(fill("Tc", "fantasy")).toBe("var(--color-card-ink)");
      expect(fill("As", "fantasy")).toBe("#1d4ed8");
    });

    it("noir: dark face with light spades and clubs", () => {
      const { container } = render(<PlayingCard code="As" skin="noir" />);
      expect(container.firstElementChild).toHaveAttribute("data-skin", "noir");
      expect(fill("As", "noir")).toBe("var(--color-bone)");
      expect(fill("Tc", "noir")).toBe("var(--color-bone)");
    });

    it("follows the stored skin when none is given", () => {
      act(() => useCardSkinStore.setState({ skin: "fantasy" }));
      expect(fill("Td")).toBe("#c2570a");
      act(() => useCardSkinStore.setState({ skin: "classic" }));
      expect(fill("Td")).toBe("var(--color-suit-red)");
    });
  });

  it("wraps a face-up card in both texture layers", () => {
    render(<PlayingCard code="As" />);
    const wrapper = screen.getByRole("img", {
      name: "Ace of spades",
    }).parentElement;
    expect(wrapper).toHaveClass("texture-item", "background-texture");
  });

  it("writes ten as 10 in the corner and in the center", () => {
    render(<PlayingCard code="Td" />);
    const svg = screen.getByRole("img", { name: "Ten of diamonds" });
    expect(svg.textContent).toBe("101010");
  });

  it("draws no suit symbol in the center", () => {
    render(<PlayingCard code="As" />);
    const svg = screen.getByRole("img", { name: "Ace of spades" });
    expect(svg.querySelectorAll("svg")).toHaveLength(2);
  });

  it("Hand renders one image per card", () => {
    render(<Hand cards={["As", "Kd", "??"]} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });
});
