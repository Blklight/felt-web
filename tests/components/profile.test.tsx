import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AVATAR_IDS, PlayerAvatar } from "@/components/player-avatar";
import { Lobby } from "@/components/screens/lobby";
import { ProfileScreen } from "@/components/screens/profile-screen";
import { TableScreen } from "@/components/screens/table-screen";
import { isRecoveryCode, newRecoveryCode } from "@/lib/recovery-code";
import { ApiFailure, deleteMe, getMe, patchMe } from "@/net/api";
import type { Profile } from "@/net/protocol";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useRecentTablesStore } from "@/store/useRecentTablesStore";
import { renderWithQuery } from "../helpers/query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/net/api", async (original) => ({
  ...(await original<typeof import("@/net/api")>()),
  getMe: vi.fn(),
  patchMe: vi.fn(),
  deleteMe: vi.fn(),
}));

vi.mock("@/net/use-table-socket", async () => {
  const { blackjackTable } = await import("@/dev/fixtures");
  return {
    useTableSocket: () => ({
      view: blackjackTable,
      fatal: null,
      send: vi.fn(),
      retry: vi.fn(),
    }),
  };
});

const TOKEN = newRecoveryCode();
const profile: Profile = {
  playerId: "p1",
  name: "Ana",
  avatarId: "a1",
  skinId: "classic",
  backId: "ink",
  balance: 2500,
  refills: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  let current = { ...profile };
  vi.mocked(getMe).mockImplementation(async () => current);
  vi.mocked(patchMe).mockImplementation(async (patch) => {
    current = { ...current, ...patch };
    return current;
  });
  vi.mocked(deleteMe).mockResolvedValue(null);
  act(() => {
    useLanguageStore.setState({ language: "en" });
    useProfileStore.setState({ playerId: "p1", token: TOKEN });
    useRecentTablesStore.setState({ tables: [] });
  });
});

describe("recovery code", () => {
  it("is 32 random bytes in base64url", () => {
    const code = newRecoveryCode();
    expect(isRecoveryCode(code)).toBe(true);
    expect(code).toHaveLength(43);
    expect(newRecoveryCode()).not.toBe(code);
  });

  it.each([
    "",
    "short",
    `${"a".repeat(42)}!`,
    "a".repeat(44),
  ])("rejects %j", (code) => {
    expect(isRecoveryCode(code)).toBe(false);
  });
});

describe("PlayerAvatar", () => {
  it("draws every avatar in the fixed set with a label", () => {
    for (const [i, id] of AVATAR_IDS.entries()) {
      const { unmount } = render(<PlayerAvatar id={id} />);
      expect(
        screen.getByRole("img", { name: `Avatar ${i + 1}` }),
      ).toBeInTheDocument();
      unmount();
    }
  });
});

