"use client";

import { useT } from "@/i18n/use-t";

export function AboutScreen() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <h1 className="font-semibold text-2xl">{t("about.title")}</h1>
      <h2 className="font-medium">{t("about.how")}</h2>
      <p>{t("about.howText")}</p>
      <p className="border border-border p-3 text-sm">
        {t("about.noRealMoney")}
      </p>
    </div>
  );
}
