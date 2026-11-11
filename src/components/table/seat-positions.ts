export type Point = { x: number; y: number };
export type TableShape = "chamfer" | "round" | "stadium" | "halfmoon";

const EXPONENT: Record<Exclude<TableShape, "halfmoon">, number> = {
  chamfer: 3,
  round: 4,
  stadium: 2.6,
};

export function tableShape(
  game: "poker" | "blackjack",
  seatCount: number,
): TableShape {
  if (game === "blackjack") return "halfmoon";
  if (seatCount <= 2) return "chamfer";
  if (seatCount <= 4) return "round";
  return "stadium";
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const signedPow = (value: number, exponent: number) =>
  Math.sign(value) * Math.abs(value) ** exponent;

export function seatPositions(shape: TableShape, count: number): Point[] {
  if (shape === "halfmoon") {
    const span = 72;
    return Array.from({ length: count }, (_, i) => {
      const phi =
        count === 1
          ? 0
          : ((-span + (i * 2 * span) / (count - 1)) * Math.PI) / 180;
      return {
        x: round2(50 + 46 * Math.sin(phi)),
        y: round2(100 * Math.cos(phi)),
      };
    });
  }
  const power = 2 / EXPONENT[shape];
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.PI / 2 + (i * 2 * Math.PI) / count;
    return {
      x: round2(50 + 50 * signedPow(Math.cos(angle), power)),
      y: round2(50 + 50 * signedPow(Math.sin(angle), power)),
    };
  });
}
