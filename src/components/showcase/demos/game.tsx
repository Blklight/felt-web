"use client";

import { useState } from "react";
import { Hand } from "@/components/cards/hand";
import { PlayingCard } from "@/components/cards/playing-card";
import { Chip } from "@/components/chips/chip";
import { ChipStack } from "@/components/chips/chip-stack";
import type { ShowcaseCategory } from "@/components/showcase/types";
import { ActionBar } from "@/components/table/action-bar";
import { Seat } from "@/components/table/seat";
import { Table } from "@/components/table/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { blackjackTable, pokerTable } from "@/dev/fixtures";
import type { CardCode } from "@/dev/view-types";

const SUITS = ["s", "h", "d", "c"] as const;
const RANKS = [
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
] as const;
const ALL_CARDS: CardCode[] = SUITS.flatMap((s) =>
  RANKS.map((r) => `${r}${s}` as CardCode),
);

function PlayingCardDemo() {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl p-4 felt-surface">
      {ALL_CARDS.map((code) => (
        <PlayingCard key={code} code={code} />
      ))}
      <PlayingCard code="??" />
    </div>
  );
}

function ChipsDemo() {
  return (
    <div className="flex flex-col gap-4 rounded-xl p-4 felt-surface">
      <div className="flex gap-2">
        {[1, 5, 25, 100, 500, 1000].map((v) => (
          <Chip key={v} value={v} />
        ))}
      </div>
      <ChipStack amount={1775} />
    </div>
  );
}

function SeatDemo() {
  const [me, other] = pokerTable(2).seats;
  return (
    <div className="flex flex-wrap gap-4 rounded-xl p-4 felt-surface">
      <Seat seat={me} isYou />
      <Seat seat={{ ...other, isTurn: false }} />
      <Seat seat={{ ...other, status: "folded", isTurn: false }} />
      <Seat
        seat={{ ...other, status: "empty", name: "", cards: [], isTurn: false }}
      />
    </div>
  );
}

function TablePokerDemo() {
  const [count, setCount] = useState<2 | 3 | 4 | 5 | 6>(6);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {([2, 3, 4, 5, 6] as const).map((n) => (
          <Button
            key={n}
            size="sm"
            variant={n === count ? "default" : "outline"}
            onClick={() => setCount(n)}
          >
            {n}
          </Button>
        ))}
      </div>
      <Table view={pokerTable(count)} />
    </div>
  );
}

function TableBlackjackDemo() {
  return <Table view={blackjackTable} />;
}

function ActionBarDemo() {
  const [last, setLast] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <ActionBar
        actions={pokerTable(2).you.legalActions}
        onAction={(a) => setLast(JSON.stringify(a))}
      />
      <code className="text-muted-foreground text-xs">{last}</code>
    </div>
  );
}

function FourColorToggleDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 felt-surface">
      <div className="flex items-center gap-2 text-bone text-sm">
        <Switch id="four-color" checked={on} onCheckedChange={setOn} />
        <Label htmlFor="four-color">Four-color deck</Label>
      </div>
      <Hand cards={["As", "Kh", "Qd", "Jc"]} fourColor={on} />
    </div>
  );
}

export const gameCategory: ShowcaseCategory = {
  id: "game",
  title: "Game",
  items: [
    { slug: "playing-card", name: "Playing card", demo: PlayingCardDemo },
    { slug: "chips", name: "Chips", demo: ChipsDemo },
    { slug: "seat", name: "Seat", demo: SeatDemo },
    { slug: "table-poker", name: "Table (poker)", demo: TablePokerDemo },
    {
      slug: "table-blackjack",
      name: "Table (blackjack)",
      demo: TableBlackjackDemo,
    },
    { slug: "action-bar", name: "Action bar", demo: ActionBarDemo },
    {
      slug: "four-color-toggle",
      name: "Four-color deck",
      demo: FourColorToggleDemo,
    },
  ],
};
