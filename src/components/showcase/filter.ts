import type { ShowcaseCategory } from "@/components/showcase/types";

type Options = { onlyUsed: boolean; ui: string[]; used: string[] };

export function filterCategories(
  categories: ShowcaseCategory[],
  { onlyUsed, ui, used }: Options,
): ShowcaseCategory[] {
  if (!onlyUsed) return categories;
  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        ({ slug }) => !ui.includes(slug) || used.includes(slug),
      ),
    }))
    .filter((category) => category.items.length > 0);
}
