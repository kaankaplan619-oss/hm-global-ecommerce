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
// GILDAN_64800_VARIANTS est branché dans PRINTFUL_VARIANT_MAP (réactivé 2026-06-13).

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

// ═══════════════════════════════════════════════════════════════════════════
// ÉLARGISSEMENT CATALOGUE (#85) — vérifié EU in_stock 2026-06-12 via API
// publique (availability_status régions EU/EU_LV/EU_ES). Toute combinaison
// absente ici N'EXISTE PAS dans products.ts (règle Kaan).
// ═══════════════════════════════════════════════════════════════════════════

// ─── Polo SOL'S 11362 Prescott (catalog 810) — vérifié EU 2026-06-12 ─────────
// Exclusions volontaires : White (L en rupture EU), Mouse Grey & Sand
// (n'existent qu'en S-2XL → grille de tailles incohérente avec le produit).
const POLO_SOLS_PRESCOTT_VARIANTS: Record<string, number> = {
  "noir__S": 20624,  "noir__M": 20610,  "noir__L": 20617,  "noir__XL": 20631,
  "noir__2XL": 20638, "noir__3XL": 20645, "noir__4XL": 20652, "noir__5XL": 20659,
  "marine__S": 20627, "marine__M": 20613, "marine__L": 20620, "marine__XL": 20634,
  "marine__2XL": 20641, "marine__3XL": 20648, "marine__4XL": 20655, "marine__5XL": 20662,
  "rouge__S": 20629, "rouge__M": 20615, "rouge__L": 20622, "rouge__XL": 20636,
  "rouge__2XL": 20643, "rouge__3XL": 20650, "rouge__4XL": 20657, "rouge__5XL": 20664,
  "gris-chine__S": 20625, "gris-chine__M": 20611, "gris-chine__L": 20618, "gris-chine__XL": 20632,
  "gris-chine__2XL": 20639, "gris-chine__3XL": 20646, "gris-chine__4XL": 20653, "gris-chine__5XL": 20660,
};

// ─── Polo Gildan 64800L femme (catalog 664) — vérifié EU 2026-06-12 ──────────
const POLO_GILDAN_64800L_VARIANTS: Record<string, number> = {
  "noir__S": 16587,  "noir__M": 16589,  "noir__L": 16590,  "noir__XL": 16591,  "noir__2XL": 16592,
  "marine__S": 16593, "marine__M": 16594, "marine__L": 16595, "marine__XL": 16596, "marine__2XL": 16597,
  "gris__S": 16598,  "gris__M": 16599,  "gris__L": 16600,  "gris__XL": 16601,  "gris__2XL": 16602,
  "blanc__S": 16603, "blanc__M": 16604, "blanc__L": 16605, "blanc__XL": 16606, "blanc__2XL": 16607,
};

// ─── Coupe-vent SOL'S 32000 (catalog 661) — vérifié EU 2026-06-12 ────────────
// « French Navy » est nommé « Navy » dans l'API → marine.
const COUPE_VENT_SOLS_32000_VARIANTS: Record<string, number> = {
  "noir__S": 16424,  "noir__M": 16425,  "noir__L": 16426,  "noir__XL": 16427,  "noir__2XL": 16428,
  "marine__S": 16434, "marine__M": 16435, "marine__L": 16436, "marine__XL": 16437, "marine__2XL": 16438,
  "vert-foret__S": 16429, "vert-foret__M": 16430, "vert-foret__L": 16431, "vert-foret__XL": 16432, "vert-foret__2XL": 16433,
};

// ─── Dad hat Yupoong 6245CM (catalog 206) — vérifié EU 2026-06-12 ────────────
// Spruce exclue (rupture EU).
const CASQUETTE_DAD_HAT_6245_VARIANTS: Record<string, number> = {
  "noir__One size":       7854,
  "blanc__One size":      7853,
  "marine__One size":     7857,
  "gris__One size":       12736,
  "kaki__One size":       7855,
  "pierre__One size":     7859,
  "bleu-clair__One size": 7856,
  "rose__One size":       7858,
  "bordeaux__One size":   12735,
  "camouflage__One size": 9794,
};

// ─── Snapback Yupoong 6089M (catalog 99) — vérifié EU 2026-06-12 ─────────────
// Exclues (rupture EU) : Heather Grey/Navy, Heather Grey/Red, Navy/Red.
const CASQUETTE_SNAPBACK_6089_VARIANTS: Record<string, number> = {
  "noir__One size":             4792,
  "blanc__One size":            22453,
  "marine__One size":           4802,
  "marine-fonce__One size":     4798,
  "gris__One size":             4797,
  "gris-chine__One size":       7836,
  "argent__One size":           4808,
  "rouge__One size":            4806,
  "royal__One size":            4807,
  "bordeaux__One size":         4799,
  "sapin__One size":            4809,
  "camouflage__One size":       7835,
  "noir-rose-fluo__One size":   7843,
  "noir-rouge__One size":       4794,
  "noir-argent__One size":      4795,
  "noir-bleu-canard__One size": 4796,
  "gris-chine-noir__One size":  7837,
  "naturel-noir__One size":     4801,
};

