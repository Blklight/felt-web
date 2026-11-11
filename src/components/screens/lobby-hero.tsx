"use client";

import { PlayingCard } from "@/components/cards/playing-card";
import { buttonVariants } from "@/components/ui/button";
import { useT } from "@/i18n/use-t";
import { cn } from "@/lib/utils";

export function LobbyHero() {
  const t = useT();
  return (
    <section className="flex flex-col items-center gap-3 py-6 text-center md:col-span-2">
      <div className="flex -rotate-3 items-end">
        <PlayingCard code="As" className="-rotate-12 translate-y-1" />
        <PlayingCard code="Kd" className="-mx-2 z-10" />
        <PlayingCard code="??" className="translate-y-1 rotate-12" />
      </div>
      <h1 className="font-pixel text-4xl tracking-wide">felt</h1>
      <p className="text-muted-foreground">{t("lobby.tagline")}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <a
          href="#create"
          className={cn(
            buttonVariants(),
            "bg-neon-violet text-white shadow-[0_0_14px_color-mix(in_oklab,var(--color-neon-violet)_55%,transparent)] hover:bg-neon-violet/90",
          )}
        >
          {t("lobby.heroCreate")}
        </a>
        <a href="#join" className={buttonVariants({ variant: "outline" })}>
          {t("lobby.join")}
        </a>
      </div>
    </section>
  );
}
