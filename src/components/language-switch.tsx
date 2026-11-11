"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/useLanguageStore";

export function LanguageSwitch() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "pt-BR";
  }, [language]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "pt-br" : "en")}
    >
      {language === "en" ? "PT" : "EN"}
    </Button>
  );
}
