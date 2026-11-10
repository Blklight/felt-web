import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gameCategory } from "@/components/showcase/demos/game";
import { categories } from "@/components/showcase/registry";

describe("game showcase", () => {
  it("is registered", () => {
    expect(categories).toContain(gameCategory);
  });

  it("uses unique slugs across all categories", () => {
    const slugs = categories.flatMap((c) => c.items.map((i) => i.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(
    gameCategory.items.map((i) => [i.slug, i.demo] as const),
  )("renders the %s demo", (_slug, Demo) => {
    expect(() => render(<Demo />)).not.toThrow();
  });

  it("exposes the planned demos", () => {
    expect(gameCategory.items.map((i) => i.slug)).toEqual([
      "playing-card",
      "chips",
      "seat",
      "table-poker",
      "table-blackjack",
      "action-bar",
      "four-color-toggle",
    ]);
  });
});
