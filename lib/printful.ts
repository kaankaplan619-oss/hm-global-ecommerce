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
  /** Printful print area id — dépend du PRODUIT : "front"/"back" (textile DTG),
   *  "default" (casquettes, goodies), "embroidery_chest_left" (polos/veste),
   *  "embroidery_front" (dad hat), "embroidery_apparel_front" (totes)…
   *  Source de vérité : getPrintfulFrontFileType (lib/printfulVariantMap.ts). */
  type: string;
  /** URL publique du fichier (PNG/PDF 300 DPI recommandé) */
  url:  string;
  /**
   * Position exacte du design dans la print area (pixels, origine = coin
   * haut-gauche de la zone d'impression). Optionnel : sans position, Printful
   * place le fichier par défaut. Construite par lib/printful-placement.ts
   * depuis le transform Studio — garantit aperçu atelier = produit imprimé.
   */
  position?: {
    area_width:          number;
    area_height:         number;
    width:               number;
    height:              number;
    top:                 number;
    left:                number;
    limit_to_print_area: boolean;
  };
}

export interface PrintfulOrderItem {
  /** Catalog variant_id (ex: 11576 = Gildan 5000 White S) */
  variant_id: number;
  quantity:   number;
  files:      PrintfulOrderFile[];
  /** Options item Printful — obligatoire pour la broderie : sans l'option
   *  thread_colors* la création du brouillon échoue en 400 (testé 2026-06-12).
   *  cf getThreadColorsOptionId (lib/printfulVariantMap.ts). */
  options?: { id: string; value: string[] }[];
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
  logoUrl:   string,
  /** Position exacte issue du Studio (lib/printful-placement.ts). Optionnelle :
   *  sans position, Printful place par défaut (centré). Pour coeur-dos, la
   *  même position relative est appliquée aux deux faces (le Studio ne stocke
   *  que le transform du premier logo — limitation V1 documentée). */
  position?: PrintfulOrderFile["position"],
  /** Type de fichier Printful du placement AVANT — dépend du produit/technique
   *  (cf getPrintfulFrontFileType). Un mauvais type → 400 Printful. */
  frontFileType: string = "front"
): PrintfulOrderFile[] {
  // La position px ne s'applique qu'au front DTG textile (print area 12″×16″).
  const frontPos = frontFileType === "front" && position ? { position } : {};
  switch (placement) {
    case "coeur":
      return [{ type: frontFileType, url: logoUrl, ...frontPos }];
    case "dos":
      return [{ type: "back", url: logoUrl, ...(position ? { position } : {}) }];
    case "coeur-dos":
      return [
        { type: frontFileType, url: logoUrl, ...frontPos },
        { type: "back",  url: logoUrl, ...(position ? { position } : {}) },
      ];
  }
}
