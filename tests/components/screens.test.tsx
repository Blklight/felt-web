import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AboutScreen } from "@/components/screens/about-screen";
import { Lobby } from "@/components/screens/lobby";
import { TableScreen } from "@/components/screens/table-screen";
import { isValidRoomCode } from "@/lib/room-code";
import { useLanguageStore } from "@/store/useLanguageStore";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("isValidRoomCode", () => {
  it.each(["KQ7XZ", "ABCDE", "23456"])("accepts %s", (code) => {
    expect(isValidRoomCode(code)).toBe(true);
  });

  it.each([
    "AB0O1",
    "ABCD",
    "ABCDEF",
    "abcde",
    "AB CD",
    "",
  ])("rejects %j", (code) => {
    expect(isValidRoomCode(code)).toBe(false);
  });
});

describe("Lobby", () => {
  beforeEach(() => {
    push.mockClear();
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it("presents the hero with the tagline and an empty recent-tables panel", () => {
    render(<Lobby />);
    expect(
      screen.getByText("Cards with friends. Fake credits only."),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img").length).toBeGreaterThanOrEqual(3);
    expect(
      screen.getByText("Tables you play will show up here."),
    ).toBeInTheDocument();
  });

  it("shows an error and does not navigate for an invalid code", async () => {
    render(<Lobby />);
    await userEvent.type(screen.getByLabelText("Room code"), "AB0O1");
    await userEvent.click(screen.getByRole("button", { name: "Join" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates to the table for a valid code", async () => {
    render(<Lobby />);
    await userEvent.type(screen.getByLabelText("Room code"), "kq7xz");
    await userEvent.click(screen.getByRole("button", { name: "Join" }));
    expect(push).toHaveBeenCalledWith("/table?code=KQ7XZ");
    expect(screen.getByRole("button", { name: "Joining…" })).toBeDisabled();
  });
});

describe("TableScreen", () => {
  beforeEach(() => {
    act(() => useLanguageStore.setState({ language: "en" }));
  });

  it.each([
    null,
    "",
    "AB0O1",
  ])("shows a message instead of crashing for code %j", (code) => {
    render(<TableScreen code={code} />);
    expect(screen.getByText(/No room code/)).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("opens the table for a valid code, watching until the player sits", () => {
    render(<TableScreen code="KQ7XZ" />);
    expect(screen.getByText("Room KQ7XZ")).toBeInTheDocument();
    expect(
      screen.getByText("You are watching. Pick a free seat to play."),
    ).toBeInTheDocument();
  });
});

describe("AboutScreen", () => {
  it.each([
    ["en", /No real money/],
    ["pt-br", /Sem dinheiro real/],
  ] as const)("states there is no real money in %s", (language, text) => {
    act(() => useLanguageStore.setState({ language }));
    render(<AboutScreen />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});
