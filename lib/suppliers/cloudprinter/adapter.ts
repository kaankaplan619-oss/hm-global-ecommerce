/**
 * lib/suppliers/cloudprinter/adapter.ts
 *
 * Adapter haut-niveau Cloudprinter — SERVER ONLY.
 *
 * Ces fonctions sont les SEULES à importer depuis les routes API HM Global.
 * Elles encapsulent les endpoints Cloudprinter et normalisent les réponses
 * pour qu'elles soient typées et exploitables côté Next.js.
 *
 * ⚠️  AUCUNE FONCTION DE CRÉATION DE COMMANDE NE FAIT D'APPEL RÉEL EN V1.
 *     `createOrder` est commenté volontairement pour interdire toute fuite
 *     accidentelle. À déverrouiller plus tard, sur décision explicite.
 *
 * Source : https://docs.cloudprinter.com/
 */

import { cpFetch, isCloudprinterConfigured } from "./client";
import type {
  CloudprinterOrderInfoResponse,
  CloudprinterPriceLookupParams,
  CloudprinterPriceLookupResponse,
  CloudprinterProductInfo,
  CloudprinterProductListItem,
  CloudprinterProductsResponse,
  CloudprinterQuoteParams,
  CloudprinterQuoteResponse,
  CloudprinterShippingCountriesResponse,
  CloudprinterShippingCountry,
  CloudprinterShippingLevel,
  CloudprinterShippingLevelsResponse,
} from "./types";

// ─── Configuration ───────────────────────────────────────────────────────────

export { isCloudprinterConfigured };

// ─── Catalogue ───────────────────────────────────────────────────────────────

/**
 * Liste tous les produits disponibles sur le compte Cloudprinter.
 *
 * Retour normalisé : toujours un tableau `CloudprinterProductListItem[]`
 * (l'API peut renvoyer soit `{ products: [...] }`, soit un tableau racine).
 */
export async function listProducts(): Promise<CloudprinterProductListItem[]> {
  const data = await cpFetch<CloudprinterProductsResponse | CloudprinterProductListItem[]>(
    "/products",
  );
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.products)) return data.products;
  return [];
}

/**
 * Détails complets d'un produit (options, formats, etc.).
 *
 * @param reference Référence Cloudprinter du produit (ex: "businesscard_85x55_350g")
 */
export async function getProductInfo(reference: string): Promise<CloudprinterProductInfo> {
  if (!reference) {
    throw new Error("getProductInfo: référence manquante");
  }
  return cpFetch<CloudprinterProductInfo>("/products/info", { reference });
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

/**
 * Lookup de prix pour un produit + pays + devise + quantité.
 *
 * Endpoint Cloudprinter : POST /prices/lookup
 *
 * Format requis (vérifié live, mai 2026) : un tableau `items` au top-level
 * contenant `{ reference, count, options? }`. Le wrapping ici permet de
 * conserver une API utilisateur simple (`{reference, count, options}` direct)
 * tout en respectant la convention Cloudprinter.
 */
export async function lookupPrice(
  params: CloudprinterPriceLookupParams,
): Promise<CloudprinterPriceLookupResponse> {
  // Convention Cloudprinter live (mai 2026) :
  //   item = { reference: <ID ligne unique>, product_reference: <ref produit>, count, options? }
  //   - `reference` est un identifiant arbitraire de ligne (ex: "item-1")
  //   - `product_reference` est la vraie référence du produit Cloudprinter
  // Cloudprinter exige le champ `options` (tableau, vide accepté) sur l'item
  // de /prices/lookup et /orders/quote, sinon il throw "foreach() ... null".
  //
  // Format de chaque option dans le payload (différent de /products/info) :
  //   { type: "<sans prefix type_>", reference: "<ref>", count: 1 }
  // ⚠️  Mapping live (mai 2026) : nous laissons les callers décider du type
  // exact à envoyer (avec ou sans préfixe type_).
  const item: Record<string, unknown> = {
    reference: "audit-item-1",
    product_reference: params.reference,
    options: Array.isArray(params.options) ? params.options : [],
  };
  if (typeof params.count === "number") item.count = params.count;

  const payload: Record<string, unknown> = {
    country: params.country,
    items: [item],
  };
  if (params.currency) payload.currency = params.currency;

  return cpFetch<CloudprinterPriceLookupResponse>("/prices/lookup", payload);
}

// ─── Devis pré-commande (lecture seule) ──────────────────────────────────────

/**
 * Calcule un devis complet (items + shipping) sans créer de commande.
 *
 * Endpoint : POST /orders/quote
 *
 * Convention live Cloudprinter (mai 2026) :
 *   Le payload utilise items[] au top-level avec chaque item formé de
 *   `{reference, product_reference, count, options?}`. L'adresse est
 *   passée à plat (`country`, `zip`, `city`, `street1`) — pas dans un
 *   objet `address`. La devise et le shipping_level sont optionnels.
 *
 * Aucune commande n'est créée — c'est un appel lecture pure.
 */
export async function quoteOrder(params: CloudprinterQuoteParams): Promise<CloudprinterQuoteResponse> {
  if (!params.country) {
    throw new Error("quoteOrder: country requis");
  }
  if (!Array.isArray(params.items) || params.items.length === 0) {
    throw new Error("quoteOrder: au moins un item requis");
  }

  // Items au format Cloudprinter (snake_case)
  // Note : `options` doit toujours être présent (tableau, vide accepté) sinon
  // Cloudprinter throw "foreach() ... null". Confirmé live.
  const items = params.items.map((it) => {
    const item: Record<string, unknown> = {
      reference: it.reference,
      product_reference: it.productReference,
      count: it.count,
      options: Array.isArray(it.options) ? it.options : [],
    };
    return item;
  });

  const payload: Record<string, unknown> = {
    country: params.country,
    items,
  };
  if (params.currency) payload.currency = params.currency;
  if (params.shippingLevel) payload.shipping_level = params.shippingLevel;

  // Adresse à plat — Cloudprinter accepte les champs au top-level si présents
  if (params.address) {
    if (params.address.zip) payload.zip = params.address.zip;
    if (params.address.city) payload.city = params.address.city;
    if (params.address.street1) payload.street1 = params.address.street1;
  }

  return cpFetch<CloudprinterQuoteResponse>("/orders/quote", payload);
}

// ─── Shipping ────────────────────────────────────────────────────────────────

/**
 * Liste des pays supportés pour expédition.
 */
export async function listShippingCountries(): Promise<CloudprinterShippingCountry[]> {
  const data = await cpFetch<CloudprinterShippingCountriesResponse | CloudprinterShippingCountry[]>(
    "/shipping/countries",
  );
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.countries)) return data.countries;
  return [];
}

