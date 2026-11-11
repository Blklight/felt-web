"use client";

// Dev-only stand-in for the blackjack table on felt-server: it deals, plays the
// other seats and the dealer, and settles, so the UI can be exercised end to end.
// The real rules live on the server; nothing in src/components imports this file.

import { useCallback, useEffect, useReducer } from "react";
import { blackjackTable } from "@/dev/fixtures";
import type {
  CardCode,
  LegalAction,
  LogEntry,
  Outcome,
  Rank,
  Suit,
  TableView,
} from "@/dev/view-types";

const YOU = 0;
const PLAYERS = [0, 1, 3];
const OTHER_BETS: Record<number, number> = { 1: 50, 3: 25 };
const MIN_BET = 10;
const MAX_BET = 500;
export const BLACKJACK_BUY_IN = { min: 200, max: 2000 };

const DEAL_SECONDS = 4.2;
const STEP_SECONDS = 1;
const RESULT_SECONDS = 3.5;

type Phase = "betting" | "dealing" | "players" | "dealer" | "results";

type State = {
  round: number;
  phase: Phase;
  deck: CardCode[];
  hands: Record<number, CardCode[]>;
  bets: Record<number, number>;
  stacks: Record<number, number>;
  dealer: CardCode[];
  holeHidden: boolean;
  turn: number | null;
  outcomes: Record<number, Outcome>;
  log: LogEntry[];
};

type Action =
  | { type: "bet"; amount: number }
  | { type: "hit" }
  | { type: "stand" }
  | { type: "double" }
  | { type: "tick" };

const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
];
const SUITS: Suit[] = ["s", "h", "d", "c"];

