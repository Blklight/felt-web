import type { SeatView, TableView } from "@/dev/view-types";

const NAMES = ["You", "Mara", "Theo", "Ines", "Kai", "Luz"];
const SKINS = [
  "classic",
  "noir",
  "fantasy",
  "vice",
  "classic",
  "noir",
] as const;
const BACKS = ["ink", "neon", "vice", "suits", "ink", "neon"] as const;
const HIDDEN = ["??", "??"] as const;

function seat(i: number, overrides: Partial<SeatView> = {}): SeatView {
  return {
    seat: i,
    name: NAMES[i] ?? `Player ${i + 1}`,
    avatarId: `a${i + 1}`,
    skinId: SKINS[i] ?? "classic",
    backId: BACKS[i] ?? "ink",
    stack: 1500 - i * 120,
    bet: i === 1 ? 50 : 0,
    cards: i === 0 ? ["As", "Kd"] : [...HIDDEN],
    status: "active",
    isDealer: i === 1,
    isTurn: i === 0,
    ...overrides,
  };
}

export function pokerTable(seatCount: 2 | 3 | 4 | 5 | 6): TableView {
  return {
    handId: 1,
    game: "poker",
    phase: "flop",
    seats: Array.from({ length: seatCount }, (_, i) => seat(i)),
    board: ["7h", "Td", "2c"],
    boardSkinId: "classic",
    boardBackId: "ink",
    pots: [300],
    secondsLeft: 18,
    you: {
      seat: 0,
      legalActions: [
        { type: "fold" },
        { type: "call", amount: 50 },
        { type: "raise", min: 100, max: 1000 },
      ],
    },
  };
}

export const spectatorTable: TableView = {
  ...pokerTable(4),
  you: { seat: null, legalActions: [] },
  seats: pokerTable(4).seats.map((s) => ({ ...s, isTurn: false })),
};

export const blackjackTable: TableView = {
  handId: 1,
  game: "blackjack",
  phase: "players",
  seats: [
    seat(0, { cards: ["9h", "7s"], bet: 100, isDealer: false }),
    seat(1, { cards: ["Kc", "5d"], bet: 200, isDealer: false, isTurn: false }),
    seat(2, {
      status: "empty",
      name: "",
      cards: [],
      isTurn: false,
      isDealer: false,
    }),
    seat(3, { cards: ["Ah", "Qs"], bet: 50, isDealer: false, isTurn: false }),
    seat(4, {
      status: "empty",
      name: "",
      cards: [],
      isTurn: false,
      isDealer: false,
    }),
  ],
  board: ["Kc", "??"],
  boardSkinId: "classic",
  boardBackId: "ink",
  pots: [],
  secondsLeft: 12,
  you: {
    seat: 0,
    legalActions: [
      { type: "hit" },
      { type: "stand" },
      { type: "double", amount: 100 },
    ],
  },
};

const base = pokerTable(3);
export const longNameTable: TableView = {
  ...base,
  seats: base.seats.map((s, i) =>
    i === 1
      ? {
          ...s,
          name: "Maximilian Bartholomew Fitzgerald-Montgomery III",
          stack: 9_999_999,
        }
      : s,
  ),
};
