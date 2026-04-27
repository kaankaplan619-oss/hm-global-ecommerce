/**
 * TopTex API v3 — client centralisé
 *
 * Base URL : https://api.toptex.io
 *
 * Auth — deux headers requis simultanément sur tous les appels :
 *   X-Toptex-Authorization: {JWT}   ← token OIDC via POST /v3/authenticate
 *   X-Api-Key: {TOPTEX_API_KEY}     ← clé du portail portal.toptex.io/apis
 *
 * Endpoint produit correct (découvert via diagnostic 27/04/2026) :
 *   GET /v3/products?catalog_reference={CGTU01T}&usage_right=b2b_b2c
 *   ⚠️  NE PAS utiliser ?sku= → retourne toujours tableau vide
 *   ⚠️  Les refs B&C ont le préfixe CG : TU01T → CGTU01T
 *
 * Structure réelle JSON produit :
 *   product.colors[].colors.fr         ← nom couleur (EN malgré le champ fr)
 *   product.colors[].colorsHexa[0]     ← hex couleur
 *   product.colors[].packshots.FACE    ← URL image face (ou {error:...} si charte non acceptée)
 *   product.colors[].packshots.BACK    ← URL image dos
 *   product.colors[].packshots.SIDE    ← URL image côté
 *   product.colors[].sizes[0].colorCode ← code couleur interne TopTex
 *
 * Photo Library :
 *   Les packshots retournent { error: "Please connect to Photo library to accept user charter..." }
 *   tant que la charte photos n'est pas acceptée sur portal.toptex.io.
 *   buildColorImageMap() gère ce cas → retourne {} sans casser l'app.
 *
 * Variables d'environnement nécessaires (serveur uniquement) :
 *   TOPTEX_API_KEY      — clé visible sur portal.toptex.io/apis
 *   TOPTEX_USERNAME     — identifiant B2B (ex. tofr_hmglobalagence)
 *   TOPTEX_PASSWORD     — mot de passe du compte TopTex
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

  const data = await res.json() as { username?: string; token?: string; expiry_time?: string };
  const token = data.token;

  if (!token) {
    throw new Error("[TopTex] Réponse auth sans champ 'token'");
  }

  const expiresAt = data.expiry_time ? new Date(data.expiry_time).getTime() : now + 55 * 60_000;
  cachedToken = token;
  tokenExpiresAt = expiresAt;

  return token;
}

// ── Headers complets pour tous les appels (hors authenticate) ─────────────────

export async function getAuthHeaders(): Promise<HeadersInit> {
  const apiKey = process.env.TOPTEX_API_KEY;
  if (!apiKey) throw new Error("[TopTex] TOPTEX_API_KEY non défini");

  const jwt = await getJwtToken();

  return {
    "X-Toptex-Authorization": jwt,
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

// ── Types — structure réelle découverte le 27/04/2026 ─────────────────────────

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

/**
 * Variant couleur TopTex réel.
 * ⚠️  Le champ `colors.fr` contient en fait du texte ANGLAIS (ex. "Black", "White").
 */
export interface TopTexColorVariant {
  /** Noms localisés — mais généralement en anglais même pour .fr */
  colors: {
    fr?: string;
    en?: string;
    de?: string;
    es?: string;
    it?: string;
    nl?: string;
    pt?: string;
    [key: string]: string | undefined;
  };
  colorsHexa:      string[];
  colorsCMYK?:     string[];
  colorsDominant?: Array<{ fr?: string; en?: string }>;
  colorsPantone?:  string[];
  colorsRGB?:      string[];
  createdDate?:    string;
  lastChange?:     string;
  saleState?:      string;
  /**
   * Images produit par vue.
   * Format réel API v3 : objet { image_id, url_packshot, url, last_update, rights_end, ... }
   * Erreur Photo Library : { error: "Please connect to Photo library..." }
   * Fallback alternatif : URL string directe
   */
  packshots?: {
    FACE?: { url_packshot?: string; url?: string; image_id?: string; error?: string; [k: string]: unknown } | string;
    BACK?: { url_packshot?: string; url?: string; image_id?: string; error?: string; [k: string]: unknown } | string;
    SIDE?: { url_packshot?: string; url?: string; image_id?: string; error?: string; [k: string]: unknown } | string;
    [key: string]: { url_packshot?: string; url?: string; image_id?: string; error?: string; [k: string]: unknown } | string | undefined;
  };
  /** Variantes taille — contient colorCode à sizes[0].colorCode */
  sizes?: TopTexSizeVariant[];
  [key: string]: unknown;
}

