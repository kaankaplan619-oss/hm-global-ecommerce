"use client";

/**
 * I18nProvider — Contexte de traduction client (FR / EN / TR).
 *
 * - `initialLocale` est lu CÔTÉ SERVEUR (cookie `hm_locale`) par le layout et
 *   passé en prop → le SSR et l'hydratation démarrent dans la MÊME langue :
 *   aucun décalage d'hydratation, aucun flash FR pour un visiteur EN/TR.
 * - Un useEffect de secours resynchronise si le cookie a changé entre le rendu
 *   serveur et le montage (cas rare).
 * - `t("nav.textile")` cherche la clé en notation pointée dans le dictionnaire.
 *
 * Les 3 dictionnaires sont embarqués côté client (légers en V1). Quand le
 * volume grandira, on migrera vers des dictionnaires serveur + routes
 * app/[lang]/ (meilleure perf + URLs /en /tr pour le SEO).
 */

import { createContext, useContext, useEffect, useState } from "react";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";
import trMsgs from "@/messages/tr.json";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/config";

type Dict = Record<string, unknown>;
const MESSAGES: Record<Locale, Dict> = { fr, en, tr: trMsgs };

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<Ctx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (k) => k,
});

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  const v = m?.[1];
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

function lookup(messages: Dict, key: string): string {
  // Clé PLATE prioritaire ("home.clients.heading") — merge trivial des sections.
  const flat = messages[key];
  if (typeof flat === "string") return flat;
  // Sinon, traversée IMBRIQUÉE ("nav.textile" → messages.nav.textile).
  const value = key.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as Dict)[k] : undefined),
    messages
  );
  return typeof value === "string" ? value : key;
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    // Filet de sécurité : si le cookie a changé entre le rendu serveur et le
    // montage (rare), on resynchronise. En régime normal cookie === initialLocale.
    const c = readCookieLocale();
    if (c !== locale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(c);
      try { document.documentElement.lang = c; } catch { /* noop */ }
    }
    // Montage uniquement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = (l: Locale) => {
    try {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
    } catch { /* noop */ }
    setLocaleState(l);
  };

  const t = (key: string) => lookup(MESSAGES[locale], key);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext).t;
}
export function useLocale() {
  return useContext(I18nContext).locale;
}
export function useSetLocale() {
  return useContext(I18nContext).setLocale;
}
