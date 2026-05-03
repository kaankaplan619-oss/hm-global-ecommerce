/**
 * lib/printfulVariantMap.ts
 *
 * Mapping statique : (productId, colorId, size) → Printful catalog variant_id
 *
 * Les IDs ont été validés via l'API Printful authentifiée le 03/05/2026.
 * Store : 18115629 (Boutique de Kaan)
 * Produit : Gildan 5000 — Printful product_id 438
 *
 * Convention de clé : `{colorId}__{sizeLabel}`
 * Les tailles HM Global "XXL" → "2XL" sont normalisées automatiquement.
 */

// ─── Normalisation taille HM Global → Printful ────────────────────────────────
const HM_TO_PRINTFUL_SIZE: Record<string, string> = {
  XXL:  "2XL",
  XXXL: "3XL",
};

function normalizeSizeForPrintful(size: string): string {
  return HM_TO_PRINTFUL_SIZE[size] ?? size;
}

// ─── Gildan 5000 (product_id: 438) ───────────────────────────────────────────
// Couleurs HM Global → Printful color name
//   blanc      → White
//   noir       → Black
//   gris-sport → Sport Grey
//   marine     → Navy
//
// Format clé : `{hmColorId}__{printfulSize}`

const GILDAN_5000_VARIANTS: Record<string, number> = {
  // White — S/M/L/XL/XXL
  "blanc__S":   11576,
  "blanc__M":   11577,
  "blanc__L":   11578,
  "blanc__XL":  11579,
  "blanc__2XL": 11580,

  // Black — S/M/L/XL/XXL
  "noir__S":   11546,
  "noir__M":   11547,
  "noir__L":   11548,
  "noir__XL":  11549,
  "noir__2XL": 11550,

  // Sport Grey — S/M/L/XL/XXL
  "gris-sport__S":   11571,
  "gris-sport__M":   11572,
  "gris-sport__L":   11573,
  "gris-sport__XL":  11574,
  "gris-sport__2XL": 11575,

  // Navy — S/M/L/XL/XXL
  "marine__S":   11561,
  "marine__M":   11562,
  "marine__L":   11563,
  "marine__XL":  11564,
  "marine__2XL": 11565,
};

// ─── Map par product_id ───────────────────────────────────────────────────────

const PRODUCT_VARIANT_MAP: Record<string, Record<string, number>> = {
  "gildan-5000": GILDAN_5000_VARIANTS,
};

// ─── Printful product catalog IDs ────────────────────────────────────────────

export const PRINTFUL_PRODUCT_IDS: Record<string, number> = {
  "gildan-5000": 438,
};

// ─── Lookup public ────────────────────────────────────────────────────────────

/**
 * Retourne le Printful catalog variant_id pour un article HM Global.
 * Retourne null si le produit n'est pas dans le map Printful.
 */
export function getPrintfulVariantId(
  productId: string,
  colorId:   string,
  size:      string
): number | null {
  const productMap = PRODUCT_VARIANT_MAP[productId];
  if (!productMap) return null;
  const pfSize = normalizeSizeForPrintful(size);
  const key = `${colorId}__${pfSize}`;
  return productMap[key] ?? null;
}

/**
 * Vérifie qu'un produit HM Global est géré par Printful.
 */
export function isPrintfulProduct(productId: string): boolean {
  return productId in PRODUCT_VARIANT_MAP;
}
