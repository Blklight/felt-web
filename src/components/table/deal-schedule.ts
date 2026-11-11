import type { TableView } from "@/dev/view-types";

export const FLOP = 3;

export function dealSchedule(
  view: TableView,
  step: number,
): { seats: number[][]; board: number[] } {
  const count = view.seats.length;
  const dealer = view.seats.findIndex((s) => s.isDealer);
  const order = Array.from(
    { length: count },
    (_, k) => (dealer + 1 + k + count) % count,
  ).filter((i) => view.seats[i].status !== "empty");
  const blackjack = view.game === "blackjack";
  const perRound = order.length + (blackjack ? 1 : 0);
  const seats = view.seats.map(() => [] as number[]);
  order.forEach((seatIndex, position) => {
    seats[seatIndex] = view.seats[seatIndex].cards.map(
      (_, round) => (round * perRound + position) * step,
    );
  });
  const holes = Math.max(0, ...view.seats.map((s) => s.cards.length));
  const board = blackjack
    ? view.board.map((_, round) => (round * perRound + order.length) * step)
    : Array.from(
        { length: FLOP },
        (_, k) => (holes * perRound + k) * step + 0.3,
      );
  return { seats, board };
}
