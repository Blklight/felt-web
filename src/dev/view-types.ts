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
    | "bet"
    | "raise"
    | "all-in"
    | "hit"
    | "stand"
    | "double";
  min?: number;
  max?: number;
  amount?: number;
};

export type HandRank =
  | "royal-flush"
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "pair"
  | "high-card";

export type HandInfo = { rank: HandRank; cards: CardCode[] };

export type Winner = { seat: number; amount: number; hand?: HandInfo };

export type LogKind =
  | "blind"
  | "fold"
  | "check"
  | "call"
  | "bet"
  | "raise"
  | "all-in"
  | "win"
  | "hit"
  | "stand"
  | "double";

export type LogEntry = {
  id: number;
  seat: number;
  kind: LogKind;
  amount?: number;
};

export type Outcome = {
  kind: "win" | "blackjack" | "push" | "lose" | "bust";
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
  blind?: "small" | "big";
  total?: number;
  outcome?: Outcome;
  isTurn: boolean;
};

export type TableView = {
  handId: number;
  game: "blackjack" | "poker";
  phase: string;
  seats: SeatView[];
  board: CardCode[];
  boardSkinId: CardSkin;
  boardBackId: CardBackVariant;
  pots: number[];
  secondsLeft: number | null;
  you: { seat: number | null; legalActions: LegalAction[]; hand?: HandInfo };
  result?: { winners: Winner[] };
  log?: LogEntry[];
  buyIn?: { min: number; max: number };
  dealerTotal?: number;
};
