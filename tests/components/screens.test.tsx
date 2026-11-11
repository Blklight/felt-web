import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AboutScreen } from "@/components/screens/about-screen";
import { Lobby } from "@/components/screens/lobby";
import { TableScreen } from "@/components/screens/table-screen";
import { isValidRoomCode } from "@/lib/room-code";
import { ApiFailure, createRoom, getRoom } from "@/net/api";
import { useLanguageStore } from "@/store/useLanguageStore";
import { renderWithQuery } from "../helpers/query";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/net/api", async (original) => ({
  ...(await original<typeof import("@/net/api")>()),
  createRoom: vi.fn(),
  getRoom: vi.fn(),
}));

vi.mock("@/net/use-table-socket", async () => {
  const { spectatorTable } = await import("@/dev/fixtures");
  return {
    useTableSocket: () => ({
      view: { ...spectatorTable, buyIn: { min: 1000, max: 5000 } },
      fatal: null,
      send: vi.fn(),
      retry: vi.fn(),
    }),
  };
});

vi.mock("@/net/queries", () => ({
  ME_KEY: ["me"],
  useMe: () => ({ data: { balance: 5000 } }),
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
    vi.clearAllMocks();
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

  it("shows an error and asks the server nothing for an invalid code", async () => {
    render(<Lobby />);
    await userEvent.type(screen.getByLabelText("Room code"), "AB0O1");
    await userEvent.click(screen.getByRole("button", { name: "Join" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(getRoom).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("checks the room exists, then goes to the table", async () => {
    vi.mocked(getRoom).mockResolvedValue({
      code: "KQ7XZ",
      game: "poker",
      seats: 6,
      taken: 0,
    });
    render(<Lobby />);
    await userEvent.type(screen.getByLabelText("Room code"), "kq7xz");
    await userEvent.click(screen.getByRole("button", { name: "Join" }));
    expect(getRoom).toHaveBeenCalledWith("KQ7XZ");
    await waitFor(() => expect(push).toHaveBeenCalledWith("/table?code=KQ7XZ"));
  });

  it("says when the room does not exist", async () => {
    vi.mocked(getRoom).mockRejectedValue(new ApiFailure("ROOM_NOT_FOUND", 404));
    render(<Lobby />);
    await userEvent.type(screen.getByLabelText("Room code"), "KQ7XZ");
    await userEvent.click(screen.getByRole("button", { name: "Join" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This room does not exist.",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("creates a poker room with the chosen blinds and goes to it", async () => {
    vi.mocked(createRoom).mockResolvedValue({ code: "ABCDE" });
    render(<Lobby />);
    await userEvent.click(screen.getByRole("radio", { name: "50/100" }));
    await userEvent.click(screen.getByRole("switch"));
    await userEvent.click(screen.getByRole("button", { name: "Create room" }));
    expect(createRoom).toHaveBeenCalledWith("poker", {
      blinds: [50, 100],
      capToShortestStack: true,
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/table?code=ABCDE"));
  });

  it("creates a blackjack room without poker options", async () => {
    vi.mocked(createRoom).mockResolvedValue({ code: "ABCDE" });
    render(<Lobby />);
    await userEvent.click(screen.getByRole("radio", { name: "Blackjack" }));
    await userEvent.click(screen.getByRole("button", { name: "Create room" }));
    expect(createRoom).toHaveBeenCalledWith("blackjack", undefined);
  });

  it("keeps the player in the lobby when creating fails", async () => {
    vi.mocked(createRoom).mockRejectedValue(new ApiFailure("NETWORK", 0));
    render(<Lobby />);
    await userEvent.click(screen.getByRole("button", { name: "Create room" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Try again.",
    );
    expect(push).not.toHaveBeenCalled();
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
    renderWithQuery(<TableScreen code={code} />);
    expect(screen.getByText(/No room code/)).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  });

  it("opens the table for a valid code, watching until the player sits", () => {
    renderWithQuery(<TableScreen code="KQ7XZ" />);
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
