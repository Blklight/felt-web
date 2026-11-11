"use client";

import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

export function CardBack({ className }: { className?: string }) {
  const t = useT();
  return (
    <svg
      role="img"
      aria-label={t("card.hidden")}
      viewBox="0 0 64 90"
      className={cn("neon-glow aspect-[64/90] w-14 rounded-md", className)}
    >
      <defs>
        <pattern
          id="felt-back"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="8" height="8" fill="#0d0b1c" />
          <rect width="4" height="8" fill="#181435" />
        </pattern>
      </defs>
      <rect width="64" height="90" rx="6" fill="url(#felt-back)" />
      <rect
        x="5"
        y="5"
        width="54"
        height="80"
        rx="4"
        fill="none"
        stroke="var(--color-neon-violet)"
        strokeWidth="1.500"
      />
      <path
        d="M32 30 44 45 32 60 20 45Z"
        fill="none"
        stroke="var(--color-neon-cyan)"
        strokeWidth="1.500"
      />
    </svg>
  );
}
