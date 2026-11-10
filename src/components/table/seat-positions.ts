export type Point = { x: number; y: number };

const RX = 38;
const RY = 38;

export function seatPositions(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.PI / 2 + (i * 2 * Math.PI) / count;
    return { x: 50 + RX * Math.cos(angle), y: 50 + RY * Math.sin(angle) };
  });
}
