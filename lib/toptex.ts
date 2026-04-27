/**
 * TopTex API v3 — client centralisé
 *
 * Base URL : https://api.toptex.io
 *
 * Auth — deux headers requis simultanément sur tous les appels :
 *   Authorization: Bearer {JWT}          ← token OIDC via POST /v3/authenticate
 *   X-Api-Key: {TOPTEX_API_KEY}         ← clé du portail portal.toptex.io/apis
 *
 * Note : contrairement au reste, POST /v3/authenticate n'utilise PAS
 * Authorization mais doit avoir X-Api-Key + body { username, password }.
 *
 * Variables d'environnement nécessaires (serveur uniquement) :
 *   TOPTEX_API_KEY      — clé visible sur portal.toptex.io/apis (commence par VmA3i...)
 *   TOPTEX_USERNAME     — identifiant B2B (ex. tofr_hmglobalagence)
 *   TOPTEX_PASSWORD     — mot de passe du compte TopTex
 *
 * Paramètre usage_right requis sur les endpoints produits :
 *   'b2b_uniquement' | 'b2c_uniquement' | 'b2b_b2c'
 *
 * ⚠️  Ne jamais importer ce fichier dans un Client Component.
 *     Toujours passer par les routes /api/toptex/* côté navigateur.
 */

const BASE_URL = "https://api.toptex.io";

// Droits d'usage par défaut — b2b_b2c = catalogue complet
export const USAGE_RIGHT = "b2b_b2c" as const;
type UsageRight = "b2b_uniquement" | "b2c_uniquement" | "b2b_b2c";

// ── JWT token cache ────────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Obtient un JWT via POST /v3/authenticate.
 * Met le token en cache et le renouvelle 60s avant expiration.
 *
 * Découverte : l'endpoint authenticate requiert X-Api-Key (pas Authorization).
 * La réponse contient { username, token, expiry_time, expiry_time_timezone }.
 */
async function getJwtToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const apiKey   = process.env.TOPTEX_API_KEY;
  const username = process.env.TOPTEX_USERNAME;
  const password = process.env.TOPTEX_PASSWORD;

  if (!apiKey || !username || !password) {
    throw new Error(
      "[TopTex] Variables manquantes : TOPTEX_API_KEY, TOPTEX_USERNAME, TOPTEX_PASSWORD. " +
      "Vérifiez .env.local et les variables Vercel."
    );
  }

  const res = await fetch(`${BASE_URL}/v3/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Obligatoire sur authenticate — différent des autres endpoints
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[TopTex] Authentification échouée ${res.status} — vérifier TOPTEX_USERNAME / TOPTEX_PASSWORD\n${body}`
    );
  }

  // Réponse : { "username": "...", "token": "...", "expiry_time": "...", "expiry_time_timezone": "..." }
  const data = await res.json() as { username?: string; token?: string; expiry_time?: string };
  const token = data.token;

  if (!token) {
    throw new Error("[TopTex] Réponse auth sans champ 'token'");
  }

  // Parse expiry_time (format "2026-04-27T19:30:59.000Z")
  const expiresAt = data.expiry_time ? new Date(data.expiry_time).getTime() : now + 55 * 60_000;
  cachedToken = token;
  tokenExpiresAt = expiresAt;

  return token;
}

// ── Headers complets pour tous les appels (hors authenticate) ─────────────────

