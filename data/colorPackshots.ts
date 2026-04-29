/**
 * colorPackshots.ts — URLs packshot CDN Toptex par produit ET par couleur
 *
 * Source : découverte automatique via cdn.toptex.com/packshots/PS_{REF}_{CODE}.png
 * La charte Photo Library Toptex bloque l'API → ces URLs sont statiques et directes.
 *
 * Structure : { productId → { colorId → packshot URL } }
 * Les colorIds correspondent aux ids dans les tableaux `colors` de chaque Product.
 *
 * ⚠️  Couleurs absentes = pas de packshot couleur disponible sur le CDN.
 *     Le composant ProductGallery affiche un fallback générique pour ces couleurs.
 */

export const COLOR_PACKSHOTS: Record<string, Record<string, string>> = {

  // ── T-shirts B&C Exact 190 (TU01T) ──────────────────────────────────────────
  "tu01t": {
    "blanc":         "https://cdn.toptex.com/packshots/PS_CGTU01T_WHITE.png",
    "noir":          "https://cdn.toptex.com/packshots/PS_CGTU01T_BLACK.png",
    "gris":          "https://cdn.toptex.com/packshots/PS_CGTU01T_SPORTGREY.png",
    "gris-anthracite":"https://cdn.toptex.com/packshots/PS_CGTU01T_DARKGREY.png",
    "marine":        "https://cdn.toptex.com/packshots/PS_CGTU01T_NAVY.png",
    "rouge":         "https://cdn.toptex.com/packshots/PS_CGTU01T_RED.png",
    "bleu-royal":    "https://cdn.toptex.com/packshots/PS_CGTU01T_ROYALBLUE.png",
    "vert-bouteille":"https://cdn.toptex.com/packshots/PS_CGTU01T_BOTTLEGREEN.png",
    "bordeaux":      "https://cdn.toptex.com/packshots/PS_CGTU01T_BURGUNDY.png",
    "turquoise":     "https://cdn.toptex.com/packshots/PS_CGTU01T_REALTURQUOISE.png",
    "denim":         "https://cdn.toptex.com/packshots/PS_CGTU01T_DENIM.png",
    "or":            "https://cdn.toptex.com/packshots/PS_CGTU01T_GOLD.png",
    "jaune":         "https://cdn.toptex.com/packshots/PS_CGTU01T_SOLARYELLOW.png",
    "rose":          "https://cdn.toptex.com/packshots/PS_CGTU01T_MILLENNIALPINK.png",
    "fuchsia":       "https://cdn.toptex.com/packshots/PS_CGTU01T_FUCHSIA.png",
    "violet":        "https://cdn.toptex.com/packshots/PS_CGTU01T_RADIANTPURPLE.png",
    "kaki":          "https://cdn.toptex.com/packshots/PS_CGTU01T_URBANKHAKI.png",
    "naturel":       "https://cdn.toptex.com/packshots/PS_CGTU01T_NATURAL.png",
    "beige":         "https://cdn.toptex.com/packshots/PS_CGTU01T_SAND.png",
    "orange":        "https://cdn.toptex.com/packshots/PS_CGTU01T_ORANGE.png",
  },

  // ── T-shirt femme B&C TW02T ──────────────────────────────────────────────────
  "tw02t": {
    "blanc":         "https://cdn.toptex.com/packshots/PS_CGTW02T_WHITE.png",
    "noir":          "https://cdn.toptex.com/packshots/PS_CGTW02T_BLACK.png",
    "gris":          "https://cdn.toptex.com/packshots/PS_CGTW02T_SPORTGREY.png",
    "marine":        "https://cdn.toptex.com/packshots/PS_CGTW02T_NAVY.png",
    "rouge":         "https://cdn.toptex.com/packshots/PS_CGTW02T_RED.png",
    "bleu-royal":    "https://cdn.toptex.com/packshots/PS_CGTW02T_ROYALBLUE.png",
    "vert-bouteille":"https://cdn.toptex.com/packshots/PS_CGTW02T_BOTTLEGREEN.png",
    "bordeaux":      "https://cdn.toptex.com/packshots/PS_CGTW02T_BURGUNDY.png",
  },

  // ── T-shirt adulte B&C Exact 190 Premium TU03T ─────────────────────────────
  "tu03t": {
    "blanc":   "https://cdn.toptex.com/packshots/PS_CGTU03T_WHITE.png",
    "noir":    "https://cdn.toptex.com/packshots/PS_CGTU03T_BLACK.png",
    "marine":  "https://cdn.toptex.com/packshots/PS_CGTU03T_NAVY.png",
    "rouge":   "https://cdn.toptex.com/packshots/PS_CGTU03T_RED.png",
  },

  // ── Sweat col rond B&C WG004 ─────────────────────────────────────────────────
  "wg004": {
    "noir":          "https://cdn.toptex.com/packshots/PS_CGWG004_BLACK.png",
    "blanc":         "https://cdn.toptex.com/packshots/PS_CGWG004_WHITE.png",
    "gris-melange":  "https://cdn.toptex.com/packshots/PS_CGWG004_SPORTGREY.png",
    "anthracite":    "https://cdn.toptex.com/packshots/PS_CGWG004_DARKGREY.png",
    "marine":        "https://cdn.toptex.com/packshots/PS_CGWG004_NAVY.png",
    "bleu-royal":    "https://cdn.toptex.com/packshots/PS_CGWG004_ROYALBLUE.png",
    "bordeaux":      "https://cdn.toptex.com/packshots/PS_CGWG004_BURGUNDY.png",
    "rouge":         "https://cdn.toptex.com/packshots/PS_CGWG004_RED.png",
    "vert-bouteille":"https://cdn.toptex.com/packshots/PS_CGWG004_BOTTLEGREEN.png",
    "orange":        "https://cdn.toptex.com/packshots/PS_CGWG004_ORANGE.png",
    // vert-foret, kaki, beige : pas de packshot CDN pour WG004
  },

  // ── Hoodie B&C WU620 ─────────────────────────────────────────────────────────
  "wu620": {
    "noir":          "https://cdn.toptex.com/packshots/PS_CGWU620_BLACK.png",
    "blanc":         "https://cdn.toptex.com/packshots/PS_CGWU620_WHITE.png",
    "gris-melange":  "https://cdn.toptex.com/packshots/PS_CGWU620_HEATHERGREY.png",
    "anthracite":    "https://cdn.toptex.com/packshots/PS_CGWU620_STEELGREY.png",
    "marine":        "https://cdn.toptex.com/packshots/PS_CGWU620_NAVY.png",
    "bleu-royal":    "https://cdn.toptex.com/packshots/PS_CGWU620_ROYALBLUE.png",
    "bordeaux":      "https://cdn.toptex.com/packshots/PS_CGWU620_BURGUNDY.png",
    "rouge":         "https://cdn.toptex.com/packshots/PS_CGWU620_RED.png",
    "kaki":          "https://cdn.toptex.com/packshots/PS_CGWU620_KHAKI.png",
    // vert-foret, vert-bouteille, beige : pas de packshot CDN pour WU620
  },

  // ── T-shirt iDeal190 Homme IB320 ─────────────────────────────────────────────
  // ⚠️  "anthracite" et "gris-anthracite" sont deux ID distincts dans IDEAL_COLORS_BASE :
  //     le produit utilise "anthracite" → clé dupliquée vers IDEALDARKGREY.
  //     "vert-bouteille" est mappé sur ForestGreen (couleur la plus proche disponible).
  //     "turquoise", "rose", "beige", "violet", "kaki" : pas de packshot iDeal CDN
  //     confirmé → fallback générique IB320_2026.jpg (image iDeal, pas B&C).
  "ib320": {
    "blanc":          "https://cdn.toptex.com/packshots/PS_IB320_IDEALWHITE.png",
    "noir":           "https://cdn.toptex.com/packshots/PS_IB320_IDEALBLACK.png",
    "gris":           "https://cdn.toptex.com/packshots/PS_IB320_IDEALASHHEATHER.png",
    "anthracite":     "https://cdn.toptex.com/packshots/PS_IB320_IDEALDARKGREY.png",
    "gris-anthracite":"https://cdn.toptex.com/packshots/PS_IB320_IDEALDARKGREY.png",
    "gris-melange":   "https://cdn.toptex.com/packshots/PS_IB320_IDEALOXFORDGREY.png",
    "marine":         "https://cdn.toptex.com/packshots/PS_IB320_IDEALNAVY.png",
    "rouge":          "https://cdn.toptex.com/packshots/PS_IB320_IDEALRED.png",
    "bleu-royal":     "https://cdn.toptex.com/packshots/PS_IB320_IDEALROYALBLUE.png",
    "bleu-ciel":      "https://cdn.toptex.com/packshots/PS_IB320_IDEALSKYBLUE.png",
    "vert-foret":     "https://cdn.toptex.com/packshots/PS_IB320_IDEALFORESTGREEN.png",
    "vert-bouteille": "https://cdn.toptex.com/packshots/PS_IB320_IDEALFORESTGREEN.png",
    "vert-kelly":     "https://cdn.toptex.com/packshots/PS_IB320_IDEALKELLYGREEN.png",
    "bordeaux":       "https://cdn.toptex.com/packshots/PS_IB320_IDEALBURGUNDY.png",
    "or":             "https://cdn.toptex.com/packshots/PS_IB320_IDEALGOLD.png",
    "jaune":          "https://cdn.toptex.com/packshots/PS_IB320_IDEALGOLD.png",
    "fuchsia":        "https://cdn.toptex.com/packshots/PS_IB320_IDEALFUCHSIA.png",
    "orange":         "https://cdn.toptex.com/packshots/PS_IB320_IDEALORANGE.png",
  },

  // ── T-shirt femme iDeal190 IB321 ─────────────────────────────────────────────
  // Mêmes règles que IB320 : "anthracite" dupliqué + "vert-bouteille" → ForestGreen.
  // Couleurs sans packshot CDN confirmé (turquoise, rose, beige, violet, kaki,
  // bordeaux, or, jaune, fuchsia, orange) → fallback IB321_2026.jpg (iDeal).
  "ib321": {
    "blanc":          "https://cdn.toptex.com/packshots/PS_IB321_IDEALWHITE.png",
    "noir":           "https://cdn.toptex.com/packshots/PS_IB321_IDEALBLACK.png",
    "gris":           "https://cdn.toptex.com/packshots/PS_IB321_IDEALASHHEATHER.png",
    "anthracite":     "https://cdn.toptex.com/packshots/PS_IB321_IDEALDARKGREY.png",
    "gris-anthracite":"https://cdn.toptex.com/packshots/PS_IB321_IDEALDARKGREY.png",
    "marine":         "https://cdn.toptex.com/packshots/PS_IB321_IDEALNAVY.png",
    "rouge":          "https://cdn.toptex.com/packshots/PS_IB321_IDEALRED.png",
    "bleu-royal":     "https://cdn.toptex.com/packshots/PS_IB321_IDEALROYALBLUE.png",
    "vert-foret":     "https://cdn.toptex.com/packshots/PS_IB321_IDEALFORESTGREEN.png",
    "vert-bouteille": "https://cdn.toptex.com/packshots/PS_IB321_IDEALFORESTGREEN.png",
  },

  // ── T-shirt enfant iDeal IB322 ───────────────────────────────────────────────
  "ib322": {
    "blanc":  "https://cdn.toptex.com/packshots/PS_IB322_IDEALWHITE.png",
    "noir":   "https://cdn.toptex.com/packshots/PS_IB322_IDEALBLACK.png",
    "marine": "https://cdn.toptex.com/packshots/PS_IB322_IDEALNAVY.png",
    "rouge":  "https://cdn.toptex.com/packshots/PS_IB322_IDEALRED.png",
  },

  // ── T-shirt iDeal IB323 ──────────────────────────────────────────────────────
  "ib323": {
    "blanc":      "https://cdn.toptex.com/packshots/PS_IB323_IDEALWHITE.png",
    "noir":       "https://cdn.toptex.com/packshots/PS_IB323_IDEALBLACK.png",
    "marine":     "https://cdn.toptex.com/packshots/PS_IB323_IDEALNAVY.png",
    "rouge":      "https://cdn.toptex.com/packshots/PS_IB323_IDEALRED.png",
    "bleu-royal": "https://cdn.toptex.com/packshots/PS_IB323_IDEALROYALBLUE.png",
  },

  // ── Sweat col rond iDeal IB400 ───────────────────────────────────────────────
  "ib400": {
    "noir":       "https://cdn.toptex.com/packshots/PS_IB400_IDEALBLACK.png",
    "blanc":      "https://cdn.toptex.com/packshots/PS_IB400_IDEALWHITE.png",
    "gris-melange":"https://cdn.toptex.com/packshots/PS_IB400_IDEALASHHEATHER.png",
    "marine":     "https://cdn.toptex.com/packshots/PS_IB400_IDEALNAVY.png",
    "rouge":      "https://cdn.toptex.com/packshots/PS_IB400_IDEALRED.png",
    "bleu-royal": "https://cdn.toptex.com/packshots/PS_IB400_IDEALROYALBLUE.png",
    "vert-foret": "https://cdn.toptex.com/packshots/PS_IB400_IDEALFORESTGREEN.png",
  },

  // ── Hoodie iDeal enfant IB401 ────────────────────────────────────────────────
  "ib401": {
    "noir":   "https://cdn.toptex.com/packshots/PS_IB401_IDEALBLACK.png",
    "marine": "https://cdn.toptex.com/packshots/PS_IB401_IDEALNAVY.png",
    "rouge":  "https://cdn.toptex.com/packshots/PS_IB401_IDEALRED.png",
  },

  // ── Hoodie iDeal 300 IB402 ───────────────────────────────────────────────────
  "ib402": {
    "noir":        "https://cdn.toptex.com/packshots/PS_IB402_IDEALBLACK.png",
    "blanc-casse": "https://cdn.toptex.com/packshots/PS_IB402_IDEALWHITE.png",
    "gris":        "https://cdn.toptex.com/packshots/PS_IB402_IDEALOXFORDGREY.png",
    "gris-melange":"https://cdn.toptex.com/packshots/PS_IB402_IDEALASHHEATHER.png",
    "anthracite":  "https://cdn.toptex.com/packshots/PS_IB402_IDEALDARKGREY.png",
    "marine":      "https://cdn.toptex.com/packshots/PS_IB402_IDEALNAVY.png",
    "rouge":       "https://cdn.toptex.com/packshots/PS_IB402_IDEALRED.png",
    "bleu-royal":  "https://cdn.toptex.com/packshots/PS_IB402_IDEALROYALBLUE.png",
    "vert-foret":  "https://cdn.toptex.com/packshots/PS_IB402_IDEALFORESTGREEN.png",
    "orange":      "https://cdn.toptex.com/packshots/PS_IB402_IDEALORANGE.png",
  },

  // ── Hoodie iDeal IB403 ───────────────────────────────────────────────────────
  "ib403": {
    "noir":   "https://cdn.toptex.com/packshots/PS_IB403_IDEALBLACK.png",
    "marine": "https://cdn.toptex.com/packshots/PS_IB403_IDEALNAVY.png",
    "rouge":  "https://cdn.toptex.com/packshots/PS_IB403_IDEALRED.png",
  },

  // ── Polo Kariban K262 ────────────────────────────────────────────────────────
  "k262": {
    "blanc":  "https://cdn.toptex.com/packshots/PS_K262_WHITE.png",
    "noir":   "https://cdn.toptex.com/packshots/PS_K262_BLACK.png",
    "gris":   "https://cdn.toptex.com/packshots/PS_K262_OXFORDGREY.png",
    "marine": "https://cdn.toptex.com/packshots/PS_K262_NAVY.png",
    "rouge":  "https://cdn.toptex.com/packshots/PS_K262_RED.png",
    // bleu-royal, bordeaux, vert-bouteille, anthracite : pas de packshot K262 CDN
  },

  // ── Polo femme Kariban K256 ──────────────────────────────────────────────────
  "k256": {
    "blanc":       "https://cdn.toptex.com/packshots/PS_K256_WHITE.png",
    "noir":        "https://cdn.toptex.com/packshots/PS_K256_BLACK.png",
    "gris":        "https://cdn.toptex.com/packshots/PS_K256_OXFORDGREY.png",
    "marine":      "https://cdn.toptex.com/packshots/PS_K256_NAVY.png",
    "rouge":       "https://cdn.toptex.com/packshots/PS_K256_RED.png",
    "gris-anthracite": "https://cdn.toptex.com/packshots/PS_K256_DARKGREY.png",
  },

  // ── Polo enfant Kariban K239 ─────────────────────────────────────────────────
  "k239": {
    "blanc":         "https://cdn.toptex.com/packshots/PS_K239_WHITE.png",
    "noir":          "https://cdn.toptex.com/packshots/PS_K239_BLACK.png",
    "marine":        "https://cdn.toptex.com/packshots/PS_K239_NAVY.png",
    "rouge":         "https://cdn.toptex.com/packshots/PS_K239_RED.png",
    "gris-anthracite":"https://cdn.toptex.com/packshots/PS_K239_DARKGREY.png",
  },

  // ── Polo femme Kariban K240 ──────────────────────────────────────────────────
  "k240": {
    "blanc":  "https://cdn.toptex.com/packshots/PS_K240_WHITE.png",
    "noir":   "https://cdn.toptex.com/packshots/PS_K240_BLACK.png",
    "marine": "https://cdn.toptex.com/packshots/PS_K240_NAVY.png",
  },

  // ── Sweat éco Native Spirit NS400 ───────────────────────────────────────────
  "ns400": {
    "noir":          "https://cdn.toptex.com/packshots/PS_NS400_BLACK.png",
    "ecru":          "https://cdn.toptex.com/packshots/PS_NS400_RAWNATURAL.png",
    "marine":        "https://cdn.toptex.com/packshots/PS_NS400_NAVYBLUE.png",
    "vert-foret":    "https://cdn.toptex.com/packshots/PS_NS400_FORESTGREEN.png",
    "terracotta":    "https://cdn.toptex.com/packshots/PS_NS400_PAPRIKA.png",
    "gris-ardoise":  "https://cdn.toptex.com/packshots/PS_NS400_MINERALGREY.png",
    "bleu-ciel":     "https://cdn.toptex.com/packshots/PS_NS400_ADRIATICBLUE.png",
    "vert-bouteille":"https://cdn.toptex.com/packshots/PS_NS400_ALMONDGREEN.png",
    "rose":          "https://cdn.toptex.com/packshots/PS_NS400_ANTIQUEROSE.png",
    "turquoise":     "https://cdn.toptex.com/packshots/PS_NS400_AQUAMARINE.png",
  },

  // ── Hoodie éco Native Spirit NS401 ──────────────────────────────────────────
  "ns401": {
    "noir":         "https://cdn.toptex.com/packshots/PS_NS401_BLACK.png",
    "ecru":         "https://cdn.toptex.com/packshots/PS_NS401_RAWNATURAL.png",
    "marine":       "https://cdn.toptex.com/packshots/PS_NS401_NAVYBLUE.png",
    "vert-foret":   "https://cdn.toptex.com/packshots/PS_NS401_FORESTGREEN.png",
    "terracotta":   "https://cdn.toptex.com/packshots/PS_NS401_SIENNA.png",
    "gris-ardoise": "https://cdn.toptex.com/packshots/PS_NS401_MINERALGREY.png",
  },

  // ── Hoodie oversize Native Spirit NS408 ─────────────────────────────────────
  "ns408": {
    "noir":       "https://cdn.toptex.com/packshots/PS_NS408_BLACK.png",
    "turquoise":  "https://cdn.toptex.com/packshots/PS_NS408_AQUAMARINE.png",
    "vert-foret": "https://cdn.toptex.com/packshots/PS_NS408_BROOKGREEN.png",
    "terracotta": "https://cdn.toptex.com/packshots/PS_NS408_BURNTBRICK.png",
    "beige":      "https://cdn.toptex.com/packshots/PS_NS408_DRIFTWOOD.png",
    "bleu-ciel":  "https://cdn.toptex.com/packshots/PS_NS408_ADRIATICBLUE.png",
  },
};
