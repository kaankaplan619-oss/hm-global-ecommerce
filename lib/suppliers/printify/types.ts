/**
 * lib/suppliers/printify/types.ts
 *
 * Types minimaux Printify (server-only).
 *
 * Source : https://developers.printify.com/
 *
 * Notes :
 * - Tous ces types reflètent la structure JSON brute Printify.
 * - Ils ne doivent JAMAIS être importés côté client.
 * - Pour exposer une vue normalisée HM, passer par `adapter.ts`.
 */

// ─── Shop (boutique liée au compte) ──────────────────────────────────────────

export interface PrintifyShop {
  id:    number;
  title: string;
  /** "shopify" | "etsy" | "custom_integration" | ... */
  sales_channel: string;
}

// ─── Catalogue (blueprints = modèles, ex: "Gildan 18500 Hoodie") ─────────────

export interface PrintifyBlueprint {
  id:          number;
  title:       string;
  description: string;
  brand:       string;          // "Gildan", "Bella+Canvas", "Cotton Heritage"...
  model:       string;          // "18500", "3001", "M2480"...
  images:      string[];        // URLs de photos catalogue
}

// ─── Print providers (fournisseurs d'impression pour un blueprint) ───────────

export interface PrintifyPrintProvider {
  id:       number;
  title:    string;
  location?: {
    country?: string;           // "US" | "GB" | "DE" | "NL" | ...
    region?:  string;
    city?:    string;
  };
}

// ─── Variants (couleur × taille × prix achat) ────────────────────────────────

export interface PrintifyVariant {
  id:    number;
  title: string;                // "White / S", "Black / M", etc.
  options?: {
    color?: string;
    size?:  string;
  };
  placeholders?: {
    position: string;           // "front" | "back" | "sleeve_left" | ...
    width:    number;
    height:   number;
  }[];
}

// ─── Variants catalogue (par blueprint + print provider) ─────────────────────

export interface PrintifyBlueprintVariantsResponse {
  id:       number;             // print_provider_id
  title:    string;
  variants: PrintifyVariant[];
}

// ─── Produit boutique (déjà créé sur Printify) ───────────────────────────────
// Note : pour l'audit, on n'utilise pas encore ce type — on lit le catalogue
// (blueprints) sans rien créer dans la boutique.

export interface PrintifyShopProduct {
  id:           string;
  title:        string;
  description:  string;
  blueprint_id: number;
  print_provider_id: number;
  variants:     {
    id:     number;
    price:  number;             // cents
    is_enabled: boolean;
  }[];
  images: {
    src:        string;
    variant_ids: number[];
    position:   "front" | "back" | "side";
    is_default: boolean;
  }[];
}

// ─── Upload & commandes (orders API) ─────────────────────────────────────────

/** Résultat de POST /v1/uploads/images.json (upload d'un visuel d'impression). */
export interface PrintifyUploadResult {
  id:           string;
  file_name:    string;
  width?:       number;
  height?:      number;
  preview_url?: string;
}

/** Image placée dans une zone d'impression (front/back). Coords 0..1. */
export interface PrintifyPlacedImage {
  /** id de l'image uploadée (PrintifyUploadResult.id) — champ `src` exigé par l'API order */
  src:   string;
  /** centre horizontal 0..1 */
  x:     number;
  /** centre vertical 0..1 */
  y:     number;
  /** échelle 0..1 relative à la largeur de la zone */
  scale: number;
  /** rotation en degrés */
  angle: number;
}

export interface PrintifyOrderLineItem {
  print_provider_id: number;
  blueprint_id:      number;
  variant_id:        number;
  quantity:          number;
  /** ex. { front: [PrintifyPlacedImage], back: [...] } */
  print_areas:       Record<string, PrintifyPlacedImage[]>;
}

export interface PrintifyAddressTo {
  first_name: string;
  last_name:  string;
  email?:     string;
  phone?:     string;
  /** Code pays ISO ("FR") */
  country:    string;
  region?:    string;
  address1:   string;
  address2?:  string;
  city:       string;
  zip:        string;
}

export interface PrintifyCreateOrderPayload {
  /** ID HM Global (order_number) pour retrouver la commande via webhook */
  external_id:                string;
  label?:                     string;
  line_items:                 PrintifyOrderLineItem[];
  /** 1 = standard */
  shipping_method:            number;
  send_shipping_notification: boolean;
  address_to:                 PrintifyAddressTo;
}

export interface PrintifyOrderResult {
  id:               string;
  status?:          string;
  external_id?:     string;
  total_price?:     number;
  total_shipping?:  number;
  [key: string]:    unknown;
}

// ─── Erreur typée pour l'app HM ──────────────────────────────────────────────

export class PrintifyError extends Error {
  constructor(
    public readonly status: number,
    public readonly endpoint: string,
    message: string,
  ) {
    super(`[Printify] ${endpoint} → ${status}: ${message}`);
    this.name = "PrintifyError";
  }
}
