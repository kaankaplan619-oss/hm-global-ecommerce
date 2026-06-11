/**
 * lib/printfulVariantMap.ts
 *
 * Mapping statique : (productId, colorId, size) → Printful catalog variant_id
 *
 * RÈGLE MÉTIER (Kaan, 2026-06-11) : ce map est la source de vérité de ce qui
 * est vendable en POD Printful. Toute combinaison couleur×taille ABSENTE d'ici
 * ne doit PAS être proposée sur le site (on ne vend pas ce qui n'existe pas).
 * Les tailles/couleurs des produits dans data/products.ts sont alignées dessus.
 *
 * IDs validés via l'API catalogue Printful (GET /products/{id}) le 2026-06-11,
 * avec vérification du stock région EU (expéditions France) :
 *   Gildan 5000          — catalog 438 — 6 couleurs × S-2XL, tout EU in_stock
 *   Bella+Canvas 3001    — catalog 71  — 6 couleurs × S-2XL (XS absent pour
 *                          True Royal, 3XL+ hors stock EU sur la moitié des
 *                          couleurs → gamme limitée à S-2XL)
 *   Gildan 18000         — catalog 145 — 5 couleurs × S-3XL (4XL/5XL hors
 *                          stock EU pour Navy/Red → gamme limitée à S-3XL)
 *   Gildan 18500         — catalog 146 — 6 couleurs × S-3XL (Royal n'existe
 *                          pas en 4XL/5XL → gamme limitée à S-3XL)
 *   Comfort Colors 1717  — catalog 586 — 5 couleurs × S-2XL (Red retiré :
 *                          3 tailles sur 5 hors stock EU ; alternative complète
 *                          si besoin plus tard : Paprika #fe4747)
 * Store : 18115629 (Boutique de Kaan)
 *
 * Convention de clé : `{hmColorId}__{printfulSize}`
 * Les tailles HM Global "XXL" → "2XL" / "XXXL" → "3XL" sont normalisées.
 */

// ─── Normalisation taille HM Global → Printful ────────────────────────────────
const HM_TO_PRINTFUL_SIZE: Record<string, string> = {
  XXL:  "2XL",
  XXXL: "3XL",
};

function normalizeSizeForPrintful(size: string): string {
  return HM_TO_PRINTFUL_SIZE[size] ?? size;
}

// ─── Gildan 5000 (catalog 438) — 6 couleurs × S-2XL ───────────────────────────
// blanc → White · noir → Black · gris → Sport Grey · marine → Navy ·
// rouge → Red · royal → Royal

const GILDAN_5000_VARIANTS: Record<string, number> = {
  // White
  "blanc__S":   11576,
  "blanc__M":   11577,
  "blanc__L":   11578,
  "blanc__XL":  11579,
  "blanc__2XL": 11580,

  // Black
  "noir__S":   11546,
  "noir__M":   11547,
  "noir__L":   11548,
  "noir__XL":  11549,
  "noir__2XL": 11550,

  // Sport Grey
  "gris__S":   11571,
  "gris__M":   11572,
  "gris__L":   11573,
  "gris__XL":  11574,
  "gris__2XL": 11575,

  // Navy
  "marine__S":   11561,
  "marine__M":   11562,
  "marine__L":   11563,
  "marine__XL":  11564,
  "marine__2XL": 11565,

  // Red
  "rouge__S":   11566,
  "rouge__M":   11567,
  "rouge__L":   11568,
  "rouge__XL":  11569,
  "rouge__2XL": 11570,

  // Royal
  "royal__S":   15879,
  "royal__M":   15880,
  "royal__L":   15881,
  "royal__XL":  15882,
  "royal__2XL": 15883,
};

// ─── Bella+Canvas 3001 (catalog 71) — 6 couleurs × S-2XL ─────────────────────
// noir → Black · blanc → White (100 % coton, conforme à la fiche produit —
// l'ancien mapping "Solid White Blend" était un mélange polyester) ·
// marine → Navy (uni, conforme au mockup — l'ancien "Heather Midnight Navy"
// était chiné) · athletic-heather → Athletic Heather · true-royal → True Royal ·
// rouge → Red

