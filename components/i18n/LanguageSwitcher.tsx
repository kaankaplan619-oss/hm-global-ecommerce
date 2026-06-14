"use client";

/**
 * LanguageSwitcher — Sélecteur de langue FR / EN / TR.
 * Met à jour le cookie + le contexte (re-rendu instantané, sans rechargement).
 */

import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { useLocale, useSetLocale } from "@/components/i18n/I18nProvider";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-[rgba(63,45,88,0.10)] bg-white/80 p-0.5 ${className}`}
      role="group"
      aria-label="Langue / Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2 py-1 text-[10px] font-bold transition ${
            locale === l
              ? "bg-[var(--hm-primary)] text-white"
              : "text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)]"
          }`}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
