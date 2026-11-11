import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AVATAR_IDS, PlayerAvatar } from "@/components/player-avatar";
import { Lobby } from "@/components/screens/lobby";
import { ProfileScreen } from "@/components/screens/profile-screen";
import { TableScreen } from "@/components/screens/table-screen";
import { isRecoveryCode, newRecoveryCode } from "@/lib/recovery-code";
import { useCardSkinStore } from "@/store/useCardSkinStore";
import { useLanguageStore } from "@/store/useLanguageStore";
import { freshProfile, useProfileStore } from "@/store/useProfileStore";
import { useRecentTablesStore } from "@/store/useRecentTablesStore";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  act(() => {
    useLanguageStore.setState({ language: "en" });
    useProfileStore.setState({
      ...freshProfile(),
      name: "Ana",
      avatarId: "a1",
      balance: 2500,
    });
    useRecentTablesStore.setState({ tables: [] });
    useCardSkinStore.setState({
      skin: "classic",
      back: "ink",
      overrideOthers: false,
    });
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
  it("saves a new name and refuses an empty one", async () => {
    render(<ProfileScreen />);
    const name = await screen.findByLabelText("Name");
    await userEvent.clear(name);
    await userEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Use 2 to 20 characters.",
    );
    await userEvent.type(name, "  Bia  ");
    await userEvent.click(screen.getByRole("button", { name: "Save name" }));
    expect(useProfileStore.getState().name).toBe("Bia");
  });

  it("picks an avatar", async () => {
    render(<ProfileScreen />);
    const group = await screen.findByRole("radiogroup", { name: "Avatar" });
    await userEvent.click(
      within(group).getByRole("radio", { name: "Avatar 4" }),
    );
    expect(useProfileStore.getState().avatarId).toBe("a4");
    expect(
      within(group).getByRole("radio", { name: "Avatar 4" }),
    ).toBeChecked();
  });

  it("picks the card skin and back", async () => {
    render(<ProfileScreen />);
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
    expect(useCardSkinStore.getState()).toMatchObject({
      skin: "vice",
      back: "suits",
    });
  });

  it("hides the recovery code until asked and copies it", async () => {
    const user = userEvent.setup();
    render(<ProfileScreen />);
    const code = useProfileStore.getState().recoveryCode;
    expect(screen.queryByText(code)).not.toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Show code" }));
    expect(screen.getByText(code)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toBe(code);
  });

  it("imports a valid recovery code and rejects a bad one", async () => {
    render(<ProfileScreen />);
    await userEvent.click(
      await screen.findByRole("button", { name: "Import code" }),
    );
    const input = screen.getByLabelText("Recovery code to import");
    await userEvent.type(input, "not-a-code");
    await userEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "That is not a valid recovery code.",
    );
    const good = newRecoveryCode();
    await userEvent.clear(input);
    await userEvent.type(input, good);
    await userEvent.click(screen.getByRole("button", { name: "Import" }));
    expect(useProfileStore.getState().recoveryCode).toBe(good);
  });

  it("deletes the account only after confirming", async () => {
    render(<ProfileScreen />);
    const before = useProfileStore.getState().recoveryCode;
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete account" }),
    );
    expect(useProfileStore.getState().name).toBe("Ana");
    await userEvent.click(
      screen.getByRole("button", { name: "Delete forever" }),
    );
    expect(useProfileStore.getState().name).not.toBe("Ana");
    expect(useProfileStore.getState().recoveryCode).not.toBe(before);
  });
});

describe("recent tables", () => {
  it("remembers a table when it is opened", () => {
    render(<TableScreen code="KQ7XZ" game="blackjack" />);
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
