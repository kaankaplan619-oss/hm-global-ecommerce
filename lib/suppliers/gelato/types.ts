/**
 * lib/suppliers/gelato/types.ts
 *
 * Types Gelato Print on Demand (server-only).
 *
 * Source : https://dashboard.gelato.com/docs/
 *
 * Gelato expose 3 sous-API :
 *   - product.gelatoapis.com   → catalogue, variantes, prix
 *   - order.gelatoapis.com     → commandes (déjà couvert par lib/gelato.ts)
 *   - shipment.gelatoapis.com  → tarifs livraison
 */

// ─── Catalogues (familles de produits) ───────────────────────────────────────

export interface GelatoCatalog {
  catalogUid: string;          // ex: "business-cards"
  title:      string;          // "Business Cards"
  productAttributes?: GelatoCatalogAttribute[];
}

export interface GelatoCatalogAttribute {
  productAttributeUid: string;     // ex: "Orientation", "PaperFormat"
  title:               string;
  values: {
    productAttributeValueUid: string; // ex: "85x55-mm"
    title:                    string;
  }[];
}

// ─── Produits (variantes par catalogue) ──────────────────────────────────────

export interface GelatoCatalogProduct {
  productUid: string;          // ex: "business_cards_pf_bx_pt_350-gsm-coated-silk_..."
  attributes: Record<string, string>;
  weight?:    { value: number; measureUnit: "grams" | "lbs" };
  dimensions?: {
    Width:  { value: number; measureUnit: "mm" | "inches" };
    Height: { value: number; measureUnit: "mm" | "inches" };
    Thickness?: { value: number; measureUnit: "mm" | "inches" };
  };
}

export interface GelatoCatalogProductsResponse {
  data: GelatoCatalogProduct[];
  pagination?: {
    total:  number;
    offset: number;
    limit:  number;
  };
}

// ─── Prix produit ────────────────────────────────────────────────────────────

export interface GelatoProductPrice {
  productUid:        string;
  country:           string;    // "FR"
  currency:          string;    // "EUR"
  quantity:          number;
  priceEUR:          number;    // prix unitaire HT en EUR (déduit ou direct)
  priceType?:        "default" | "promo";
}

// ─── Shipping ────────────────────────────────────────────────────────────────

export interface GelatoShippingOption {
  shipmentMethodName: string;
  shipmentMethodUid:  string;
  isBusiness?:        boolean;
  isPrivate?:         boolean;
  totalWeight?:       number;
  productionTime?:    { min: number; max: number; days: "businessDays" | "calendarDays" };
  deliveryTime?:      { min: number; max: number; days: "businessDays" | "calendarDays" };
  cost?:              { value: number; currency: string };
  type?:              "express" | "normal" | "economy";
}

// ─── Erreur typée ────────────────────────────────────────────────────────────

export class GelatoError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
    message: string,
  ) {
    super(`[Gelato] ${endpoint} → ${status}: ${message}`);
    this.name = "GelatoError";
  }
}
