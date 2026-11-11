import { useLanguageStore } from "@/store/useLanguageStore";

const LOCALES = { en: "en-US", "pt-br": "pt-BR" } as const;

export function useFormatNumber() {
  const language = useLanguageStore((s) => s.language);
  return (value: number) =>
    new Intl.NumberFormat(LOCALES[language]).format(value);
}
