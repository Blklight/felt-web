import { describe, expect, it } from "vitest";
import { dictionaries } from "@/i18n/dictionaries";

describe("dictionaries", () => {
  it("defines the same keys in en and pt-br", () => {
    expect(Object.keys(dictionaries["pt-br"]).sort()).toEqual(
      Object.keys(dictionaries.en).sort(),
    );
  });

  it("has no empty values", () => {
    for (const dict of Object.values(dictionaries)) {
      for (const value of Object.values(dict)) {
        expect(value.trim()).not.toBe("");
      }
    }
  });
});
