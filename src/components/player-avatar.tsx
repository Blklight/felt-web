"use client";

import { SUIT_PATHS } from "@/components/cards/suits";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

type Look = {
  bg: string;
  ring: string;
  ink: string;
  mark: "s" | "h" | "d" | "c" | "f" | "crown" | "chip" | "sun";
};

const LOOKS: Record<string, Look> = {
  a1: { bg: "#17493a", ring: "#faf6ea", ink: "#faf6ea", mark: "s" },
  a2: { bg: "#2a1d6e", ring: "#7cf4ff", ink: "#7cf4ff", mark: "h" },
  a3: { bg: "#14110f", ring: "#b3261e", ink: "#ff5a4f", mark: "d" },
  a4: { bg: "#faf6ea", ring: "#14110f", ink: "#14110f", mark: "c" },
  a5: { bg: "#7cf4ff", ring: "#14110f", ink: "#14110f", mark: "f" },
  a6: { bg: "#b3261e", ring: "#faf6ea", ink: "#faf6ea", mark: "crown" },
  a7: { bg: "#ff8a2b", ring: "#2a1d6e", ink: "#2a1d6e", mark: "chip" },
  a8: { bg: "#3b1a78", ring: "#ff2e7e", ink: "#ffd166", mark: "sun" },
};

export const AVATAR_IDS = Object.keys(LOOKS);

function Mark({ look }: { look: Look }) {
  const { mark, ink, bg } = look;
  if (mark === "s" || mark === "h" || mark === "d" || mark === "c") {
    return (
      <svg
        x="10"
        y="10"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={ink}
        aria-hidden="true"
      >
        <path d={SUIT_PATHS[mark]} />
      </svg>
    );
  }
  if (mark === "f") {
    return (
      <text
        x="20"
        y="28"
        textAnchor="middle"
        fontFamily="var(--font-bungee-shade), sans-serif"
        fontSize="22"
        fill={ink}
      >
        f
      </text>
    );
  }
  if (mark === "crown") {
    return (
      <path
        d="M10 26 L12 15 L16.5 20 L20 12 L23.5 20 L28 15 L30 26 Z"
        fill={ink}
      />
    );
  }
  if (mark === "chip") {
    return (
      <>
        <circle
          cx="20"
          cy="20"
          r="9"
          fill="none"
          stroke={ink}
          strokeWidth="4"
          strokeDasharray="3.5 3.5"
        />
        <circle cx="20" cy="20" r="5" fill={ink} />
      </>
    );
  }
  return (
    <>
      <circle cx="20" cy="21" r="9" fill={ink} />
      <rect x="9" y="22" width="22" height="1.6" fill={bg} />
      <rect x="9" y="25.5" width="22" height="2.2" fill={bg} />
    </>
  );
}

export function PlayerAvatar({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const t = useT();
  const look = LOOKS[id] ?? LOOKS.a1;
  const n = Math.max(AVATAR_IDS.indexOf(id), 0) + 1;
  return (
    <svg
      role="img"
      aria-label={t("avatar.label", { n })}
      viewBox="0 0 40 40"
      className={cn("size-10 shrink-0", className)}
    >
      <circle
        cx="20"
        cy="20"
        r="19"
        fill={look.bg}
        stroke={look.ring}
        strokeWidth="2"
      />
      <Mark look={look} />
    </svg>
  );
}
