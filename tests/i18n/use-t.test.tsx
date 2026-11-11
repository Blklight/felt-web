import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useT } from "@/i18n/use-t";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("useT", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "pt-br" }));
  });

  it("translates with the active language and follows changes", () => {
    const { result } = renderHook(() => useT());
    expect(result.current("action.fold")).toBe("Desistir");

    act(() => useLanguageStore.getState().setLanguage("en"));
    expect(result.current("action.fold")).toBe("Fold");
  });

  it("interpolates {placeholders}", () => {
    const { result } = renderHook(() => useT());
    expect(result.current("card.label", { rank: "Ás", suit: "espadas" })).toBe(
      "Ás de espadas",
    );
  });
});
