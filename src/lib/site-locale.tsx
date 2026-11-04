"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type SiteLocale = "pt" | "en" | "es";

const LocaleContext = createContext<{
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
}>({ locale: "pt", setLocale: () => {} });

export function SiteLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SiteLocale>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("luxence_site_locale");
    if (saved === "pt" || saved === "en" || saved === "es") setLocaleState(saved);
  }, []);

  const setLocale = (next: SiteLocale) => {
    localStorage.setItem("luxence_site_locale", next);
    setLocaleState(next);
  };

  useEffect(() => {
    document.documentElement.lang = { pt: "pt-BR", en: "en", es: "es" }[locale];
  }, [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export const useSiteLocale = () => useContext(LocaleContext);
