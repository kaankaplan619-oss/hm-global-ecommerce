/**
 * lib/integrations/hermes.ts
 *
 * Stub d'intégration Hermès OS (cockpit interne HM Global).
 *
 * État : NO-OP volontaire. Aucune connexion réseau, aucune dépendance externe.
 * Objectif : disposer d'un point d'entrée typé et stable pour notifier Hermès OS
 *            depuis le code applicatif (webhook Stripe, admin-update, etc.) sans
 *            risquer de casser le site tant que la connexion réelle n'est pas
 *            validée par Kaan.
 *
 * Activation future :
 *   - Une fois la cible Hermès OS définie (URL, auth, format), remplacer le corps
 *     des fonctions ci-dessous par un POST signé (timing-safe).
 *   - Conserver les signatures et le contrat no-op (jamais throw, jamais bloquant).
 *
 * Règle d'or : un échec Hermès ne doit JAMAIS faire échouer une opération
 * applicative (paiement, BAT, mise à jour statut).
 */

export type HermesEventType =
  | "order.paid"
  | "order.bat_required"
  | "order.express_internal";

export interface HermesEventPayload {
  type: HermesEventType;
  orderId: string;
  /** Métadonnées libres — JSON-sérialisable. Pas de secret, pas de PII inutile. */
  meta?: Record<string, string | number | boolean | null>;
}

/**
 * Notifie Hermès OS qu'une commande vient d'être payée.
 * À appeler depuis le webhook Stripe (`payment_intent.succeeded`).
 */
export async function notifyHermesOrderPaid(orderId: string): Promise<void> {
  return enqueue({ type: "order.paid", orderId });
}

/**
 * Notifie Hermès OS qu'un BAT doit être préparé pour cette commande.
 * À appeler après transition vers `bat_a_preparer` ou détection d'une commande
 * dont la quantité totale ≥ 20 ou contenant de la broderie.
 */
export async function notifyHermesBatRequired(orderId: string): Promise<void> {
  return enqueue({ type: "order.bat_required", orderId });
}

/**
 * Notifie Hermès OS qu'une commande est marquée "Express interne HM" et doit
 * être prise en charge en interne (DTF/flex, délai rapide).
 */
export async function notifyHermesExpressOrder(orderId: string): Promise<void> {
  return enqueue({ type: "order.express_internal", orderId });
}

// ─── Implémentation no-op ─────────────────────────────────────────────────────

const DEBUG = process.env.HERMES_DEBUG === "1";

async function enqueue(event: HermesEventPayload): Promise<void> {
  if (DEBUG) {
    console.log("[Hermes:no-op]", event);
  }
  // TODO Hermès OS : remplacer ce no-op par un POST réel quand la cible sera
  // validée par Kaan. Ne jamais throw — toujours swallow l'erreur réseau.
  return;
}
