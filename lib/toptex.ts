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

/**
 * GET /v3/products/{sku}/inventory
 * Stock d'un produit par SKU.
 */
export async function getTopTexInventory(sku: string): Promise<Record<string, unknown> | null> {
  try {
    return await toptexFetch<Record<string, unknown>>(
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
export async function getTopTexPrice(sku: string): Promise<Record<string, unknown> | null> {
  try {
    return await toptexFetch<Record<string, unknown>>(
      `/v3/products/${encodeURIComponent(sku)}/price`
    );
  } catch {
    return null;
  }
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
