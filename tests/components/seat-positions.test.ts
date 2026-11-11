import { describe, expect, it } from "vitest";
import { seatPositions } from "@/components/table/seat-positions";

describe("seatPositions", () => {
  it.each([
    2, 3, 4, 5, 6,
  ])("gives %i points inside the table, well apart", (n) => {
    const points = seatPositions(n);
    expect(points).toHaveLength(n);
    for (const p of points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(100);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(100);
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        expect(
          Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y),
        ).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it("puts the first seat at the bottom center", () => {
    const [first] = seatPositions(5);
    expect(first.x).toBeCloseTo(50);
    expect(first.y).toBeGreaterThan(50);
  });
});
