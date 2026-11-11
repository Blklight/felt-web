import { describe, expect, it } from "vitest";
import { parseCard, suitColor } from "@/lib/cards";

describe("cards", () => {
  it("parses a face-up card", () => {
    expect(parseCard("As")).toEqual({ hidden: false, rank: "A", suit: "s" });
  });

  it("parses ten as T", () => {
    expect(parseCard("Td")).toEqual({ hidden: false, rank: "T", suit: "d" });
  });

  it("parses the hidden card", () => {
    expect(parseCard("??")).toEqual({ hidden: true });
  });

  it("colors hearts and diamonds red, spades and clubs black", () => {
    expect(suitColor("h")).toBe("red");
    expect(suitColor("d")).toBe("red");
    expect(suitColor("s")).toBe("black");
    expect(suitColor("c")).toBe("black");
  });
});
