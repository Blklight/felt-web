import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "@/components/app-shell";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("skip link", () => {
  it("lets keyboard users jump past the header to the content", () => {
    act(() => useLanguageStore.setState({ language: "en" }));
    const { container } = render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#content");
    expect(container.querySelector("#content")).toContainElement(
      screen.getByText("content"),
    );
  });
});
