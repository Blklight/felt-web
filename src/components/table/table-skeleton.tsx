"use client";

import { useT } from "@/i18n/use-t";

export function TableSkeleton() {
  const t = useT();
  return (
    <output
      aria-busy="true"
      aria-label={t("conn.loading")}
      className="mx-auto block w-full max-w-3xl px-10 py-14 sm:px-8 sm:py-12"
    >
      <div className="relative mx-auto aspect-[4/5] w-full animate-pulse rounded-[44px] bg-card-ink/60 sm:aspect-[16/10]">
        <div className="absolute inset-3 rounded-[34px] bg-felt/40" />
      </div>
    </output>
  );
}
