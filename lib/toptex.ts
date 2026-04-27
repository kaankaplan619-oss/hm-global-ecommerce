/**
 * TopTex API v3 — client centralisé
 *
 * Base URL : https://api.toptex.io
 * Auth     : header X-API-KEY (variable TOPTEX_API_KEY — serveur uniquement)
 *
 * ⚠️  Ne jamais importer ce fichier dans un Client Component.
 *     Toujours passer par les routes /api/toptex/* côté navigateur.
 */

const BASE_URL = "https://api.toptex.io";

// ── Auth headers ───────────────────────────────────────────────────────────────

function getHeaders(): HeadersInit {
  const apiKey = process.env.TOPTEX_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[TopTex] TOPTEX_API_KEY n'est pas défini. Ajoutez-la dans .env.local et sur Vercel."
    );
  }
  return {
    "X-API-KEY": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ── Fetch helper ───────────────────────────────────────────────────────────────

async function toptexFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
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
    // 404 → null ; toute autre erreur re-lance
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
