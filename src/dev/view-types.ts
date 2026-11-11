import type { CardBackVariant, CardSkin } from "@/components/cards/skins";

export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K";
export type Suit = "s" | "h" | "d" | "c";
export type CardCode = `${Rank}${Suit}` | "??";

export type LegalAction = {
  type:
    | "fold"
    | "check"
    | "call"
    | "raise"
    | "all-in"
    | "hit"
    | "stand"
    | "double";
  min?: number;
  max?: number;
  amount?: number;
};

export type SeatView = {
  seat: number;
  name: string;
  avatarId: string;
  skinId: CardSkin;
  backId: CardBackVariant;
  stack: number;
  bet: number;
  cards: CardCode[];
  status: "active" | "folded" | "all-in" | "out" | "empty";
  isDealer: boolean;
  isTurn: boolean;
};

export type TableView = {
  game: "blackjack" | "poker";
  phase: string;
  seats: SeatView[];
  board: CardCode[];
  boardSkinId: CardSkin;
  boardBackId: CardBackVariant;
  pots: number[];
  secondsLeft: number | null;
  you: { seat: number | null; legalActions: LegalAction[] };
};
