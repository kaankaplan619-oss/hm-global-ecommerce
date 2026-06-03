/**
 * lib/suppliers/cloudprinter/types.ts
 *
 * Types Cloudprinter (cloudcore 1.0) — partagés client/adapter/routes.
 *
 * ⚠️  SERVER ONLY — ces types peuvent être importés côté client mais
 *     toutes les FONCTIONS qui les consomment vivent côté serveur uniquement.
 *
 * Source de vérité : https://docs.cloudprinter.com/ (cloudcore 1.0)
 *
 * Convention :
 *   - Toutes les requêtes sont POST avec `{ apikey, ...payload }` dans le body
 *   - Toutes les réponses sont JSON
 *   - Champs nullable signalés explicitement
 */

// ─── Erreur typée ────────────────────────────────────────────────────────────

export class CloudprinterError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "CloudprinterError";
  }
}

// ─── Produits ────────────────────────────────────────────────────────────────

/**
 * Item retourné par /products (liste compacte).
 * Les noms exacts des champs sont validés à runtime ; la structure ici
 * couvre les variants connus de la doc.
 */
export interface CloudprinterProductListItem {
  reference: string;
  name?: string;
  /** Catégorie (ex: "Businesscard", "Flyer", "Poster", "Canvas") */
  category?: string;
  /** Sous-catégorie éventuelle */
  subcategory?: string;
  /** Description courte */
  description?: string;
  /** Champ image éventuel — à confirmer en audit live */
  image?: string;
  /** Permet de capturer tout champ image-like additionnel */
  [k: string]: unknown;
}

export interface CloudprinterProductsResponse {
  products?: CloudprinterProductListItem[];
  /** Cloudprinter peut retourner directement un tableau racine */
  [k: string]: unknown;
}

/**
 * Détails d'un produit (réponse de /products/info).
 * La structure réelle inclut typiquement options, paper specs, finitions, etc.
 */
export interface CloudprinterProductInfo {
  reference?: string;
  name?: string;
  category?: string;
  /** Options de configuration (pages, finitions, papier...) */
  options?: Array<{
    type?: string;
    option?: string;
    name?: string;
    values?: Array<{ value: string; name?: string; default?: boolean }>;
  }>;
  /** Tailles disponibles */
  sizes?: Array<{
    name?: string;
    width?: number;
    height?: number;
    unit?: string;
  }>;
  /** Image marketing si présente — à confirmer */
  image?: string;
  /** Tout autre champ pour audit */
  [k: string]: unknown;
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

/**
 * Format Cloudprinter pour une option de configuration produit.
 *
 * Confirmé live (mai 2026) après probe de 9 shapes différents :
 *   - clé `option`            = nom de la famille SANS préfixe `type_`
 *     (ex: "product_material" pas "type_product_material")
 *   - clé `option_reference`  = valeur sélectionnée
 *     (ex: "paper_300off")
 *   - clé `count`             = multiplicateur, toujours 1 sauf cas spécifique
 *
 * 3 variantes acceptées par Cloudprinter (toutes retournent le même prix) :
 *   1. {option: "product_material",  option_reference: "paper_300off", count: 1}  ← standard
 *   2. {option: "paper",             option_reference: "paper_300off", count: 1}  ← shortcut paper
 *   3. {option_type: "product_material", option_reference: "...", count: 1}        ← alt
 *
 * On utilise la variante #1 (la plus explicite).
 */
export interface CloudprinterOption {
  /** Nom de la famille d'options SANS préfixe `type_` (ex: "product_material") */
  option: string;
  /** Référence de la valeur sélectionnée (ex: "paper_300off") */
  option_reference: string;
  /** Multiplicateur — toujours 1 sauf cas spécifique */
  count?: number;
}

export interface CloudprinterPriceLookupParams {
  reference: string;
  /** Code pays ISO (ex: "FR") */
  country: string;
  /** Devise (ex: "EUR") */
  currency?: string;
  /** Quantité */
  count?: number;
  /**
   * Options spécifiques au produit (papier, finition, etc.).
   * Format Cloudprinter : tableau d'objets `{type, reference}`.
   * Si absent ou tableau vide → Cloudprinter applique ses défauts internes.
   */
  options?: CloudprinterOption[];
}

export interface CloudprinterPriceLookupResponse {
  reference?: string;
  /** Prix HT (selon le payload de l'API) */
  price?: number | string;
  vat?: number | string;
  /** Devise retournée */
  currency?: string;
  /** Liste de prix par palier si applicable */
  prices?: Array<{
    count: number;
    price: number | string;
    currency?: string;
  }>;
  [k: string]: unknown;
}

// ─── Shipping ────────────────────────────────────────────────────────────────

export interface CloudprinterShippingCountry {
  country: string;
  name?: string;
  [k: string]: unknown;
}

export interface CloudprinterShippingCountriesResponse {
  countries?: CloudprinterShippingCountry[];
  [k: string]: unknown;
}

export interface CloudprinterShippingLevel {
  level: string;
  name?: string;
  description?: string;
  [k: string]: unknown;
}

export interface CloudprinterShippingLevelsResponse {
  levels?: CloudprinterShippingLevel[];
  [k: string]: unknown;
}

// ─── Quote (pré-order, lecture seule en V1) ──────────────────────────────────

/**
 * Item d'un devis Cloudprinter.
 *
 * Convention live (mai 2026) :
 *   - `reference` est un ID arbitraire de ligne (ex: "quote-item-1")
 *   - `product_reference` est la vraie référence Cloudprinter du produit
 *   - `count` est la quantité
 *   - `options` est optionnel — défauts Cloudprinter si absent
 */
export interface CloudprinterQuoteItem {
  /** ID de ligne unique dans le devis (arbitraire) */
  reference: string;
  /** Référence Cloudprinter du produit (ex: "businesscard_ss_int_bc_fc") */
  productReference: string;
  /** Quantité */
  count: number;
  /** Options du produit — tableau `{type, reference}`. Défauts si absent. */
  options?: CloudprinterOption[];
}

/**
 * Adresse pour calcul de shipping Cloudprinter.
 * Champs minimaux pour /orders/quote — l'API peut exiger plus pour /orders/add.
 */
export interface CloudprinterQuoteAddress {
  country: string;
  zip?: string;
  city?: string;
  street1?: string;
}

export interface CloudprinterQuoteParams {
  /** Pays destinataire ISO (fallback si pas d'adresse complète) */
  country: string;
  /** Devise */
  currency?: string;
  /** Niveau d'expédition Cloudprinter (ex: "cp_saver", "cp_dhl_express") */
  shippingLevel?: string;
  /** Items à devis */
  items: CloudprinterQuoteItem[];
  /** Adresse complète (souvent requise pour shipping) */
  address?: CloudprinterQuoteAddress;
}

export interface CloudprinterQuoteResponse {
  /** Devis détaillé avec frais et items */
  total?: number | string;
  shipping?: number | string;
  currency?: string;
  items?: Array<{
    reference: string;
    count: number;
    price?: number | string;
  }>;
  [k: string]: unknown;
}

// ─── Order info (lecture seule) ──────────────────────────────────────────────

export interface CloudprinterOrderInfoResponse {
  reference?: string;
  state?: string;
  state_name?: string;
  items?: Array<{
    reference?: string;
    count?: number;
    state?: string;
  }>;
  shipments?: Array<{
    tracking?: string;
    state?: string;
  }>;
  [k: string]: unknown;
}
