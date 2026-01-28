"use client";

import React from "react";

import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

// Import locale JSON files
import mnLocale from "../../locales/mn.json";
import koLocale from "../../locales/ko.json";
import enLocale from "../../locales/en.json";

export type Locale = "mn" | "ko" | "en";

type Dictionaries = Record<Locale, Record<string, string>>;

const dictionaries: Dictionaries = {
  mn: mnLocale,
  ko: koLocale,
  en: enLocale,
};

type I18nContextValue = {
  // Preferred names (per spec)
  lang: Locale;
  setLang: (next: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;

  // Backwards-compatible aliases (do not remove without updating all callsites)
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Locale>(() =>
    readLocalStorage<Locale>("lang", "mn"),
  );

  const setLang = React.useCallback((next: Locale) => {
    setLangState(next);
    writeLocalStorage("lang", next);
  }, []);

  const t = React.useCallback((key: string, vars?: Record<string, string | number>) => {
    const template = dictionaries[lang]?.[key] ?? dictionaries.mn?.[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_m, name: string) => String(vars[name] ?? `{${name}}`));
  }, [lang]);

  const value = React.useMemo(
    () => ({
      lang,
      setLang,
      t,
      locale: lang,
      setLocale: setLang,
    }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
