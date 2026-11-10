import { describe, expect, it } from "vitest";
import { breakdown } from "@/components/chips/chip-stack";

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