/**
 * Liste des niveaux d'expédition disponibles (saver, express, etc.).
 */
export async function listShippingLevels(): Promise<CloudprinterShippingLevel[]> {
  const data = await cpFetch<CloudprinterShippingLevelsResponse | CloudprinterShippingLevel[]>(
    "/shipping/levels",
  );
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.levels)) return data.levels;
  return [];
}

// ─── Suivi commande (lecture seule, optionnel) ───────────────────────────────

/**
 * Détails d'une commande existante (état, suivi, items).
 *
 * Endpoint : POST /orders/info
 *
 * Utile en V2 pour synchroniser le suivi commande avec Supabase.
 * Aucune fonction de création n'est exposée — voir le stub commenté ci-dessous.
 */
export async function getOrderInfo(reference: string): Promise<CloudprinterOrderInfoResponse> {
  if (!reference) {
    throw new Error("getOrderInfo: référence commande manquante");
  }
  return cpFetch<CloudprinterOrderInfoResponse>("/orders/info", { reference });
}

// ─── Stub commande — VOLONTAIREMENT NON IMPLÉMENTÉ ───────────────────────────

/**
 * createOrder — STUB.
 *
 * Cette fonction N'EST PAS implémentée en V1 et ne doit pas l'être tant que
 * la stratégie commerciale Cloudprinter n'est pas validée (cf
 * `docs/strategy/internal-textile-production.md` et `docs/audits/*`).
 *
 * Référence endpoint Cloudprinter : POST /orders/add
 * Pré-requis pour activation future :
 *   1. Tests sandbox concluants (catalogue + pricing + shipping)
 *   2. Décision V2 validée
 *   3. Webhook CloudSignal branché (suivi état commande)
 *   4. Logique BAT/preview gérée côté HM (Cloudprinter n'en fournit pas)
 *   5. Tests d'intégration Stripe → Cloudprinter avec rollback
 *
 * Pour éviter toute fuite accidentelle, on lance une erreur explicite.
 */
export function createOrder(): never {
  throw new Error(
    "createOrder: désactivé en V1. Voir docs/strategy/* avant activation.",
  );
}

/*
 * Implémentation cible (à réactiver UNIQUEMENT sur décision explicite) :
 *
 * export async function createOrder(payload: CloudprinterOrderPayload) {
 *   return cpFetch("/orders/add", {
 *     reference: payload.reference,
 *     email: payload.email,
 *     items: payload.items,
 *     addresses: payload.addresses,
 *     shipping_level: payload.shippingLevel,
 *   });
 * }
 */
