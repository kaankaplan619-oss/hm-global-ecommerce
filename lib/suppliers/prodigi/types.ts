/**
 * lib/suppliers/prodigi/types.ts
 *
 * Types Prodigi Print API v4.0 — partagés client/adapter/routes.
 *
 * ⚠️  SERVER ONLY pour les fonctions ; ces types peuvent être importés
 *     côté client mais aucune fonction de fetch n'est exposée au front.
 *
 * Source : https://www.prodigi.com/print-api/docs/
 * Sandbox base URL : https://api.sandbox.prodigi.com/v4.0/
 * Production base URL : https://api.prodigi.com/v4.0/
 * Auth : header `X-API-Key`
 */

// ─── Erreur typée ────────────────────────────────────────────────────────────

export class ProdigiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ProdigiError";
  }
}

// ─── Catalogue ───────────────────────────────────────────────────────────────

/**
 * Élément retourné par la liste de SKUs Prodigi (catalogue compact).
 * La structure exacte varie ; on capture tolérantément.
 */
export interface ProdigiProductSummary {
  sku?: string;
  description?: string;
  /** Catégorie / famille (canvas, framed prints, posters, apparel, etc.) */
  productType?: string;
  /** Champ image éventuel — à confirmer en audit live */
  image?: string;
  thumbnail?: string;
  preview?: string;
  /** Capture tout autre champ pour audit */
  [k: string]: unknown;
}

/**
 * Détails complets d'un produit Prodigi (réponse de `/products/{sku}`).
 */
export interface ProdigiProductDetail {
  sku?: string;
  description?: string;
  productType?: string;
  /** Dimensions disponibles */
  productDimensions?: Array<{
    width?: number;
    height?: number;
    units?: string;
  }>;
  /** Attributs (couleurs, finitions, etc.) */
  attributes?: Record<string, unknown>;
  /** Variantes possibles (papier, finitions, tailles) */
  variants?: Array<Record<string, unknown>>;
  /** Champs image-like potentiellement présents */
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  preview?: string;
  mockup?: string;
  assets?: unknown;
  /** Files de print spécifications */
  printAreas?: Record<string, unknown>;
  [k: string]: unknown;
}

// ─── Quote / pricing (lecture seule en V1) ──────────────────────────────────

export interface ProdigiQuoteRecipientAddress {
  countryCode: string;
  postalOrZipCode?: string;
  townOrCity?: string;
  line1?: string;
}

export interface ProdigiQuoteItem {
  sku: string;
  copies: number;
  /** Optionnel : URL HTTPS du fichier client */
  assets?: Array<{ printArea?: string; url?: string }>;
  attributes?: Record<string, string>;
}

export interface ProdigiQuoteParams {
  /** Niveau d'expédition Prodigi (Standard / Express / Overnight) */
  shippingMethod?: "Budget" | "Standard" | "Express" | "Overnight";
  destinationCountryCode: string;
  items: ProdigiQuoteItem[];
  /** Adresse complète si requise */
  recipient?: { address?: ProdigiQuoteRecipientAddress };
  currencyCode?: string;
}

export interface ProdigiQuoteResponse {
  outcome?: string;
  quotes?: Array<{
    shipmentMethod?: string;
    costSummary?: {
      items?: { amount?: string; currency?: string };
      shipping?: { amount?: string; currency?: string };
      totalCost?: { amount?: string; currency?: string };
      totalTax?: { amount?: string; currency?: string };
    };
    items?: Array<Record<string, unknown>>;
    shipments?: Array<Record<string, unknown>>;
  }>;
  issues?: Array<Record<string, unknown>>;
  [k: string]: unknown;
}
