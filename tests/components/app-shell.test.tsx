import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AppShell } from "@/components/app-shell";
import { useLanguageStore } from "@/store/useLanguageStore";

describe("AppShell", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it("renders navigation and content without a felt page background", () => {
    const { container } = render(
      <AppShell>
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Lobby" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(container.querySelector(".felt-surface")).toBeNull();
  });
});
