"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useT } from "@/i18n/use-t";

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="felt-surface flex min-h-screen flex-col text-bone">
      <header className="flex items-center justify-between gap-4 border-bone/10 border-b bg-black/30 px-4 py-2">
        <Link href="/" className="font-pixel text-lg tracking-tight">
          felt
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/">{t("nav.lobby")}</Link>
          <Link href="/profile">{t("nav.profile")}</Link>
          <Link href="/about">{t("nav.about")}</Link>
          <LanguageSwitch />
          <AnimatedThemeToggler className="size-8 border border-bone/30 px-0 text-bone hover:bg-bone/20 hover:text-bone dark:text-bone dark:hover:bg-bone/20 dark:hover:text-bone [&_svg]:size-4">
            <SunIcon className="dark:hidden" />
            <MoonIcon className="hidden dark:block" />
          </AnimatedThemeToggler>
        </nav>
      </header>
      <main className="flex grow flex-col p-4">{children}</main>
    </div>
  );
}
