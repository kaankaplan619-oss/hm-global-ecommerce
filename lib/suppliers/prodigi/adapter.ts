/**
 * lib/suppliers/prodigi/adapter.ts
 *
 * Adapter haut-niveau Prodigi — SERVER ONLY.
 *
 * Aucune création de commande n'est exposée en V1 (`createOrder` est un stub
 * `throw` volontaire). Lecture pure : catalogue + détail produit + quote.
 *
 * Source : https://www.prodigi.com/print-api/docs/
 */

import { pdFetch, isProdigiConfigured } from "./client";
import type {
  ProdigiProductDetail,
  ProdigiProductSummary,
  ProdigiQuoteParams,
  ProdigiQuoteResponse,
} from "./types";

export { isProdigiConfigured };

/**
 * Détails complets d'un produit Prodigi par SKU.
 * Endpoint : GET /products/{sku}
 */
export async function getProductDetail(sku: string): Promise<ProdigiProductDetail> {
  if (!sku) throw new Error("getProductDetail: SKU manquant");
  // Prodigi peut envelopper la réponse dans { outcome, product }
  const raw = await pdFetch<Record<string, unknown>>(`/products/${encodeURIComponent(sku)}`);
  if (raw && typeof raw === "object" && "product" in raw) {
    return raw.product as ProdigiProductDetail;
  }
  return raw as ProdigiProductDetail;
}

/**
 * Devis Prodigi — calcule prix + shipping pour un panier d'items vers un pays.
 * Endpoint : POST /quotes
 */
export async function quoteOrder(params: ProdigiQuoteParams): Promise<ProdigiQuoteResponse> {
  if (!params.destinationCountryCode) {
    throw new Error("quoteOrder: destinationCountryCode requis");
  }
  if (!Array.isArray(params.items) || params.items.length === 0) {
    throw new Error("quoteOrder: au moins un item requis");
  }
  return pdFetch<ProdigiQuoteResponse>("/quotes", {
    method: "POST",
    body: {
      shippingMethod: params.shippingMethod ?? "Standard",
      destinationCountryCode: params.destinationCountryCode,
      currencyCode: params.currencyCode,
      items: params.items,
      recipient: params.recipient,
    },
  });
}

/**
 * Tente de récupérer une liste de produits Prodigi.
 * Note : l'API publique Prodigi n'a PAS d'endpoint `/products` listing.
 * Cette fonction sert d'audit pour confirmer cette absence et explorer les
 * routes alternatives (`/skus`, `/catalogue`, etc.).
 *
 * Si aucune route ne fonctionne, retourne un tableau vide.
 */
export async function tryListProducts(): Promise<{
  endpointUsed: string;
  ok: boolean;
  products: ProdigiProductSummary[];
  rawSample?: unknown;
  error?: string;
}> {
  const candidates = ["/products", "/catalogue", "/skus", "/products/list"];
  for (const endpoint of candidates) {
    try {
      const raw = await pdFetch<unknown>(endpoint);
      // Plusieurs shapes possibles
      if (Array.isArray(raw)) {
        return {
          endpointUsed: endpoint,
          ok: true,
          products: raw as ProdigiProductSummary[],
          rawSample: raw.slice(0, 3),
        };
      }
      if (raw && typeof raw === "object") {
        const obj = raw as Record<string, unknown>;
        if (Array.isArray(obj.products)) {
          return {
            endpointUsed: endpoint,
            ok: true,
            products: obj.products as ProdigiProductSummary[],
            rawSample: (obj.products as unknown[]).slice(0, 3),
          };
        }
        if (Array.isArray(obj.skus)) {
          return {
            endpointUsed: endpoint,
            ok: true,
            products: (obj.skus as string[]).map((s) => ({ sku: s })),
            rawSample: (obj.skus as unknown[]).slice(0, 3),
          };
        }
        if (Array.isArray(obj.items)) {
          return {
            endpointUsed: endpoint,
            ok: true,
            products: obj.items as ProdigiProductSummary[],
            rawSample: (obj.items as unknown[]).slice(0, 3),
          };
        }
        // Échec silencieux, on tente le suivant
      }
    } catch {
      // Endpoint inexistant → tente le suivant
    }
  }
  return {
    endpointUsed: "(none)",
    ok: false,
    products: [],
    error: "Aucun endpoint de listing public n'a répondu. Prodigi documente l'accès par SKU connu uniquement (cf catalog officiel téléchargeable).",
  };
}

// ─── Stub commande désactivé V1 ──────────────────────────────────────────────

export function createOrder(): never {
  throw new Error(
    "createOrder: désactivé en V1 Prodigi. Audit lecture pure uniquement.",
  );
}
