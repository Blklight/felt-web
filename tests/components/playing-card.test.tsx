import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Hand } from "@/components/cards/hand";
import { PlayingCard } from "@/components/cards/playing-card";
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
    expect(container.textContent).toBe("");
  });

  it("uses a different diamond fill in four-color mode", () => {
    const a = render(<PlayingCard code="Td" />);
    const plain = a.container
      .querySelector("[data-suit-fill]")
      ?.getAttribute("data-suit-fill");
    a.unmount();
    const b = render(<PlayingCard code="Td" fourColor />);
    const four = b.container
      .querySelector("[data-suit-fill]")
      ?.getAttribute("data-suit-fill");
    expect(four).not.toBe(plain);
  });

  it("Hand renders one image per card", () => {
    render(<Hand cards={["As", "Kd", "??"]} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });
});
