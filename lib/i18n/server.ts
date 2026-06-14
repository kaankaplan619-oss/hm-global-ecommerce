/**
 * lib/i18n/server.ts — Traduction côté SERVEUR (pages / composants serveur).
 *
 * Pour les fichiers qui DOIVENT rester serveur (ils exportent `metadata`,
 * `generateMetadata`, `generateStaticParams`, ou sont des `app/.../page.tsx`),
 * on ne peut pas utiliser le hook client `useT`. On lit la langue depuis le
 * cookie `hm_locale` et on renvoie une fonction `t(key)`.
 *
 *   const t = await getT();
 *   <h1>{t("impression.title")}</h1>
 *
 * Lire le cookie rend la page DYNAMIQUE (rendu par requête). Acceptable en V1 ;
 * la version statique par langue (/en, /tr) = V2 (routes app/[lang]/).
 */

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n/config";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";
import trMsgs from "@/messages/tr.json";

type Dict = Record<string, unknown>;
const MESSAGES: Record<Locale, Dict> = { fr, en, tr: trMsgs };

function lookup(messages: Dict, key: string): string {
  const flat = messages[key];
  if (typeof flat === "string") return flat;
  const value = key.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" ? (acc as Dict)[k] : undefined),
    messages
  );
  return typeof value === "string" ? value : key;
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale();
  return (key: string) => lookup(MESSAGES[locale], key);
}