export interface TopTexSizeVariant {
  barCode?:          string;
  colorCode?:        string;
  sku?:              string;
  size?:             string;
  sizeCode?:         string;
  saleState?:        string;
  ean?:              string;
  publicUnitPrice?:  string;
  isDiscontinued?:   number;
  isNew?:            number;
  productReference?: string;
  [key: string]: unknown;
}

export interface TopTexProduct {
  catalogReference?: string;
  /** SKU au sens TopTex — différent du catalog_reference */
  sku?:              string;
  brand?:            string;
  designation?:      TopTexLocalizedString | string;
  description?:      TopTexLocalizedString | string;
  composition?:      TopTexLocalizedString | string;
  averageWeight?:    string;
  /** Tableau de variantes couleur avec packshots par vue */
  colors?:           TopTexColorVariant[];
  /** Image produit générique — souvent bloquée par la charte Photo Library */
  images?:           unknown;
  saleState?:        string;
  supplierReference?: string;
  family?:           string;
  sub_family?:       string;
  gender?:           string;
  fit?:              string;
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

// ── Helpers génériques ────────────────────────────────────────────────────────

/** Retourne le nom FR d'un champ localisé */
export function getLabel(
  field: TopTexLocalizedString | string | undefined,
  lang: keyof TopTexLocalizedString = "fr"
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] ?? field.en ?? Object.values(field).find(Boolean) ?? "";
}

/** Retourne la première image d'un produit (toutes vues confondues) */
export function getMainImage(product: TopTexProduct): string {
  for (const color of product.colors ?? []) {
    for (const view of ["FACE", "BACK", "SIDE"] as const) {
      const p = color.packshots?.[view];
      if (typeof p === "string" && p.startsWith("http")) return p;
    }
  }
  return "";
}

// ── Normalization couleurs TopTex EN → ID couleur site ────────────────────────
//
// TopTex stocke les noms de couleurs EN ANGLAIS même dans le champ `colors.fr`.
// Certaines marques ajoutent un préfixe : "Ideal Black", "NS Navy".
// Cette fonction nettoie le préfixe puis mappe vers l'ID couleur de notre catalogue.
//
// Règles : priorité du plus spécifique au moins spécifique.

/**
 * Préfixes marque à retirer avant la normalisation.
 * Ex. "Ideal Black" → "Black", "NS Navy" → "Navy"
 */
const BRAND_PREFIXES = [
  /^ideal\s+/i,
  /^ns\s+/i,
  /^kariban\s+/i,
  /^b&?c\s+/i,
];

