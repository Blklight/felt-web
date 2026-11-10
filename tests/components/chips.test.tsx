import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Chip } from "@/components/chips/chip";
import { breakdown, ChipStack } from "@/components/chips/chip-stack";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("breakdown", () => {
  it("returns no chips for zero", () => {
    expect(breakdown(0)).toEqual([]);
  });

  it("returns a single chip for an exact denomination", () => {
    expect(breakdown(25)).toEqual([25]);
  });

  it("caps at 6 chips, sorted descending, never exceeding the amount", () => {
    const chips = breakdown(1775);
    expect(chips.length).toBeLessThanOrEqual(6);
    expect(chips[0]).toBe(1000);
    expect([...chips].sort((a, b) => b - a)).toEqual(chips);
    expect(chips.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1775);
  });
});

describe("Chip", () => {
  it("prints the value on the chip", () => {
    render(<Chip value={25} />);
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("abbreviates thousands", () => {
    render(<Chip value={1000} />);
    expect(screen.getByText("1K")).toBeInTheDocument();
  });

  it("is a labeled image so the value is not only conveyed by color", () => {
    render(<Chip value={100} />);
    expect(screen.getByRole("img", { name: "100" })).toBeInTheDocument();
  });
});

describe("Chip alignment", () => {
  it.each([
    1, 5, 25, 100, 500, 1000,
  ])("centers the value of chip %i on both axes", (value) => {
    render(<Chip value={value} />);
    const text = screen.getByText(value >= 1000 ? "1K" : String(value));
    expect(text).toHaveAttribute("text-anchor", "middle");
    expect(text).toHaveAttribute("dy", "0.35em");
  });
});

describe("ChipStack", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it("renders nothing for a zero amount", () => {
    const { container } = render(<ChipStack amount={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the total next to the pile", () => {
    render(<ChipStack amount={1775} />);
    expect(screen.getByText("1,775")).toBeInTheDocument();
  });
});
