/**
 * TopTex API v3 — client centralisé
 *
 * Base URL : https://api.toptex.io
 *
 * Auth — double système requis simultanément :
 *   1. POST /v3/authenticate → JWT (Bearer token)
 *   2. Header X-Toptex-Authorization: {TOPTEX_API_KEY}
 *
 * Variables d'environnement nécessaires (serveur uniquement) :
 *   TOPTEX_API_KEY      — clé du dashboard TopTex
 *   TOPTEX_USERNAME     — identifiant B2B (ex. tofr_hmglobalagence)
 *   TOPTEX_PASSWORD     — mot de passe B2B
 *
 * ⚠️  Ne jamais importer ce fichier dans un Client Component.
 *     Toujours passer par les routes /api/toptex/* côté navigateur.
 */

const BASE_URL = "https://api.toptex.io";

// ── JWT token cache (mémoire process — durée de vie du serveur Next.js) ───────

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0; // timestamp ms

/**
 * Obtient un JWT via POST /v3/authenticate.
 * Le token est mis en cache et renouvelé 60s avant expiration.
 * JWTs TopTex ont une durée de vie de ~1h typiquement.
 */
async function getJwtToken(): Promise<string> {
  const now = Date.now();

  // Retourne le cache si encore valide (marge 60s)
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const username = process.env.TOPTEX_USERNAME;
  const password = process.env.TOPTEX_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "[TopTex] TOPTEX_USERNAME ou TOPTEX_PASSWORD non défini. " +
      "Ajoutez ces variables dans .env.local et sur Vercel."
    );
  }

  const res = await fetch(`${BASE_URL}/v3/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
    // Ne pas cacher cette requête d'auth
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[TopTex] Authentification échouée ${res.status}: ${body}`
    );
  }

  const data = await res.json() as Record<string, unknown>;

  // Le JWT peut être dans différents champs selon la version API
  const token =
    (data.token ?? data.access_token ?? data.jwt ?? data.accessToken) as string | undefined;

  if (!token) {
    throw new Error(
      `[TopTex] Réponse auth inattendue — champs reçus : ${Object.keys(data).join(", ")}`
    );
  }

  // Parse expiration depuis le JWT (payload base64) ou TTL par défaut 55 min
  let ttl = 55 * 60 * 1000; // 55 minutes par défaut
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf8")
    ) as { exp?: number };
    if (payload.exp) {
      ttl = payload.exp * 1000 - now;
    }
  } catch {
    // ignore — on garde 55 min
  }

  cachedToken = token;
  tokenExpiresAt = now + ttl;

  return token;
}

// ── Headers complets (API key + JWT) ─────────────────────────────────────────

async function getAuthHeaders(): Promise<HeadersInit> {
  const apiKey = process.env.TOPTEX_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[TopTex] TOPTEX_API_KEY non défini. " +
      "Ajoutez-la dans .env.local et sur Vercel."
    );
  }

  const jwt = await getJwtToken();

  return {
    "Authorization": `Bearer ${jwt}`,
    "X-Toptex-Authorization": apiKey,
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
    headers: {
      ...headers,
      ...(options?.headers ?? {}),
    },
    // Cache Next.js : revalidation toutes les 5 minutes
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[TopTex] ${res.status} ${res.statusText} — ${url}\n${body}`);
  }

  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TopTexColor {
  id?: string | number;
  nom?: string;
  name?: string;
  code?: string;
  hex?: string;
  [key: string]: unknown;
}

export interface TopTexImage {
  url?: string;
  type?: string;
  [key: string]: unknown;
}

export interface TopTexSize {
  label?: string;
  code?: string;
  stock?: number;
  [key: string]: unknown;
}

export interface TopTexProduct {
  id?: string | number;
  reference?: string;
  sku?: string;
  nom?: string;
  name?: string;
  description?: string;
  couleurs?: TopTexColor[];
  colors?: TopTexColor[];
  tailles?: (string | TopTexSize)[];
  sizes?: (string | TopTexSize)[];
  images?: TopTexImage[];
  prix?: number;
  prixFournisseur?: number;
  price?: number;
  stock?: number;
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

// ── Helpers de normalisation ───────────────────────────────────────────────────

/** Extrait un tableau depuis les différentes formes de réponse possibles */
function extractArray<T>(
  data: T[] | { produits?: T[]; products?: T[]; attributs?: T[]; attributes?: T[]; data?: T[] }
): T[] {
  if (Array.isArray(data)) return data;
  return (
    (data as Record<string, T[] | undefined>).produits ??
    (data as Record<string, T[] | undefined>).products ??
    (data as Record<string, T[] | undefined>).attributs ??
    (data as Record<string, T[] | undefined>).attributes ??
    (data as Record<string, T[] | undefined>).data ??
    []
  );
}

// ── API calls ──────────────────────────────────────────────────────────────────

/**
 * GET /v3/produits/tous
 * Catalogue complet — peut être long sur un gros catalogue.
 */
export async function getTopTexProducts(): Promise<TopTexProduct[]> {
  type Resp = TopTexProduct[] | { produits?: TopTexProduct[]; products?: TopTexProduct[]; data?: TopTexProduct[] };
  const data = await toptexFetch<Resp>("/v3/produits/tous");
  return extractArray(data);
}

/**
 * GET /v3/produits?page=&limit=
 * Catalogue paginé.
 */
export async function getTopTexProductsPaginated(
  page = 1,
  limit = 50
): Promise<TopTexProduct[]> {
  type Resp = TopTexProduct[] | { produits?: TopTexProduct[]; products?: TopTexProduct[]; data?: TopTexProduct[] };
  const data = await toptexFetch<Resp>(`/v3/produits?page=${page}&limit=${limit}`);
  return extractArray(data);
}

/**
 * GET /v3/produits/{sku}
 * Produit unique par SKU ou référence catalogue.
 * Retourne null si non trouvé (404).
 */
export async function getTopTexProductBySku(
  sku: string
): Promise<TopTexProduct | null> {
  try {
    type Resp = TopTexProduct | { produit?: TopTexProduct; product?: TopTexProduct };
    const data = await toptexFetch<Resp>(`/v3/produits/${encodeURIComponent(sku)}`);
    if (data && typeof data === "object" && "produit" in data && (data as { produit?: TopTexProduct }).produit) return (data as { produit: TopTexProduct }).produit;
    if (data && typeof data === "object" && "product" in data && (data as { product?: TopTexProduct }).product) return (data as { product: TopTexProduct }).product;
    return data as TopTexProduct;
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) return null;
    throw err;
  }
}

/**
 * GET /v3/attributes
 * Attributs produits (couleurs, tailles, matières…).
 */
export async function getTopTexAttributes(): Promise<TopTexAttribute[]> {
  type Resp = TopTexAttribute[] | { attributs?: TopTexAttribute[]; attributes?: TopTexAttribute[]; data?: TopTexAttribute[] };
  const data = await toptexFetch<Resp>("/v3/attributes");
  return extractArray(data);
}