const COLOR_NORMALIZE_MAP: Array<[RegExp, string]> = [
  // ── Blanc / Naturel ───────────────────────────────────────────────────────────
  [/^white$/i,                     "blanc"],
  [/^raw natural$/i,               "blanc-casse"],
  [/^natural$/i,                   "blanc-casse"],
  [/^sand$/i,                      "beige"],
  [/^beige$/i,                     "beige"],

  // ── Gris léger (avant gris standard) ─────────────────────────────────────────
  [/^ash heather$/i,               "gris"],
  [/^pacific grey$/i,              "gris"],
  [/^ash$/i,                       "gris"],

  // ── Noir ──────────────────────────────────────────────────────────────────────
  [/^black pure$/i,                "noir"],
  [/^used black$/i,                "noir"],
  [/^black$/i,                     "noir"],

  // ── Marine (avant navy blue qui est aussi marine) ─────────────────────────────
  [/^french navy heather$/i,       "marine"],
  [/^navy heather$/i,              "marine"],
  [/^light navy$/i,                "marine"],
  [/^navy blue$/i,                 "marine"],
  [/^navy$/i,                      "marine"],

  // ── Gris standard ─────────────────────────────────────────────────────────────
  [/^sport grey$/i,                "gris"],
  [/^grey heather$/i,              "gris-melange"],
  [/^oxford grey$/i,               "gris"],
  [/^dark grey$/i,                 "gris-anthracite"],
  [/^anthracite$/i,                "anthracite"],
  [/^grey$/i,                      "gris"],

  // ── Bordeaux / Wine ───────────────────────────────────────────────────────────
  [/^burgundy$/i,                  "bordeaux"],
  [/^wine$/i,                      "bordeaux"],
  [/^deep red$/i,                  "bordeaux"],

  // ── Rouge ─────────────────────────────────────────────────────────────────────
  [/^fire red$/i,                  "rouge"],
  [/^red$/i,                       "rouge"],

  // ── Bleu Royal (avant générique blue) ────────────────────────────────────────
  [/^light royal blue$/i,          "bleu-royal"],
  [/^royal blue$/i,                "bleu-royal"],
  [/^cobalt blue$/i,               "bleu-royal"],
  [/^electric blue$/i,             "bleu-royal"],

  // ── Bleu Ciel ─────────────────────────────────────────────────────────────────
  [/^sky blue$/i,                  "bleu-ciel"],
  [/^azure$/i,                     "bleu-ciel"],
  [/^light blue$/i,                "bleu-ciel"],

  // ── Vert ──────────────────────────────────────────────────────────────────────
  [/^bottle green$/i,              "vert-bouteille"],
  [/^forest green$/i,              "vert-bouteille"],   // iDeal "Forest Green"
  [/^kelly green$/i,               "vert-kelly"],
  [/^orchid green$/i,              "vert-kelly"],
  [/^pistachio$/i,                 "vert-kelly"],

  // ── Orange ────────────────────────────────────────────────────────────────────
  [/^orange$/i,                    "orange"],
  [/^apricot$/i,                   "rose"],             // Apricot = rose-pêche

  // ── Jaune / Or ────────────────────────────────────────────────────────────────
  [/^solar yellow$/i,              "jaune"],
  [/^yellow$/i,                    "jaune"],
  [/^gold$/i,                      "or"],

  // ── Turquoise ─────────────────────────────────────────────────────────────────
  [/^real turquoise$/i,            "turquoise"],
  [/^turquoise$/i,                 "turquoise"],
  [/^atoll blue$/i,                "turquoise"],        // iDeal "Atoll Blue"
  [/^atoll$/i,                     "turquoise"],
  [/^diva blue$/i,                 "turquoise"],

  // ── Rose / Fuchsia ────────────────────────────────────────────────────────────
  [/^fuchsia$/i,                   "fuchsia"],
  [/^millennial pink$/i,           "rose"],

  // ── Violet / Purple ───────────────────────────────────────────────────────────
  [/^radiant purple$/i,            "violet"],
  [/^urban purple$/i,              "violet"],

  // ── Kaki / Sage / Brun ────────────────────────────────────────────────────────
  [/^urban khaki$/i,               "kaki"],
  [/^millennial khaki$/i,          "kaki"],
  [/^light khaki$/i,               "kaki"],
  [/^khaki$/i,                     "kaki"],
  [/^sage$/i,                      "sauge"],
  [/^bear brown$/i,                "kaki"],

  // ── Denim ─────────────────────────────────────────────────────────────────────
  [/^denim$/i,                     "denim"],
];

/**
 * Convertit un nom de couleur TopTex (en anglais, parfois préfixé par la marque)
 * vers l'ID couleur du site.
 *
 * Gère les préfixes marque : "Ideal Black" → "noir", "NS Navy" → "marine".
 * Retourne null si aucune correspondance.
 */