// ─── Bob Flexfit 5003 (catalog 253) — vérifié EU 2026-06-12 ──────────────────
const BOB_FLEXFIT_5003_VARIANTS: Record<string, number> = {
  "noir__One size":   8760,
  "blanc__One size":  8759,
  "marine__One size": 8761,
  "gris__One size":   8763,
  "kaki__One size":   8762,
};

// ─── Bonnet Yupoong 1501KC (catalog 266) — vérifié EU 2026-06-12 ─────────────
const BONNET_YUPOONG_1501KC_VARIANTS: Record<string, number> = {
  "noir__One size":       8936,
  "blanc__One size":      8938,
  "marine__One size":     8940,
  "gris__One size":       12881,
  "gris-chine__One size": 8937,
  "rouge__One size":      8939,
  "royal__One size":      17496,
  "sapin__One size":      8941,
  "olive__One size":      17495,
  "marron__One size":     12880,
  "or__One size":         12882,
  "rose__One size":       17494,
};

// ─── Tote BagBase W101 (catalog 1553) — vérifié EU 2026-06-12 ────────────────
const TOTE_BAGBASE_W101_VARIANTS: Record<string, number> = {
  "noir__One size":           49313,
  "vert-bouteille__One size": 49314,
  "bordeaux__One size":       49315,
  "rose__One size":           49316,
  "rouge__One size":          49317,
  "corail__One size":         49318,
  "marine__One size":         49319,
  "gris-clair__One size":     49320,
  "menthe__One size":         49321,
  "moutarde__One size":       49322,
  "naturel__One size":        49323,
  "orange__One size":         49324,
};

// ─── Tote denim Mantis M196 (catalog 528) — vérifié EU 2026-06-12 ────────────
const TOTE_DENIM_MANTIS_M196_VARIANTS: Record<string, number> = {
  "denim__One size": 13313,
};

// ─── Sacoche BagBase QS309 (catalog 1552) — vérifié EU 2026-06-12 ────────────
const SACOCHE_BAGBASE_QS309_VARIANTS: Record<string, number> = {
  "noir__One size": 49308,
  "vert__One size": 49309,
  "rose__One size": 49310,
};

// ─── Stickers kiss-cut (catalog 358) — vérifié EU 2026-06-12 ─────────────────
// « Tailles » = formats. Bandeau 15″ volontairement exclu.
const STICKERS_LOGO_VARIANTS: Record<string, number> = {
  "blanc__7,6 × 7,6 cm": 10163,
  "blanc__10 × 10 cm":   10164,
  "blanc__14 × 14 cm":   10165,
};

// ─── Planche de stickers A5 (catalog 505) — vérifié EU 2026-06-12 ────────────
const PLANCHE_STICKERS_VARIANTS: Record<string, number> = {
  "blanc__14,8 × 21 cm": 12917,
};

// ─── Mug noir brillant (catalog 300) — vérifié EU 2026-06-12 ─────────────────
const MUG_NOIR_VARIANTS: Record<string, number> = {
  "noir__11 oz / 325 ml": 9323,
  "noir__15 oz / 445 ml": 9324,
};

// ─── Dessous de verre liège (catalog 611) — vérifié EU 2026-06-12 ────────────
const DESSOUS_VERRE_VARIANTS: Record<string, number> = {
  "blanc__9,5 × 9,5 cm": 15662,
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
  // Élargissement #85 (2026-06-12)
  "gildan-64800":           GILDAN_64800_VARIANTS, // réactivé 2026-06-13 (broderie cœur)
  "polo-sols-prescott":     POLO_SOLS_PRESCOTT_VARIANTS,
  "polo-gildan-64800l":     POLO_GILDAN_64800L_VARIANTS,
  "coupe-vent-sols-32000":  COUPE_VENT_SOLS_32000_VARIANTS,
  "casquette-dad-hat-6245": CASQUETTE_DAD_HAT_6245_VARIANTS,
  "casquette-snapback-6089": CASQUETTE_SNAPBACK_6089_VARIANTS,
  "bob-flexfit-5003":       BOB_FLEXFIT_5003_VARIANTS,
  "bonnet-yupoong-1501kc":  BONNET_YUPOONG_1501KC_VARIANTS,
  "tote-bagbase-w101":      TOTE_BAGBASE_W101_VARIANTS,
  "tote-denim-mantis-m196": TOTE_DENIM_MANTIS_M196_VARIANTS,
  "sacoche-bagbase-qs309":  SACOCHE_BAGBASE_QS309_VARIANTS,
  "stickers-logo":          STICKERS_LOGO_VARIANTS,
  "planche-stickers":       PLANCHE_STICKERS_VARIANTS,
  "mug-noir-brillant":      MUG_NOIR_VARIANTS,
  "dessous-verre-liege":    DESSOUS_VERRE_VARIANTS,
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
  // Élargissement #85 (2026-06-12)
  "gildan-64800":           670, // réactivé 2026-06-13
  "polo-sols-prescott":     810,
  "polo-gildan-64800l":     664,
  "coupe-vent-sols-32000":  661,
  "casquette-dad-hat-6245": 206,
  "casquette-snapback-6089": 99,
  "bob-flexfit-5003":       253,
  "bonnet-yupoong-1501kc":  266,
  "tote-bagbase-w101":      1553,
  "tote-denim-mantis-m196": 528,
  "sacoche-bagbase-qs309":  1552,
  "stickers-logo":          358,
  "planche-stickers":       505,
  "mug-noir-brillant":      300,
  "dessous-verre-liege":    611,
};

