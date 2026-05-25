/**
 * lib/integrations/hermes.ts
 *
 * Intégration Hermès OS (cockpit interne HM Global) — transport webhook réel.
 *
 * Contrat de sécurité (inchangé vs stub d'origine) :
 *   - Aucune fonction ne throw : un échec Hermès ne doit JAMAIS faire échouer
 *     une opération applicative (paiement, BAT, mise à jour statut).
 *   - Si `HERMES_WEBHOOK_URL` n'est pas configurée, toutes les fonctions
 *     deviennent des no-op silencieux. La connexion réelle ne s'active donc
 *     qu'une fois la variable d'environnement renseignée (validation humaine).
 *
 * Transport :
 *   POST JSON vers HERMES_WEBHOOK_URL, timeout 5 s (AbortController).
 *   Signature HMAC-SHA256 optionnelle si HERMES_WEBHOOK_SECRET est défini
 *   (en-tête `X-Hermes-Signature: sha256=<hex>`).
 *
 * Note "sync bidirectionnelle" (updateOrderStatus) :
 *   Ce module ne gère que le sens SORTANT (HM Global → Hermès). Le sens
 *   ENTRANT (Hermès → HM Global) nécessitera une route API dédiée
 *   (`app/api/hermes/webhook/route.ts`) — hors périmètre de cette itération.
 */

import crypto from "crypto";
import type { OrderStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HermesEventType =
  | "order.created"
  | "order.paid"
  | "order.bat_required"
  | "order.express_internal"
  | "order.mockup_approval"
  | "order.status_changed";

export interface HermesEvent {
  type: HermesEventType;
  orderId: string;
  /** Horodatage ISO d'émission (rempli automatiquement). */
  sentAt: string;
  /** Données additionnelles JSON-sérialisables. Pas de secret, pas de PII inutile. */
  data?: Record<string, string | number | boolean | null>;
}

export interface HermesDeliveryResult {
  /** true si l'événement a été accepté par Hermès (HTTP 2xx). */
  delivered: boolean;
  /** true si Hermès n'est pas configuré (no-op) — distinct d'un échec réseau. */
  skipped: boolean;
  status?: number;
  error?: string;
}

// ─── Configuration ──────────────────────────────────────────────────────────

const TIMEOUT_MS = 5_000;
const DEBUG = process.env.HERMES_DEBUG === "1";

/** Retourne l'URL Hermès configurée, ou null si l'intégration est désactivée. */
function getWebhookUrl(): string | null {
  const url = process.env.HERMES_WEBHOOK_URL?.trim();
  return url && url.length > 0 ? url : null;
}

// ─── Transport bas niveau ─────────────────────────────────────────────────────

/**
 * Poste un événement vers Hermès OS.
 *
 * Ne throw jamais : capture toutes les erreurs (réseau, timeout, HTTP non-2xx)
 * et les retourne dans le résultat. Si Hermès n'est pas configuré, retourne
 * immédiatement `{ delivered: false, skipped: true }`.
 *
 * @param event Événement à transmettre (sans le champ `sentAt`, ajouté ici).
 * @returns Résultat de livraison (jamais d'exception).
 */
async function postToHermes(event: Omit<HermesEvent, "sentAt">): Promise<HermesDeliveryResult> {
  const url = getWebhookUrl();

  const payload: HermesEvent = { ...event, sentAt: new Date().toISOString() };

  if (DEBUG) {
    console.log("[Hermes]", url ? "→ POST" : "(no-op, URL absente)", payload);
  }

  if (!url) {
    return { delivered: false, skipped: true };
  }

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Signature HMAC optionnelle pour authentifier l'émetteur côté Hermès.
  const secret = process.env.HERMES_WEBHOOK_SECRET?.trim();
  if (secret) {
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    headers["X-Hermes-Signature"] = `sha256=${sig}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { method: "POST", headers, body, signal: controller.signal });
    if (!res.ok) {
      return { delivered: false, skipped: false, status: res.status, error: `HTTP ${res.status}` };
    }
    return { delivered: true, skipped: false, status: res.status };
  } catch (err) {
    // Réseau, timeout (abort), DNS… — non bloquant.
    const message = err instanceof Error ? err.message : "unknown error";
    if (DEBUG) console.error("[Hermes] delivery failed:", message);
    return { delivered: false, skipped: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

// ─── API publique ──────────────────────────────────────────────────────────────

/**
 * Notifie Hermès OS qu'une nouvelle commande vient d'être créée / payée.
 * À appeler depuis le webhook Stripe (`payment_intent.succeeded`) ou à la
 * création de commande.
 *
 * @param orderId Identifiant interne de la commande.
 * @returns Résultat de livraison (jamais d'exception).
 */
export async function notifyNewOrder(orderId: string): Promise<HermesDeliveryResult> {
  return postToHermes({ type: "order.created", orderId });
}

/**
 * Envoie à Hermès OS le mockup d'une commande pour validation client (flux BAT).
 * Hermès se charge ensuite de relayer le visuel au client (email / WhatsApp).
 *
 * @param orderId   Identifiant interne de la commande.
 * @param mockupUrl URL publique du mockup à faire valider.
 * @returns Résultat de livraison (jamais d'exception).
 */
export async function sendMockupForApproval(
  orderId: string,
  mockupUrl: string,
): Promise<HermesDeliveryResult> {
  return postToHermes({
    type: "order.mockup_approval",
    orderId,
    data: { mockupUrl },
  });
}

/**
 * Notifie Hermès OS d'un changement de statut de commande (sens sortant).
 *
 * Remarque : la vraie synchronisation bidirectionnelle (Hermès → site)
 * nécessitera une route API entrante dédiée — non incluse ici.
 *
 * @param orderId Identifiant interne de la commande.
 * @param status  Nouveau statut workflow.
 * @returns Résultat de livraison (jamais d'exception).
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<HermesDeliveryResult> {
  return postToHermes({
    type: "order.status_changed",
    orderId,
    data: { status },
  });
}

// ─── Helpers événementiels (compat. workflow commande) ────────────────────────
// Wrappers fins au-dessus du transport réel, alignés sur les transitions métier.

/** Commande payée — notifie Hermès. */
export async function notifyHermesOrderPaid(orderId: string): Promise<HermesDeliveryResult> {
  return postToHermes({ type: "order.paid", orderId });
}

/** BAT requis pour cette commande — notifie Hermès. */
export async function notifyHermesBatRequired(orderId: string): Promise<HermesDeliveryResult> {
  return postToHermes({ type: "order.bat_required", orderId });
}

/** Commande Express interne HM — notifie Hermès. */
export async function notifyHermesExpressOrder(orderId: string): Promise<HermesDeliveryResult> {
  return postToHermes({ type: "order.express_internal", orderId });
}
