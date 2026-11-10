import { describe, expect, it } from "vitest";
import {
  blackjackTable,
  longNameTable,
  pokerTable,
  spectatorTable,
} from "@/dev/fixtures";

describe("fixtures", () => {
  it.each([
    2, 3, 4, 5, 6,
  ] as const)("pokerTable(%i) has that many seats", (n) => {
    expect(pokerTable(n).seats).toHaveLength(n);
  });

  it("spectator has no legal actions and no seat", () => {
    expect(spectatorTable.you).toEqual({ seat: null, legalActions: [] });
  });

  it("never leaks opponents' cards in the player's view", () => {
    const view = pokerTable(4);
    for (const s of view.seats) {
      if (s.seat !== view.you.seat) {
        expect(s.cards.every((c) => c === "??")).toBe(true);
      }
    }
  });

  it("blackjack is blackjack and long-name fixture stresses layout", () => {
    expect(blackjackTable.game).toBe("blackjack");
    expect(longNameTable.seats.some((s) => s.name.length >= 40)).toBe(true);
    expect(longNameTable.seats.some((s) => s.stack >= 9_999_999)).toBe(true);
  });
});
