import { describe, expect, it } from "vitest";
import { computeUsed } from "../../scripts/used-ui-lib";

const files = [
  {
    path: "src/app/page.tsx",
    text: 'import { Button } from "@/components/ui/button";\nimport { Card } from "@/components/ui/card";',
  },
  { path: "src/components/ui/button.tsx", text: "export const Button = 1;" },
  {
    path: "src/components/ui/card.tsx",
    text: 'import { Separator } from "@/components/ui/separator";\nimport { Label } from "./label";',
  },
  { path: "src/components/ui/separator.tsx", text: "" },
  { path: "src/components/ui/label.tsx", text: "" },
  { path: "src/components/ui/dialog.tsx", text: "" },
  {
    path: "src/components/showcase/demos/x.tsx",
    text: 'import { Dialog } from "@/components/ui/dialog";',
  },
];

describe("computeUsed", () => {
  it("lists every ui component", () => {
    expect(computeUsed(files).ui).toEqual([
      "button",
      "card",
      "dialog",
      "label",
      "separator",
    ]);
  });

  it("follows imports from app code and between ui components, ignoring the showcase", () => {
    expect(computeUsed(files).used).toEqual([
      "button",
      "card",
      "label",
      "separator",
    ]);
  });
});
