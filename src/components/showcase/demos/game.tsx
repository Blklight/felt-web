"use client";

import { useState } from "react";
import { CardBack } from "@/components/cards/card-back";
import { Hand } from "@/components/cards/hand";
import { PlayingCard } from "@/components/cards/playing-card";
import { CARD_SKINS, type CardSkin } from "@/components/cards/skins";
import { Chip } from "@/components/chips/chip";
import { ChipStack } from "@/components/chips/chip-stack";
import type { ShowcaseCategory } from "@/components/showcase/types";
import { ActionBar } from "@/components/table/action-bar";
import { Seat } from "@/components/table/seat";
import { Table } from "@/components/table/table";
import { Button } from "@/components/ui/button";
import { blackjackTable, pokerTable } from "@/dev/fixtures";
import type { CardCode } from "@/dev/view-types";
import { useCardSkinStore } from "@/store/useCardSkinStore";

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
    <div className="grid max-w-3xl grid-cols-7 gap-3 rounded-xl p-4 felt-surface">
      {ALL_CARDS.map((code) => (
        <PlayingCard key={code} code={code} className="w-full" />
      ))}
    </div>
  );
}

function CardBackDemo() {
  return (
    <div className="flex gap-3 rounded-xl p-4 felt-surface">
      <CardBack variant="ink" />
      <CardBack variant="neon" />
    </div>
  );
}

function ChipsDemo() {
  return (
    <div className="flex flex-col gap-5 rounded-xl p-4 felt-surface">
      <div className="flex gap-3">
        {[1, 5, 25, 100, 500, 1000].map((v) => (
          <Chip key={v} value={v} className="size-14" />
        ))}
      </div>
      <div className="flex gap-6">
        <ChipStack amount={75} />
        <ChipStack amount={1775} />
        <ChipStack amount={12600} />
      </div>
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
        pot={300}
        onAction={(a) => setLast(JSON.stringify(a))}
      />
      <code className="text-muted-foreground text-xs">{last}</code>
    </div>
  );
}

const SKIN_NAMES: Record<CardSkin, string> = {
  classic: "Classic",
  "four-color": "Four-color",
  fantasy: "Fantasy",
  noir: "Noir",
};

function CardSkinsDemo() {
  const active = useCardSkinStore((state) => state.skin);
  const setSkin = useCardSkinStore((state) => state.setSkin);
  return (
    <div className="flex flex-col gap-4 rounded-xl p-4 felt-surface">
      {CARD_SKINS.map((skin) => (
        <div key={skin} className="flex flex-wrap items-center gap-4">
          <Button
            size="sm"
            variant={skin === active ? "default" : "outline"}
            className="w-28"
            aria-pressed={skin === active}
            onClick={() => setSkin(skin)}
          >
            {SKIN_NAMES[skin]}
          </Button>
          <Hand
            cards={["As", "Kh", "Qd", "Jc"]}
            skin={skin}
            className="space-x-2"
            cardClassName="w-14"
          />
        </div>
      ))}
    </div>
  );
}

export const gameCategory: ShowcaseCategory = {
  id: "game",
  title: "Game",
  items: [
    { slug: "playing-card", name: "Playing card", demo: PlayingCardDemo },
    { slug: "card-back", name: "Card back", demo: CardBackDemo },
    { slug: "chips", name: "Chips", demo: ChipsDemo },
    { slug: "seat", name: "Seat", demo: SeatDemo },
    { slug: "table-poker", name: "Table (poker)", demo: TablePokerDemo },
    {
      slug: "table-blackjack",
      name: "Table (blackjack)",
      demo: TableBlackjackDemo,
    },
    { slug: "action-bar", name: "Action bar", demo: ActionBarDemo },
    { slug: "card-skins", name: "Card skins", demo: CardSkinsDemo },
  ],
};
