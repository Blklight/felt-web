"use client";

import { useEffect, useState } from "react";
import { SHUFFLE_SECONDS } from "@/components/cards/deck";
import { pokerTable } from "@/dev/fixtures";
import type {
  CardCode,
  LegalAction,
  LogKind,
  TableView,
} from "@/dev/view-types";

const YOU = 0;
const MARA = 1;
const THEO = 2;
const INES = 3;
const BOARD: CardCode[] = ["7h", "Td", "2c", "Qs", "4d"];
const YOUR_ACTIONS: LegalAction[] = [
  { type: "fold" },
  { type: "call", amount: 50 },
  { type: "raise", min: 100, max: 1000 },
];

type Step = { wait: number; apply: (view: TableView) => TableView };

const total = (values: number[]) => values.reduce((a, b) => a + b, 0);

const did =
  (index: number, kind: LogKind, amount?: number) =>
  (view: TableView): TableView => {
    const log = view.log ?? [];
    return {
      ...view,
      log: [...log, { id: log.length + 1, seat: index, kind, amount }],
    };
  };

function seat(
  view: TableView,
  index: number,
  patch: Partial<TableView["seats"][number]>,
): TableView {
  return {
    ...view,
    seats: view.seats.map((s, i) => (i === index ? { ...s, ...patch } : s)),
  };
}

function bet(view: TableView, index: number, amount: number): TableView {
  const current = view.seats[index];
  return seat(view, index, {
    bet: amount,
    stack: current.stack - (amount - current.bet),
  });
}

function turn(view: TableView, index: number | null): TableView {
  return {
    ...view,
    seats: view.seats.map((s, i) => ({ ...s, isTurn: i === index })),
    you: {
      ...view.you,
      seat: YOU,
      legalActions: index === YOU ? YOUR_ACTIONS : [],
    },
    secondsLeft: index === null ? null : 15,
  };
}

function collect(view: TableView): TableView {
  const bets = total(view.seats.map((s) => s.bet));
  return {
    ...view,
    pots: [total(view.pots) + bets],
    seats: view.seats.map((s) => ({ ...s, bet: 0 })),
  };
}

const street =
  (phase: string, cards: number) =>
  (view: TableView): TableView => ({
    ...view,
    phase,
    board: BOARD.slice(0, cards),
  });

export function dealView(): TableView {
  const base = pokerTable(4);
  const fresh: TableView = {
    ...base,
    phase: "preflop",
    board: [],
    pots: [],
    seats: base.seats.map((s, i) => ({
      ...s,
      bet: 0,
      status: "active",
      cards: i === YOU ? ["As", "Kd"] : ["??", "??"],
    })),
  };
  const blinds = pipe(
    (v: TableView) => seat(v, THEO, { blind: "small" }),
    (v) => seat(v, INES, { blind: "big" }),
    (v) => bet(v, THEO, 25),
    did(THEO, "blind", 25),
    (v) => bet(v, INES, 50),
    did(INES, "blind", 50),
  );
  const dealt = turn(blinds(fresh), YOU);
  return {
    ...dealt,
    you: { ...dealt.you, hand: { rank: "high-card", cards: ["As", "Kd"] } },
  };
}

const pipe =
  (...fns: ((view: TableView) => TableView)[]) =>
  (view: TableView) =>
    fns.reduce((v, fn) => fn(v), view);

const SHOWDOWN = (v: TableView): TableView => ({
  ...v,
  phase: "showdown",
  seats: v.seats.map((s, i) =>
    i === MARA ? { ...s, cards: ["Qh", "Jh"] } : s,
  ),
  result: {
    winners: [
      {
        seat: MARA,
        amount: total(v.pots),
        hand: { rank: "pair", cards: ["Qh", "Qs", "Jh", "Td", "7h"] },
      },
    ],
  },
});

export const HAND_STEPS: Step[] = [
  { wait: 3.4 + SHUFFLE_SECONDS, apply: (v) => v },
  {
    wait: 1,
    apply: pipe(
      (v) => bet(v, YOU, 50),
      did(YOU, "call", 50),
      (v) => turn(v, MARA),
    ),
  },
  {
    wait: 1,
    apply: pipe(
      (v) => bet(v, MARA, 50),
      did(MARA, "call", 50),
      (v) => turn(v, THEO),
    ),
  },
  {
    wait: 1,
    apply: pipe(
      (v) => bet(v, THEO, 50),
      did(THEO, "call", 50),
      (v) => turn(v, INES),
    ),
  },
  { wait: 1, apply: pipe(did(INES, "check"), (v) => turn(v, null)) },
  { wait: 1.1, apply: collect },
  { wait: 1.4, apply: pipe(street("flop", 3), (v) => turn(v, THEO)) },
  {
    wait: 1,
    apply: pipe(did(THEO, "check"), did(INES, "check"), (v) => turn(v, YOU)),
  },
  {
    wait: 1,
    apply: pipe(
      (v) => bet(v, YOU, 100),
      did(YOU, "bet", 100),
      (v) => turn(v, MARA),
    ),
  },
  {
    wait: 1,
    apply: pipe(
      (v) => bet(v, MARA, 100),
      did(MARA, "call", 100),
      (v) => seat(v, THEO, { status: "folded" }),
      did(THEO, "fold"),
      (v) => seat(v, INES, { status: "folded" }),
      did(INES, "fold"),
      (v) => turn(v, null),
    ),
  },
  { wait: 1.1, apply: collect },
  { wait: 1.4, apply: pipe(street("turn", 4), (v) => turn(v, YOU)) },
  { wait: 1, apply: pipe(did(YOU, "check"), (v) => turn(v, MARA)) },
  { wait: 1, apply: pipe(did(MARA, "check"), (v) => turn(v, null)) },
  { wait: 1.4, apply: pipe(street("river", 5), (v) => turn(v, YOU)) },
  { wait: 1, apply: pipe(did(YOU, "check"), (v) => turn(v, MARA)) },
  { wait: 1.2, apply: pipe(did(MARA, "check"), (v) => turn(v, null)) },
  { wait: 1.8, apply: SHOWDOWN },
  {
    wait: 2.6,
    apply: (v) =>
      did(
        MARA,
        "win",
        total(v.pots),
      )(
        seat({ ...v, pots: [] }, MARA, {
          stack: v.seats[MARA].stack + total(v.pots),
        }),
      ),
  },
];

export function useHandScript() {
  const [state, setState] = useState({ hand: 0, step: 0, view: dealView() });

  useEffect(() => {
    const id = setTimeout(() => {
      setState((s) => {
        const next = s.step + 1;
        if (next < HAND_STEPS.length) {
          return {
            hand: s.hand,
            step: next,
            view: HAND_STEPS[next].apply(s.view),
          };
        }
        return { hand: s.hand + 1, step: 0, view: dealView() };
      });
    }, HAND_STEPS[state.step].wait * 1000);
    return () => clearTimeout(id);
  }, [state]);

  return state;
}