describe("ProfileScreen", () => {
  it("saves a new name and refuses an invalid one", async () => {
    renderWithQuery(<ProfileScreen />);
    const name = await screen.findByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Use 2 to 20 characters.",
    );
    expect(patchMe).not.toHaveBeenCalled();
    await userEvent.type(name, "  Bia  ");
    await userEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(patchMe).toHaveBeenCalledWith({ name: "Bia" });
  });

  it("picks an avatar", async () => {
    renderWithQuery(<ProfileScreen />);
    const group = await screen.findByRole("radiogroup", { name: "Avatar" });
    await userEvent.click(
      within(group).getByRole("radio", { name: "Avatar 4" }),
    );
    expect(patchMe).toHaveBeenCalledWith({ avatarId: "a4" });
    expect(
      await within(group).findByRole("radio", { name: "Avatar 4" }),
    ).toBeChecked();
  });

  it("keeps the old value when the server freezes the profile (seated)", async () => {
    vi.mocked(patchMe).mockRejectedValueOnce(
      new ApiFailure("VALIDATION_ERROR", 409, { avatarId: "locked" }),
    );
    renderWithQuery(<ProfileScreen />);
    const group = await screen.findByRole("radiogroup", { name: "Avatar" });
    await userEvent.click(
      within(group).getByRole("radio", { name: "Avatar 4" }),
    );
    expect(
      within(group).getByRole("radio", { name: "Avatar 1" }),
    ).toBeChecked();
  });

  it("picks the card skin and back", async () => {
    renderWithQuery(<ProfileScreen />);
    await userEvent.click(
      within(
        await screen.findByRole("radiogroup", { name: "Cards" }),
      ).getByRole("radio", { name: "Vice" }),
    );
    await userEvent.click(
      within(screen.getByRole("radiogroup", { name: "Card back" })).getByRole(
        "radio",
        { name: "Suits" },
      ),
    );
    expect(patchMe).toHaveBeenCalledWith({ skinId: "vice" });
    expect(patchMe).toHaveBeenCalledWith({ backId: "suits" });
  });

  it("hides the recovery code until asked and copies it", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileScreen />);
    expect(screen.queryByText(TOKEN)).not.toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Show code" }));
    expect(screen.getByText(TOKEN)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toBe(TOKEN);
  });

  it("imports a recovery code only when the server knows it", async () => {
    renderWithQuery(<ProfileScreen />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Import code" }),
    );
    const input = screen.getByLabelText("Recovery code to import");
    await userEvent.type(input, "not-a-code");
    await userEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "That is not a valid recovery code.",
    );

    const unknown = newRecoveryCode();
    vi.mocked(getMe).mockRejectedValueOnce(new ApiFailure("UNAUTHORIZED", 401));
    await userEvent.clear(input);
    await userEvent.type(input, unknown);
    await userEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(useProfileStore.getState().token).toBe(TOKEN);

    const good = newRecoveryCode();
    vi.mocked(getMe).mockResolvedValueOnce({ ...profile, playerId: "p2" });
    await userEvent.clear(input);
    await userEvent.type(input, good);
    await userEvent.click(screen.getByRole("button", { name: "Import" }));
    await waitFor(() => expect(useProfileStore.getState().token).toBe(good));
    expect(getMe).toHaveBeenLastCalledWith(good);
    expect(useProfileStore.getState().playerId).toBe("p2");
  });

  it("deletes the account only after confirming", async () => {
    renderWithQuery(<ProfileScreen />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete account" }),
    );
    expect(deleteMe).not.toHaveBeenCalled();
    expect(useProfileStore.getState().token).toBe(TOKEN);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete forever" }),
    );
    await waitFor(() => expect(useProfileStore.getState().token).toBeNull());
    expect(deleteMe).toHaveBeenCalled();
  });
});

describe("recent tables", () => {
  it("remembers a table when it is opened", () => {
    renderWithQuery(<TableScreen code="KQ7XZ" />);
    expect(useRecentTablesStore.getState().tables[0]).toMatchObject({
      code: "KQ7XZ",
      game: "blackjack",
    });
  });

  it("keeps the latest five without duplicates", () => {
    const { visit } = useRecentTablesStore.getState();
    act(() => {
      for (const code of [
        "AAAAA",
        "BBBBB",
        "CCCCC",
        "DDDDD",
        "EEEEE",
        "FFFFF",
        "BBBBB",
      ])
        visit(code, "poker");
    });
    expect(useRecentTablesStore.getState().tables.map((t) => t.code)).toEqual([
      "BBBBB",
      "FFFFF",
      "EEEEE",
      "DDDDD",
      "CCCCC",
    ]);
  });

  it("are listed in the lobby with links back", async () => {
    act(() => useRecentTablesStore.getState().visit("KQ7XZ", "blackjack"));
    render(<Lobby />);
    const link = await screen.findByRole("link", { name: /KQ7XZ/ });
    expect(link).toHaveAttribute("href", "/table?code=KQ7XZ&game=blackjack");
  });
});
