/**
 * GET /api/toptex/debug-product?ref=TU01T
 *
 * Diagnostic complet d'un produit TopTex.
 * Teste plusieurs méthodes de recherche et renvoie le JSON brut + analyse.
 *
 * ⚠️  Jamais déployé en production — route de debug uniquement (localhost).
 *     Si elle est accessible en prod, elle ne renvoie aucune clé API.
 */

import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.toptex.io";

// ── Auth helpers (dupliqués ici pour isoler le debug) ─────────────────────────

async function getJwt(): Promise<string> {
  const apiKey   = process.env.TOPTEX_API_KEY   ?? "";
  const username = process.env.TOPTEX_USERNAME   ?? "";
  const password = process.env.TOPTEX_PASSWORD   ?? "";

  if (!apiKey || !username || !password)
    throw new Error("Variables TOPTEX_API_KEY / TOPTEX_USERNAME / TOPTEX_PASSWORD manquantes");

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
    throw new Error(`Authenticate ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Réponse auth sans champ token");
  return data.token;
}

type FetchResult = { ok: boolean; status: number; data: unknown; error?: string };

async function ttFetch(
  path: string,
  jwt: string,
  extraHeaders?: Record<string, string>
): Promise<FetchResult> {
  const apiKey = process.env.TOPTEX_API_KEY ?? "";
  const url    = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Toptex-Authorization": jwt,
        "X-Api-Key":              apiKey,
        "Content-Type":           "application/json",
        Accept:                   "application/json",
        ...(extraHeaders ?? {}),
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = null;
    try { data = JSON.parse(text); } catch { data = text; }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: String(err) };
  }
}

/** Variante avec Authorization: Bearer au lieu de X-Toptex-Authorization */
async function ttFetchBearer(path: string, jwt: string): Promise<FetchResult> {
  const apiKey = process.env.TOPTEX_API_KEY ?? "";
  const url    = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "X-Api-Key":     apiKey,
        "Content-Type":  "application/json",
        Accept:          "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = null;
    try { data = JSON.parse(text); } catch { data = text; }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: String(err) };
  }
}

// ── Analyse helpers ───────────────────────────────────────────────────────────

/** Extrait les clés de premier niveau d'un objet ou du premier item d'un tableau */
function topLevelKeys(data: unknown): string[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    if (data.length === 0) return ["[tableau vide]"];
    return Object.keys(data[0] as object);
  }
  if (typeof data === "object") return Object.keys(data as object);
  return [];
}

/** Résume les médias/images trouvés */
function analyzeMedias(product: Record<string, unknown>): {
  field: string;
  count: number;
  sample: unknown[];
}[] {
  const candidates = [
    "medias", "images", "pictures", "photos", "media",
    "declinaisons", "variants", "colors", "catalog", "attributes",
  ];
  const found: { field: string; count: number; sample: unknown[] }[] = [];

  for (const key of candidates) {
    const val = product[key];
    if (!val) continue;
    const arr = Array.isArray(val) ? val : [val];
    if (arr.length === 0) continue;
    found.push({ field: key, count: arr.length, sample: arr.slice(0, 3) });
  }

  // Chercher aussi dans les champs inconnus qui contiennent des URLs
  for (const [key, val] of Object.entries(product)) {
    if (candidates.includes(key)) continue;
    if (Array.isArray(val) && val.length > 0) {
      const first = val[0];
      if (typeof first === "object" && first !== null) {
        const sub = first as Record<string, unknown>;
        const hasUrl = Object.values(sub).some(
          (v) => typeof v === "string" && (v.startsWith("http") || v.includes(".jpg") || v.includes(".png"))
        );
        if (hasUrl) {
          found.push({ field: `${key} (découvert)`, count: val.length, sample: val.slice(0, 2) });
        }
      }
    }
  }

  return found;
}

/** Résume les couleurs trouvées */
function analyzeColors(product: Record<string, unknown>): {
  field: string;
  count: number;
  sample: unknown[];
} | null {
  const candidates = ["colors", "couleurs", "colorways", "variants", "declinaisons"];
  for (const key of candidates) {
    const val = product[key];
    if (!val) continue;
    const arr = Array.isArray(val) ? val : [val];
    if (arr.length === 0) continue;
    return { field: key, count: arr.length, sample: arr.slice(0, 5) };
  }
  return null;
}

/** Résume les tailles trouvées */
function analyzeSizes(product: Record<string, unknown>): {
  field: string;
  count: number;
  sample: unknown[];
} | null {
  const candidates = ["sizes", "tailles", "size_list", "sizeRange", "variants"];
  for (const key of candidates) {
    const val = product[key];
    if (!val) continue;
    const arr = Array.isArray(val) ? val : [val];
    if (arr.length === 0) continue;
    return { field: key, count: arr.length, sample: arr.slice(0, 8) };
  }
  return null;
}

/** Extrait le premier produit depuis une réponse brute (tableau ou paginée ou unique) */
function extractFirst(data: unknown): Record<string, unknown> | null {
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] as Record<string, unknown>) ?? null;
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    // Réponse paginée TopTex
    for (const key of ["items", "products", "data", "results", "produits"]) {
      const arr = obj[key];
      if (Array.isArray(arr) && arr.length > 0) {
        return arr[0] as Record<string, unknown>;
      }
    }
    // Peut-être un objet produit direct
    if (obj.sku || obj.catalogReference || obj.reference || obj.id) return obj;
  }
  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref")?.trim();

  if (!ref) {
    return NextResponse.json(
      { error: "Paramètre ?ref= requis. Exemple : /api/toptex/debug-product?ref=TU03T" },
      { status: 400 }
    );
  }

  // 1. Auth
  let jwt: string;
  try {
    jwt = await getJwt();
  } catch (err) {
    return NextResponse.json({ error: String(err), step: "authenticate" }, { status: 500 });
  }

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`[TopTex Debug] Référence : ${ref}`);
  console.log(`═══════════════════════════════════════════════`);

  const usageRight = "b2b_b2c";

  // 2. Tester plusieurs endpoints en parallèle (batch 1)
  const [
    byRef,
    byRefSlash,
    bySku,
    bySearch,
    byQ,
    byRefUpper,
  ] = await Promise.all([
    ttFetch(`/v3/products/${encodeURIComponent(ref)}?usage_right=${usageRight}`,                    jwt),
    ttFetch(`/v3/products/${encodeURIComponent(ref.toUpperCase())}?usage_right=${usageRight}`,      jwt),
    ttFetch(`/v3/products?sku=${encodeURIComponent(ref)}&usage_right=${usageRight}`,                jwt),
    ttFetch(`/v3/products?search=${encodeURIComponent(ref)}&usage_right=${usageRight}`,             jwt),
    ttFetch(`/v3/products?q=${encodeURIComponent(ref)}&usage_right=${usageRight}`,                  jwt),
    ttFetch(`/v3/products?reference=${encodeURIComponent(ref)}&usage_right=${usageRight}`,          jwt),
  ]);

  // 3. Tester aussi quelques endpoints alternatifs (batch 2)
  const [
    byCatalogRef,
    byModel,
    bySkuLower,
    byRefParam,
    withMedias,
  ] = await Promise.all([
    ttFetch(`/v3/products?catalogReference=${encodeURIComponent(ref)}&usage_right=${usageRight}`,   jwt),
    ttFetch(`/v3/products?modele=${encodeURIComponent(ref)}&usage_right=${usageRight}`,             jwt),
    ttFetch(`/v3/products?sku=${encodeURIComponent(ref.toLowerCase())}&usage_right=${usageRight}`,  jwt),
    ttFetch(`/v3/products?ref=${encodeURIComponent(ref)}&usage_right=${usageRight}`,                jwt),
    ttFetch(`/v3/products/${encodeURIComponent(ref)}/medias?usage_right=${usageRight}`,             jwt),
  ]);

  // 4. Batch 3 — catalog_reference (le bon nom de paramètre) + Authorization: Bearer
  const [
    byCatalogReference,
    byRefBearer,
    bySkuBearer,
    withMediasBearer,
    byCatalogRefBearer,
  ] = await Promise.all([
    ttFetch(`/v3/products?catalog_reference=${encodeURIComponent(ref)}&usage_right=${usageRight}`,  jwt),
    ttFetchBearer(`/v3/products/${encodeURIComponent(ref)}?usage_right=${usageRight}`,              jwt),
    ttFetchBearer(`/v3/products?sku=${encodeURIComponent(ref)}&usage_right=${usageRight}`,          jwt),
    ttFetchBearer(`/v3/products/${encodeURIComponent(ref)}/medias?usage_right=${usageRight}`,       jwt),
    ttFetchBearer(`/v3/products?catalog_reference=${encodeURIComponent(ref)}&usage_right=${usageRight}`, jwt),
  ]);

  // 5. Compiler les résultats
  const endpoints: Record<string, {
    url: string;
    status: number;
    found: boolean;
    dataShape: string;
    itemCount: number | null;
  }> = {};

  const attempts: Array<{ label: string; path: string; result: FetchResult }> = [
    { label: "GET /v3/products/{ref} [X-Toptex-Auth]",        path: `/v3/products/${ref}?usage_right=${usageRight}`,                    result: byRef },
    { label: "GET /v3/products/{REF} [X-Toptex-Auth]",        path: `/v3/products/${ref.toUpperCase()}?usage_right=${usageRight}`,      result: byRefSlash },
    { label: "GET /v3/products?sku={ref}",                     path: `/v3/products?sku=${ref}&usage_right=${usageRight}`,                result: bySku },
    { label: "GET /v3/products?sku={ref_lower}",               path: `/v3/products?sku=${ref.toLowerCase()}&usage_right=${usageRight}`,  result: bySkuLower },
    { label: "GET /v3/products?catalog_reference={ref}",       path: `/v3/products?catalog_reference=${ref}&usage_right=${usageRight}`,  result: byCatalogReference },
    { label: "GET /v3/products?catalogReference={ref}",        path: `/v3/products?catalogReference=${ref}&usage_right=${usageRight}`,   result: byCatalogRef },
    { label: "GET /v3/products?reference={ref}",               path: `/v3/products?reference=${ref}&usage_right=${usageRight}`,          result: byRefUpper },
    { label: "GET /v3/products?ref={ref}",                     path: `/v3/products?ref=${ref}&usage_right=${usageRight}`,                result: byRefParam },
    { label: "GET /v3/products?modele={ref}",                  path: `/v3/products?modele=${ref}&usage_right=${usageRight}`,             result: byModel },
    { label: "GET /v3/products?search={ref}",                  path: `/v3/products?search=${ref}&usage_right=${usageRight}`,             result: bySearch },
    { label: "GET /v3/products?q={ref}",                       path: `/v3/products?q=${ref}&usage_right=${usageRight}`,                  result: byQ },
    { label: "GET /v3/products/{ref}/medias [X-Toptex-Auth]",  path: `/v3/products/${ref}/medias?usage_right=${usageRight}`,             result: withMedias },
    { label: "GET /v3/products/{ref} [Bearer]",                path: `/v3/products/${ref}?usage_right=${usageRight}`,                    result: byRefBearer },
    { label: "GET /v3/products?sku={ref} [Bearer]",            path: `/v3/products?sku=${ref}&usage_right=${usageRight}`,                result: bySkuBearer },
    { label: "GET /v3/products/{ref}/medias [Bearer]",         path: `/v3/products/${ref}/medias?usage_right=${usageRight}`,             result: withMediasBearer },
    { label: "GET /v3/products?catalog_reference={ref} [Bearer]", path: `/v3/products?catalog_reference=${ref}&usage_right=${usageRight}`, result: byCatalogRefBearer },
  ];

  // Trouver le premier qui a retourné quelque chose d'utile
  let bestProduct: Record<string, unknown> | null = null;
  let bestEndpoint = "";

  for (const { label, result } of attempts) {
    const { ok, status, data } = result;
    let found = false;
    let itemCount: number | null = null;
    let dataShape = "null";

    if (data !== null) {
      if (Array.isArray(data)) {
        dataShape = `Array[${data.length}]`;
        itemCount = data.length;
        found     = data.length > 0;
      } else if (typeof data === "object") {
        const obj = data as Record<string, unknown>;
        dataShape = `Object{${Object.keys(obj).join(", ")}}`;
        // Vérifier si c'est une réponse paginée
        for (const key of ["items", "products", "data", "results", "produits"]) {
          if (Array.isArray(obj[key])) {
            itemCount = (obj[key] as unknown[]).length;
            dataShape = `Paginated{${key}[${itemCount}]}`;
            found = itemCount! > 0;
            break;
          }
        }
        // Objet produit direct ?
        if (obj.sku || obj.catalogReference || obj.reference || obj.id) {
          found = true;
          itemCount = 1;
          dataShape = `DirectProduct{${Object.keys(obj).slice(0, 6).join(", ")}...}`;
        }
      } else if (typeof data === "string" && (data as string).length > 10) {
        dataShape = `String(${(data as string).length} chars)`;
      }
    }

    console.log(`[${ok ? "✅" : "❌"}] ${label} → ${status} | ${dataShape}`);

    endpoints[label] = { url: `${BASE_URL}${attempts.find(a => a.label === label)?.path ?? ""}`, status, found, dataShape, itemCount };

    if (found && !bestProduct) {
      bestProduct   = extractFirst(data);
      bestEndpoint  = label;
    }
  }

  // 5. Analyse détaillée du meilleur produit trouvé
  let analysis: Record<string, unknown> = { found: false };

  if (bestProduct) {
    const medias  = analyzeMedias(bestProduct);
    const colors  = analyzeColors(bestProduct);
    const sizes   = analyzeSizes(bestProduct);

    console.log(`\n[TopTex Debug] Produit trouvé via : ${bestEndpoint}`);
    console.log(`  Clés : ${topLevelKeys(bestProduct).join(", ")}`);
    console.log(`  Médias : ${medias.map(m => `${m.field}(${m.count})`).join(", ") || "aucun"}`);
    console.log(`  Couleurs : ${colors ? `${colors.field}(${colors.count})` : "aucune"}`);
    console.log(`  Tailles : ${sizes ? `${sizes.field}(${sizes.count})` : "aucune"}`);

    analysis = {
      found:          true,
      via:            bestEndpoint,
      topLevelKeys:   topLevelKeys(bestProduct),
      medias,
      colors,
      sizes,
      // Champs d'identification présents
      identifiers: {
        sku:              bestProduct.sku              ?? null,
        catalogReference: bestProduct.catalogReference ?? null,
        reference:        bestProduct.reference        ?? null,
        id:               bestProduct.id               ?? null,
        modele:           bestProduct.modele           ?? null,
        code:             bestProduct.code             ?? null,
      },
      // Infos produit
      productInfo: {
        brand:        bestProduct.brand        ?? null,
        designation:  bestProduct.designation  ?? null,
        description:  bestProduct.description  ?? null,
        composition:  bestProduct.composition  ?? null,
        weight:       bestProduct.averageWeight ?? bestProduct.weight ?? null,
        category:     bestProduct.category     ?? null,
        gender:       bestProduct.gender       ?? bestProduct.genre   ?? null,
      },
      // Produit brut complet (limité aux 4 KB pour la lisibilité)
      rawProduct: bestProduct,
    };
  } else {
    console.log(`\n[TopTex Debug] ❌ Aucun produit trouvé pour : ${ref}`);
    console.log("  Tous les endpoints ont renvoyé vide ou une erreur.");
  }

  const response = {
    ref,
    timestamp:       new Date().toISOString(),
    authOk:          true,
    endpointsTested: endpoints,
    analysis,
    // Données brutes des endpoints utiles (pour inspection manuelle)
    rawResponses: {
      "sku [X-Toptex-Auth]":              bySku.data,
      "direct [X-Toptex-Auth]":           byRef.data,
      "catalog_reference [X-Toptex-Auth]":byCatalogReference.data,
      "search":                           bySearch.data,
      "q":                                byQ.data,
      "catalogReference (camelCase)":     byCatalogRef.data,
      "medias [X-Toptex-Auth]":           withMedias.data,
      "sku [Bearer]":                     bySkuBearer.data,
      "direct [Bearer]":                  byRefBearer.data,
      "catalog_reference [Bearer]":       byCatalogRefBearer.data,
      "medias [Bearer]":                  withMediasBearer.data,
    },
  };

  console.log(`[TopTex Debug] Terminé.`);

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type":  "application/json",
    },
  });
}
