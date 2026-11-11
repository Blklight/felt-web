import { act, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { TableCard } from "@/components/cards/table-card";
import { useLanguageStore } from "@/store/useLanguageStore";

beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes("reduce"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
});

describe("reduced motion", () => {
  it("puts a dealt card straight into place, face up, without flying", () => {
    act(() => useLanguageStore.setState({ language: "en" }));
    const deck = { current: document.createElement("div") };
    const { container } = render(
      <TableCard code="As" dealFrom={deck} dealDelay={2} />,
    );
    expect(
      screen.getByRole("img", { name: "Ace of spades" }),
    ).toBeInTheDocument();
    expect((container.firstElementChild as HTMLElement).style.transform).toBe(
      "",
    );
  });
});