export function normalizeTopTexColorName(name: string): string | null {
  let trimmed = name.trim();

  // Retirer le préfixe marque si présent
  for (const prefix of BRAND_PREFIXES) {
    trimmed = trimmed.replace(prefix, "");
  }
  trimmed = trimmed.trim();

  for (const [regex, id] of COLOR_NORMALIZE_MAP) {
    if (regex.test(trimmed)) return id;
  }
  return null;
}

// ── Helpers couleur/image ─────────────────────────────────────────────────────

/** Extrait le nom EN/FR depuis une variante couleur TopTex */
function getTopTexColorName(tc: TopTexColorVariant): string {
  if (!tc.colors) return "";
  // TopTex met le même texte anglais dans tous les champs langue
  return (
    tc.colors.en ??
    tc.colors.fr ??
    Object.values(tc.colors).find((v): v is string => typeof v === "string") ??
    ""
  );
}

/**
 * Extrait les URLs packshot valides (filtre les erreurs Photo Library).
 * FACE → BACK → SIDE : ordre prioritaire pour la galerie.
 *
 * L'API TopTex v3 retourne les packshots sous deux formes :
 *   - Objet : { image_id, url_packshot, url, last_update, ... }  ← format réel v3
 *   - Chaîne : "https://..."                                      ← format alternatif
 *   - Objet erreur : { error: "Please connect to Photo library..." } ← ignoré
 */
