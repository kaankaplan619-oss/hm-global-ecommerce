/**
 * lib/gelato.ts
 *
 * Client API Gelato Print on Demand — SERVER SIDE ONLY.
 * Ne jamais importer depuis des composants client.
 *
 * Variables d'environnement requises :
 *   GELATO_API_KEY   — Clé API générée sur dashboard.gelato.com/keys
 *   GELATO_API_BASE  — (optionnel) défaut : https://order.gelatoapis.com
 *
 * Documentation : https://dashboard.gelato.com/docs/
 */

const ORDER_BASE   = process.env.GELATO_API_BASE    ?? "https://order.gelatoapis.com";
const PRODUCT_BASE = process.env.GELATO_PRODUCT_BASE ?? "https://product.gelatoapis.com";
const API_KEY      = process.env.GELATO_API_KEY       ?? "";

export function isGelatoConfigured(): boolean {
  return Boolean(API_KEY);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GelatoAddress {
  firstName:   string;
  lastName:    string;
  addressLine1: string;
  addressLine2?: string;
  city:        string;
  postCode:    string;
  country:     string; // code ISO 2 lettres ex: "FR"
  email:       string;
  phone?:      string;
  companyName?: string;
}

export interface GelatoOrderItem {
  itemReferenceId: string;   // ID unique côté HM Global
  productUid:      string;   // UID produit Gelato (ex: "business_cards_...")
  files: {
    type:  "default" | "front" | "back";
    url:   string;           // URL publique du fichier PDF/PNG
  }[];
  quantity: number;
}

export interface GelatoCreateOrderPayload {
  orderReferenceId: string;  // Numéro de commande HM Global
  customerReferenceId?: string;
  currency:         string;  // "EUR"
  items:            GelatoOrderItem[];
  shippingAddress:  GelatoAddress;
  returnAddress?:   GelatoAddress;
  metadata?: Record<string, string>;
}

export interface GelatoOrder {
  id:               string;
  orderReferenceId: string;
  fulfillmentStatus: string;
  financialStatus:  string;
  currency:         string;
  items:            GelatoOrderItem[];
  shippingAddress:  GelatoAddress;
  created:          string;
  modified:         string;
}

export interface GelatoProductDimension {
  name:           string;
  nameFormatted:  string;
  value:          string;
  valueFormatted: string;
}

export interface GelatoProduct {
  id:             string;
  productUid:     string;
  productNameUid: string;
  productTypeUid: string;
  title?:         string;
  dimensions:     GelatoProductDimension[];
  // Anciens champs (compatibilité)
  uid?:           string;
  productType?:   string;
  variants?:      GelatoProductVariant[];
}

export interface GelatoProductVariant {
  uid:         string;
  title:       string;
  attributes:  Record<string, string>;
}

// ─── Helper fetch ─────────────────────────────────────────────────────────────

async function gelatoFetch<T>(
  path: string,
  options: RequestInit = {},
  base?: string
): Promise<T> {
  if (!API_KEY) {
    throw new Error("GELATO_API_KEY non configurée dans les variables d'environnement.");
  }

  const url = `${base ?? ORDER_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "X-API-KEY":   API_KEY,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gelato API ${res.status} — ${path} : ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Commandes ────────────────────────────────────────────────────────────────

/**
 * Crée une commande Gelato.
 * Les commandes sont lancées en production immédiatement.
 */
export async function createGelatoOrder(
  payload: GelatoCreateOrderPayload
): Promise<GelatoOrder> {
  return gelatoFetch<GelatoOrder>("/v4/orders", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
}

/**
 * Récupère une commande Gelato par son ID.
 */
export async function getGelatoOrder(orderId: string): Promise<GelatoOrder> {
  return gelatoFetch<GelatoOrder>(`/v4/orders/${orderId}`);
}

/**
 * Annule une commande Gelato (possible uniquement si non encore en production).
 */
export async function cancelGelatoOrder(orderId: string): Promise<void> {
  await gelatoFetch(`/v4/orders/${orderId}/cancel`, { method: "POST" });
}

// ─── Produits ─────────────────────────────────────────────────────────────────

/**
 * Récupère la liste des produits Gelato disponibles.
 */
export async function getGelatoProducts(): Promise<GelatoProduct[]> {
  const res = await gelatoFetch<{ products: GelatoProduct[] }>("/v3/products", {}, PRODUCT_BASE);
  return res.products;
}

/**
 * Récupère un produit Gelato par son UID.
 */
export async function getGelatoProduct(productUid: string): Promise<GelatoProduct> {
  return gelatoFetch<GelatoProduct>(`/v3/products/${productUid}`, {}, PRODUCT_BASE);
}

// ─── Prix ─────────────────────────────────────────────────────────────────────

export interface GelatoPriceResult {
  productUid:    string;
  quantity:      number;
  currency:      string;
  price:         number;
  shippingPrice: number;
}

/**
 * Obtient un prix pour un produit/quantité/destination.
 */
export async function getGelatoPrice(params: {
  productUid: string;
  quantity:   number;
  country:    string;
  currency?:  string;
}): Promise<GelatoPriceResult> {
  return gelatoFetch<GelatoPriceResult>("/v4/products/prices", {
    method: "POST",
    body: JSON.stringify({
      productUid: params.productUid,
      quantity:   params.quantity,
      country:    params.country,
      currency:   params.currency ?? "EUR",
    }),
  });
}

// ─── Helpers adresse ──────────────────────────────────────────────────────────

/**
 * Convertit une adresse HM Global → format Gelato.
 */
export function mapHMAddressToGelato(
  addr: Record<string, string>,
  email: string
): GelatoAddress {
  return {
    firstName:    addr.firstName ?? "",
    lastName:     addr.lastName  ?? "",
    addressLine1: addr.street    ?? "",
    addressLine2: addr.complement,
    city:         addr.city      ?? "",
    postCode:     addr.postalCode ?? "",
    country:      addr.country === "France" ? "FR" : (addr.country ?? "FR"),
    email,
    phone:        addr.phone,
    companyName:  addr.company,
  };
}
