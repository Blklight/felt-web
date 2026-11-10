import { describe, expect, it } from "vitest";
import { seatPositions, tableShape } from "@/components/table/seat-positions";

describe("tableShape", () => {
  it("picks the shape from game and seat count", () => {
    expect(tableShape("poker", 2)).toBe("chamfer");
    expect(tableShape("poker", 3)).toBe("round");
    expect(tableShape("poker", 4)).toBe("round");
    expect(tableShape("poker", 5)).toBe("stadium");
    expect(tableShape("poker", 6)).toBe("stadium");
    expect(tableShape("blackjack", 5)).toBe("halfmoon");
  });
});

describe("seatPositions", () => {
  const cases = [
    ["chamfer", 2],
    ["round", 3],
    ["round", 4],
    ["stadium", 5],
    ["stadium", 6],
    ["halfmoon", 3],
    ["halfmoon", 5],
  ] as const;

  it.each(
    cases,
  )("%s with %i seats: inside the box and well apart", (shape, n) => {
    const points = seatPositions(shape, n);
    expect(points).toHaveLength(n);
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(100);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(110);
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = (points[i].x - points[j].x) * (16 / 9);
        const dy = points[i].y - points[j].y;
        expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it("puts the first ring seat at the bottom center", () => {
    for (const shape of ["chamfer", "round", "stadium"] as const) {
      const [first] = seatPositions(shape, 4);
      expect(first.x).toBeCloseTo(50);
      expect(first.y).toBeGreaterThan(50);
    }
  });

  it("puts the middle half-moon seat at the bottom center, lowest of all", () => {
    const points = seatPositions("halfmoon", 5);
    expect(points[2].x).toBeCloseTo(50);
    expect(points[2].y).toBe(Math.max(...points.map((p) => p.y)));
  });
});
