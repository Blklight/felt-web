"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/use-t";

type Props = {
  secondsLeft: number | null;
  secondsTotal?: number;
  // Each server message restarts the countdown, even when secondsLeft repeats.
  resetKey?: unknown;
};

export function Timer({ secondsLeft, secondsTotal, resetKey }: Props) {
  const t = useT();
  const [left, setLeft] = useState(secondsLeft);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetKey restarts the countdown
  useEffect(() => {
    setLeft(secondsLeft);
    if (secondsLeft === null) return;
    const end = Date.now() + secondsLeft * 1000;
    const id = setInterval(
      () => setLeft(Math.max(0, Math.ceil((end - Date.now()) / 1000))),
      250,
    );
    return () => clearInterval(id);
  }, [secondsLeft, resetKey]);

  if (secondsLeft === null || left === null) return null;
  const total = Math.max(secondsTotal ?? secondsLeft, left, 1);
  return (
    <span
      role="timer"
      data-urgent={left <= 5 ? "true" : undefined}
      className="timer relative inline-flex size-10 items-center justify-center rounded-full bg-card-ink/80 font-bold text-neon-cyan text-sm tabular-nums"
    >
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          strokeWidth="2.5"
          className="stroke-bone/15"
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 * (1 - left / total)}
          className="stroke-current transition-[stroke-dashoffset] duration-1000 ease-linear motion-reduce:transition-none"
        />
      </svg>
      <span
        key={left}
        aria-hidden="true"
        className="animate-in fade-in zoom-in-75 duration-300 motion-reduce:animate-none"
      >
        {left}
      </span>
      <span className="sr-only">{t("timer.seconds", { seconds: left })}</span>
    </span>
  );
}
