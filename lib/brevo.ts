/**
 * lib/brevo.ts — Synchronisation des contacts opt-in vers Brevo.
 *
 * Appelé quand un client coche le consentement prospection (inscription OU
 * commande). Upsert le contact dans la liste `BREVO_LIST_ID` (défaut 2).
 *
 * Conçu pour ne JAMAIS bloquer le flux appelant :
 *  - no-op si `BREVO_API_KEY` n'est pas configurée ;
 *  - toutes les erreurs sont avalées (log uniquement) — un échec Brevo ne doit
 *    jamais empêcher la création d'un compte ni un paiement.
 *
 * Serveur uniquement (utilise process.env.BREVO_API_KEY — jamais exposé client).
 */

const BREVO_API = "https://api.brevo.com/v3";

export type BrevoContactInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  /** Origine de l'opt-in : "inscription" | "commande" */
  source?: string;
  /** Attributs Brevo additionnels (ex. { VILLE: "Strasbourg" }). */
  attributes?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Crée ou met à jour un contact Brevo et l'ajoute à la liste opt-in.
 * Ne lève jamais d'exception.
 */
export async function syncBrevoContact(input: BrevoContactInput): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !input.email) return; // non configuré ou pas d'email → on ne fait rien

  const listId = Number(process.env.BREVO_LIST_ID ?? "2");

  const attributes: Record<string, string> = {};
  if (input.firstName) attributes.PRENOM = input.firstName;
  if (input.lastName) attributes.NOM = input.lastName;
  if (input.source) attributes.SOURCE = input.source;
  for (const [key, value] of Object.entries(input.attributes ?? {})) {
    if (value !== undefined && value !== null && value !== "") attributes[key] = String(value);
  }

  try {
    const res = await fetch(`${BREVO_API}/contacts`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        updateEnabled: true, // upsert : met à jour le contact s'il existe déjà
        ...(Number.isFinite(listId) ? { listIds: [listId] } : {}),
        ...(Object.keys(attributes).length ? { attributes } : {}),
      }),
    });
    // 201 = créé, 204 = mis à jour. Tout autre statut : on log sans bloquer.
    if (!res.ok && res.status !== 204) {
      const detail = await res.text().catch(() => "");
      console.error(`[brevo] sync ${res.status}: ${detail.slice(0, 300)}`);
    }
  } catch (err) {
    console.error("[brevo] sync error:", err);
  }
}