const BELLA_3001_VARIANTS: Record<string, number> = {
  // Black
  "noir__S":   4016,
  "noir__M":   4017,
  "noir__L":   4018,
  "noir__XL":  4019,
  "noir__2XL": 4020,

  // White
  "blanc__S":   4011,
  "blanc__M":   4012,
  "blanc__L":   4013,
  "blanc__XL":  4014,
  "blanc__2XL": 4015,

  // Navy
  "marine__S":   4111,
  "marine__M":   4112,
  "marine__L":   4113,
  "marine__XL":  4114,
  "marine__2XL": 4115,

  // Athletic Heather
  "athletic-heather__S":   6948,
  "athletic-heather__M":   6949,
  "athletic-heather__L":   6950,
  "athletic-heather__XL":  6951,
  "athletic-heather__2XL": 6952,

  // True Royal
  "true-royal__S":   4171,
  "true-royal__M":   4172,
  "true-royal__L":   4173,
  "true-royal__XL":  4174,
  "true-royal__2XL": 4175,

  // Red
  "rouge__S":   4141,
  "rouge__M":   4142,
  "rouge__L":   4143,
  "rouge__XL":  4144,
  "rouge__2XL": 4145,
};

// ─── Gildan 18000 Sweatshirt (catalog 145) — 5 couleurs × S-3XL ──────────────
// noir → Black · marine → Navy · gris-sport → Sport Grey · blanc → White ·
// rouge → Red

const GILDAN_18000_VARIANTS: Record<string, number> = {
  // Black
  "noir__S":   5434,
  "noir__M":   5435,
  "noir__L":   5436,
  "noir__XL":  5437,
  "noir__2XL": 5438,
  "noir__3XL": 5439,

  // Navy
  "marine__S":   5498,
  "marine__M":   5499,
  "marine__L":   5500,
  "marine__XL":  5501,
  "marine__2XL": 5502,
  "marine__3XL": 5503,

  // Sport Grey
  "gris-sport__S":   5514,
  "gris-sport__M":   5515,
  "gris-sport__L":   5516,
  "gris-sport__XL":  5517,
  "gris-sport__2XL": 5518,
  "gris-sport__3XL": 5519,

  // White
  "blanc__S":   5426,
  "blanc__M":   5427,
  "blanc__L":   5428,
  "blanc__XL":  5429,
  "blanc__2XL": 5430,
  "blanc__3XL": 5431,

  // Red
  "rouge__S":   5442,
  "rouge__M":   5443,
  "rouge__L":   5444,
  "rouge__XL":  5445,
  "rouge__2XL": 5446,
  "rouge__3XL": 5447,
};

// ─── Gildan 18500 Hoodie (catalog 146) — 6 couleurs × S-3XL ──────────────────
// noir → Black · marine → Navy · blanc → White · gris-sport → Sport Grey ·
// rouge → Red · royal → Royal

const GILDAN_18500_VARIANTS: Record<string, number> = {
  // Black
  "noir__S":   5530,
  "noir__M":   5531,
  "noir__L":   5532,
  "noir__XL":  5533,
  "noir__2XL": 5534,
  "noir__3XL": 5535,

  // Navy
  "marine__S":   5594,
  "marine__M":   5595,
  "marine__L":   5596,
  "marine__XL":  5597,
  "marine__2XL": 5598,
  "marine__3XL": 5599,

  // White
  "blanc__S":   5522,
  "blanc__M":   5523,
  "blanc__L":   5524,
  "blanc__XL":  5525,
  "blanc__2XL": 5526,
  "blanc__3XL": 5527,

  // Sport Grey
  "gris-sport__S":   5610,
  "gris-sport__M":   5611,
  "gris-sport__L":   5612,
  "gris-sport__XL":  5613,
  "gris-sport__2XL": 5614,
  "gris-sport__3XL": 5615,

  // Red
  "rouge__S":   5538,
  "rouge__M":   5539,
  "rouge__L":   5540,
  "rouge__XL":  5541,
  "rouge__2XL": 5542,
  "rouge__3XL": 5543,

  // Royal
  "royal__S":   16850,
  "royal__M":   16851,
  "royal__L":   16852,
  "royal__XL":  16853,
  "royal__2XL": 16854,
  "royal__3XL": 16855,
};

