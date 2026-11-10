import { dictionaries, type MessageKey } from "@/i18n/dictionaries";
import { useLanguageStore } from "@/store/useLanguageStore";

type Vars = Record<string, string | number>;

export function useT() {
  const language = useLanguageStore((s) => s.language);
  return (key: MessageKey, vars?: Vars) =>
    dictionaries[language][key].replace(/\{(\w+)\}/g, (match, name: string) =>
      name in (vars ?? {}) ? String(vars?.[name]) : match,
    );
}
