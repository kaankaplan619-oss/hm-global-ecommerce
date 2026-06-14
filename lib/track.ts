/**
 * lib/track.ts — Helper de mesure FIRST-PARTY (client-only, RGPD).
 *
 * Aucune dépendance React → importable depuis n'importe quel composant, store
 * ou page client. N'envoie RIEN tant que le consentement « analytics » n'est
 * pas donné. Identifiant de session = UUID anonyme (aucun PII).
 *
 *   import { track } from "@/lib/track";
 *   track("add_to_cart", { productId });
 */

const CONSENT_KEY = "hm_cookie_consent_v1";
const SID_KEY     = "hm_analytics_id";

function consented(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    return (JSON.parse(raw) as { analytics?: boolean })?.analytics === true;
  } catch {
    return false;
  }
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

export function track(type: string, meta?: Record<string, unknown>) {
  if (typeof window === "undefined" || !consented()) return;
  try {
    const body = JSON.stringify({
      type,
      path:      window.location.pathname,
      referrer:  document.referrer || undefined,
      sessionId: getSessionId(),
      meta,
    });
    fetch("/api/track", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* silencieux — la mesure ne casse jamais l'UX */
  }
}
