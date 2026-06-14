/**
 * lib/i18n/config.ts — Configuration internationalisation (FR / EN / TR).
 *
 * Approche V1 : langue stockée dans un cookie (`hm_locale`), pas de préfixe
 * d'URL (/en, /tr) pour l'instant — ça viendra en V2 (migration des routes
 * sous app/[lang]/, plus lourde). Le défaut reste le français.
 */

export const LOCALES = ["fr", "en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "hm_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  tr: "TR",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  tr: "Türkçe",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
