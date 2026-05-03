/**
 * lib/printful.ts
 *
 * Client API Printful v1 — SERVER SIDE ONLY.
 * Ne jamais importer depuis des composants client.
 *
 * Variables d'environnement requises (Vercel) :
 *   PRINTFUL_API_KEY   — Bearer token Printful (jamais exposé)
 *   PRINTFUL_STORE_ID  — ID du store Printful (18115629)
 */

const PRINTFUL_BASE = "https://api.printful.com";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrintfulRecipient {
  name:         string;
  address1:     string;
  address2?:    string;
  city:         string;
  state_code?:  string;
  country_code: string;
  zip:          string;
  email?:       string;
  phone?:       string;
}

export interface PrintfulOrderFile {
  /** Printful print area id : "front" pour face avant, "back" pour dos */
  type: "front" | "back" | "default";
  /** URL publique du fichier (PNG/PDF 300 DPI recommandé) */
  url:  string;
}

export interface PrintfulOrderItem {
  /** Catalog variant_id (ex: 11576 = Gildan 5000 White S) */
  variant_id: number;
  quantity:   number;
  files:      PrintfulOrderFile[];
}

export interface PrintfulCreateOrderPayload {
  /** ID HM Global pour retrouver la commande via webhook */
  external_id: string;
  recipient:   PrintfulRecipient;
  items:       PrintfulOrderItem[];
  /** Toujours false — ne jamais confirmer automatiquement */
  confirm:     false;
}

export interface PrintfulOrderResult {
  id:          number;
  status:      string;
  external_id: string;
  costs?: {
    subtotal: string;
    discount: string;
    shipping: string;
    tax:      string;
    total:    string;
    currency: string;
  };
}

export interface PrintfulShipment {
  id:              number;
  carrier:         string;
  service:         string;
  tracking_number: string;
  tracking_url:    string;
  ship_date:       string;
  shipped_at?:     number;
}

export interface PrintfulWebhookEvent {
  type:  string;
  store: number;
  data:  Record<string, unknown>;
}

// ─── Client interne ───────────────────────────────────────────────────────────

async function pfFetch<T>(
  path:    string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey  = process.env.PRINTFUL_API_KEY;
  const storeId = process.env.PRINTFUL_STORE_ID;

  if (!apiKey) throw new Error("[Printful] PRINTFUL_API_KEY manquante");

  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
      ...(storeId ? { "X-PF-Store-Id": storeId } : {}),
      ...(options.headers ?? {}),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    const msg = json?.result ?? json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`[Printful] ${path} → ${res.status}: ${msg}`);
  }

  return (json.result ?? json) as T;
}

// ─── API publiques ────────────────────────────────────────────────────────────

/**
 * Crée une commande Printful en mode DRAFT.
 * Ne lance PAS la production (confirm: false).
 * À confirmer manuellement via confirmPrintfulOrder().
 */
export async function createPrintfulDraft(
  payload: PrintfulCreateOrderPayload
): Promise<PrintfulOrderResult> {
  return pfFetch<PrintfulOrderResult>("/orders", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
}

/**
 * Confirme une commande Printful draft → lance la production.
 * ⚠️  IRRÉVERSIBLE et PAYANT. N'appeler qu'après validation admin explicite.
 */
export async function confirmPrintfulOrder(
  printfulOrderId: number
): Promise<PrintfulOrderResult> {
  return pfFetch<PrintfulOrderResult>(`/orders/${printfulOrderId}/confirm`, {
    method: "POST",
  });
}

/**
 * Récupère le statut live d'une commande Printful.
 */
export async function getPrintfulOrder(
  printfulOrderId: number
): Promise<PrintfulOrderResult> {
  return pfFetch<PrintfulOrderResult>(`/orders/${printfulOrderId}`);
}

/**
 * Annule une commande Printful draft (non encore confirmée).
 * Uniquement possible si status = 'draft'.
 */
export async function cancelPrintfulOrder(
  printfulOrderId: number
): Promise<void> {
  await pfFetch(`/orders/${printfulOrderId}`, { method: "DELETE" });
}

// ─── Mapping placement HM Global → types de fichiers Printful ────────────────

export function getFilesForPlacement(
  placement: "coeur" | "dos" | "coeur-dos",
  logoUrl:   string
): PrintfulOrderFile[] {
  switch (placement) {
    case "coeur":
      return [{ type: "front", url: logoUrl }];
    case "dos":
      return [{ type: "back", url: logoUrl }];
    case "coeur-dos":
      return [
        { type: "front", url: logoUrl },
        { type: "back",  url: logoUrl },
      ];
  }
}
