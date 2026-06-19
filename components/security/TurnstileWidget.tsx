"use client";

import { useEffect, useRef } from "react";

/**
 * TurnstileWidget — widget anti-bot Cloudflare Turnstile.
 *
 * DORMANT par conception : si NEXT_PUBLIC_TURNSTILE_SITE_KEY n'est pas
 * configurée, le composant ne rend RIEN (return null) et les formulaires
 * fonctionnent normalement. Dès que la clé est posée, le widget s'affiche et
 * remonte le token via onToken() (null si expiré / erreur).
 *
 * Ne touche pas au design global : un simple bloc inséré dans le formulaire.
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const isTurnstileEnabled = () => TURNSTILE_SITE_KEY.length > 0;

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile script failed to load"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export default function TurnstileWidget({
  onToken,
  className,
}: {
  onToken: (token: string | null) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!isTurnstileEnabled() || !ref.current) return;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      })
      .catch(() => onToken(null));

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget déjà retiré */
        }
        widgetId.current = null;
      }
    };
    // onToken = setter stable du parent → pas besoin de le mettre en dépendance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isTurnstileEnabled()) return null;
  return <div ref={ref} className={className} />;
}