// ─── Types de fichiers Printful par produit ──────────────────────────────────
// L'API order exige un type de fichier EXACT par produit (vérifié via
// GET /products/{id} → product.files le 2026-06-12). Un mauvais type → 400.
// "front"/"back" = textiles DTG (défaut historique, validé en production).
// broderie : type du placement avant ; print : type impression (DTG/sublim).

const PRODUCT_FILE_TYPES: Record<string, { broderie?: string; print?: string }> = {
  // Textiles DTG — impression = front/back (historique), broderie cœur =
  // chest left (audit API 2026-06-12 : EMBROIDERY dispo, mais PAS de broderie
  // dos sur ces produits → contrainte placements dans data/products.ts).
  "gildan-5000":         { broderie: "embroidery_chest_left", print: "front" },
  "bella-3001":          { broderie: "embroidery_chest_left", print: "front" },
  "comfort-colors-1717": { broderie: "embroidery_chest_left", print: "front" },
  "gildan-18000":        { broderie: "embroidery_chest_left", print: "front" },
  "gildan-18500":        { broderie: "embroidery_chest_left", print: "front" },
  // Polos & veste — broderie cœur = chest left
  "gildan-64800":           { broderie: "embroidery_chest_left" },
  "polo-sols-prescott":     { broderie: "embroidery_chest_left" },
  "polo-gildan-64800l":     { broderie: "embroidery_chest_left" },
  "coupe-vent-sols-32000":  { broderie: "embroidery_chest_left" },
  // Casquettes/bonnet — "default" = broderie front standard…
  "casquette-flexfit-6277":  { broderie: "default" },
  "casquette-yupoong-6006":  { broderie: "default" },
  "casquette-snapback-6089": { broderie: "default" },
  "bob-flexfit-5003":        { broderie: "default" },
  "bonnet-yupoong-1501kc":   { broderie: "default" },
  // …sauf le dad hat 6245CM qui n'a PAS de "default" (vérifié : erreur 400)
  "casquette-dad-hat-6245":  { broderie: "embroidery_front" },
  // Sacs
  "tote-bagbase-w101":      { broderie: "embroidery_apparel_front", print: "default" },
  "tote-denim-mantis-m196": { broderie: "embroidery_apparel_front" },
  // ⚠️ QS309 : technique Printful par défaut = EMBROIDERY → le fichier "default"
  // est un fichier BRODERIE. Le produit est vendu en impression → fichier DTF
  // "front_dtf_backpack" (audit API 2026-06-12 ; surcoût Printful +5,25 $/pc).
  "sacoche-bagbase-qs309":  { print: "front_dtf_backpack" },
  // Goodies — sublimation/impression digitale
  "stickers-logo":       { print: "default" },
  "planche-stickers":    { print: "default" },
  "mug-noir-brillant":   { print: "default" },
  "dessous-verre-liege": { print: "default" },
};

// ─── Couleurs de fil broderie ─────────────────────────────────────────────────
// Printful REFUSE (400) tout brouillon broderie sans l'option thread_colors*.
// Identifiants vérifiés par création de brouillons réels le 2026-06-12 :
//   - "default" / "embroidery_front" (casquettes, bonnet) → thread_colors
//   - "embroidery_chest_left" (textiles, polos, veste)    → thread_colors_chest_left
//   - "embroidery_apparel_front" (totes)                  → thread_colors_apparel

/** Identifiant d'option couleurs de fil exigé pour un type de fichier broderie. */
export function getThreadColorsOptionId(fileType: string): string {
  if (fileType === "embroidery_chest_left")    return "thread_colors_chest_left";
  if (fileType === "embroidery_apparel_front") return "thread_colors_apparel";
  return "thread_colors";
}

/**
 * Couleurs de fil par défaut du brouillon (palette autorisée Printful).
 * Placeholder volontaire : Kaan ajuste les fils dans le dashboard Printful
 * pendant la revue du brouillon — la confirmation reste manuelle.
 */
export const DEFAULT_THREAD_COLORS = ["#FFFFFF", "#000000"];

/**
 * Type de fichier Printful pour le placement AVANT d'un article.
 * Retourne "front" (textile DTG historique) si le produit n'est pas mappé.
 */
export function getPrintfulFrontFileType(productId: string, technique?: string | null): string {
  const entry = PRODUCT_FILE_TYPES[productId];
  if (!entry) return "front";
  const isBroderie = technique === "broderie" || technique === "broderie_illimitee";
  return (isBroderie ? entry.broderie : entry.print) ?? entry.broderie ?? entry.print ?? "front";
}

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
