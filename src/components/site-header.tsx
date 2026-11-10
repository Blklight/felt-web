"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useT } from "@/i18n/use-t";

export function SiteHeader() {
  const t = useT();
  return (
    <header className="flex items-center justify-between gap-4 border-border border-b px-4 py-2">
      <Link href="/" className="font-pixel text-lg tracking-tight">
        felt
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/">{t("nav.lobby")}</Link>
        <Link href="/profile">{t("nav.profile")}</Link>
        <Link href="/about">{t("nav.about")}</Link>
        <LanguageSwitch />
        <AnimatedThemeToggler className="size-8 border border-border px-0 [&_svg]:size-4">
          <SunIcon className="dark:hidden" />
          <MoonIcon className="hidden dark:block" />
        </AnimatedThemeToggler>
      </nav>
    </header>
  );
}