function shuffled(seed: number): CardCode[] {
  const deck = SUITS.flatMap((s) => RANKS.map((r): CardCode => `${r}${s}`));
  let x = seed * 9301 + 49297;
  for (let i = deck.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function handTotal(cards: CardCode[]): number {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    const rank = card[0];
    if (rank === "A") {
      aces += 1;
      total += 11;
    } else if (rank === "T" || rank === "J" || rank === "Q" || rank === "K") {
      total += 10;
    } else {
      total += Number(rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

const isBlackjack = (cards: CardCode[]) =>
  cards.length === 2 && handTotal(cards) === 21;

function logged(
  state: State,
  seat: number,
  kind: LogEntry["kind"],
  amount?: number,
): LogEntry[] {
  return [...state.log, { id: state.log.length + 1, seat, kind, amount }];
}

function newRound(round: number, stacks: Record<number, number>): State {
  return {
    round,
    phase: "betting",
    deck: shuffled(round + 1),
    hands: {},
    bets: {},
    stacks,
    dealer: [],
    holeHidden: true,
    turn: null,
    outcomes: {},
    log: [],
  };
}

function deal(state: State, yourBet: number): State {
  const deck = [...state.deck];
  const hands: Record<number, CardCode[]> = {};
  const dealer: CardCode[] = [];
  for (let round = 0; round < 2; round++) {
    for (const seat of PLAYERS)
      hands[seat] = [...(hands[seat] ?? []), deck.shift() as CardCode];
    dealer.push(deck.shift() as CardCode);
  }
  const bets: Record<number, number> = { ...OTHER_BETS, [YOU]: yourBet };
  const stacks = { ...state.stacks };
  let log = state.log;
  for (const seat of PLAYERS) {
    stacks[seat] -= bets[seat];
    log = [
      ...log,
      { id: log.length + 1, seat, kind: "bet", amount: bets[seat] },
    ];
  }
  return { ...state, phase: "dealing", deck, hands, dealer, bets, stacks, log };
}

function nextTurn(state: State, after: number | null): State {
  const from = after === null ? 0 : PLAYERS.indexOf(after) + 1;
  const next = PLAYERS.slice(from).find((seat) => {
    const total = handTotal(state.hands[seat]);
    return total < 21;
  });
  if (next === undefined)
    return { ...state, phase: "dealer", turn: null, holeHidden: false };
  return { ...state, phase: "players", turn: next };
}

function draw(state: State, seat: number): State {
  const [card, ...deck] = state.deck;
  return {
    ...state,
    deck,
    hands: { ...state.hands, [seat]: [...state.hands[seat], card] },
  };
}

function settle(state: State): State {
  const dealerTotal = handTotal(state.dealer);
  const stacks = { ...state.stacks };
  const outcomes: Record<number, Outcome> = {};
  let log = state.log;
  for (const seat of PLAYERS) {
    const cards = state.hands[seat];
    const total = handTotal(cards);
    const bet = state.bets[seat];
    let outcome: Outcome;
    if (total > 21) outcome = { kind: "bust" };
    else if (isBlackjack(cards) && !isBlackjack(state.dealer))
      outcome = { kind: "blackjack", amount: Math.floor(bet * 1.5) };
    else if (dealerTotal > 21 || total > dealerTotal)
      outcome = { kind: "win", amount: bet };
    else if (total === dealerTotal) outcome = { kind: "push" };
    else outcome = { kind: "lose" };
    if (outcome.kind === "win" || outcome.kind === "blackjack") {
      stacks[seat] += bet + (outcome.amount ?? 0);
      log = [
        ...log,
        { id: log.length + 1, seat, kind: "win", amount: outcome.amount },
      ];
    }
    if (outcome.kind === "push") stacks[seat] += bet;
    outcomes[seat] = outcome;
  }
  return { ...state, phase: "results", stacks, outcomes, log };
}

function reducer(state: State, action: Action): State {
  if (action.type === "bet" && state.phase === "betting")
    return deal(state, action.amount);

  if (
    state.phase === "players" &&
    state.turn === YOU &&
    action.type !== "tick" &&
    action.type !== "bet"
  ) {
    if (action.type === "stand")
      return nextTurn({ ...state, log: logged(state, YOU, "stand") }, YOU);
    if (action.type === "hit") {
      const drawn = draw({ ...state, log: logged(state, YOU, "hit") }, YOU);
      return handTotal(drawn.hands[YOU]) >= 21 ? nextTurn(drawn, YOU) : drawn;
    }
    if (action.type === "double") {
      const bet = state.bets[YOU];
      const doubled: State = {
        ...state,
        bets: { ...state.bets, [YOU]: bet * 2 },
        stacks: { ...state.stacks, [YOU]: state.stacks[YOU] - bet },
        log: logged(state, YOU, "double"),
      };
      return nextTurn(draw(doubled, YOU), YOU);
    }
  }

  if (action.type !== "tick") return state;

  switch (state.phase) {
    case "dealing":
      return nextTurn(state, null);
    case "players": {
      const seat = state.turn as number;
      if (handTotal(state.hands[seat]) < 16)
        return draw({ ...state, log: logged(state, seat, "hit") }, seat);
      return nextTurn({ ...state, log: logged(state, seat, "stand") }, seat);
    }
    case "dealer":
      if (handTotal(state.dealer) < 17) {
        const [card, ...deck] = state.deck;
        return { ...state, deck, dealer: [...state.dealer, card] };
      }
      return settle(state);
    case "results":
      return newRound(state.round + 1, state.stacks);
    default:
      return state;
  }
}

const WAIT: Partial<Record<Phase, number>> = {
  dealing: DEAL_SECONDS,
  dealer: STEP_SECONDS,
  results: RESULT_SECONDS,
};

function legalActions(state: State): LegalAction[] {
  if (state.phase === "betting") {
    return [
      { type: "bet", min: MIN_BET, max: Math.min(MAX_BET, state.stacks[YOU]) },
    ];
  }
  if (state.phase !== "players" || state.turn !== YOU) return [];
  const actions: LegalAction[] = [{ type: "hit" }, { type: "stand" }];
  const bet = state.bets[YOU];
  if (state.hands[YOU].length === 2 && state.stacks[YOU] >= bet)
    actions.push({ type: "double", amount: bet });
  return actions;
}

function toView(state: State): TableView {
  const dealerCards: CardCode[] =
    state.holeHidden && state.dealer.length === 2
      ? [state.dealer[0], "??"]
      : state.dealer;
  return {
    ...blackjackTable,
    phase: state.phase,
    seats: blackjackTable.seats.map((seat, i) => {
      if (!PLAYERS.includes(i)) return seat;
      const cards = state.hands[i] ?? [];
      return {
        ...seat,
        cards,
        bet: state.bets[i] ?? 0,
        stack: state.stacks[i],
        isTurn: state.turn === i,
        total: cards.length > 0 ? handTotal(cards) : undefined,
        outcome: state.outcomes[i],
      };
    }),
    board: dealerCards,
    dealerTotal:
      dealerCards.length > 0
        ? handTotal(dealerCards.filter((c) => c !== "??"))
        : undefined,
    pots: [],
    secondsLeft: state.phase === "betting" || state.turn === YOU ? 15 : null,
    you: { seat: YOU, legalActions: legalActions(state) },
    log: state.log,
    buyIn: BLACKJACK_BUY_IN,
  };
}

export function useBlackjackScript(buyIn: number) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    newRound(0, { [YOU]: buyIn, 1: 1380, 3: 1140 }),
  );

  const others = state.phase === "players" && state.turn !== YOU;
  const wait = others ? STEP_SECONDS : WAIT[state.phase];
  // biome-ignore lint/correctness/useExhaustiveDependencies: the timer is re-armed on every state change
  useEffect(() => {
    if (wait === undefined) return;
    const id = setTimeout(() => dispatch({ type: "tick" }), wait * 1000);
    return () => clearTimeout(id);
  }, [state, wait]);

  const act = useCallback(
    (action: { type: LegalAction["type"]; amount?: number }) => {
      if (action.type === "bet")
        dispatch({ type: "bet", amount: action.amount ?? MIN_BET });
      if (
        action.type === "hit" ||
        action.type === "stand" ||
        action.type === "double"
      )
        dispatch({ type: action.type });
    },
    [],
  );

  return {
    view: toView(state),
    round: state.round,
    dealKey: `${state.round}-${state.phase === "betting" ? "bet" : "deal"}`,
    act,
  };
}

export function blackjackWatchingView(): TableView {
  return {
    ...blackjackTable,
    phase: "waiting",
    board: [],
    secondsLeft: null,
    buyIn: BLACKJACK_BUY_IN,
    log: [],
    seats: blackjackTable.seats.map((seat, i) =>
      i === YOU
        ? {
            ...seat,
            status: "empty",
            name: "",
            cards: [],
            bet: 0,
            isTurn: false,
          }
        : { ...seat, cards: [], bet: 0, isTurn: false },
    ),
    you: { seat: null, legalActions: [] },
  };
}