async function getAuthHeaders(): Promise<HeadersInit> {
  const apiKey = process.env.TOPTEX_API_KEY;
  if (!apiKey) throw new Error("[TopTex] TOPTEX_API_KEY non défini");

  const jwt = await getJwtToken();

  return {
    // JWT OIDC dans X-Toptex-Authorization (découvert empiriquement)
    "X-Toptex-Authorization": jwt,
    // Clé de souscription portal.toptex.io
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ── Fetch helper ───────────────────────────────────────────────────────────────

async function toptexFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers = await getAuthHeaders();

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options?.headers ?? {}) },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[TopTex] ${res.status} ${res.statusText} — ${url}\n${body}`);
  }

  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TopTexLocalizedString {
  fr?: string;
  en?: string;
  de?: string;
  es?: string;
  it?: string;
  nl?: string;
  pt?: string;
  [key: string]: string | undefined;
}

export interface TopTexColor {
  colorCode?: string;
  colorName?: string | TopTexLocalizedString;
  colorLabel?: string;
  [key: string]: unknown;
}

export interface TopTexMedia {
  url?: string;
  type?: string;
  colorCode?: string;
  [key: string]: unknown;
}

export interface TopTexSize {
  size?: string;
  label?: string;
  code?: string;
  [key: string]: unknown;
}

export interface TopTexProduct {
  catalogReference?: string;
  sku?: string;
  brand?: string;
  designation?: TopTexLocalizedString | string;
  description?: TopTexLocalizedString | string;
  composition?: TopTexLocalizedString | string;
  averageWeight?: string;
  colors?: TopTexColor[];
  medias?: TopTexMedia[];
  sizes?: (string | TopTexSize)[];
  createdDate?: string;
  updatedDate?: string;
  [key: string]: unknown;
}

export interface TopTexAttribute {
  id?: string | number;
  nom?: string;
  name?: string;
  code?: string;
  valeurs?: string[];
  values?: string[];
  [key: string]: unknown;
}

export interface TopTexPaginatedResponse<T> {
  items: T[];
  total_count: number;
  page_number: number;
  page_size: string | number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Retourne le nom FR d'un champ localisé */
export function getLabel(
  field: TopTexLocalizedString | string | undefined,
  lang: keyof TopTexLocalizedString = "fr"
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field.en ?? Object.values(field).find(Boolean) ?? "";
}

/** Retourne la première image d'un produit */
export function getMainImage(product: TopTexProduct): string {
  const medias = product.medias ?? [];
  return (medias.find((m) => m.url)?.url ?? "") as string;
}

// ── API calls ──────────────────────────────────────────────────────────────────

/**
 * GET /v3/products/all?usage_right={right}
 * Catalogue complet — peut être volumineux.
 */
export async function getTopTexProducts(
  usageRight: UsageRight = USAGE_RIGHT
): Promise<TopTexProduct[]> {
  const data = await toptexFetch<TopTexPaginatedResponse<TopTexProduct> | TopTexProduct[]>(
    `/v3/products/all?usage_right=${encodeURIComponent(usageRight)}`
  );
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

/**
 * GET /v3/products?sku={sku}&usage_right={right}
 * Produit unique par SKU ou référence catalogue.
 * Retourne null si non trouvé.
 */
export async function getTopTexProductBySku(
  sku: string,
  usageRight: UsageRight = USAGE_RIGHT
): Promise<TopTexProduct | null> {
  try {
    const data = await toptexFetch<TopTexProduct[] | TopTexProduct>(
      `/v3/products?sku=${encodeURIComponent(sku)}&usage_right=${encodeURIComponent(usageRight)}`
    );
    if (Array.isArray(data)) return data[0] ?? null;
    return data ?? null;
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) return null;
    throw err;
  }
}

// ── Inventory & Price types ────────────────────────────────────────────────────

export interface TopTexStockItem {
  colorCode?: string;
  colorName?: string | TopTexLocalizedString;
  sizeCode?: string;
  size?: string;
  /** Quantité disponible en stock */
  quantity?: number;
  available?: number;
  /** Date de réapprovisionnement estimée (ISO) */
  expectedDate?: string;
  [key: string]: unknown;
}

export interface TopTexInventoryResponse {
  catalogReference?: string;
  sku?: string;
  /** Résumé rapide : true si au moins 1 article en stock */
  inStock?: boolean;
  items?: TopTexStockItem[];
  stock?: TopTexStockItem[];
  colors?: Record<string, Record<string, number>>;
  [key: string]: unknown;
}

export interface TopTexPriceItem {
  colorCode?: string;
  sizeCode?: string;
  size?: string;
  /** Prix catalogue HT (€) */
  price?: number;
  unitPrice?: number;
  priceHT?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface TopTexPriceResponse {
  catalogReference?: string;
  sku?: string;
  currency?: string;
  /** Prix unitaire de base HT */
  basePrice?: number;
  price?: number;
  items?: TopTexPriceItem[];
  prices?: TopTexPriceItem[];
  [key: string]: unknown;
}

/**
 * Résumé simplifié du stock pour l'affichage côté client.
 */
export interface TopTexStockSummary {
  inStock: boolean;
  totalUnits: number;
  /** Prix de base HT (€) — null si inconnu */
  basePriceHT: number | null;
  /** Dernier fetch (timestamp ISO) */
  fetchedAt: string;
}

// ── API calls (inventory & price) ─────────────────────────────────────────────

/**
 * GET /v3/products/{sku}/inventory
 * Stock d'un produit par SKU.
 */
export async function getTopTexInventory(
  sku: string
): Promise<TopTexInventoryResponse | null> {
  try {
    return await toptexFetch<TopTexInventoryResponse>(
      `/v3/products/${encodeURIComponent(sku)}/inventory`
    );
  } catch {
    return null;
  }
}

/**
 * GET /v3/products/{sku}/price
 * Prix fournisseur d'un produit par SKU.
 */
export async function getTopTexPrice(
  sku: string
): Promise<TopTexPriceResponse | null> {
  try {
    return await toptexFetch<TopTexPriceResponse>(
      `/v3/products/${encodeURIComponent(sku)}/price`
    );
  } catch {
    return null;
  }
}

// ── Color-image mapping helper ────────────────────────────────────────────────

/**
 * Construit un mapping colorId → imageUrls à partir des médias TopTex.
 *
 * Logique :
 *   1. Récupère les couleurs TopTex (code → nom FR)
 *   2. Regroupe les médias par colorCode
 *   3. Pour chaque couleur de notre catalogue, cherche le code TopTex dont
 *      le nom FR correspond au label FR du produit
 *
 * Utilisé côté serveur ET côté client (via /api/toptex/enrichment/[sku]).
 */
export function buildColorImageMap(
  productColors: Array<{ id: string; label: string }>,
  toptexProduct: TopTexProduct
): Record<string, string[]> {
  const toptexColors = (toptexProduct.colors ?? []) as TopTexColor[];
  const medias       = (toptexProduct.medias  ?? []) as TopTexMedia[];

  // colorCode → nom FR normalisé
  const codeToFrName: Record<string, string> = {};
  for (const tc of toptexColors) {
    if (!tc.colorCode) continue;
    const code = String(tc.colorCode);
    let fr = "";
    if (typeof tc.colorName === "object" && tc.colorName !== null) {
      fr = (tc.colorName as TopTexLocalizedString).fr
        ?? (tc.colorName as TopTexLocalizedString).en
        ?? Object.values(tc.colorName as TopTexLocalizedString).find(Boolean)
        ?? "";
    } else if (typeof tc.colorName === "string") {
      fr = tc.colorName;
    }
    codeToFrName[code] = fr.toLowerCase().trim();
  }

  // colorCode → tableau d'URLs
  const codeToImages: Record<string, string[]> = {};
  for (const media of medias) {
    if (!media.url || !media.colorCode) continue;
    const code = String(media.colorCode);
    if (!codeToImages[code]) codeToImages[code] = [];
    codeToImages[code].push(media.url as string);
  }

  // Associer les couleurs produit HM aux codes TopTex par correspondance de nom FR
  const result: Record<string, string[]> = {};
  for (const color of productColors) {
    const labelLower = color.label.toLowerCase().trim();

    const [matchCode] =
      Object.entries(codeToFrName).find(([, frName]) => {
        if (!frName) return false;
        return (
          frName === labelLower ||
          frName.startsWith(labelLower) ||
          labelLower.startsWith(frName) ||
          // "gris chiné" ↔ "gris" : tolérance partielle
          (labelLower.length >= 4 && frName.includes(labelLower)) ||
          (frName.length >= 4 && labelLower.includes(frName))
        );
      }) ?? [];

    if (matchCode && codeToImages[matchCode]?.length) {
      result[color.id] = codeToImages[matchCode];
    }
  }

  return result;
}

/**
 * Résumé agrégé stock + prix pour affichage rapide.
 * Fait deux appels en parallèle et retourne un objet simplifié.
 */
export async function getTopTexStockSummary(
  sku: string
): Promise<TopTexStockSummary> {
  const [inventory, price] = await Promise.all([
    getTopTexInventory(sku),
    getTopTexPrice(sku),
  ]);

  // Compter les unités disponibles depuis les différentes formes de réponse
  let totalUnits = 0;

  if (inventory) {
    const items =
      (inventory.items as TopTexStockItem[] | undefined) ??
      (inventory.stock as TopTexStockItem[] | undefined) ??
      [];

    if (items.length > 0) {
      totalUnits = items.reduce((sum, item) => {
        const qty = (item.quantity ?? item.available ?? 0) as number;
        return sum + qty;
      }, 0);
    } else if (inventory.colors) {
      // Format { WHITE: { S: 50, M: 100 }, ... }
      for (const colorSizes of Object.values(inventory.colors)) {
        for (const qty of Object.values(colorSizes)) {
          totalUnits += qty;
        }
      }
    } else if (typeof inventory.inStock === "boolean") {
      // L'API retourne directement un champ inStock
      totalUnits = inventory.inStock ? 1 : 0;
    }
  }

  // Extraire le prix de base HT
  let basePriceHT: number | null = null;
  if (price) {
    const raw =
      price.basePrice ??
      price.price ??
      (price.items as TopTexPriceItem[] | undefined)?.[0]?.price ??
      (price.prices as TopTexPriceItem[] | undefined)?.[0]?.price ??
      null;
    if (raw != null) basePriceHT = Number(raw);
  }

  return {
    inStock: totalUnits > 0,
    totalUnits,
    basePriceHT,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * GET /v3/attributes?attributes={type}
 * Attributs produits.
 */
export async function getTopTexAttributes(
  attributeType = "all"
): Promise<TopTexAttribute[]> {
  const data = await toptexFetch<TopTexPaginatedResponse<TopTexAttribute> | TopTexAttribute[]>(
    `/v3/attributes?attributes=${encodeURIComponent(attributeType)}`
  );
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}
