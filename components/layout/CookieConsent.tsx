"use client";

/**
 * CookieConsent.tsx — Bandeau de consentement cookies (RGPD / CNIL).
 *
 * Conformité :
 *   - Choix « Tout accepter » et « Refuser » d'égale importance (pas de
 *     case pré-cochée, refus aussi simple que l'acceptation — exigence CNIL).
 *   - Par défaut, aucun cookie non essentiel n'est déposé tant que l'utilisateur
 *     n'a pas accepté (privacy-first).
 *   - Le choix est mémorisé (localStorage) ; le bandeau ne réapparaît pas.
 *   - Lien vers la politique de confidentialité.
 *
 * NB : le site n'utilise aujourd'hui que des cookies essentiels (panier, session,
 * paiement Stripe). Ce bandeau prépare l'ajout futur de mesure d'audience /
 * marketing : tant que `analytics`/`marketing` ne sont pas acceptés, ne charger
 * aucun script tiers correspondant (voir hasConsent()).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "hm_cookie_consent_v1";

export type CookieConsentValue = {
  essential: true;       // toujours actifs (fonctionnement du site)
  analytics: boolean;    // mesure d'audience
  marketing: boolean;    // publicité / reciblage
  date: string;          // ISO
};

/** Utilitaire : un module tiers peut vérifier le consentement avant de se charger. */
export function getStoredConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookieConsentValue) : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // N'affiche le bandeau que si aucun choix n'a encore été fait. Lecture
    // localStorage uniquement côté client (après montage) pour éviter tout
    // décalage d'hydratation SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getStoredConsent()) setOpen(true);
  }, []);

  const save = (a: boolean, m: boolean) => {
    const value: CookieConsentValue = {
      essential: true,
      analytics: a,
      marketing: m,
      date: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch { /* localStorage indisponible — on ferme quand même */ }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--hm-line)] bg-white p-4 shadow-[0_8px_40px_rgba(45,35,64,0.18)] sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]">
            <Cookie size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[var(--hm-text)]">Votre vie privée</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--hm-text-soft)]">
              Nous utilisons des cookies essentiels au fonctionnement du site (panier, session,
              paiement sécurisé). Avec votre accord, nous pouvons aussi mesurer l&apos;audience pour
              améliorer le site. Vous pouvez accepter, refuser ou personnaliser.{" "}
              <Link href="/confidentialite" className="font-semibold text-[var(--hm-primary)] hover:underline">
                En savoir plus
              </Link>
            </p>

            {details && (
              <div className="mt-3 flex flex-col gap-2 rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-3">
                <label className="flex cursor-not-allowed items-center justify-between text-[12px] text-[var(--hm-text)]">
                  <span><strong>Essentiels</strong> — toujours actifs (panier, paiement)</span>
                  <input type="checkbox" checked readOnly disabled className="h-4 w-4 accent-[var(--hm-primary)]" />
                </label>
                <label className="flex cursor-pointer items-center justify-between text-[12px] text-[var(--hm-text)]">
                  <span><strong>Mesure d&apos;audience</strong> — statistiques anonymes de visite</span>
                  <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="h-4 w-4 accent-[var(--hm-primary)]" />
                </label>
                <label className="flex cursor-pointer items-center justify-between text-[12px] text-[var(--hm-text)]">
                  <span><strong>Marketing</strong> — publicité personnalisée</span>
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="h-4 w-4 accent-[var(--hm-primary)]" />
                </label>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => save(true, true)}
                className="btn-primary px-4 py-2 text-[13px]"
              >
                Tout accepter
              </button>
              <button
                type="button"
                onClick={() => save(false, false)}
                className="rounded-xl border border-[var(--hm-line)] px-4 py-2 text-[13px] font-semibold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]"
              >
                Tout refuser
              </button>
              {details ? (
                <button
                  type="button"
                  onClick={() => save(analytics, marketing)}
                  className="rounded-xl border border-[var(--hm-line)] px-4 py-2 text-[13px] font-semibold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]"
                >
                  Enregistrer mes choix
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setDetails(true)}
                  className="text-[12px] font-semibold text-[var(--hm-primary)] hover:underline"
                >
                  Personnaliser
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => save(false, false)}
            aria-label="Refuser et fermer"
            className="shrink-0 rounded-full p-1 text-[var(--hm-text-muted)] hover:bg-[var(--hm-surface)]"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
