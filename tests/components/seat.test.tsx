import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Pot } from "@/components/table/pot";
import { Seat } from "@/components/table/seat";
import { Timer } from "@/components/table/timer";
import { longNameTable, pokerTable } from "@/dev/fixtures";
import { useLanguageStore } from "@/store/useLanguageStore";

const [me, other] = pokerTable(3).seats;

describe("Seat", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it("exposes the full name in a title when it is long", () => {
    const long = longNameTable.seats[1];
    render(<Seat seat={long} />);
    expect(screen.getByTitle(long.name)).toBeInTheDocument();
  });

  it("marks the player whose turn it is", () => {
    render(<Seat seat={me} isYou />);
    expect(screen.getByRole("group")).toHaveAttribute("aria-current", "true");
  });

  it("does not mark a player waiting", () => {
    render(<Seat seat={{ ...other, isTurn: false }} />);
    expect(screen.getByRole("group")).not.toHaveAttribute("aria-current");
  });

  it("renders a free seat placeholder", () => {
    render(<Seat seat={{ ...other, status: "empty", name: "", cards: [] }} />);
    expect(screen.getByText("Free seat")).toBeInTheDocument();
  });

  it("formats big stacks per language", () => {
    const rich = { ...other, stack: 9_999_999 };
    const { unmount } = render(<Seat seat={rich} />);
    expect(screen.getByText("9,999,999")).toBeInTheDocument();
    unmount();
    act(() => useLanguageStore.setState({ language: "pt-br" }));
    render(<Seat seat={rich} />);
    expect(screen.getByText("9.999.999")).toBeInTheDocument();
  });
});

describe("Pot", () => {
  it("shows the summed pot", () => {
    act(() => useLanguageStore.setState({ language: "en" }));
    render(<Pot pots={[300, 900]} />);
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });
});

describe("Timer", () => {
  it("is a timer with the seconds left", () => {
    act(() => useLanguageStore.setState({ language: "en" }));
    render(<Timer secondsLeft={18} />);
    expect(screen.getByRole("timer")).toHaveTextContent("18s left");
  });

  it("renders nothing without a deadline", () => {
    render(<Timer secondsLeft={null} />);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });
});