// ─── Comfort Colors 1717 (catalog 586) — 5 couleurs × S-2XL ──────────────────
// noir → Black · blanc → White · gris → Grey · marine → True Navy ·
// naturel → Ivory
// "rouge" retiré du site 2026-06-11 : Printful "Red" hors stock EU sur S/M/XL.
// Alternative complète si réintroduction : Paprika (#fe4747), mockup à refaire.

const COMFORT_COLORS_1717_VARIANTS: Record<string, number> = {
  // Black
  "noir__S":   15114,
  "noir__M":   15115,
  "noir__L":   15116,
  "noir__XL":  15117,
  "noir__2XL": 15118,

  // White (S momentanément hors stock EU au 2026-06-11 — variant existant)
  "blanc__S":   15124,
  "blanc__M":   15125,
  "blanc__L":   15126,
  "blanc__XL":  15127,
  "blanc__2XL": 15128,

  // Grey
  "gris__S":   15176,
  "gris__M":   15177,
  "gris__L":   15178,
  "gris__XL":  15179,
  "gris__2XL": 15180,

  // True Navy
  "marine__S":   15181,
  "marine__M":   15182,
  "marine__L":   15183,
  "marine__XL":  15184,
  "marine__2XL": 15185,

  // Ivory
  "naturel__S":   16523,
  "naturel__M":   16524,
  "naturel__L":   16525,
  "naturel__XL":  16526,
  "naturel__2XL": 16527,
};

// ─── Polo Gildan 64800 piqué (catalog 670) ────────────────────────────────────
// Broderie uniquement (Printful : embroidery_chest_left + manches).
// RETIRÉ de l'auto-fulfillment — Printful ne fait pas le dos. Le polo
// (cœur + dos) passe en traitement atelier manuel. Conservé pour référence.

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
// Évite l'avertissement "unused" tout en gardant la table de référence.
void GILDAN_64800_VARIANTS;

// ─── Casquette Flexfit 6277 (catalog 140) — vérifié EU in_stock 2026-06-11 ───
// noir → Black · marine → Navy · gris → Dark Grey · kaki → Khaki ·
// rouge → Red · bleu-royal → Royal · blanc → White
// Tailles : S/M et L/XL (clé exacte, pas de normalisation)

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

// ─── Casquette Yupoong 6006 trucker (catalog 100) — vérifié EU 2026-06-11 ────
// noir → Black · anthracite → Charcoal · marine → Navy · blanc → White
// Taille unique : "One size"

const CASQUETTE_YUPOONG_6006_VARIANTS: Record<string, number> = {
  "noir__One size":       4811,
  "anthracite__One size": 4814,
  "marine__One size":     4816,
  "blanc__One size":      4810,
};

// ─── Map par product_id ───────────────────────────────────────────────────────

const PRODUCT_VARIANT_MAP: Record<string, Record<string, number>> = {
  "gildan-5000":          GILDAN_5000_VARIANTS,
  "bella-3001":           BELLA_3001_VARIANTS,
  "gildan-18000":         GILDAN_18000_VARIANTS,
  "gildan-18500":         GILDAN_18500_VARIANTS,
  "comfort-colors-1717":  COMFORT_COLORS_1717_VARIANTS,
  "casquette-flexfit-6277": CASQUETTE_FLEXFIT_6277_VARIANTS,
  "casquette-yupoong-6006": CASQUETTE_YUPOONG_6006_VARIANTS,
};

// ─── Printful product catalog IDs ────────────────────────────────────────────

export const PRINTFUL_PRODUCT_IDS: Record<string, number> = {
  "gildan-5000":          438,
  "bella-3001":           71,
  "gildan-18000":         145,
  "gildan-18500":         146,
  "comfort-colors-1717":  586,
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
