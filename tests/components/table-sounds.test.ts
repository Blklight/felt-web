import { describe, expect, it } from "vitest";
import { soundsBetween } from "@/components/table/table";
import { pokerTable } from "@/dev/fixtures";
import type { TableView } from "@/dev/view-types";

const waiting = (view: TableView): TableView => ({
  ...view,
  you: { ...view.you, legalActions: [] },
});

describe("soundsBetween", () => {
  it("is silent when nothing changed", () => {
    const view = pokerTable(3);
    expect(soundsBetween(view, view)).toEqual([]);
  });

  it("calls the player when their turn starts and again when time runs low", () => {
    const view = pokerTable(3);
    expect(soundsBetween(waiting(view), view)).toEqual(["turn"]);
    expect(soundsBetween(view, { ...view, secondsLeft: 4 })).toEqual(["hurry"]);
  });

  it("drops a chip when a bet grows", () => {
    const before = waiting(pokerTable(3));
    const now: TableView = {
      ...before,
      seats: before.seats.map((s, i) =>
        i === 1 ? { ...s, bet: s.bet + 50 } : s,
      ),
    };
    expect(soundsBetween(before, now)).toEqual(["bet"]);
  });

  it("plays the result for the player's own outcome, nothing on a push", () => {
    const before = waiting(pokerTable(3));
    const withOutcome = (kind: "win" | "bust" | "push"): TableView => ({
      ...before,
      seats: before.seats.map((s, i) =>
        i === 0 ? { ...s, outcome: { kind } } : s,
      ),
    });
    expect(soundsBetween(before, withOutcome("win"))).toEqual(["win"]);
    expect(soundsBetween(before, withOutcome("bust"))).toEqual(["lose"]);
    expect(soundsBetween(before, withOutcome("push"))).toEqual([]);
  });
});
