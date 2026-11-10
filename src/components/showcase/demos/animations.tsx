"use client";

import { useEffect, useState } from "react";
import { Deck } from "@/components/cards/deck";
import { Hand } from "@/components/cards/hand";
import { ChipFlight } from "@/components/chips/chip-flight";
import { ChipStack } from "@/components/chips/chip-stack";
import { ScriptedTable } from "@/components/screens/scripted-table";
import { ActionBar } from "@/components/table/action-bar";
import { Pot } from "@/components/table/pot";
import { Seat } from "@/components/table/seat";
import { Timer } from "@/components/table/timer";
import { Button } from "@/components/ui/button";
import { pokerTable } from "@/dev/fixtures";

function Stage({
  title,
  hint,
  actions,
  wide = false,
  children,
}: {
  title: string;
  hint: string;
  actions: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-xl border border-border p-4 ${wide ? "md:col-span-2" : ""}`}
    >
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>
      <div className="felt-surface relative flex min-h-40 items-center justify-center rounded-lg p-4">
        {children}
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </section>
  );
}

const replayButton = (onClick: () => void, label = "Replay") => (
  <Button size="sm" variant="outline" onClick={onClick}>
    {label}
  </Button>
);

function ShuffleStage() {
  const [shuffling, setShuffling] = useState(false);
  useEffect(() => {
    if (!shuffling) return;
    const id = setTimeout(() => setShuffling(false), 1800);
    return () => clearTimeout(id);
  }, [shuffling]);
  return (
    <Stage
      title="Shuffle"
      hint="The deck riffles its top cards."
      actions={replayButton(() => setShuffling(true), "Shuffle")}
    >
      <Deck shuffling={shuffling} className="w-20" />
    </Stage>
  );
}

function DealStage() {
  const [run, setRun] = useState(0);
  return (
    <Stage
      wide
      title="A whole hand"
      hint="Hole cards leave the deck face down, one per player from the dealer's left; the board is dealt face down; bets go to the pot; flop, turn and river turn over after each betting round; showdown; the pot goes to the winner."
      actions={replayButton(() => setRun((n) => n + 1))}
    >
      <div className="w-full">
        <ScriptedTable key={run} />
      </div>
    </Stage>
  );
}

function RevealStage() {
  const [revealed, setRevealed] = useState(false);
  return (
    <Stage
      title="Reveal"
      hint="A face-down card turns over when its value arrives (showdown)."
      actions={replayButton(
        () => setRevealed((v) => !v),
        revealed ? "Hide" : "Reveal",
      )}
    >
      <Hand
        cards={revealed ? ["As", "Kd"] : ["??", "??"]}
        cardClassName="w-16"
      />
    </Stage>
  );
}

function ChipsStage() {
  const [run, setRun] = useState(0);
  return (
    <Stage
      title="Chips drop"
      hint="Each chip of a stack drops in, one after another."
      actions={replayButton(() => setRun((n) => n + 1))}
    >
      <div key={run} className="flex gap-8">
        <ChipStack amount={75} />
        <ChipStack amount={1775} />
        <ChipStack amount={12600} />
      </div>
    </Stage>
  );
}

function FlightStage({
  title,
  hint,
  amount,
  from,
  to,
}: {
  title: string;
  hint: string;
  amount: number;
  from: number;
  to: number;
}) {
  const [run, setRun] = useState<number | null>(null);
  return (
    <Stage
      title={title}
      hint={hint}
      actions={replayButton(() => setRun((n) => (n ?? 0) + 1), "Send")}
    >
      <div className="relative h-24 w-80 text-bone">
        <div className="absolute top-8 left-2 rounded border border-bone/40 px-2 py-1 text-xs">
          {from < to ? "Seat" : "Pot"}
        </div>
        <div className="absolute top-8 right-2 rounded border border-neon-cyan px-2 py-1 text-neon-cyan text-xs">
          {from < to ? "Pot" : "Winner"}
        </div>
        {run !== null && (
          <ChipFlight
            key={run}
            amount={amount}
            from={{ x: from, y: 28 }}
            to={{ x: to, y: 28 }}
          />
        )}
      </div>
    </Stage>
  );
}

function PotStage() {
  const [pot, setPot] = useState(300);
  return (
    <Stage
      title="Pot changes"
      hint="The pot value pops when it changes."
      actions={
        <>
          {replayButton(() => setPot((p) => p + 100), "+100")}
          {replayButton(() => setPot((p) => p + 500), "+500")}
          {replayButton(() => setPot(300), "Reset")}
        </>
      }
    >
      <Pot pots={[pot]} />
    </Stage>
  );
}

function TimerStage() {
  const [seconds, setSeconds] = useState(8);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);
  return (
    <Stage
      title="Timer urgency"
      hint="Under 5 seconds the timer blinks red."
      actions={replayButton(() => setSeconds(8))}
    >
      <Timer secondsLeft={seconds} />
    </Stage>
  );
}

function SeatStage() {
  const [turn, setTurn] = useState(true);
  const [folded, setFolded] = useState(false);
  const seat = {
    ...pokerTable(2).seats[0],
    isTurn: turn,
    status: folded ? ("folded" as const) : ("active" as const),
  };
  return (
    <Stage
      title="Turn and fold"
      hint="The seat glows on its turn and fades when folded."
      actions={
        <>
          {replayButton(() => setTurn((v) => !v), "Toggle turn")}
          {replayButton(() => setFolded((v) => !v), "Toggle fold")}
        </>
      }
    >
      <Seat seat={seat} isYou />
    </Stage>
  );
}

function RaiseStage() {
  const [run, setRun] = useState(0);
  return (
    <Stage
      wide
      title="Raise panel"
      hint="The panel slides in; chip and slider modes."
      actions={replayButton(() => setRun((n) => n + 1))}
    >
      <div key={run} className="flex w-full flex-wrap justify-center gap-4">
        {(["slider", "chips"] as const).map((mode) => (
          <ActionBar
            key={mode}
            actions={pokerTable(2).you.legalActions}
            pot={300}
            mode={mode}
            defaultOpen
            onAction={() => {}}
          />
        ))}
      </div>
    </Stage>
  );
}

export function AnimationsDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DealStage />
      <ShuffleStage />
      <RevealStage />
      <ChipsStage />
      <FlightStage
        title="Bet to pot"
        hint="A bet slides from the seat to the pot."
        amount={200}
        from={8}
        to={230}
      />
      <FlightStage
        title="Payout"
        hint="The pot slides to the winner."
        amount={1200}
        from={230}
        to={8}
      />
      <PotStage />
      <TimerStage />
      <SeatStage />
      <RaiseStage />
    </div>
  );
}
