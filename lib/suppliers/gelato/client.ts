/**
 * lib/suppliers/gelato/client.ts
 *
 * Client Gelato — SERVER ONLY.
 *
 * ⚠️  Ne jamais importer depuis un Client Component.
 *     Toutes les fonctions utilisent process.env.GELATO_API_KEY.
 *
 * Auth : Header X-API-KEY (clé du dashboard.gelato.com/keys).
 *
 * 3 base URLs :
 *   product.gelatoapis.com   — catalogue, prix
 *   order.gelatoapis.com     — orders (couvert par lib/gelato.ts existant)
 *   shipment.gelatoapis.com  — shipping options
 *
 * ─── STRATÉGIE BUSINESS V1 (décision Mai 2026) ──────────────────────────────
 *
 * Gelato API n'est PAS branché au front V1.
 * Audit prix a montré que Gelato est compétitif sur :
 *   - canvas (produit + framed)
 *   - hanging posters
 *   - framed posters
 *   - produits déco unitaires
 *
 * Gelato est NON COMPÉTITIF sur :
 *   - cartes de visite (2-3× plus cher que PrintOclock/Exaprint FR)
 *   - flyers grande quantité
 *   - affiches standard A3/A2
 *
 * → Pour V1 :
 *   - Print courant (cartes / flyers / affiches) = devis manuel via formulaire
 *     /contact?sujet=devis, traité ensuite via PrintOclock / Pixart / Exaprint
 *   - Canvas + framed/hanging posters = Gelato API en back-office uniquement
 *     (à brancher dans une V2 quand la chaîne devis/commande Gelato sera prête)
 *
 * → Ne PAS utiliser Gelato pour cartes de visite en automatique tant que les prix
 *   ne sont pas validés. Ce module reste disponible pour les audits et la
 *   future intégration canvas/framed.
 */

/*
 * ⚠️  SERVER ONLY — fichier consommé uniquement côté Node.
 *     Pas de dépendance "server-only" pour éviter d'ajouter un paquet.
 */

import {
  GelatoError,
  type GelatoCatalog,
  type GelatoCatalogProduct,
  type GelatoCatalogProductsResponse,
  type GelatoShippingOption,
} from "./types";

const PRODUCT_BASE  = process.env.GELATO_PRODUCT_BASE  ?? "https://product.gelatoapis.com";
const SHIPMENT_BASE = process.env.GELATO_SHIPMENT_BASE ?? "https://shipment.gelatoapis.com";

function getKey(): string {
  const k = process.env.GELATO_API_KEY;
  if (!k) throw new GelatoError(0, "(init)", "GELATO_API_KEY manquant dans .env.local");
  return k;
}

export function isGelatoConfigured(): boolean {
  return Boolean(process.env.GELATO_API_KEY);
}

// ─── Fetch interne ───────────────────────────────────────────────────────────

async function gFetch<T>(
  base: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "X-API-KEY":    getKey(),
      "Content-Type": "application/json",
      Accept:         "application/json",
      "User-Agent":    "HMGlobal/1.0 (gelato-audit)",
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GelatoError(res.status, path, body.slice(0, 300) || res.statusText);
  }
  return res.json() as Promise<T>;
}

// ─── Catalogues ──────────────────────────────────────────────────────────────

/** Liste tous les catalogues Gelato. */
export async function listCatalogs(): Promise<GelatoCatalog[]> {
  const json = await gFetch<{ data: GelatoCatalog[] }>(PRODUCT_BASE, "/v3/catalogs");
  return json.data ?? [];
}

/** Détail d'un catalogue (attributs disponibles : format, papier, finition, etc.). */
export async function getCatalog(catalogUid: string): Promise<GelatoCatalog> {
  return gFetch<GelatoCatalog>(PRODUCT_BASE, `/v3/catalogs/${catalogUid}`);
}

// ─── Produits du catalogue ───────────────────────────────────────────────────

/**
 * Liste les produits d'un catalogue avec leurs attributs.
 * Pagination : limit max 100 par appel.
 */
export async function listCatalogProducts(
  catalogUid: string,
  opts: { offset?: number; limit?: number; attributeFilters?: Record<string, string[]> } = {},
): Promise<GelatoCatalogProductsResponse> {
  return gFetch<GelatoCatalogProductsResponse>(
    PRODUCT_BASE,
    `/v3/catalogs/${catalogUid}/products:search`,
    {
      method: "POST",
      body: JSON.stringify({
        offset: opts.offset ?? 0,
        limit:  opts.limit  ?? 50,
        attributeFilters: opts.attributeFilters ?? {},
      }),
    },
  );
}

/** Récupère un produit Gelato par son UID. */
export async function getCatalogProduct(productUid: string): Promise<GelatoCatalogProduct> {
  return gFetch<GelatoCatalogProduct>(PRODUCT_BASE, `/v3/products/${productUid}`);
}

// ─── Prix produit ────────────────────────────────────────────────────────────

/**
 * Récupère les prix d'un produit pour un pays donné.
 * Retourne un tableau de paliers de quantité avec leurs prix unitaires.
 */
export async function getProductPrices(
  productUid: string,
  country: string,    // ISO 2 letters, ex "FR"
  currency: string = "EUR",
): Promise<Array<{
  productUid:        string;
  country:           string;
  quantity:          number;
  price:             number;
  currency:          string;
  pageCount?:        number;
}>> {
  return gFetch(
    PRODUCT_BASE,
    `/v3/products/${productUid}/prices?country=${country}&currency=${currency}`,
  );
}

// ─── Shipping ────────────────────────────────────────────────────────────────

/**
 * Récupère les options de livraison disponibles pour une adresse pays.
 * Endpoint Gelato officiel : POST /v1/shipment-methods
 */
export async function getShipmentMethods(country: string): Promise<GelatoShippingOption[]> {
  const json = await gFetch<{ shipmentMethods: GelatoShippingOption[] }>(
    SHIPMENT_BASE,
    `/v1/shipment-methods?country=${country}`,
  );
  return json.shipmentMethods ?? [];
}
