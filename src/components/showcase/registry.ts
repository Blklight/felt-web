import { chamferCategory } from "@/components/showcase/demos/chamfer";
import { customCategory } from "@/components/showcase/demos/custom";
import { dataCategory } from "@/components/showcase/demos/data";
import { formsCategory } from "@/components/showcase/demos/forms";
import { gameCategory } from "@/components/showcase/demos/game";
import { menusCategory } from "@/components/showcase/demos/menus";
import { overlaysCategory } from "@/components/showcase/demos/overlays";
import { primitivesCategory } from "@/components/showcase/demos/primitives";
import { filterCategories } from "@/components/showcase/filter";
import { SHOWCASE_ONLY_USED } from "@/components/showcase/showcase.config";
import type { ShowcaseCategory } from "@/components/showcase/types";
import generated from "@/components/showcase/used.generated.json";

const allCategories: ShowcaseCategory[] = [
  gameCategory,
  primitivesCategory,
  formsCategory,
  overlaysCategory,
  menusCategory,
  dataCategory,
  customCategory,
  chamferCategory,
];

export const categories = filterCategories(allCategories, {
  onlyUsed: SHOWCASE_ONLY_USED,
  ...generated,
});