function extractPackshotUrls(
  packshots: TopTexColorVariant["packshots"] | undefined
): string[] {
  if (!packshots) return [];
  const urls: string[] = [];
  for (const view of ["FACE", "BACK", "SIDE"] as const) {
    const p = packshots[view];
    if (!p) continue;

    if (typeof p === "object") {
      // Format réel v3 : { url_packshot: "https://cdn.toptex.com/...", url: "...", ... }
      const obj = p as Record<string, unknown>;
      const urlPackshot = (obj.url_packshot ?? obj.url) as string | undefined;
      if (
        urlPackshot &&
        typeof urlPackshot === "string" &&
        (urlPackshot.startsWith("http") || urlPackshot.startsWith("/")) &&
        !urlPackshot.includes("Please connect")
      ) {
        urls.push(urlPackshot);
      }
      // { error: "Please connect to Photo library..." } → ignoré silencieusement
    } else if (typeof p === "string" && (p.startsWith("http") || p.startsWith("/"))) {
      // Format chaîne directe (fallback)
      urls.push(p);
    }
  }
  return urls;
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
 * GET /v3/products?catalog_reference={ref}&usage_right={right}
 *
 * IMPORTANT : utilise `catalog_reference` (pas `sku`).
 * Pour les produits B&C, le catalog_reference inclut le préfixe CG :
 *   TU01T → CGTU01T
 *
 * Retourne le produit complet (objet direct, pas un tableau).
 * Retourne null si non trouvé ou erreur 404.
 */
export async function getTopTexProductBySku(
  catalogRef: string,
  usageRight: UsageRight = USAGE_RIGHT
): Promise<TopTexProduct | null> {
  try {
    const data = await toptexFetch<unknown>(
      `/v3/products?catalog_reference=${encodeURIComponent(catalogRef)}&usage_right=${encodeURIComponent(usageRight)}`
    );

    // L'API retourne le produit directement (objet JSON, pas un tableau)
    if (data && typeof data === "object" && !Array.isArray(data)) {
      const obj = data as Record<string, unknown>;

      // Vérifier que c'est bien un produit et pas une réponse d'erreur
      if (obj.errorType || obj.errorMessage) {
        console.warn(`[TopTex] Erreur API pour catalog_reference=${catalogRef}:`, obj.errorMessage);
        return null;
      }

      // Un produit valide a catalogReference, colors, ou designation
      if (obj.catalogReference || obj.colors || obj.designation) {
        return obj as TopTexProduct;
      }
    }

    // Si tableau vide : référence inconnue
    if (Array.isArray(data) && data.length === 0) {
      console.warn(`[TopTex] catalog_reference=${catalogRef} inconnu de l'API`);
      return null;
    }

    return null;
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
  quantity?: number;
  available?: number;
  expectedDate?: string;
  [key: string]: unknown;
}

export interface TopTexInventoryResponse {
  catalogReference?: string;
  sku?: string;
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
  basePrice?: number;
  price?: number;
  items?: TopTexPriceItem[];
  prices?: TopTexPriceItem[];
  [key: string]: unknown;
}

export interface TopTexStockSummary {
  inStock: boolean;
  totalUnits: number;
  basePriceHT: number | null;
  fetchedAt: string;
}

// ── API calls (inventory & price) ─────────────────────────────────────────────

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

// ── Color-image mapping helpers ───────────────────────────────────────────────

/**
 * Construit un mapping colorId → imageUrls depuis les packshots TopTex.
 *
 * Logique :
 *   1. Pour chaque couleur TopTex, normalise son nom EN → ID couleur site
 *   2. Extrait les URLs packshot FACE/BACK/SIDE (filtre erreurs Photo Library)
 *   3. Pour chaque couleur produit HM qui matche, associe les URLs
 *
 * Si les packshots sont bloqués (charte Photo Library), retourne {} sans erreur.
 * L'app utilise alors les images locales comme fallback.
 */
export function buildColorImageMap(
  productColors: Array<{ id: string; label: string }>,
  toptexProduct: TopTexProduct
): Record<string, string[]> {
  const toptexColors = (toptexProduct.colors ?? []) as TopTexColorVariant[];

  // Pré-calculer normalizedId → variant TopTex (favori = celui avec le plus d'images)
  const byNormalizedId: Record<string, TopTexColorVariant> = {};
  for (const tc of toptexColors) {
    const name = getTopTexColorName(tc);
    if (!name) continue;
    const id = normalizeTopTexColorName(name);
    if (!id) {
      // Log en dev pour détecter les couleurs non mappées
      if (process.env.NODE_ENV === "development") {
        console.log(`[TopTex] Couleur non mappée : "${name}" (${toptexProduct.catalogReference})`);
      }
      continue;
    }
    if (!byNormalizedId[id]) {
      byNormalizedId[id] = tc;
    } else {
      // Préférer le variant avec des URLs réelles
      const existing = extractPackshotUrls(byNormalizedId[id].packshots).length;
      const incoming = extractPackshotUrls(tc.packshots).length;
      if (incoming > existing) byNormalizedId[id] = tc;
    }
  }

  // Associer aux couleurs produit HM
  const result: Record<string, string[]> = {};
  for (const color of productColors) {
    const tc = byNormalizedId[color.id];
    if (!tc) continue;
    const urls = extractPackshotUrls(tc.packshots);
    if (urls.length > 0) {
      result[color.id] = urls;
    }
  }

  return result;
}

/**
 * Retourne la liste des IDs couleur site qui existent dans TopTex
 * (indépendamment de la disponibilité des photos).
 *
 * Utilisé pour savoir si une couleur est "commandable" même sans packshot.
 */
export function buildAvailableColorIds(
  productColors: Array<{ id: string; label: string }>,
  toptexProduct: TopTexProduct
): string[] {
  const toptexColors = (toptexProduct.colors ?? []) as TopTexColorVariant[];

  const normalizedIds = new Set<string>();
  for (const tc of toptexColors) {
    const name = getTopTexColorName(tc);
    if (!name) continue;
    const id = normalizeTopTexColorName(name);
    if (id) normalizedIds.add(id);
  }

  return productColors
    .filter((c) => normalizedIds.has(c.id))
    .map((c) => c.id);
}

// ── Résumé agrégé stock + prix ────────────────────────────────────────────────

export async function getTopTexStockSummary(
  sku: string
): Promise<TopTexStockSummary> {
  const [inventory, price] = await Promise.all([
    getTopTexInventory(sku),
    getTopTexPrice(sku),
  ]);

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
      for (const colorSizes of Object.values(inventory.colors)) {
        for (const qty of Object.values(colorSizes)) {
          totalUnits += qty;
        }
      }
    } else if (typeof inventory.inStock === "boolean") {
      totalUnits = inventory.inStock ? 1 : 0;
    }
  }

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
