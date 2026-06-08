/**
 * lib/printfulVariantMap.ts
 *
 * Mapping statique : (productId, colorId, size) → Printful catalog variant_id
 *
 * Validés via l'API Printful authentifiée le 03/05/2026.
 * Store : 18115629 (Boutique de Kaan)
 *
 * Produits V1 Printful :
 *   Gildan 5000        — Printful product_id 438
 *   Bella+Canvas 3001  — Printful product_id 71
 *   Gildan 18000       — Printful product_id 145
 *   Gildan 18500       — Printful product_id 146
 *
 * Convention de clé : `{hmColorId}__{printfulSize}`
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
  // White — S/M/L/XL/2XL
  "blanc__S":   11576,
  "blanc__M":   11577,
  "blanc__L":   11578,
  "blanc__XL":  11579,
  "blanc__2XL": 11580,

  // Black — S/M/L/XL/2XL
  "noir__S":   11546,
  "noir__M":   11547,
  "noir__L":   11548,
  "noir__XL":  11549,
  "noir__2XL": 11550,

  // Navy — S/M/L/XL/2XL
  "marine__S":   11561,
  "marine__M":   11562,
  "marine__L":   11563,
  "marine__XL":  11564,
  "marine__2XL": 11565,

  // Dark Heather — S/M/L/XL/2XL
  "dark-heather__S":   15843,
  "dark-heather__M":   15844,
  "dark-heather__L":   15845,
  "dark-heather__XL":  15846,
  "dark-heather__2XL": 15847,
};

// ─── Bella+Canvas 3001 (product_id: 71) ──────────────────────────────────────
// Couleurs HM Global → Printful color name
//   noir   → Black
//   blanc  → Solid White Blend
//   marine → Heather Midnight Navy

const BELLA_3001_VARIANTS: Record<string, number> = {
  // Black — S/M/L/XL/2XL
  "noir__S":   4016,
  "noir__M":   4017,
  "noir__L":   4018,
  "noir__XL":  4019,
  "noir__2XL": 4020,

  // Solid White Blend — S/M/L/XL/2XL
  "blanc__S":   24352,
  "blanc__M":   24353,
  "blanc__L":   24354,
  "blanc__XL":  24355,
  "blanc__2XL": 24356,

  // Heather Midnight Navy — S/M/L/XL/2XL
  "marine__S":   8495,
  "marine__M":   8496,
  "marine__L":   8497,
  "marine__XL":  8498,
  "marine__2XL": 8499,
};

// ─── Gildan 18000 Sweatshirt (product_id: 145) ────────────────────────────────
// Couleurs HM Global → Printful color name
//   noir       → Black
//   marine     → Navy
//   gris-sport → Sport Grey

const GILDAN_18000_VARIANTS: Record<string, number> = {
  // Black — S/M/L/XL/2XL
  "noir__S":   5434,
  "noir__M":   5435,
  "noir__L":   5436,
  "noir__XL":  5437,
  "noir__2XL": 5438,

  // Navy — S/M/L/XL/2XL
  "marine__S":   5498,
  "marine__M":   5499,
  "marine__L":   5500,
  "marine__XL":  5501,
  "marine__2XL": 5502,

  // Sport Grey — S/M/L/XL/2XL
  "gris-sport__S":   5514,
  "gris-sport__M":   5515,
  "gris-sport__L":   5516,
  "gris-sport__XL":  5517,
  "gris-sport__2XL": 5518,
};

// ─── Gildan 18500 Hoodie (product_id: 146) ────────────────────────────────────
// Couleurs HM Global → Printful color name
//   noir       → Black
//   blanc      → White
//   marine     → Navy
//   gris-sport → Sport Grey

const GILDAN_18500_VARIANTS: Record<string, number> = {
  // Black — S/M/L/XL/2XL
  "noir__S":   5530,
  "noir__M":   5531,
  "noir__L":   5532,
  "noir__XL":  5533,
  "noir__2XL": 5534,

  // White — S/M/L/XL/2XL
  "blanc__S":   5522,
  "blanc__M":   5523,
  "blanc__L":   5524,
  "blanc__XL":  5525,
  "blanc__2XL": 5526,

  // Navy — S/M/L/XL/2XL
  "marine__S":   5594,
  "marine__M":   5595,
  "marine__L":   5596,
  "marine__XL":  5597,
  "marine__2XL": 5598,

  // Sport Grey — S/M/L/XL/2XL
  "gris-sport__S":   5610,
  "gris-sport__M":   5611,
  "gris-sport__L":   5612,
  "gris-sport__XL":  5613,
  "gris-sport__2XL": 5614,
};

// ─── Polo Gildan 64800 piqué (product_id: 670) ────────────────────────────────
// Broderie uniquement (Printful : embroidery_chest_left + manches).
// Couleurs HM Global → Printful : noir → Black, marine → Navy,
// gris-sport → Sport Grey, blanc → White. Tailles S–XXL (XXL → 2XL normalisé).

const GILDAN_64800_VARIANTS: Record<string, number> = {
  "noir__S":   16752,
  "noir__M":   16753,
  "noir__L":   16754,
  "noir__XL":  16755,
  "noir__2XL": 16756,

  "marine__S":   16759,
  "marine__M":   16760,
  "marine__L":   16761,
  "marine__XL":  16762,
  "marine__2XL": 16763,

  "gris-sport__S":   16766,
  "gris-sport__M":   16767,
  "gris-sport__L":   16768,
  "gris-sport__XL":  16784,
  "gris-sport__2XL": 16769,

  "blanc__S":   16772,
  "blanc__M":   16773,
  "blanc__L":   16774,
  "blanc__XL":  16775,
  "blanc__2XL": 16776,
};

// ─── Casquette Flexfit 6277 (product_id: 140) ─────────────────────────────────
// Couleurs HM Global → Printful color name
//   noir       → Black          marine → Navy        gris → Dark Grey
//   kaki       → Khaki          rouge  → Red          bleu-royal → Royal
//   blanc      → White
// Tailles : S/M et L/XL (pas de normalisation, clé exacte)

const CASQUETTE_FLEXFIT_6277_VARIANTS: Record<string, number> = {
  "noir__S/M":        5276,
  "noir__L/XL":       5277,
  "marine__S/M":      5278,
  "marine__L/XL":     5279,
  "gris__S/M":        5282,
  "gris__L/XL":       5283,
  "kaki__S/M":        5292,
  "kaki__L/XL":       5293,
  "rouge__S/M":       5288,
  "rouge__L/XL":      5289,
  "bleu-royal__S/M":  5286,
  "bleu-royal__L/XL": 5287,
  "blanc__S/M":       5274,
  "blanc__L/XL":      5275,
};

// ─── Casquette Yupoong 6006 trucker (product_id: 100) ─────────────────────────
// Couleurs HM Global → Printful color name
//   noir → Black   anthracite → Charcoal   marine → Navy   blanc → White
// Taille unique : "One size"

const CASQUETTE_YUPOONG_6006_VARIANTS: Record<string, number> = {
  "noir__One size":       4811,
  "anthracite__One size": 4814,
  "marine__One size":     4816,
  "blanc__One size":      4810,
};

// ─── Map par product_id ───────────────────────────────────────────────────────

const PRODUCT_VARIANT_MAP: Record<string, Record<string, number>> = {
  "gildan-5000":  GILDAN_5000_VARIANTS,
  "bella-3001":   BELLA_3001_VARIANTS,
  "gildan-18000": GILDAN_18000_VARIANTS,
  "gildan-18500": GILDAN_18500_VARIANTS,
  // gildan-64800 (polo) : retiré de l'auto-fulfillment Printful — Printful ne fait
  // que la broderie cœur, pas le dos. Le polo (cœur + dos) passe par Printify en
  // traitement atelier manuel. GILDAN_64800_VARIANTS conservé pour référence.
  "casquette-flexfit-6277": CASQUETTE_FLEXFIT_6277_VARIANTS,
  "casquette-yupoong-6006": CASQUETTE_YUPOONG_6006_VARIANTS,
};

// ─── Printful product catalog IDs ────────────────────────────────────────────

export const PRINTFUL_PRODUCT_IDS: Record<string, number> = {
  "gildan-5000":  438,
  "bella-3001":   71,
  "gildan-18000": 145,
  "gildan-18500": 146,
  "casquette-flexfit-6277": 140,
  "casquette-yupoong-6006": 100,
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
