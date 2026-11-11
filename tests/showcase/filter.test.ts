import { describe, expect, it } from "vitest";
import { filterCategories } from "@/components/showcase/filter";
import type { ShowcaseCategory } from "@/components/showcase/types";

const item = (slug: string) => ({ slug, name: slug, demo: () => null });
const categories: ShowcaseCategory[] = [
  {
    id: "ui",
    title: "UI",
    items: [item("button"), item("card"), item("dialog")],
  },
  { id: "game", title: "Game", items: [item("table-poker")] },
  { id: "dead", title: "Dead", items: [item("dialog")] },
];
const ui = ["button", "card", "dialog"];

describe("filterCategories", () => {
  it("returns everything when onlyUsed is off", () => {
    expect(
      filterCategories(categories, { onlyUsed: false, ui, used: [] }),
    ).toEqual(categories);
  });

  it("keeps used ui components, drops unused ones and keeps demos that are not ui files", () => {
    const result = filterCategories(categories, {
      onlyUsed: true,
      ui,
      used: ["button"],
    });
    expect(result.map((c) => c.items.map((i) => i.slug))).toEqual([
      ["button"],
      ["table-poker"],
    ]);
  });

  it("drops categories left without items", () => {
    const result = filterCategories(categories, {
      onlyUsed: true,
      ui,
      used: [],
    });
    expect(result.map((c) => c.id)).toEqual(["game"]);
  });
});
