import type { Product } from "@/types";
import {
  TSHIRT_PRICES,
  TSHIRT_IDEAL_PRICES,
  HOODIE_PRICES,
  SWEAT_IDEAL_PRICES,
  SOFTSHELL_PRICES,
  POLO_PRICES,
  POLAIRE_PRICES,
  CASQUETTE_PRICES,
  SAC_PRICES,
  PLACEMENT_SURCHARGES,
  GILDAN_5000_PRICES,
  GILDAN_5000_PLACEMENT_SURCHARGES,
  GILDAN_5000_DTF_VOLUME,
  GILDAN_5000_DTFLEX_VOLUME,
  GILDAN_5000_BRODERIE_VOLUME,
  GILDAN_5000_BRODERIE_ILLIMITEE_VOLUME,
  BELLA_3001_PRICES,
  BELLA_3001_PLACEMENT_SURCHARGES,
  BELLA_3001_DTF_VOLUME,
  BELLA_3001_DTFLEX_VOLUME,
  BELLA_3001_BRODERIE_VOLUME,
  BELLA_3001_BRODERIE_ILLIMITEE_VOLUME,
  GILDAN_18000_PRICES,
  GILDAN_18000_PLACEMENT_SURCHARGES,
  GILDAN_18000_DTG_VOLUME,
  GILDAN_18000_DTFLEX_VOLUME,
  GILDAN_18000_BRODERIE_VOLUME,
  GILDAN_18000_BRODERIE_ILLIMITEE_VOLUME,
  GILDAN_18500_PRICES,
  GILDAN_18500_PLACEMENT_SURCHARGES,
  GILDAN_18500_DTG_VOLUME,
  GILDAN_18500_DTFLEX_VOLUME,
  GILDAN_18500_BRODERIE_VOLUME,
  GILDAN_18500_BRODERIE_ILLIMITEE_VOLUME,
  COMFORT_COLORS_1717_PRICES,
  COMFORT_COLORS_1717_PLACEMENT_SURCHARGES,
  COMFORT_COLORS_1717_DTF_VOLUME,
  COMFORT_COLORS_1717_DTFLEX_VOLUME,
  COMFORT_COLORS_1717_BRODERIE_VOLUME,
  COMFORT_COLORS_1717_BRODERIE_ILLIMITEE_VOLUME,
  GILDAN_2400_LS_PRICES,
  GILDAN_2400_LS_PLACEMENT_SURCHARGES,
  GILDAN_2400_LS_DTF_VOLUME,
  GILDAN_2400_LS_DTFLEX_VOLUME,
  GILDAN_2400_LS_BRODERIE_VOLUME,
  GILDAN_2400_LS_BRODERIE_ILLIMITEE_VOLUME,
  SPREADSHIRT_GILDAN_TSHIRT_VOLUME,
  SPREADSHIRT_GILDAN_TSHIRT_BRODERIE_VOLUME,
  SPREADSHIRT_HOODIE_VOLUME,
  MUG_11OZ_PRICES,
  MUG_11OZ_PLACEMENT_SURCHARGES,
  MUG_11OZ_DTF_VOLUME,
  CASQUETTE_PLACEMENT_SURCHARGES,
  CASQUETTE_FLEXFIT_6277_PRICES,
  CASQUETTE_YUPOONG_6006_PRICES,
  CASQUETTE_FLEXFIT_6277_BRODERIE_VOLUME,
  CASQUETTE_YUPOONG_6006_BRODERIE_VOLUME,
  POLO_GILDAN_64800_BRODERIE_VOLUME,
  POLO_GILDAN_64800_PLACEMENT_SURCHARGES,
} from "./pricing";

function buildProductImages(productId: string, images: string[]) {
  return images.map((image) => `/images/products/${productId}/${image}`);
}

// CDN Toptex — déclaré tôt pour être utilisable partout dans ce fichier
const TOPTEX_CDN = "https://cdn.toptex.com/pictures/";

// ─── Images CDN Toptex par produit (5 vues : packshot + 4 coloris) ────────────
// Convention : {REF}_YYYY = packshot catalogue ; {REF}-N_YYYY = coloris/vue N
const TOPTEX_IMGS: Record<string, string[]> = {
  // ── T-shirts B&C Exact 190 ───────────────────────────────────────────────
  tu01t: [`${TOPTEX_CDN}CGTU01T_2026.jpg`,`${TOPTEX_CDN}CGTU01T-1_2026.jpg`,`${TOPTEX_CDN}CGTU01T-2_2026.jpg`,`${TOPTEX_CDN}CGTU01T-3_2026.jpg`,`${TOPTEX_CDN}CGTU01T-4_2026.jpg`],
  tw02t: [`${TOPTEX_CDN}CGTW02T_2026.jpg`,`${TOPTEX_CDN}CGTW02T-1_2026.jpg`,`${TOPTEX_CDN}CGTW02T-2_2026.jpg`,`${TOPTEX_CDN}CGTW02T-3_2026.jpg`,`${TOPTEX_CDN}CGTW02T-4_2026.jpg`],
  tu03t: [`${TOPTEX_CDN}CGTU03T_2026.jpg`,`${TOPTEX_CDN}CGTU03T-1_2026.jpg`,`${TOPTEX_CDN}CGTU03T-2_2026.jpg`,`${TOPTEX_CDN}CGTU03T-3_2026.jpg`,`${TOPTEX_CDN}CGTU03T-4_2026.jpg`],
  // ── Sweats & hoodies B&C ─────────────────────────────────────────────────
  wg004: [`${TOPTEX_CDN}CGWG004_2026.jpg`,`${TOPTEX_CDN}CGWG004-1_2026.jpg`,`${TOPTEX_CDN}CGWG004-2_2026.jpg`,`${TOPTEX_CDN}CGWG004-3_2026.jpg`,`${TOPTEX_CDN}CGWG004-4_2026.jpg`],
  wu620: [`${TOPTEX_CDN}CGWU620_2026.jpg`,`${TOPTEX_CDN}CGWU620-1_2026.jpg`,`${TOPTEX_CDN}CGWU620-2_2026.jpg`,`${TOPTEX_CDN}CGWU620-3_2026.jpg`,`${TOPTEX_CDN}CGWU620-4_2026.jpg`],
  // ── Softshells B&C (packshots par coloris via API) ───────────────────────
  jui62: ["https://cdn.toptex.com/packshots/PS_CGJUI62_BLACK-BLACK.png","https://cdn.toptex.com/packshots/PS_CGJUI62_NAVY-NEONGREEN.png","https://cdn.toptex.com/packshots/PS_CGJUI62_DARKGREY-NEONORANGE.png","https://cdn.toptex.com/packshots/PS_CGJUI62_ATOLL-GHOSTGREY.png","https://cdn.toptex.com/packshots/PS_CGJUI62_RED-WARMGREY.png"],
  jwi63: ["https://cdn.toptex.com/packshots/PS_CGJWI63_BLACK-BLACK.png","https://cdn.toptex.com/packshots/PS_CGJWI63_NAVY-NEONGREEN.png","https://cdn.toptex.com/packshots/PS_CGJWI63_DARKGREY-NEONORANGE.png","https://cdn.toptex.com/packshots/PS_CGJWI63_ATOLL-GHOSTGREY.png","https://cdn.toptex.com/packshots/PS_CGJWI63_RED-WARMGREY.png"],
  // ── T-shirts iDeal190 ────────────────────────────────────────────────────
  ib320: [`${TOPTEX_CDN}IB320_2026.jpg`,`${TOPTEX_CDN}IB320-1_2026.jpg`,`${TOPTEX_CDN}IB320-2_2026.jpg`,`${TOPTEX_CDN}IB320-3_2026.jpg`,`${TOPTEX_CDN}IB320-4_2026.jpg`],
  ib321: [`${TOPTEX_CDN}IB321_2026.jpg`,`${TOPTEX_CDN}IB321-1_2026.jpg`,`${TOPTEX_CDN}IB321-2_2026.jpg`,`${TOPTEX_CDN}IB321-3_2026.jpg`,`${TOPTEX_CDN}IB321-4_2026.jpg`],
  ib322: [`${TOPTEX_CDN}IB322_2026.jpg`,`${TOPTEX_CDN}IB322-1_2026.jpg`,`${TOPTEX_CDN}IB322-2_2026.jpg`,`${TOPTEX_CDN}IB322-3_2026.jpg`,`${TOPTEX_CDN}IB322-4_2026.jpg`],
  ib323: [`${TOPTEX_CDN}IB323_2026.jpg`,`${TOPTEX_CDN}IB323-1_2026.jpg`,`${TOPTEX_CDN}IB323-2_2026.jpg`,`${TOPTEX_CDN}IB323-3_2026.jpg`,`${TOPTEX_CDN}IB323-4_2026.jpg`],
  // ── Polos Kariban ─────────────────────────────────────────────────────────
  k262:  [`${TOPTEX_CDN}K262_2026.jpg`,`${TOPTEX_CDN}K262-1_2026.jpg`,`${TOPTEX_CDN}K262-2_2026.jpg`,`${TOPTEX_CDN}K262-3_2026.jpg`,`${TOPTEX_CDN}K262-4_2026.jpg`],
  k256:  [`${TOPTEX_CDN}K256_2026.jpg`,`${TOPTEX_CDN}K256-1_2026.jpg`,`${TOPTEX_CDN}K256-2_2026.jpg`,`${TOPTEX_CDN}K256-3_2026.jpg`,`${TOPTEX_CDN}K256-4_2026.jpg`],
  k239:  [`${TOPTEX_CDN}K239_2026.jpg`,`${TOPTEX_CDN}K239-1_2026.jpg`,`${TOPTEX_CDN}K239-2_2026.jpg`,`${TOPTEX_CDN}K239-3_2026.jpg`,`${TOPTEX_CDN}K239-4_2026.jpg`],
  k240:  [`${TOPTEX_CDN}K240_2026.jpg`,`${TOPTEX_CDN}K240-1_2026.jpg`,`${TOPTEX_CDN}K240-2_2026.jpg`,`${TOPTEX_CDN}K240-3_2026.jpg`,`${TOPTEX_CDN}K240-4_2026.jpg`],
  // ── Sweats & hoodies iDeal ────────────────────────────────────────────────
  ib400: [`${TOPTEX_CDN}IB400_2026.jpg`,`${TOPTEX_CDN}IB400-1_2026.jpg`,`${TOPTEX_CDN}IB400-2_2026.jpg`,`${TOPTEX_CDN}IB400-3_2026.jpg`,`${TOPTEX_CDN}IB400-4_2026.jpg`],
  ib401: [`${TOPTEX_CDN}IB401_2026.jpg`,`${TOPTEX_CDN}IB401-1_2026.jpg`,`${TOPTEX_CDN}IB401-2_2026.jpg`,`${TOPTEX_CDN}IB401-3_2026.jpg`,`${TOPTEX_CDN}IB401-4_2026.jpg`],
  ib402: [`${TOPTEX_CDN}IB402_2026.jpg`,`${TOPTEX_CDN}IB402-1_2026.jpg`,`${TOPTEX_CDN}IB402-2_2026.jpg`,`${TOPTEX_CDN}IB402-3_2026.jpg`,`${TOPTEX_CDN}IB402-4_2026.jpg`],
  ib403: [`${TOPTEX_CDN}IB403_2026.jpg`,`${TOPTEX_CDN}IB403-1_2026.jpg`,`${TOPTEX_CDN}IB403-2_2026.jpg`,`${TOPTEX_CDN}IB403-3_2026.jpg`,`${TOPTEX_CDN}IB403-4_2026.jpg`],
  // ── Sweats & hoodies Native Spirit (packshots par coloris via API) ────────
  ns400: ["https://cdn.toptex.com/packshots/PS_NS400_BLACK.png","https://cdn.toptex.com/packshots/PS_NS400_ALMONDGREEN.png","https://cdn.toptex.com/packshots/PS_NS400_AQUAMARINE.png","https://cdn.toptex.com/packshots/PS_NS400-2_ADRIATICBLUE.png","https://cdn.toptex.com/packshots/PS_NS400-2_ANTIQUEROSE.png"],
  ns401: ["https://cdn.toptex.com/packshots/PS_NS401_BLACK.png","https://cdn.toptex.com/packshots/PS_NS401_ALMONDGREEN.png","https://cdn.toptex.com/packshots/PS_NS401_AQUAMARINE.png","https://cdn.toptex.com/packshots/PS_NS401-2_ADRIATICBLUE.png","https://cdn.toptex.com/packshots/PS_NS401-2_ANTIQUEROSE.png"],
  ns408: ["https://cdn.toptex.com/packshots/PS_NS408_BLACK.png","https://cdn.toptex.com/packshots/PS_NS408_AQUAMARINE.png","https://cdn.toptex.com/packshots/PS_NS408_BROOKGREEN.png","https://cdn.toptex.com/packshots/PS_NS408_BURNTBRICK.png","https://cdn.toptex.com/packshots/PS_NS408_DRIFTWOOD.png"],
  // ── Polaires & doudounes ──────────────────────────────────────────────────
  ib900:  [`${TOPTEX_CDN}IB900_2026.jpg`,`${TOPTEX_CDN}IB900-1_2026.jpg`,`${TOPTEX_CDN}IB900-2_2026.jpg`,`${TOPTEX_CDN}IB900-3_2026.jpg`,`${TOPTEX_CDN}IB900-4_2026.jpg`],
  ib6175: [`${TOPTEX_CDN}IB6175_2026.jpg`,`${TOPTEX_CDN}IB6175-1_2026.jpg`,`${TOPTEX_CDN}IB6175-2_2026.jpg`,`${TOPTEX_CDN}IB6175-3_2026.jpg`,`${TOPTEX_CDN}IB6175-4_2026.jpg`],
  ib6176: [`${TOPTEX_CDN}IB6176_2026.jpg`,`${TOPTEX_CDN}IB6176-1_2026.jpg`,`${TOPTEX_CDN}IB6176-2_2026.jpg`,`${TOPTEX_CDN}IB6176-3_2026.jpg`,`${TOPTEX_CDN}IB6176-4_2026.jpg`],
  wk904:  [`${TOPTEX_CDN}WK904_2026.jpg`,`${TOPTEX_CDN}WK904-1_2026.jpg`,`${TOPTEX_CDN}WK904-2_2026.jpg`,`${TOPTEX_CDN}WK904-3_2026.jpg`,`${TOPTEX_CDN}WK904-4_2026.jpg`],
  // ── Casquettes K-up ───────────────────────────────────────────────────────
  kp157:  [`${TOPTEX_CDN}KP157_2026.jpg`,`${TOPTEX_CDN}KP157-1_2026.jpg`,`${TOPTEX_CDN}KP157-2_2026.jpg`,`${TOPTEX_CDN}KP157-3_2026.jpg`,`${TOPTEX_CDN}KP157-4_2026.jpg`],
  kp162:  [`${TOPTEX_CDN}KP162_2026.jpg`,`${TOPTEX_CDN}KP162-1_2026.jpg`,`${TOPTEX_CDN}KP162-2_2026.jpg`,`${TOPTEX_CDN}KP162-3_2026.jpg`,`${TOPTEX_CDN}KP162-4_2026.jpg`],
  kp165:  ["https://cdn.toptex.com/packshots/PS_KP165-B_BLACKWASHED.png","https://cdn.toptex.com/packshots/PS_KP165_WASHEDBLUEQUARTZ.png","https://cdn.toptex.com/packshots/PS_KP165_DARKPINKWASHED.png","https://cdn.toptex.com/packshots/PS_KP165_WASHEDDUSKYORCHID.png","https://cdn.toptex.com/packshots/PS_KP165_WASHEDIVYGREEN.png"],
  kp185:  ["https://cdn.toptex.com/packshots/PS_KP185_BLACK.png","https://cdn.toptex.com/packshots/PS_KP185_BLACK-ORANGE.png","https://cdn.toptex.com/packshots/PS_KP185_BLACK-RED.png","https://cdn.toptex.com/packshots/PS_KP185_BLACK-WHITE.png","https://cdn.toptex.com/packshots/PS_KP185_DARKGREY-LIGHTGREY.png"],
  // ── Sacs & tote bags Kimood (packshots par coloris via API) ──────────────
  // KI0262 — V1.1 (2026-05-27) : réduit à 1 SEULE couleur (Naturel) car le
  // CDN TopTex sert le MÊME fichier image pour les 3 URLs (NATURAL, BLACK,
  // NAVYBLUE renvoient toutes 2 746 145 bytes identiques — vérifié via curl).
  // Avant cette modif, le client sélectionnait "Noir" ou "Marine" mais voyait
  // toujours le tote naturel beige → expérience trompeuse.
  // Pour ré-activer Noir et Marine en V1.2 : sourcer des vrais mockups
  // ailleurs (photos HM Global, Kimood brand center, etc.) puis ajouter les
  // chemins dans hmMockupImages côté PRODUCT_KI0262.
  ki0262: ["https://cdn.toptex.com/packshots/PS_KI0262_NATURAL.png"],
  ki0252: ["https://cdn.toptex.com/packshots/PS_KI0252_NATURAL.png","https://cdn.toptex.com/packshots/PS_KI0252_BLACK.png","https://cdn.toptex.com/packshots/PS_KI0252_NAVYBLUE.png","https://cdn.toptex.com/packshots/PS_KI0252_CURCUMA.png","https://cdn.toptex.com/packshots/PS_KI0252_METALGREY.png"],
  ki0275: ["https://cdn.toptex.com/packshots/PS_KI0275_NATURAL-BLACK.png","https://cdn.toptex.com/packshots/PS_KI0275_NATURAL-NAVY.png","https://cdn.toptex.com/packshots/PS_KI0275_NATURAL-RED.png"],
  ki0274: ["https://cdn.toptex.com/packshots/PS_KI0274_BLACK.png","https://cdn.toptex.com/packshots/PS_KI0274_BLACK-SILVER.png","https://cdn.toptex.com/packshots/PS_KI0274_CHERRYRED-GOLD.png","https://cdn.toptex.com/packshots/PS_KI0274_ICEMINT.png","https://cdn.toptex.com/packshots/PS_KI0274_MIDNIGHTBLUE.png"],
};

// Retourne les 5 URLs CDN Toptex du produit (fallback: placeholder local)
const PLACEHOLDER_IMAGES = (id: string): string[] =>
  TOPTEX_IMGS[id] ?? [`/images/products/${id}/front.jpg`];

// Convention visuelle actuelle :
// - front-{couleur} / back-{couleur} = vue liée a une variante précise
// - detail-{theme} = vue neutre réutilisable comme fallback
// Tant que nous restons sur `images: string[]`, seules les images réellement
// présentes dans `public/images/products/...` doivent être listées ici.

// ─── T-SHIRTS ─────────────────────────────────────────────────────────────────

const TSHIRT_COLORS_CLASSIC = [
  { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
  { id: "noir", label: "Noir", hex: "#111111", available: true },
  { id: "gris", label: "Gris chiné", hex: "#9CA3AF", available: true },
  { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
  { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
  { id: "bleu-royal", label: "Bleu royal", hex: "#2563EB", available: true },
  { id: "vert-bouteille", label: "Vert bouteille", hex: "#166534", available: true },
  { id: "bordeaux", label: "Bordeaux", hex: "#7F1D1D", available: true },
];

const TSHIRT_SIZES = [
  { label: "XS", available: true },
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: true },
  { label: "XXL", available: true },
  { label: "3XL", available: true },
];

// Toutes les images → CDN Toptex (TOPTEX_IMGS ci-dessous)


export const PRODUCT_TU01T: Product = {
  id: "tu01t",
  slug: "tshirt-bc-exact-190-homme",
  reference: "B&C TU01T",
  name: "T-shirt B&C Exact 190 Homme",
  shortName: "T-shirt Homme",
  category: "tshirts",
  gender: "homme",
  tier: "appel",
  description:
    "Le T-shirt d'appel de HM Global Agence. Coupe moderne, col rond, jersey simple épaule à épaule. Excellent rapport qualité/prix pour les commandes d'entreprise. Idéal pour débuter votre communication textile.",
  composition: "100% coton semi-peigné",
  weight: "190 g/m²",
  images: PLACEHOLDER_IMAGES("tu01t"),
  colors: TSHIRT_COLORS_CLASSIC,
  sizes: TSHIRT_SIZES,
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_PRICES.appel.dtf,
    dtflex:   TSHIRT_PRICES.appel.dtflex,
    flex:     TSHIRT_PRICES.appel.flex,
    broderie: TSHIRT_PRICES.appel.broderie,
    placements: {
      coeur:     PLACEMENT_SURCHARGES.dtf.coeur,
      dos:       PLACEMENT_SURCHARGES.dtf.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.dtf["coeur-dos"],
    },
    broDeriePlacementSurcharge: {
      coeur:       PLACEMENT_SURCHARGES.broderie.coeur,
      dos:         PLACEMENT_SURCHARGES.broderie.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.broderie["coeur-dos"],
    },
  },
  featured: true,
  seasonal: ["printemps", "ete"],
  badge: "Bestseller",
  supplierName: "falk-ross",
  supplierRef: "TU01T",
  toptexRef: "CGTU01T",
  hmHeroImage: "/mockups/tshirt/noir-front.jpg",
};

export const PRODUCT_TW02T: Product = {
  id: "tw02t",
  slug: "tshirt-bc-exact-190-femme",
  reference: "B&C TW02T",
  name: "T-shirt B&C Exact 190 Femme",
  shortName: "T-shirt Femme",
  category: "tshirts",
  gender: "femme",
  tier: "appel",
  description:
    "Version femme du T-shirt d'appel. Coupe ajustée, encolure arrondie. Même qualité que le modèle homme, pensé pour une silhouette féminine moderne.",
  composition: "100% coton semi-peigné",
  weight: "190 g/m²",
  images: PLACEHOLDER_IMAGES("tw02t"),
  colors: TSHIRT_COLORS_CLASSIC,
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_PRICES.appel.dtf,
    dtflex:   TSHIRT_PRICES.appel.dtflex,
    flex:     TSHIRT_PRICES.appel.flex,
    broderie: TSHIRT_PRICES.appel.broderie,
    placements: {
      coeur:     PLACEMENT_SURCHARGES.dtf.coeur,
      dos:       PLACEMENT_SURCHARGES.dtf.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.dtf["coeur-dos"],
    },
    broDeriePlacementSurcharge: {
      coeur:       PLACEMENT_SURCHARGES.broderie.coeur,
      dos:         PLACEMENT_SURCHARGES.broderie.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.broderie["coeur-dos"],
    },
  },
  featured: false,
  seasonal: ["printemps", "ete"],
  supplierName: "falk-ross",
  supplierRef: "TW02T",
  toptexRef: "CGTW02T",
  hmHeroImage: "/mockups/tshirt/blanc-front.jpg",
};

export const PRODUCT_TU03T: Product = {
  id: "tu03t",
  slug: "tshirt-bc-exact-190-premium",
  reference: "B&C TU03T",
  name: "T-shirt B&C Exact 190 Premium",
  shortName: "T-shirt Premium",
  category: "tshirts",
  gender: "unisex",
  tier: "standard",
  description:
    "Le meilleur rapport qualité/prix de notre gamme. Tissu plus dense, col côtelé renforcé, finitions premium. Idéal pour les marques exigeantes qui veulent un résultat professionnel impeccable.",
  composition: "100% coton ring-spun peigné",
  weight: "190 g/m²",
  images: PLACEHOLDER_IMAGES("tu03t"),
  colors: [
    ...TSHIRT_COLORS_CLASSIC,
    { id: "khaki", label: "Kaki", hex: "#65721F", available: true },
    { id: "orange", label: "Orange", hex: "#EA580C", available: true },
  ],
  sizes: TSHIRT_SIZES,
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_PRICES.standard.dtf,
    dtflex:   TSHIRT_PRICES.standard.dtflex,
    flex:     TSHIRT_PRICES.standard.flex,
    broderie: TSHIRT_PRICES.standard.broderie,
    placements: {
      coeur:     PLACEMENT_SURCHARGES.dtf.coeur,
      dos:       PLACEMENT_SURCHARGES.dtf.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.dtf["coeur-dos"],
    },
    broDeriePlacementSurcharge: {
      coeur:       PLACEMENT_SURCHARGES.broderie.coeur,
      dos:         PLACEMENT_SURCHARGES.broderie.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.broderie["coeur-dos"],
    },
  },
  featured: true,
  seasonal: ["printemps", "ete"],
  badge: "Meilleur rapport qualité/prix",
  supplierName: "falk-ross",
  supplierRef: "TU03T",
  toptexRef: "CGTU03T",
  hmHeroImage: "/mockups/tshirt/bordeaux-front.png",
};

// ─── HOODIES / SWEATS ────────────────────────────────────────────────────────

// Couleurs WG004 — version stock agence V1 (2026-05-26).
// Réduit de 10 → 1 couleur (Noir uniquement) pour refléter le stock réel
// à l'agence : 100 pcs noir disponibles immédiatement, pas d'autres coloris
// physiquement en stock. Les autres coloris (blanc, gris, marine, bleu royal,
// bordeaux, rouge, vert bouteille, orange) restent dispos chez Falk&Ross en
// flux mais ne sont pas exposés en V1 pour éviter la confusion stock vs flux.
// Si on veut un jour réactiver le flux fournisseur multi-coloris, restaurer
// la liste complète depuis l'historique git ou les packshots CDN TopTex
// (data/colorPackshots.ts garde les 10 URLs).
const WG004_COLORS = [
  { id: "noir", label: "Noir", hex: "#111111", available: true },
];

// Couleurs réelles B&C WU620 (vérifiées sur CDN Toptex — packshots confirmés)
const WU620_COLORS = [
  { id: "noir",         label: "Noir",         hex: "#111111", available: true },
  { id: "blanc",        label: "Blanc cassé",  hex: "#F5F5F5", available: true },
  { id: "gris-melange", label: "Gris chiné",   hex: "#6B7280", available: true },
  { id: "anthracite",   label: "Anthracite",   hex: "#374151", available: true },
  { id: "marine",       label: "Marine",       hex: "#1E3A5F", available: true },
  { id: "bleu-royal",  label: "Bleu royal",   hex: "#2563EB", available: true },
  { id: "bordeaux",     label: "Bordeaux",     hex: "#7F1D1D", available: true },
  { id: "rouge",        label: "Rouge",        hex: "#DC2626", available: true },
  { id: "kaki",         label: "Kaki",         hex: "#65721F", available: true },
];

const HOODIE_SIZES = [
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: true },
  { label: "XXL", available: true },
  { label: "3XL", available: true },
];


// ─── WG004 stock agence V1 (2026-05-26) ──────────────────────────────────────
// Override produit-spécifique pour le positionner en pilote stock :
//   - Couleur : Noir uniquement (cf. WG004_COLORS ci-dessus)
//   - Technique : DTF uniquement (les autres masquées via prix 0)
//   - Prix : 24.90 € TTC override inline (HOODIE_PRICES.sweat.* reste à 44.90 €
//     pour usage flux fournisseur futur — non modifié)
//   - Description enrichie : mention "Stock agence : 100 pcs noir"
//   - Badge "En stock agence" conservé
//   - Personnalisation : upload logo actif, validation manuelle équipe HM
//     (cf. ProductDetailClient — showMockup désactivé pour wg004 → pas de
//     zone rose textile, image statique propre)
export const PRODUCT_WG004: Product = {
  id: "wg004",
  slug: "sweat-col-rond-bc-set-in-sweat",
  reference: "B&C WG004",
  name: "Sweat col rond B&C Set In Sweat",
  shortName: "Sweat Col Rond",
  category: "hoodies",
  gender: "unisex",
  tier: "appel",
  description:
    "Sweat col rond classique, coupe droite confortable. Intérieur molletonné doux, idéal pour la communication d'entreprise. Résistant au lavage fréquent. **Stock agence : 100 pièces disponibles en noir, expédition immédiate.**",
  composition: "80% coton, 20% polyester recyclé",
  weight: "280 g/m²",
  images: PLACEHOLDER_IMAGES("wg004"),
  colors: WG004_COLORS,
  sizes: HOODIE_SIZES,
  // Stock agence V1 : DTF uniquement. Les techniques DTFlex / Flex / Broderie
  // sont masquées du sélecteur (prix 0 = non disponible côté UI).
  techniques: ["dtf"],
  // Stock agence V1+ : 3 placements activés depuis qu'on a sourcé une vraie photo
  // dos B&C ID.332 (via designpartner.fr, distributeur Falk&Ross). Pre-cropée
  // localement dans /mockups/falkross-cropped/wg004/noir-back.jpg.
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    // Override inline 24.90 € — ne modifie PAS HOODIE_PRICES.sweat (qui reste
    // à 44.90 € pour un éventuel passage flux fournisseur futur).
    dtf:      24.90,
    dtflex:   0, // Masqué V1 stock — réactivable si besoin (HOODIE_PRICES.sweat.dtflex = 46.90)
    flex:     0, // Masqué V1 stock — réactivable si besoin (HOODIE_PRICES.sweat.flex   = 44.90)
    broderie: 0, // Masqué V1 stock — réactivable si besoin (HOODIE_PRICES.sweat.broderie = 52.90)
    placements: {
      coeur:     PLACEMENT_SURCHARGES.dtf.coeur,
      dos:       PLACEMENT_SURCHARGES.dtf.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.dtf["coeur-dos"],
    },
    broDeriePlacementSurcharge: {
      coeur:       PLACEMENT_SURCHARGES.broderie.coeur,
      dos:         PLACEMENT_SURCHARGES.broderie.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.broderie["coeur-dos"],
    },
  },
  featured: true,
  seasonal: ["automne", "hiver"],
  badge: "En stock agence",
  visible: true, // 2026-05-26 — Pilote Stock HM Global / Falk&Ross (B&C ID.332 Crew)
  supplierName: "falk-ross",
  supplierRef: "WG004",
  toptexRef: "CGWG004",
  // Image dos pre-cropée localement (source designpartner.fr distributeur B&C).
  // Active la vue "Dos" du Studio + le placement dos/coeur-dos. Le front est
  // déjà géré via data/colorPackshots.ts (priorité Printify V1 inactif pour
  // wg004 → fallback colorPackshots qui pointe sur la version cropée locale).
  hmMockupImagesBack: {
    "noir": "/mockups/falkross-cropped/wg004/noir-back.jpg",
  },
};

export const PRODUCT_WU620: Product = {
  id: "wu620",
  slug: "hoodie-bc-hooded-sweat",
  reference: "B&C WU620",
  name: "Hoodie B&C Hooded Sweat",
  shortName: "Hoodie",
  category: "hoodies",
  gender: "unisex",
  tier: "standard",
  description:
    "Hoodie à capuche double épaisseur, cordon de serrage assorti, poche kangourou. Le classique premium de toute garde-robe corporate. Idéal pour créer une image de marque cohérente.",
  composition: "80% coton ring-spun, 20% polyester",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("wu620"),
  colors: WU620_COLORS,
  sizes: HOODIE_SIZES,
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      HOODIE_PRICES.hoodie.dtf,
    dtflex:   HOODIE_PRICES.hoodie.dtflex,
    flex:     HOODIE_PRICES.hoodie.flex,
    broderie: HOODIE_PRICES.hoodie.broderie,
    placements: {
      coeur:     PLACEMENT_SURCHARGES.dtf.coeur,
      dos:       PLACEMENT_SURCHARGES.dtf.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.dtf["coeur-dos"],
    },
    broDeriePlacementSurcharge: {
      coeur:       PLACEMENT_SURCHARGES.broderie.coeur,
      dos:         PLACEMENT_SURCHARGES.broderie.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.broderie["coeur-dos"],
    },
  },
  featured: true,
  seasonal: ["automne", "hiver"],
  badge: "Populaire",
  supplierName: "falk-ross",
  supplierRef: "WU620",
  toptexRef: "CGWU620",
};

// ─── SOFTSHELLS / VESTES ──────────────────────────────────────────────────────

const SOFTSHELL_COLORS = [
  { id: "noir", label: "Noir", hex: "#111111", available: true },
  { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
  { id: "gris-acier", label: "Gris acier", hex: "#4B5563", available: true },
  { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
];

const SOFTSHELL_SIZES = [
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: true },
  { label: "XXL", available: true },
  { label: "3XL", available: true },
];


export const PRODUCT_JUI62: Product = {
  id: "jui62",
  visible: false, // 2026-06-03 retiré — softshell TopTex non personnalisable (Studio = image fournisseur + dos absent ; aucun équivalent softshell sur Printful). Validé Kaan.
  slug: "softshell-bc-homme",
  reference: "B&C JUI62",
  name: "Softshell B&C Homme",
  shortName: "Softshell Homme",
  category: "softshells",
  gender: "homme",
  tier: "premium",
  description:
    "Veste softshell 3 couches homme. Imperméable, coupe-vent, respirant. Idéal pour les équipes terrain, les commerciaux, les événements outdoor. Finition premium avec broderie recommandée.",
  composition: "96% polyester, 4% élasthanne (3 couches)",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("jui62"),
  colors: SOFTSHELL_COLORS,
  sizes: SOFTSHELL_SIZES,
  techniques: ["broderie", "dtf", "dtflex", "flex"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SOFTSHELL_PRICES.standard.dtf,
    dtflex:   SOFTSHELL_PRICES.standard.dtflex,
    flex:     SOFTSHELL_PRICES.standard.flex,
    broderie: SOFTSHELL_PRICES.standard.broderie,
    placements: {
      coeur:     PLACEMENT_SURCHARGES.dtf.coeur,
      dos:       PLACEMENT_SURCHARGES.dtf.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.dtf["coeur-dos"],
    },
    broDeriePlacementSurcharge: {
      coeur:       PLACEMENT_SURCHARGES.broderie.coeur,
      dos:         PLACEMENT_SURCHARGES.broderie.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.broderie["coeur-dos"],
    },
  },
  featured: true,
  seasonal: ["automne", "hiver"],
  badge: "Premium",
  supplierName: "falk-ross",
  supplierRef: "JUI62",
  toptexRef: "CGJUI62",
};

export const PRODUCT_JWI63: Product = {
  id: "jwi63",
  visible: false, // 2026-06-03 retiré — softshell TopTex non personnalisable (Studio = image fournisseur + dos absent ; aucun équivalent softshell sur Printful). Validé Kaan.
  slug: "softshell-bc-femme",
  reference: "B&C JWI63",
  name: "Softshell B&C Femme",
  shortName: "Softshell Femme",
  category: "softshells",
  gender: "femme",
  tier: "premium",
  description:
    "Veste softshell 3 couches femme. Coupe ajustée, imperméable et respirante. Silhouette moderne pour une image de marque professionnelle et premium.",
  composition: "96% polyester, 4% élasthanne (3 couches)",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("jwi63"),
  colors: SOFTSHELL_COLORS,
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["broderie", "dtf", "dtflex", "flex"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SOFTSHELL_PRICES.standard.dtf,
    dtflex:   SOFTSHELL_PRICES.standard.dtflex,
    flex:     SOFTSHELL_PRICES.standard.flex,
    broderie: SOFTSHELL_PRICES.standard.broderie,
    placements: {
      coeur:     PLACEMENT_SURCHARGES.dtf.coeur,
      dos:       PLACEMENT_SURCHARGES.dtf.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.dtf["coeur-dos"],
    },
    broDeriePlacementSurcharge: {
      coeur:       PLACEMENT_SURCHARGES.broderie.coeur,
      dos:         PLACEMENT_SURCHARGES.broderie.dos,
      "coeur-dos": PLACEMENT_SURCHARGES.broderie["coeur-dos"],
    },
  },
  featured: false,
  seasonal: ["automne", "hiver"],
  badge: "Premium",
  supplierName: "falk-ross",
  supplierRef: "JWI63",
  toptexRef: "CGJWI63",
};

// ─── T-SHIRTS iDeal Basic Brand ───────────────────────────────────────────────

// Palette complète iDeal — couvre les ~20 coloris disponibles sur TopTex
const IDEAL_COLORS_BASE = [
  { id: "blanc",          label: "Blanc",           hex: "#FFFFFF", available: true },
  { id: "noir",           label: "Noir",            hex: "#111111", available: true },
  { id: "marine",         label: "Marine",          hex: "#1E3A5F", available: true },
  { id: "rouge",          label: "Rouge",           hex: "#DC2626", available: true },
  { id: "gris",           label: "Gris chiné",      hex: "#9CA3AF", available: true },
  { id: "bleu-royal",     label: "Bleu royal",      hex: "#2563EB", available: true },
  { id: "bordeaux",       label: "Bordeaux",        hex: "#7F1D1D", available: true },
  { id: "anthracite",     label: "Anthracite",      hex: "#374151", available: true },
  { id: "vert-bouteille", label: "Vert bouteille",  hex: "#166534", available: true },
  { id: "turquoise",      label: "Turquoise",       hex: "#0891B2", available: true },
  { id: "orange",         label: "Orange",          hex: "#EA580C", available: true },
  { id: "jaune",          label: "Jaune",           hex: "#EAB308", available: true },
  { id: "rose",           label: "Rose",            hex: "#EC4899", available: true },
  { id: "beige",          label: "Beige",           hex: "#D4B896", available: true },
  { id: "violet",         label: "Violet",          hex: "#7C3AED", available: true },
  { id: "kaki",           label: "Kaki",            hex: "#65721F", available: true },
];

// ─── Toptex CDN images ────────────────────────────────────────────────────────
// URLs vérifiées en live le 28/04/2026 — source : cdn.toptex.com/pictures/
// next.config.ts autorise ce domaine via remotePatterns (pathname: /pictures/**)

export const PRODUCT_IB320: Product = {
  id: "ib320",
  slug: "tshirt-ideal-190-homme",
  reference: "iDeal Basic Brand IB320",
  toptexRef: "IB320",
  toptexUrl: "https://www.toptex.fr/ib320-t-shirt-homme-ideal190.html",
  prixAchatHT: 2.54,
  name: "T-shirt iDeal190 Homme",
  shortName: "T-shirt Homme iDeal",
  category: "tshirts",
  gender: "homme",
  tier: "appel",
  description: "T-shirt homme 190 g/m² en coton semi-peigné. Coupe moderne, col rond côtelé, épaule à épaule. 20 coloris disponibles, du XS au 5XL. Le meilleur rapport qualité/prix du marché.",
  composition: "100% coton semi-peigné",
  weight: "190 g/m²",
  images: PLACEHOLDER_IMAGES("ib320"),
  colors: IDEAL_COLORS_BASE,
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
    { label: "3XL", available: true },
    { label: "4XL", available: true },
    { label: "5XL", available: true },
  ],
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_IDEAL_PRICES.base.dtf,
    dtflex:   TSHIRT_IDEAL_PRICES.base.dtflex,
    flex:     TSHIRT_IDEAL_PRICES.base.flex,
    broderie: TSHIRT_IDEAL_PRICES.base.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  seasonal: ["printemps", "ete"],
  badge: "Bestseller",
  supplierName: "toptex",
  supplierRef: "IB320",
  ideaPour: ["Équipes événementielles", "Associations", "Restaurants & Hôtellerie"],
};

export const PRODUCT_IB321: Product = {
  id: "ib321",
  slug: "tshirt-ideal-190-femme",
  reference: "iDeal Basic Brand IB321",
  toptexRef: "IB321",
  toptexUrl: "https://www.toptex.fr/ib321-t-shirt-femme-ideal190.html",
  prixAchatHT: 2.54,
  name: "T-shirt iDeal190 Femme",
  shortName: "T-shirt Femme iDeal",
  category: "tshirts",
  gender: "femme",
  tier: "appel",
  description: "T-shirt femme 190 g/m² coupe cintrée. 16 coloris, du XS au 3XL. Idéal pour les uniformes féminins ou les événements d'entreprise.",
  composition: "100% coton semi-peigné",
  weight: "190 g/m²",
  images: PLACEHOLDER_IMAGES("ib321"),
  colors: IDEAL_COLORS_BASE,
  sizes: TSHIRT_SIZES,
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_IDEAL_PRICES.base.dtf,
    dtflex:   TSHIRT_IDEAL_PRICES.base.dtflex,
    flex:     TSHIRT_IDEAL_PRICES.base.flex,
    broderie: TSHIRT_IDEAL_PRICES.base.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["printemps", "ete"],
  supplierName: "toptex",
  supplierRef: "IB321",
};

export const PRODUCT_IB323: Product = {
  id: "ib323",
  slug: "tshirt-manches-longues-ideal-190",
  reference: "iDeal Basic Brand IB323",
  toptexRef: "IB323",
  toptexUrl: "https://www.toptex.fr/ib323-t-shirt-lsl-unisexe-ideal190.html",
  prixAchatHT: 4.14,
  name: "T-shirt Manches Longues iDeal190",
  shortName: "T-shirt ML iDeal",
  category: "tshirts",
  gender: "unisex",
  tier: "appel",
  description: "T-shirt manches longues unisexe 190 g/m². 16 coloris, du XS au 5XL. Parfait pour les saisons intermédiaires, les sports d'hiver ou les équipes terrain.",
  composition: "100% coton semi-peigné",
  weight: "190 g/m²",
  images: PLACEHOLDER_IMAGES("ib323"),
  colors: IDEAL_COLORS_BASE,
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
    { label: "3XL", available: true },
    { label: "4XL", available: true },
    { label: "5XL", available: true },
  ],
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_IDEAL_PRICES.longues.dtf,
    dtflex:   TSHIRT_IDEAL_PRICES.longues.dtflex,
    flex:     TSHIRT_IDEAL_PRICES.longues.flex,
    broderie: TSHIRT_IDEAL_PRICES.longues.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["automne", "hiver"],
  badge: "Nouveauté",
  supplierName: "toptex",
  supplierRef: "IB323",
  ideaPour: ["Sport & Outdoor", "BTP & Artisans", "Associations"],
};

// ─── POLOS ────────────────────────────────────────────────────────────────────

const POLO_SIZES_STD = [
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: true },
  { label: "XXL", available: true },
  { label: "3XL", available: true },
];

// Palette complète polos Kariban — couvre les coloris disponibles sur TopTex
const POLO_COLORS_BASE = [
  { id: "blanc",          label: "Blanc",           hex: "#FFFFFF", available: true },
  { id: "noir",           label: "Noir",            hex: "#111111", available: true },
  { id: "marine",         label: "Marine",          hex: "#1E3A5F", available: true },
  { id: "rouge",          label: "Rouge",           hex: "#DC2626", available: true },
  { id: "gris",           label: "Gris chiné",      hex: "#9CA3AF", available: true },
  { id: "bleu-royal",     label: "Bleu royal",      hex: "#2563EB", available: true },
  { id: "anthracite",     label: "Anthracite",      hex: "#374151", available: true },
  { id: "vert-bouteille", label: "Vert bouteille",  hex: "#166534", available: true },
  { id: "bordeaux",       label: "Bordeaux",        hex: "#7F1D1D", available: true },
  { id: "orange",         label: "Orange",          hex: "#EA580C", available: true },
  { id: "turquoise",      label: "Turquoise",       hex: "#0891B2", available: true },
  { id: "bleu-ciel",      label: "Bleu ciel",       hex: "#38BDF8", available: true },
  { id: "beige",          label: "Beige",           hex: "#D4B896", available: true },
  { id: "jaune",          label: "Jaune",           hex: "#EAB308", available: true },
];

const POLO_CONSEIL = "💡 Conseil HM Global : Sur les polos piqués, la broderie est recommandée pour un rendu professionnel durable. Le DTF n'est pas adapté à la surface structurée piqué.";

export const PRODUCT_K262: Product = {
  id: "k262",
  slug: "polo-jersey-homme-kariban",
  reference: "Kariban K262",
  toptexRef: "K262",
  toptexUrl: "https://www.toptex.fr/k262-polo-jersey-mc-homme.html",
  prixAchatHT: 6.90,
  name: "Polo Jersey Manches Courtes Homme",
  shortName: "Polo Jersey Homme",
  category: "polos",
  gender: "homme",
  tier: "appel",
  description: "Polo jersey coupe moderne, idéal pour la restauration, l'hôtellerie et le commerce. Tissu jersey souple et confortable. Broderie recommandée pour un rendu professionnel.",
  composition: "100% coton jersey 200 g/m²",
  weight: "200 g/m²",
  images: PLACEHOLDER_IMAGES("k262"),
  colors: POLO_COLORS_BASE,
  sizes: POLO_SIZES_STD,
  techniques: ["flex", "broderie"],
  techniqueRecommandee: "broderie",
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLO_PRICES.jersey.dtf,
    dtflex:   POLO_PRICES.jersey.dtflex,
    flex:     POLO_PRICES.jersey.flex,
    broderie: POLO_PRICES.jersey.broderie,
    placements: PLACEMENT_SURCHARGES.flex,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  seasonal: ["printemps", "ete"],
  badge: "Meilleur rapport qualité/prix",
  supplierName: "toptex",
  supplierRef: "K262",
  ideaPour: ["Restauration & Hôtellerie", "Commerce & Retail", "Accueil événementiel"],
};

export const PRODUCT_K256: Product = {
  id: "k256",
  slug: "polo-pique-manches-longues-homme",
  reference: "Kariban K256",
  toptexRef: "K256",
  toptexUrl: "https://www.toptex.fr/k256-polo-pique-ml-homme.html",
  prixAchatHT: 9.22,
  name: "Polo Piqué Manches Longues Homme",
  shortName: "Polo ML Homme",
  category: "polos",
  gender: "homme",
  tier: "standard",
  description: "Polo piqué manches longues, coupe droite. Tissu piqué structuré 220 g/m², 15 coloris. Idéal pour les équipes en contact client tout au long de l'année.",
  composition: "100% coton piqué",
  weight: "220 g/m²",
  images: PLACEHOLDER_IMAGES("k256"),
  colors: POLO_COLORS_BASE,
  sizes: POLO_SIZES_STD,
  techniques: ["flex", "broderie"],
  techniqueRecommandee: "broderie",
  conseil: POLO_CONSEIL,
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLO_PRICES.longues.dtf,
    dtflex:   POLO_PRICES.longues.dtflex,
    flex:     POLO_PRICES.longues.flex,
    broderie: POLO_PRICES.longues.broderie,
    placements: PLACEMENT_SURCHARGES.flex,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["automne", "hiver", "printemps"],
  badge: "Premium",
  supplierName: "toptex",
  supplierRef: "K256",
};

export const PRODUCT_K239: Product = {
  id: "k239",
  slug: "polo-pique-mc-homme-kariban",
  reference: "Kariban K239",
  toptexRef: "K239",
  prixAchatHT: 11.15,
  name: "Polo Piqué Manches Courtes Homme",
  shortName: "Polo Piqué Homme",
  category: "polos",
  gender: "homme",
  tier: "standard",
  description: "Polo piqué classique manches courtes homme. Tissu dense et structuré, 5 coloris sobres. Idéal pour les uniforms corporate et les équipes commerciales.",
  composition: "100% coton piqué",
  weight: "220 g/m²",
  images: PLACEHOLDER_IMAGES("k239"),
  colors: [
    { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "gris", label: "Gris", hex: "#9CA3AF", available: true },
  ],
  sizes: POLO_SIZES_STD,
  techniques: ["flex", "broderie"],
  techniqueRecommandee: "broderie",
  conseil: POLO_CONSEIL,
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLO_PRICES.pique.dtf,
    dtflex:   POLO_PRICES.pique.dtflex,
    flex:     POLO_PRICES.pique.flex,
    broderie: POLO_PRICES.pique.broderie,
    placements: PLACEMENT_SURCHARGES.flex,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["printemps", "ete"],
  supplierName: "toptex",
  supplierRef: "K239",
};

export const PRODUCT_K240: Product = {
  id: "k240",
  slug: "polo-pique-mc-femme-kariban",
  reference: "Kariban K240",
  toptexRef: "K240",
  prixAchatHT: 11.58,
  name: "Polo Maille Piqué Manches Courtes Femme",
  shortName: "Polo Piqué Femme",
  category: "polos",
  gender: "femme",
  tier: "standard",
  description: "Polo piqué femme coupe ajustée. Tissu maille piqué structuré, finitions soignées. Idéal pour les uniformes professionnels féminins.",
  composition: "100% coton piqué",
  weight: "220 g/m²",
  images: PLACEHOLDER_IMAGES("k240"),
  colors: [
    { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "gris", label: "Gris", hex: "#9CA3AF", available: true },
  ],
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["flex", "broderie"],
  techniqueRecommandee: "broderie",
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLO_PRICES.pique.dtf,
    dtflex:   POLO_PRICES.pique.dtflex,
    flex:     POLO_PRICES.pique.flex,
    broderie: POLO_PRICES.pique.broderie,
    placements: PLACEMENT_SURCHARGES.flex,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["printemps", "ete"],
  supplierName: "toptex",
  supplierRef: "K240",
};

// ─── SWEATS iDeal & Native Spirit ─────────────────────────────────────────────

export const PRODUCT_IB400: Product = {
  id: "ib400",
  slug: "sweat-col-rond-ideal",
  reference: "iDeal Basic Brand IB400",
  toptexRef: "IB400",
  toptexUrl: "https://www.toptex.fr/ib400-sweat-shirt-col-rond-unisexe.html",
  prixAchatHT: 6.70,
  name: "Sweat Col Rond iDeal 300",
  shortName: "Sweat Col Rond iDeal",
  category: "hoodies",
  gender: "unisex",
  tier: "appel",
  description: "Sweat col rond unisexe 300 g/m², coupe droite confortable. 5 coloris, du XS au 3XL. Excellent rapport qualité/prix pour les équipes et associations.",
  composition: "80% coton, 20% polyester",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("ib400"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "gris-melange", label: "Gris mélangé", hex: "#6B7280", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "blanc-casse", label: "Blanc cassé", hex: "#F5F5F5", available: true },
  ],
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
    { label: "3XL", available: true },
  ],
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.colRond.dtf,
    dtflex:   SWEAT_IDEAL_PRICES.colRond.dtflex,
    flex:     SWEAT_IDEAL_PRICES.colRond.flex,
    broderie: SWEAT_IDEAL_PRICES.colRond.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  seasonal: ["automne", "hiver"],
  badge: "Meilleur rapport qualité/prix",
  supplierName: "toptex",
  supplierRef: "IB400",
  ideaPour: ["Associations", "Sport & Clubs", "Événementiels"],
};

export const PRODUCT_IB402: Product = {
  id: "ib402",
  slug: "hoodie-ideal-300",
  reference: "iDeal Basic Brand IB402",
  toptexRef: "IB402",
  toptexUrl: "https://www.toptex.fr/ib402-sweat-shirt-capuche-unisexe.html",
  prixAchatHT: 8.92,
  name: "Hoodie à Capuche iDeal 300",
  shortName: "Hoodie iDeal",
  category: "hoodies",
  gender: "unisex",
  tier: "appel",
  description: "Hoodie à capuche unisexe 300 g/m², poche kangourou, cordon assorti. 10 coloris, du XS au 3XL. Le bestseller prix/qualité de la gamme iDeal.",
  composition: "80% coton, 20% polyester",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("ib402"),
  colors: [
    { id: "noir",         label: "Noir",          hex: "#111111", available: true },
    { id: "blanc-casse",  label: "Blanc cassé",   hex: "#F5F5F5", available: true },
    { id: "gris",         label: "Gris Oxford",   hex: "#9CA3AF", available: true },
    { id: "gris-melange", label: "Gris chiné",    hex: "#6B7280", available: true },
    { id: "anthracite",   label: "Anthracite",    hex: "#374151", available: true },
    { id: "marine",       label: "Marine",        hex: "#1E3A5F", available: true },
    { id: "rouge",        label: "Rouge",         hex: "#DC2626", available: true },
    { id: "bleu-royal",   label: "Bleu royal",    hex: "#2563EB", available: true },
    { id: "vert-foret",   label: "Vert forêt",    hex: "#14532D", available: true },
    { id: "orange",       label: "Orange",        hex: "#EA580C", available: true },
  ],
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
    { label: "3XL", available: true },
  ],
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.hoodie.dtf,
    dtflex:   SWEAT_IDEAL_PRICES.hoodie.dtflex,
    flex:     SWEAT_IDEAL_PRICES.hoodie.flex,
    broderie: SWEAT_IDEAL_PRICES.hoodie.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  seasonal: ["automne", "hiver"],
  badge: "Bestseller",
  supplierName: "toptex",
  supplierRef: "IB402",
  ideaPour: ["Associations & BDE", "Sport & Clubs", "Marques & Streetwear"],
};

export const PRODUCT_NS400: Product = {
  id: "ns400",
  slug: "sweat-col-rond-eco-native-spirit",
  reference: "Native Spirit NS400",
  toptexRef: "NS400",
  toptexUrl: "https://www.toptex.fr/ns400-sweat-shirt-ecoresponsable-col-rond.html",
  prixAchatHT: 8.00,
  name: "Sweat Col Rond Écoresponsable Native Spirit",
  shortName: "Sweat Éco Native Spirit",
  category: "hoodies",
  gender: "unisex",
  tier: "premium",
  description: "Sweat col rond écoresponsable 85% coton biologique / 15% polyester recyclé. Coloris essentiels sélectionnés pour la personnalisation. Certifié GOTS. Idéal pour les marques engagées.",
  composition: "85% coton biologique, 15% polyester recyclé",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("ns400"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "ecru", label: "Écru naturel", hex: "#F5F0E8", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "vert-foret", label: "Vert forêt", hex: "#14532D", available: true },
    { id: "terracotta", label: "Terracotta", hex: "#B45309", available: true },
    { id: "gris-ardoise", label: "Gris ardoise", hex: "#4B5563", available: true },
  ],
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
    { label: "3XL", available: true },
  ],
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.ecoSweat.dtf,
    dtflex:   SWEAT_IDEAL_PRICES.ecoSweat.dtflex,
    flex:     SWEAT_IDEAL_PRICES.ecoSweat.flex,
    broderie: SWEAT_IDEAL_PRICES.ecoSweat.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  seasonal: ["automne", "hiver"],
  badge: "Écoresponsable",
  supplierName: "toptex",
  supplierRef: "NS400",
  ideaPour: ["Marques éco-responsables", "Associations engagées", "Boutiques bio"],
};

export const PRODUCT_NS401: Product = {
  id: "ns401",
  slug: "hoodie-eco-native-spirit",
  reference: "Native Spirit NS401",
  toptexRef: "NS401",
  prixAchatHT: 12.00,
  name: "Hoodie Écoresponsable Native Spirit",
  shortName: "Hoodie Éco Native Spirit",
  category: "hoodies",
  gender: "unisex",
  tier: "premium",
  description: "Hoodie écoresponsable à capuche, 85% coton bio / 15% polyester recyclé. Coloris essentiels sélectionnés pour la personnalisation. Certifié GOTS. Le hoodie premium durable pour les marques qui ont du sens.",
  composition: "85% coton biologique, 15% polyester recyclé",
  weight: "320 g/m²",
  images: PLACEHOLDER_IMAGES("ns401"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "ecru", label: "Écru naturel", hex: "#F5F0E8", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "vert-foret", label: "Vert forêt", hex: "#14532D", available: true },
    { id: "terracotta", label: "Terracotta", hex: "#B45309", available: true },
  ],
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
    { label: "3XL", available: true },
  ],
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.ecoHoodie.dtf,
    dtflex:   SWEAT_IDEAL_PRICES.ecoHoodie.dtflex,
    flex:     SWEAT_IDEAL_PRICES.ecoHoodie.flex,
    broderie: SWEAT_IDEAL_PRICES.ecoHoodie.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["automne", "hiver"],
  badge: "Écoresponsable · Premium",
  supplierName: "toptex",
  supplierRef: "NS401",
  ideaPour: ["Marques éco-responsables", "Associations engagées"],
};

export const PRODUCT_NS408: Product = {
  id: "ns408",
  slug: "hoodie-oversize-eco-native-spirit",
  reference: "Native Spirit NS408",
  toptexRef: "NS408",
  prixAchatHT: 20.73,
  name: "Hoodie Oversize Écoresponsable Native Spirit",
  shortName: "Hoodie Oversize",
  category: "hoodies",
  gender: "unisex",
  tier: "premium",
  description: "Hoodie oversize écoresponsable, coupe ample tendance streetwear. Coloris essentiels sélectionnés pour la personnalisation. Parfait pour les associations, BDE, clubs de sport et marques streetwear.",
  composition: "85% coton biologique, 15% polyester recyclé",
  weight: "350 g/m²",
  images: PLACEHOLDER_IMAGES("ns408"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "ecru", label: "Écru naturel", hex: "#F5F0E8", available: true },
    { id: "gris-melange", label: "Gris mélangé", hex: "#6B7280", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "vert-foret", label: "Vert forêt", hex: "#14532D", available: true },
  ],
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf", "dtflex", "flex"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.oversize.dtf,
    dtflex:   SWEAT_IDEAL_PRICES.oversize.dtflex,
    flex:     SWEAT_IDEAL_PRICES.oversize.flex,
    broderie: SWEAT_IDEAL_PRICES.oversize.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["automne", "hiver"],
  badge: "Nouveauté · Oversize",
  supplierName: "toptex",
  supplierRef: "NS408",
  ideaPour: ["BDE & Associations étudiantes", "Streetwear & Marques", "Clubs de sport"],
};

// ─── POLAIRES & DOUDOUNES ─────────────────────────────────────────────────────

const POLAIRE_CONSEIL = "💡 Conseil HM Global : Sur les vestes et polaires, la broderie est recommandée pour un résultat professionnel durable. Le DTF n'est pas adapté aux surfaces imperméables ou polaires.";

export const PRODUCT_IB900: Product = {
  id: "ib900",
  slug: "veste-polaire-ideal",
  reference: "iDeal Basic Brand IB900",
  toptexRef: "IB900",
  prixAchatHT: 9.01,
  name: "Veste Polaire Unisexe iDeal",
  shortName: "Polaire iDeal",
  category: "polaires",
  gender: "unisex",
  tier: "standard",
  description: "Polaire légère et chaude, coupe droite confortable. 6 coloris, parfaite pour les équipes terrain, BTP, outdoor et associations.",
  composition: "100% polyester antipilling",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("ib900"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "gris", label: "Gris", hex: "#9CA3AF", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "bleu-royal", label: "Bleu royal", hex: "#2563EB", available: true },
  ],
  sizes: [
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
    { label: "3XL", available: true },
  ],
  techniques: ["flex", "broderie"],
  techniqueRecommandee: "broderie",
  conseil: POLAIRE_CONSEIL,
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLAIRE_PRICES.legere.dtf,
    dtflex:   POLAIRE_PRICES.legere.dtflex,
    flex:     POLAIRE_PRICES.legere.flex,
    broderie: POLAIRE_PRICES.legere.broderie,
    placements: PLACEMENT_SURCHARGES.flex,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["automne", "hiver"],
  badge: "Nouveauté",
  supplierName: "toptex",
  supplierRef: "IB900",
  ideaPour: ["BTP & Artisans", "Outdoor & Sport", "Associations"],
};

export const PRODUCT_IB6175: Product = {
  id: "ib6175",
  slug: "doudoune-matelassee-homme-ideal",
  reference: "iDeal Basic Brand IB6175",
  toptexRef: "IB6175",
  prixAchatHT: 17.43,
  name: "Doudoune Matelassée Homme iDeal",
  shortName: "Doudoune Homme",
  category: "polaires",
  gender: "homme",
  tier: "premium",
  description: "Doudoune matelassée légère et chaude, coupe moderne. 3 coloris sobres, idéale pour les équipes commerciales et les événements hivernaux.",
  composition: "100% polyester matelassé",
  weight: "—",
  images: PLACEHOLDER_IMAGES("ib6175"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "gris-acier", label: "Gris acier", hex: "#4B5563", available: true },
  ],
  sizes: SOFTSHELL_SIZES,
  techniques: ["flex", "broderie"],
  techniqueRecommandee: "broderie",
  conseil: POLAIRE_CONSEIL,
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLAIRE_PRICES.doudoune.dtf,
    dtflex:   POLAIRE_PRICES.doudoune.dtflex,
    flex:     POLAIRE_PRICES.doudoune.flex,
    broderie: POLAIRE_PRICES.doudoune.broderie,
    placements: PLACEMENT_SURCHARGES.flex,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["hiver"],
  badge: "Nouveauté · Premium",
  supplierName: "toptex",
  supplierRef: "IB6175",
  ideaPour: ["Équipes commerciales", "Événements hivernaux", "Outdoor"],
};

export const PRODUCT_IB6176: Product = {
  id: "ib6176",
  slug: "doudoune-matelassee-femme-ideal",
  reference: "iDeal Basic Brand IB6176",
  toptexRef: "IB6176",
  prixAchatHT: 17.43,
  name: "Doudoune Matelassée Femme iDeal",
  shortName: "Doudoune Femme",
  category: "polaires",
  gender: "femme",
  tier: "premium",
  description: "Doudoune matelassée femme, coupe ajustée moderne. 3 coloris, légère et chaude pour un usage professionnel ou événementiel hivernal.",
  composition: "100% polyester matelassé",
  weight: "—",
  images: PLACEHOLDER_IMAGES("ib6176"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "gris-acier", label: "Gris acier", hex: "#4B5563", available: true },
  ],
  sizes: [
    { label: "XS", available: true },
    { label: "S", available: true },
    { label: "M", available: true },
    { label: "L", available: true },
    { label: "XL", available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["flex", "broderie"],
  techniqueRecommandee: "broderie",
  conseil: POLAIRE_CONSEIL,
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLAIRE_PRICES.doudoune.dtf,
    dtflex:   POLAIRE_PRICES.doudoune.dtflex,
    flex:     POLAIRE_PRICES.doudoune.flex,
    broderie: POLAIRE_PRICES.doudoune.broderie,
    placements: PLACEMENT_SURCHARGES.flex,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["hiver"],
  badge: "Nouveauté · Premium",
  supplierName: "toptex",
  supplierRef: "IB6176",
};

export const PRODUCT_WK904: Product = {
  id: "wk904",
  slug: "micropolaire-bicolore-eco-wk",
  reference: "WK WK904",
  toptexRef: "WK904",
  prixAchatHT: 20.03,
  name: "Veste Micropolaire Bicolore Écoresponsable",
  shortName: "Micropolaire Éco",
  category: "polaires",
  gender: "unisex",
  tier: "premium",
  description: "Veste micropolaire bicolore écoresponsable. 4 combinaisons coloris, matière recyclée certifiée. Coupe moderne avec zip pleine longueur.",
  composition: "100% polyester recyclé antipilling",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("wk904"),
  colors: [
    { id: "noir-gris", label: "Noir / Gris", hex: "#111111", available: true },
    { id: "marine-gris", label: "Marine / Gris", hex: "#1E3A5F", available: true },
    { id: "rouge-noir", label: "Rouge / Noir", hex: "#DC2626", available: true },
    { id: "bleu-noir", label: "Bleu / Noir", hex: "#2563EB", available: true },
  ],
  sizes: SOFTSHELL_SIZES,
  techniques: ["flex", "broderie"],
  techniqueRecommandee: "broderie",
  conseil: POLAIRE_CONSEIL,
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLAIRE_PRICES.eco.dtf,
    dtflex:   POLAIRE_PRICES.eco.dtflex,
    flex:     POLAIRE_PRICES.eco.flex,
    broderie: POLAIRE_PRICES.eco.broderie,
    placements: PLACEMENT_SURCHARGES.flex,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["automne", "hiver"],
  badge: "Écoresponsable",
  supplierName: "toptex",
  supplierRef: "WK904",
  ideaPour: ["BTP & Artisans", "Sport & Outdoor", "Équipes terrain"],
};

// ─── CASQUETTES ───────────────────────────────────────────────────────────────

const CASQUETTE_CONSEIL = "💡 La broderie est la seule technique professionnelle adaptée aux casquettes — rendu 3D, durable et premium. Minimum 5 casquettes recommandé.";

const CASQUETTE_SIZES = [{ label: "One size", available: true }];

export const PRODUCT_KP157: Product = {
  id: "kp157",
  slug: "casquette-polyester-5-panneaux-kup",
  reference: "K-up KP157",
  toptexRef: "KP157",
  prixAchatHT: 1.10,
  name: "Casquette Polyester 5 Panneaux",
  shortName: "Casquette 5P",
  category: "casquettes",
  gender: "unisex",
  tier: "appel",
  description: "Casquette 5 panneaux en polyester léger. 6 coloris, fermeture à velcro réglable. Idéale pour les événements, associations et équipes sportives.",
  composition: "100% polyester",
  weight: "—",
  images: PLACEHOLDER_IMAGES("kp157"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "bleu-royal", label: "Bleu royal", hex: "#2563EB", available: true },
    { id: "gris", label: "Gris", hex: "#9CA3AF", available: true },
  ],
  sizes: CASQUETTE_SIZES,
  techniques: ["broderie"],
  techniqueRecommandee: "broderie",
  conseil: CASQUETTE_CONSEIL,
  placements: ["coeur"],
  pricing: {
    dtf:      CASQUETTE_PRICES.entreeGamme.dtf,
    dtflex:   CASQUETTE_PRICES.entreeGamme.dtflex,
    flex:     CASQUETTE_PRICES.entreeGamme.flex,
    broderie: CASQUETTE_PRICES.entreeGamme.broderie,
    placements: { coeur: 0, dos: 0, "coeur-dos": 0 },
    broDeriePlacementSurcharge: { coeur: 0, dos: 0, "coeur-dos": 0 },
  },
  featured: true,
  seasonal: ["printemps", "ete"],
  badge: "Meilleur rapport qualité/prix",
  supplierName: "toptex",
  supplierRef: "KP157",
  ideaPour: ["Événementiels", "Associations", "Sport & Clubs"],
};

export const PRODUCT_KP162: Product = {
  id: "kp162",
  slug: "casquette-coton-epais-5-panneaux-kup",
  reference: "K-up KP162",
  toptexRef: "KP162",
  prixAchatHT: 1.67,
  name: "Casquette Coton Épais 5 Panneaux",
  shortName: "Casquette Coton",
  category: "casquettes",
  gender: "unisex",
  tier: "standard",
  description: "Casquette 5 panneaux en coton épais. 8 coloris, visière pré-incurvée, fermeture velcro. Confort et durabilité pour une utilisation professionnelle quotidienne.",
  composition: "100% coton épais",
  weight: "—",
  images: PLACEHOLDER_IMAGES("kp162"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "bleu-royal", label: "Bleu royal", hex: "#2563EB", available: true },
    { id: "gris", label: "Gris", hex: "#9CA3AF", available: true },
    { id: "bordeaux", label: "Bordeaux", hex: "#7F1D1D", available: true },
    { id: "vert-bouteille", label: "Vert bouteille", hex: "#166534", available: true },
  ],
  sizes: CASQUETTE_SIZES,
  techniques: ["broderie"],
  techniqueRecommandee: "broderie",
  conseil: CASQUETTE_CONSEIL,
  placements: ["coeur"],
  pricing: {
    dtf:      CASQUETTE_PRICES.standard.dtf,
    dtflex:   CASQUETTE_PRICES.standard.dtflex,
    flex:     CASQUETTE_PRICES.standard.flex,
    broderie: CASQUETTE_PRICES.standard.broderie,
    placements: { coeur: 0, dos: 0, "coeur-dos": 0 },
    broDeriePlacementSurcharge: { coeur: 0, dos: 0, "coeur-dos": 0 },
  },
  featured: false,
  seasonal: ["printemps", "ete", "automne"],
  supplierName: "toptex",
  supplierRef: "KP162",
};

export const PRODUCT_KP165: Product = {
  id: "kp165",
  slug: "casquette-vintage-6-panneaux-kup",
  reference: "K-up KP165",
  toptexRef: "KP165",
  prixAchatHT: 3.76,
  name: "Casquette Vintage 6 Panneaux",
  shortName: "Casquette Vintage",
  category: "casquettes",
  gender: "unisex",
  tier: "standard",
  description: "Style vintage washed, 6 panneaux structurés. 5 coloris tendance streetwear. Idéale pour les associations, clubs, marques et boutiques.",
  composition: "100% coton washed",
  weight: "—",
  images: PLACEHOLDER_IMAGES("kp165"),
  colors: [
    { id: "noir-washed", label: "Noir washed", hex: "#2D2D2D", available: true },
    { id: "beige-washed", label: "Beige washed", hex: "#D4C5A9", available: true },
    { id: "marine-washed", label: "Marine washed", hex: "#2A3A56", available: true },
    { id: "kaki-washed", label: "Kaki washed", hex: "#78764A", available: true },
    { id: "rouge-washed", label: "Rouge washed", hex: "#9B3A3A", available: true },
  ],
  sizes: CASQUETTE_SIZES,
  techniques: ["broderie"],
  techniqueRecommandee: "broderie",
  conseil: CASQUETTE_CONSEIL,
  placements: ["coeur"],
  pricing: {
    dtf:      CASQUETTE_PRICES.vintage.dtf,
    dtflex:   CASQUETTE_PRICES.vintage.dtflex,
    flex:     CASQUETTE_PRICES.vintage.flex,
    broderie: CASQUETTE_PRICES.vintage.broderie,
    placements: { coeur: 0, dos: 0, "coeur-dos": 0 },
    broDeriePlacementSurcharge: { coeur: 0, dos: 0, "coeur-dos": 0 },
  },
  featured: true,
  seasonal: ["printemps", "ete", "automne"],
  badge: "Premium",
  supplierName: "toptex",
  supplierRef: "KP165",
  ideaPour: ["Associations & BDE", "Clubs & Sports", "Marques & Boutiques"],
};

export const PRODUCT_KP185: Product = {
  id: "kp185",
  slug: "casquette-sandwich-6-panneaux-kup",
  reference: "K-up KP185",
  toptexRef: "KP185",
  prixAchatHT: 1.53,
  name: "Casquette Sandwich Contrasté 6 Panneaux",
  shortName: "Casquette Sandwich",
  category: "casquettes",
  gender: "unisex",
  tier: "appel",
  description: "Casquette 6 panneaux avec passepoil contrasté sur la visière. 5 combinaisons coloris bicolores. Rendu dynamique et sportif, parfait pour les clubs et équipes.",
  composition: "100% polyester",
  weight: "—",
  images: PLACEHOLDER_IMAGES("kp185"),
  colors: [
    { id: "noir-rouge", label: "Noir / Rouge", hex: "#111111", available: true },
    { id: "marine-blanc", label: "Marine / Blanc", hex: "#1E3A5F", available: true },
    { id: "blanc-bleu", label: "Blanc / Bleu", hex: "#FFFFFF", available: true },
    { id: "rouge-blanc", label: "Rouge / Blanc", hex: "#DC2626", available: true },
    { id: "bleu-rouge", label: "Bleu / Rouge", hex: "#2563EB", available: true },
  ],
  sizes: CASQUETTE_SIZES,
  techniques: ["broderie"],
  techniqueRecommandee: "broderie",
  conseil: CASQUETTE_CONSEIL,
  placements: ["coeur"],
  pricing: {
    dtf:      CASQUETTE_PRICES.sandwich.dtf,
    dtflex:   CASQUETTE_PRICES.sandwich.dtflex,
    flex:     CASQUETTE_PRICES.sandwich.flex,
    broderie: CASQUETTE_PRICES.sandwich.broderie,
    placements: { coeur: 0, dos: 0, "coeur-dos": 0 },
    broDeriePlacementSurcharge: { coeur: 0, dos: 0, "coeur-dos": 0 },
  },
  featured: false,
  seasonal: ["printemps", "ete"],
  supplierName: "toptex",
  supplierRef: "KP185",
  ideaPour: ["Sport & Clubs", "Équipes sportives", "Événementiels"],
};

// ─── SACS & TOTE BAGS ─────────────────────────────────────────────────────────

const SAC_PLACEMENT_SURCHARGES = { coeur: 0, dos: 0, "coeur-dos": 0 };

// ─── TopTex KI0262 — Tote Bag Coton Bio (V1.1 actif, 1 couleur) ──────────────
// Issu de : option B audit `docs/audits/printify-new-categories-2026-05-18.md`
// suite à l'abandon du ticket P1 bp 731 Westford Mill (sample KO).
//
// V1.1 (2026-05-27) — Réduction à 1 SEULE couleur (Naturel) :
//   Le CDN TopTex renvoie le MÊME fichier image (2 746 145 bytes) pour
//   PS_KI0262_NATURAL.png, PS_KI0262_BLACK.png et PS_KI0262_NAVYBLUE.png.
//   Conséquence : sélectionner "Noir" ou "Marine" sur la fiche produit
//   affichait le tote naturel beige → expérience client trompeuse.
//   Retrait temporaire Noir + Marine jusqu'à ce qu'on source des vrais
//   visuels (photos HM, brand center Kimood, etc.). À ré-activer en V1.2.
//
// Câblage technique :
//   - supplierName "toptex" + supplierRef "KI0262" (mappé dans supplierMap.ts)
//   - pricing via SAC_PRICES.toteBio (data/pricing.ts:281)
//   - images via TOPTEX_IMGS.ki0262 (1 URL CDN — voir ligne 107)
export const PRODUCT_KI0262: Product = {
  id: "ki0262",
  slug: "tote-bag-coton-bio-kimood",
  reference: "Kimood KI0262",
  toptexRef: "KI0262",
  prixAchatHT: 2.17,
  name: "Tote Bag Coton Biologique",
  shortName: "Tote Bag Bio",
  category: "sacs",
  gender: "unisex",
  tier: "appel",
  description: "Tote bag en coton biologique certifié GOTS, coloris naturel intemporel. Idéal comme cadeau client, goodies événementiels, sac logo boutique.",
  composition: "100% coton biologique",
  weight: "140 g/m²",
  images: PLACEHOLDER_IMAGES("ki0262"),
  colors: [
    { id: "naturel", label: "Naturel", hex: "#E8DCC8", available: true },
  ],
  sizes: [{ label: "One size", available: true }],
  techniques: ["dtf", "dtflex", "flex"],
  placements: ["coeur"],
  pricing: {
    dtf:      SAC_PRICES.toteBio.dtf,
    dtflex:   SAC_PRICES.toteBio.dtflex,
    flex:     SAC_PRICES.toteBio.flex,
    broderie: SAC_PRICES.toteBio.broderie,
    placements: SAC_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: SAC_PLACEMENT_SURCHARGES,
  },
  featured: true,
  visible: false, // retiré V1.2 — TopTex non personnalisable (pas de zone Studio)
  seasonal: ["printemps", "ete"],
  badge: "Coton bio",
  supplierName: "toptex",
  supplierRef: "KI0262",
  ideaPour: ["Cadeaux clients", "Événementiels", "Boutiques & Commerce", "Goodies entreprise"],
};

export const PRODUCT_KI0252: Product = {
  id: "ki0252",
  slug: "sac-cabas-coton-bio-kimood",
  reference: "Kimood KI0252",
  toptexRef: "KI0252",
  prixAchatHT: 3.62,
  name: "Sac Cabas Coton Biologique",
  shortName: "Sac Cabas Bio",
  category: "sacs",
  gender: "unisex",
  tier: "standard",
  description: "Sac cabas en coton biologique, grande contenance. 5 coloris, poignées longues. Idéal comme sac logo professionnel ou cadeau d'entreprise.",
  composition: "100% coton biologique",
  weight: "180 g/m²",
  images: PLACEHOLDER_IMAGES("ki0252"),
  colors: [
    { id: "naturel", label: "Naturel", hex: "#E8DCC8", available: true },
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "vert-foret", label: "Vert forêt", hex: "#166534", available: true },
  ],
  sizes: [{ label: "One size", available: true }],
  techniques: ["dtf", "dtflex", "flex"],
  placements: ["coeur"],
  pricing: {
    dtf:      SAC_PRICES.cabasBio.dtf,
    dtflex:   SAC_PRICES.cabasBio.dtflex,
    flex:     SAC_PRICES.cabasBio.flex,
    broderie: SAC_PRICES.cabasBio.broderie,
    placements: SAC_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: SAC_PLACEMENT_SURCHARGES,
  },
  featured: false,
  seasonal: ["printemps", "ete"],
  badge: "Écoresponsable",
  supplierName: "toptex",
  supplierRef: "KI0252",
  ideaPour: ["Cadeaux clients", "Boutiques", "Associations"],
};

export const PRODUCT_KI0275: Product = {
  id: "ki0275",
  slug: "sac-cabas-bicolore-kimood",
  reference: "Kimood KI0275",
  toptexRef: "KI0275",
  prixAchatHT: 3.17,
  name: "Sac Cabas Bicolore",
  shortName: "Sac Bicolore",
  category: "sacs",
  gender: "unisex",
  tier: "standard",
  description: "Sac cabas bicolore avec soufflet latéral. 3 combinaisons de coloris contrastés. Design moderne pour un impact visuel fort.",
  composition: "100% coton",
  weight: "—",
  images: PLACEHOLDER_IMAGES("ki0275"),
  colors: [
    { id: "naturel-marine", label: "Naturel / Marine", hex: "#E8DCC8", available: true },
    { id: "noir-rouge", label: "Noir / Rouge", hex: "#111111", available: true },
    { id: "marine-rouge", label: "Marine / Rouge", hex: "#1E3A5F", available: true },
  ],
  sizes: [{ label: "One size", available: true }],
  techniques: ["dtf", "dtflex", "flex"],
  placements: ["coeur"],
  pricing: {
    dtf:      SAC_PRICES.bicolore.dtf,
    dtflex:   SAC_PRICES.bicolore.dtflex,
    flex:     SAC_PRICES.bicolore.flex,
    broderie: SAC_PRICES.bicolore.broderie,
    placements: SAC_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: SAC_PLACEMENT_SURCHARGES,
  },
  featured: false,
  seasonal: ["printemps", "ete"],
  supplierName: "toptex",
  supplierRef: "KI0275",
  ideaPour: ["Événementiels", "Boutiques", "Cadeaux clients"],
};

export const PRODUCT_KI0274: Product = {
  id: "ki0274",
  slug: "sac-jute-grand-kimood",
  reference: "Kimood KI0274",
  toptexRef: "KI0274",
  prixAchatHT: 2.33,
  name: "Sac Jute Grand Modèle",
  shortName: "Sac Jute",
  category: "sacs",
  gender: "unisex",
  tier: "appel",
  description: "Sac jute écologique grand format. 4 coloris naturels. Très apprécié pour les marchés, épiceries, événements et goodies écoresponsables.",
  composition: "100% jute naturel",
  weight: "—",
  images: PLACEHOLDER_IMAGES("ki0274"),
  colors: [
    { id: "naturel", label: "Naturel", hex: "#C4A55A", available: true },
    { id: "naturel-marine", label: "Naturel / Marine", hex: "#1E3A5F", available: true },
    { id: "naturel-rouge", label: "Naturel / Rouge", hex: "#DC2626", available: true },
    { id: "naturel-vert", label: "Naturel / Vert", hex: "#166534", available: true },
  ],
  sizes: [{ label: "One size", available: true }],
  techniques: ["dtf", "dtflex", "flex"],
  placements: ["coeur"],
  pricing: {
    dtf:      SAC_PRICES.jute.dtf,
    dtflex:   SAC_PRICES.jute.dtflex,
    flex:     SAC_PRICES.jute.flex,
    broderie: SAC_PRICES.jute.broderie,
    placements: SAC_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: SAC_PLACEMENT_SURCHARGES,
  },
  featured: false,
  seasonal: ["printemps", "ete"],
  badge: "Écoresponsable",
  supplierName: "toptex",
  supplierRef: "KI0274",
  ideaPour: ["Marchés & Épiceries", "Événementiels éco", "Associations"],
};

// ─── ENFANTS ──────────────────────────────────────────────────────────────────

const ENFANT_SIZES = [
  { label: "3/4 ans", available: true },
  { label: "5/6 ans", available: true },
  { label: "7/8 ans", available: true },
  { label: "9/11 ans", available: true },
  { label: "12/14 ans", available: true },
];

export const PRODUCT_IB322: Product = {
  id: "ib322",
  slug: "tshirt-enfant-ideal-190",
  reference: "iDeal Basic Brand IB322",
  toptexRef: "IB322",
  toptexUrl: "https://www.toptex.fr/ib322-t-shirt-enfant-ideal190.html",
  prixAchatHT: 2.07,
  name: "T-shirt Enfant iDeal190",
  shortName: "T-shirt Enfant",
  category: "enfants",
  gender: "enfant",
  tier: "appel",
  description: "T-shirt enfant 190 g/m² en coton semi-peigné. 16 coloris, du 3/4 ans au 12/14 ans. Même qualité que les adultes, adapté aux petits.",
  composition: "100% coton semi-peigné",
  weight: "190 g/m²",
  images: PLACEHOLDER_IMAGES("ib322"),
  colors: IDEAL_COLORS_BASE,
  sizes: ENFANT_SIZES,
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos"],
  pricing: {
    dtf:      TSHIRT_IDEAL_PRICES.base.dtf,
    dtflex:   TSHIRT_IDEAL_PRICES.base.dtflex,
    flex:     TSHIRT_IDEAL_PRICES.base.flex,
    broderie: TSHIRT_IDEAL_PRICES.base.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  seasonal: ["printemps", "ete"],
  supplierName: "toptex",
  supplierRef: "IB322",
  ideaPour: ["Associations jeunesse", "Clubs sportifs enfants", "Événementiels familiaux"],
};

export const PRODUCT_IB401: Product = {
  id: "ib401",
  slug: "sweat-col-rond-enfant-ideal",
  reference: "iDeal Basic Brand IB401",
  toptexRef: "IB401",
  prixAchatHT: 5.41,
  name: "Sweat Col Rond Enfant iDeal",
  shortName: "Sweat Enfant",
  category: "enfants",
  gender: "enfant",
  tier: "appel",
  description: "Sweat col rond enfant 300 g/m², molletonné. 5 coloris, du 3/4 ans au 12/14 ans. Confort et durabilité pour les petits.",
  composition: "80% coton, 20% polyester",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("ib401"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "gris-melange", label: "Gris mélangé", hex: "#6B7280", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "blanc-casse", label: "Blanc cassé", hex: "#F5F5F5", available: true },
  ],
  sizes: ENFANT_SIZES,
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.colRond.dtf,
    dtflex:   SWEAT_IDEAL_PRICES.colRond.dtflex,
    flex:     SWEAT_IDEAL_PRICES.colRond.flex,
    broderie: SWEAT_IDEAL_PRICES.colRond.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["automne", "hiver"],
  supplierName: "toptex",
  supplierRef: "IB401",
};

export const PRODUCT_IB403: Product = {
  id: "ib403",
  slug: "hoodie-enfant-ideal",
  reference: "iDeal Basic Brand IB403",
  toptexRef: "IB403",
  prixAchatHT: 7.53,
  name: "Hoodie à Capuche Enfant iDeal",
  shortName: "Hoodie Enfant",
  category: "enfants",
  gender: "enfant",
  tier: "appel",
  description: "Hoodie enfant à capuche 300 g/m², poche kangourou. 10 coloris, du 3/4 ans au 12/14 ans. Le classique des tenues de groupe pour les petits.",
  composition: "80% coton, 20% polyester",
  weight: "300 g/m²",
  images: PLACEHOLDER_IMAGES("ib403"),
  colors: [
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "gris-melange", label: "Gris mélangé", hex: "#6B7280", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "bordeaux", label: "Bordeaux", hex: "#7F1D1D", available: true },
  ],
  sizes: ENFANT_SIZES,
  techniques: ["dtf", "dtflex", "flex", "broderie"],
  placements: ["coeur", "dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.hoodie.dtf,
    dtflex:   SWEAT_IDEAL_PRICES.hoodie.dtflex,
    flex:     SWEAT_IDEAL_PRICES.hoodie.flex,
    broderie: SWEAT_IDEAL_PRICES.hoodie.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  seasonal: ["automne", "hiver"],
  supplierName: "toptex",
  supplierRef: "IB403",
};

// ─── Printful POD — Gildan 5000 ───────────────────────────────────────────────
// visible: true → produit d'appel V1 catalogue Printful (19.90 € TTC)
// supplierName: "printful" → traitement automatique POD
export const PRODUCT_GILDAN_5000: Product = {
  id: "gildan-5000",
  slug: "tshirt-gildan-heavy-cotton",
  reference: "Gildan Heavy Cotton 5000",
  name: "T-shirt personnalisé économique",
  shortName: "T-shirt économique",
  category: "tshirts",
  gender: "unisex",
  tier: "standard",
  description: "Le t-shirt essentiel pour équiper une équipe, un événement ou une association. Unisexe 185 g/m² en coton épais, col rond côtelé, coupe régulière. Imprimable DTF, DTFlex ou broderie. Expédition directe depuis l'Allemagne.",
  composition: "100% coton épais",
  weight: "185 g/m²",
  images: [],
  colors: [
    // Couleurs V1 Printify : alignées sur le manifest + mapping variant_id
    // dark-heather retiré V1 : pas de vrai mockup Dark Heather Printify
    // (fallback gris-front.jpg trompeur) — à réintroduire si mockup dédié généré
    { id: "blanc",  label: "Blanc",  hex: "#FFFFFF", available: true },
    { id: "noir",   label: "Noir",   hex: "#1a1a1a", available: true },
    { id: "gris",   label: "Sport Grey", hex: "#97999B", available: true },
    { id: "marine", label: "Marine", hex: "#1b2a4a", available: true },
    { id: "rouge",  label: "Rouge",  hex: "#DC2626", available: true },
    { id: "royal",  label: "Bleu Royal", hex: "#1D50A4", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf", "dtflex", "broderie", "broderie_illimitee"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:                GILDAN_5000_PRICES.dtf,
    dtflex:             GILDAN_5000_PRICES.dtflex,
    flex:               GILDAN_5000_PRICES.flex,
    broderie:           GILDAN_5000_PRICES.broderie,
    broderie_illimitee: GILDAN_5000_PRICES.broderie_illimitee,
    placements: GILDAN_5000_PLACEMENT_SURCHARGES,   // cœur 19.90 / cœur+dos 29.90 (DTF)
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  visible: true,
  badge: "Essentiel",
  supplierName: "printful",
  ideaPour: ["Associations", "Événementiel", "Équipes"],
  conseil: "Notre t-shirt personnalisé entrée de gamme le plus vendu. Coton épais 185 g/m², couleurs intenses, expédition directe depuis l'UE. À partir de 17,90 € l'unité dès 25 pièces.",
  // Volume pricing par technique (remises Printful progressives)
  volumePricingByTechnique: {
    dtf:                GILDAN_5000_DTF_VOLUME,
    dtflex:             GILDAN_5000_DTFLEX_VOLUME,
    broderie:           GILDAN_5000_BRODERIE_VOLUME,
    broderie_illimitee: GILDAN_5000_BRODERIE_ILLIMITEE_VOLUME,
  },
  // Mockups — photos fournisseur croppées (printify-cropped, cadrage uniforme
  // ~94 % de largeur). Fix 2026-06-10 : les anciennes clés (gris-sport,
  // dark-heather) ne correspondaient pas à colors[] → gris/rouge/royal
  // retombaient sur le fallback /mockups/tshirt/*.jpg inexistant (canvas vide
  // dans le Studio). Clés désormais alignées 1:1 sur colors[].
  hmMockupImages: {
    "blanc":  "/mockups/printify-cropped/gildan-5000/blanc-front.jpg",
    "noir":   "/mockups/printify-cropped/gildan-5000/noir-front.jpg",
    "gris":   "/mockups/printify-cropped/gildan-5000/gris-front.jpg",
    "marine": "/mockups/printify-cropped/gildan-5000/marine-front.jpg",
    "rouge":  "/mockups/printify-cropped/gildan-5000/rouge-front.jpg",
    "royal":  "/mockups/printify-cropped/gildan-5000/royal-front.jpg",
  },
  hmMockupImagesBack: {
    "blanc":  "/mockups/printify-cropped/gildan-5000/blanc-back.jpg",
    "noir":   "/mockups/printify-cropped/gildan-5000/noir-back.jpg",
    "gris":   "/mockups/printify-cropped/gildan-5000/gris-back.jpg",
    "marine": "/mockups/printify-cropped/gildan-5000/marine-back.jpg",
    "rouge":  "/mockups/printify-cropped/gildan-5000/rouge-back.jpg",
    "royal":  "/mockups/printify-cropped/gildan-5000/royal-back.jpg",
  },
  hmMockupGallery: {
    "blanc":  ["/mockups/printify-cropped/gildan-5000/blanc-front.jpg",  "/mockups/printify-cropped/gildan-5000/blanc-back.jpg",  "/mockups/printify-cropped/gildan-5000/blanc-folded.jpg"],
    "noir":   ["/mockups/printify-cropped/gildan-5000/noir-front.jpg",   "/mockups/printify-cropped/gildan-5000/noir-back.jpg",   "/mockups/printify-cropped/gildan-5000/noir-folded.jpg"],
    "gris":   ["/mockups/printify-cropped/gildan-5000/gris-front.jpg",   "/mockups/printify-cropped/gildan-5000/gris-back.jpg",   "/mockups/printify-cropped/gildan-5000/gris-folded.jpg"],
    "marine": ["/mockups/printify-cropped/gildan-5000/marine-front.jpg", "/mockups/printify-cropped/gildan-5000/marine-back.jpg", "/mockups/printify-cropped/gildan-5000/marine-folded.jpg"],
    "rouge":  ["/mockups/printify-cropped/gildan-5000/rouge-front.jpg",  "/mockups/printify-cropped/gildan-5000/rouge-back.jpg",  "/mockups/printify-cropped/gildan-5000/rouge-folded.jpg"],
    "royal":  ["/mockups/printify-cropped/gildan-5000/royal-front.jpg",  "/mockups/printify-cropped/gildan-5000/royal-back.jpg",  "/mockups/printify-cropped/gildan-5000/royal-folded.jpg"],
  },
};

// ─── Printful POD — Bella+Canvas 3001 ────────────────────────────────────────
// T-shirt premium jersey / tri-blend 145 g/m²
// V2 — prix abaissés (-7 €) pour rester attractifs : DTF 22.90 € | DTFlex 24.90 €
//       Broderie 27.90 € | Broderie illimitée 31.90 € — marges ~9-11 € HT
export const PRODUCT_BELLA_3001: Product = {
  id: "bella-3001",
  slug: "tshirt-bella-canvas-3001",
  reference: "Bella+Canvas 3001",
  name: "T-shirt Bella+Canvas 3001 Unisexe",
  shortName: "T-shirt Premium",
  category: "tshirts",
  gender: "unisex",
  tier: "premium",
  description: "Un t-shirt doux et moderne, idéal pour une image de marque plus soignée. Unisexe 145 g/m² en coton ring-spun peigné, étiquette détachable, coutures latérales, coupe ajustée. Imprimable DTF, DTFlex, broderie.",
  composition: "Coloris unis : 100% coton ring-spun peigné · Heather : 52% coton / 48% polyester",
  weight: "145 g/m²",
  images: [],
  // ─── Palette V1 — 6 couleurs validées (2026-05-20) ─────────────────────────
  // Réduction de 37 → 6 coloris. Source de vérité unique pour fiche produit,
  // studio, panier, BAT, admin. Match exact avec le mapping Printify
  // `lib/suppliers/printify/printify-colors.ts` (alias athletic-heather→gris,
  // true-royal→royal). Mockups locaux disponibles dans /mockups/bella-3001/
  // (front + back + detail) et /mockups/printify/bella-3001/ (folded + collar).
  // Couleurs retirées V1 : dark-heather, heather-navy, asphalt, silver,
  // steel-blue, teal, aqua, baby-blue, columbia-blue, vert-militaire, olive,
  // kelly, forest, mint, leaf, cardinal, bordeaux, berry, charity-pink, mauve,
  // lilac, violet, orange, burnt-orange, mustard, gold, yellow, natural,
  // soft-cream, sand, brown, heather-dust. À ré-activer en V2 si pertinent.
  colors: [
    { id: "noir",             label: "Noir",             hex: "#1a1a1a", available: true },
    { id: "blanc",            label: "Blanc",            hex: "#FAFAF8", available: true },
    { id: "marine",           label: "Marine",           hex: "#1b2a4a", available: true },
    { id: "athletic-heather", label: "Athletic Heather", hex: "#b0b0b0", available: true },
    { id: "true-royal",       label: "Bleu Royal",       hex: "#2563EB", available: true },
    { id: "rouge",            label: "Rouge",            hex: "#CC1414", available: true },
  ],
  sizes: [
    { label: "XS",   available: true },
    { label: "S",    available: true },
    { label: "M",    available: true },
    { label: "L",    available: true },
    { label: "XL",   available: true },
    { label: "XXL",  available: true },
    { label: "3XL",  available: true },
    { label: "4XL",  available: true },
    { label: "5XL",  available: true },
  ],
  techniques: ["dtf", "dtflex", "broderie", "broderie_illimitee"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:                BELLA_3001_PRICES.dtf,
    dtflex:             BELLA_3001_PRICES.dtflex,
    flex:               BELLA_3001_PRICES.flex,
    broderie:           BELLA_3001_PRICES.broderie,
    broderie_illimitee: BELLA_3001_PRICES.broderie_illimitee,
    placements: BELLA_3001_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  // Bella 3001 retiré du featured homepage : on garde G5000/Comfort/G18000/G18500
  // pour la sélection "Nos textiles les plus commandés" (mission merchandising V1).
  featured: false,
  visible: true,
  badge: "Premium",
  supplierName: "printful",
  ideaPour: ["Marques & Streetwear", "Événementiels premium", "Boutiques"],
  conseil: "Le Bella+Canvas 3001 est la référence mondiale des créateurs de marques. 5 852 avis, 93% satisfaits. Coton ring-spun ultra-doux, 84 coloris disponibles, tombé parfait. Parfait pour streetwear, merch et vêtements premium.",
  // Volume pricing par technique (remises Printful progressives)
  volumePricingByTechnique: {
    dtf:                BELLA_3001_DTF_VOLUME,
    dtflex:             BELLA_3001_DTFLEX_VOLUME,
    broderie:           BELLA_3001_BRODERIE_VOLUME,
    broderie_illimitee: BELLA_3001_BRODERIE_ILLIMITEE_VOLUME,
  },
  // Mockups — photos fournisseur croppées (printify-cropped, cadrage uniforme).
  // Fix 2026-06-10 : les 5 anciens PNG générés (16-17 mai) remplacés par les
  // vraies photos Printify pour matcher le rouge (déjà printify-cropped depuis
  // le 26 mai) et le dos (déjà servi en printify-cropped via le manifest).
  // Alias fichiers : athletic-heather → gris-*, true-royal → royal-*.
  hmMockupImages: {
    "noir":             "/mockups/printify-cropped/bella-3001/noir-front.jpg",
    "blanc":            "/mockups/printify-cropped/bella-3001/blanc-front.jpg",
    "marine":           "/mockups/printify-cropped/bella-3001/marine-front.jpg",
    "athletic-heather": "/mockups/printify-cropped/bella-3001/gris-front.jpg",
    "true-royal":       "/mockups/printify-cropped/bella-3001/royal-front.jpg",
    "rouge":            "/mockups/printify-cropped/bella-3001/rouge-front.jpg",
  },
  hmMockupImagesBack: {
    "noir":             "/mockups/printify-cropped/bella-3001/noir-back.jpg",
    "blanc":            "/mockups/printify-cropped/bella-3001/blanc-back.jpg",
    "marine":           "/mockups/printify-cropped/bella-3001/marine-back.jpg",
    "athletic-heather": "/mockups/printify-cropped/bella-3001/gris-back.jpg",
    "true-royal":       "/mockups/printify-cropped/bella-3001/royal-back.jpg",
    "rouge":            "/mockups/printify-cropped/bella-3001/rouge-back.jpg",
  },
  hmMockupGallery: {
    "noir":             ["/mockups/printify-cropped/bella-3001/noir-front.jpg",   "/mockups/printify-cropped/bella-3001/noir-back.jpg",   "/mockups/printify-cropped/bella-3001/noir-folded.jpg"],
    "blanc":            ["/mockups/printify-cropped/bella-3001/blanc-front.jpg",  "/mockups/printify-cropped/bella-3001/blanc-back.jpg",  "/mockups/printify-cropped/bella-3001/blanc-folded.jpg"],
    "marine":           ["/mockups/printify-cropped/bella-3001/marine-front.jpg", "/mockups/printify-cropped/bella-3001/marine-back.jpg", "/mockups/printify-cropped/bella-3001/marine-folded.jpg"],
    "athletic-heather": ["/mockups/printify-cropped/bella-3001/gris-front.jpg",   "/mockups/printify-cropped/bella-3001/gris-back.jpg",   "/mockups/printify-cropped/bella-3001/gris-folded.jpg"],
    "true-royal":       ["/mockups/printify-cropped/bella-3001/royal-front.jpg",  "/mockups/printify-cropped/bella-3001/royal-back.jpg",  "/mockups/printify-cropped/bella-3001/royal-folded.jpg"],
    "rouge":            ["/mockups/printify-cropped/bella-3001/rouge-front.jpg",  "/mockups/printify-cropped/bella-3001/rouge-back.jpg",  "/mockups/printify-cropped/bella-3001/rouge-folded.jpg"],
  },
};

// ─── Printful POD — Gildan 18000 Sweatshirt ──────────────────────────────────
// Sweatshirt col rond 271 g/m² — 25 couleurs — S à 5XL
// DTG + DTFlex + Broderie Standard + Broderie illimitée
// Note clients : 4.5/5 (1 624 avis) — 91% recommandent
export const PRODUCT_GILDAN_18000: Product = {
  id: "gildan-18000",
  slug: "sweat-gildan-18000",
  reference: "Gildan 18000",
  name: "Sweatshirt Gildan 18000 Unisexe",
  shortName: "Sweatshirt",
  category: "hoodies",
  gender: "unisex",
  tier: "standard",
  description: "Le sweat classique pour clubs, équipes et entreprises. Col rond 271 g/m² en coton/polyester, poignets et ceinture côtelés, coutures doubles. Imprimable DTF, DTFlex ou broderie.",
  composition: "50% coton, 50% polyester (prélavé)",
  weight: "271 g/m²",
  images: [],
  // ─── Palette V1 — 5 couleurs validées (2026-05-20) ─────────────────────────
  // Réduction de 25 → 5 coloris. Source de vérité unique pour fiche produit,
  // studio, panier, BAT, admin. Match exact avec le mapping Printify
  // `lib/suppliers/printify/printify-colors.ts` (alias gris-sport → gris).
  // Mockups locaux disponibles dans /mockups/gildan-18000/ (front + back + detail).
  // Couleurs retirées V1 : dark-heather, gris-graphite, charcoal, bordeaux, royal,
  // indigo, bleu-carolina, bleu-clair, violet, heliconia, rose-clair, orange, or,
  // vert-militaire, vert-foret, vert-irlandais, chocolat, sable, cendré,
  // bleu-profond. À ré-activer en V2 si pertinent.
  colors: [
    { id: "noir",       label: "Noir",       hex: "#0b0b0b", available: true },
    { id: "marine",     label: "Marine",     hex: "#050c1d", available: true },
    { id: "gris-sport", label: "Gris Sport", hex: "#ccccce", available: true },
    { id: "blanc",      label: "Blanc",      hex: "#ffffff", available: true },
    { id: "rouge",      label: "Rouge",      hex: "#da0a1a", available: true },
  ],
  sizes: [
    { label: "S",    available: true },
    { label: "M",    available: true },
    { label: "L",    available: true },
    { label: "XL",   available: true },
    { label: "XXL",  available: true },
    { label: "3XL",  available: true },
    { label: "4XL",  available: true },
    { label: "5XL",  available: true },
  ],
  techniques: ["dtf", "dtflex", "broderie", "broderie_illimitee"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:                GILDAN_18000_PRICES.dtf,
    dtflex:             GILDAN_18000_PRICES.dtflex,
    flex:               GILDAN_18000_PRICES.flex,
    broderie:           GILDAN_18000_PRICES.broderie,
    broderie_illimitee: GILDAN_18000_PRICES.broderie_illimitee,
    placements:         GILDAN_18000_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  volumePricingByTechnique: {
    dtf:                GILDAN_18000_DTG_VOLUME,
    dtflex:             GILDAN_18000_DTFLEX_VOLUME,
    broderie:           GILDAN_18000_BRODERIE_VOLUME,
    broderie_illimitee: GILDAN_18000_BRODERIE_ILLIMITEE_VOLUME,
  },
  featured: true,
  visible: true,
  badge: "Sweat classique",
  supplierName: "printful",
  supplierImages: [],
  ideaPour: ["Associations & Clubs", "BDE & Étudiants", "Corporate & Équipes"],
  conseil: "Le sweatshirt Gildan 18000 est un incontournable du textile personnalisé. 91% des acheteurs le recommandent. Filé par jet d'air, sans pli central, rendu DTG net et broderie premium disponible.",
  // Mockups — photos fournisseur croppées (printify-cropped, cadrage uniforme).
  // Fix 2026-06-10 : anciens PNG générés remplacés par les vraies photos
  // Printify (le rouge notamment était une vieille photo dépareillée).
  // Alias fichiers : gris-sport → gris-*.
  hmMockupImages: {
    "noir":       "/mockups/printify-cropped/gildan-18000/noir-front.jpg",
    "marine":     "/mockups/printify-cropped/gildan-18000/marine-front.jpg",
    "gris-sport": "/mockups/printify-cropped/gildan-18000/gris-front.jpg",
    "blanc":      "/mockups/printify-cropped/gildan-18000/blanc-front.jpg",
    "rouge":      "/mockups/printify-cropped/gildan-18000/rouge-front.jpg",
  },
  hmMockupImagesBack: {
    "noir":       "/mockups/printify-cropped/gildan-18000/noir-back.jpg",
    "marine":     "/mockups/printify-cropped/gildan-18000/marine-back.jpg",
    "gris-sport": "/mockups/printify-cropped/gildan-18000/gris-back.jpg",
    "blanc":      "/mockups/printify-cropped/gildan-18000/blanc-back.jpg",
    "rouge":      "/mockups/printify-cropped/gildan-18000/rouge-back.jpg",
  },
  hmMockupGallery: {
    "noir":       ["/mockups/printify-cropped/gildan-18000/noir-front.jpg",   "/mockups/printify-cropped/gildan-18000/noir-back.jpg",   "/mockups/printify-cropped/gildan-18000/noir-folded.jpg"],
    "marine":     ["/mockups/printify-cropped/gildan-18000/marine-front.jpg", "/mockups/printify-cropped/gildan-18000/marine-back.jpg", "/mockups/printify-cropped/gildan-18000/marine-folded.jpg"],
    "gris-sport": ["/mockups/printify-cropped/gildan-18000/gris-front.jpg",   "/mockups/printify-cropped/gildan-18000/gris-back.jpg",   "/mockups/printify-cropped/gildan-18000/gris-folded.jpg"],
    "blanc":      ["/mockups/printify-cropped/gildan-18000/blanc-front.jpg",  "/mockups/printify-cropped/gildan-18000/blanc-back.jpg",  "/mockups/printify-cropped/gildan-18000/blanc-folded.jpg"],
    "rouge":      ["/mockups/printify-cropped/gildan-18000/rouge-front.jpg",  "/mockups/printify-cropped/gildan-18000/rouge-back.jpg",  "/mockups/printify-cropped/gildan-18000/rouge-folded.jpg"],
  },
};

// ─── Printful POD — Gildan 18500 Hoodie ──────────────────────────────────────
// Hoodie à capuche 271 g/m² — 26 couleurs — S à 5XL
// DTG + DTFlex + Broderie Standard + Broderie illimitée
// Note clients : 4.5/5 (3 015 avis) — 88% recommandent
export const PRODUCT_GILDAN_18500: Product = {
  id: "gildan-18500",
  slug: "hoodie-gildan-18500",
  reference: "Gildan 18500",
  name: "Hoodie Gildan 18500 Unisexe",
  shortName: "Hoodie",
  category: "hoodies",
  gender: "unisex",
  tier: "standard",
  description: "Le hoodie polyvalent pour staff, associations et collections personnalisées. Capuche double doublure avec cordon, poche kangourou, 271 g/m² coton/polyester, poignets et ceinture côtelés. Imprimable DTF, DTFlex ou broderie.",
  composition: "50% coton prérétréci, 50% polyester",
  weight: "271 g/m²",
  images: [],
  // ─── Palette V1 — 6 couleurs avec vraies photos Printify (2026-06-10) ──────
  // Réduction de 26 → 6 coloris (demande Kaan : ne garder que les couleurs
  // avec mockup fournisseur réel ; les autres utilisaient d'anciennes images
  // générées et 3 étaient totalement cassées). Couleurs retirées V1 :
  // dark-heather, gris-graphite, charcoal, cendré, bordeaux, indigo,
  // bleu-carolina, bleu-clair, heather-sport, violet, heliconia, rose-clair,
  // azalea, orange, or, vert-militaire, vert-foret, vert-irlandais, chocolat,
  // sable. À ré-activer quand leurs mockups Printify seront générés.
  colors: [
    { id: "noir",       label: "Noir",       hex: "#0b0b0b", available: true },
    { id: "marine",     label: "Marine",     hex: "#131928", available: true },
    { id: "blanc",      label: "Blanc",      hex: "#ffffff", available: true },
    { id: "gris-sport", label: "Gris Sport", hex: "#9b969c", available: true },
    { id: "rouge",      label: "Rouge",      hex: "#da0a1a", available: true },
    { id: "royal",      label: "Bleu Royal", hex: "#1D50A4", available: true },
  ],
  sizes: [
    { label: "S",    available: true },
    { label: "M",    available: true },
    { label: "L",    available: true },
    { label: "XL",   available: true },
    { label: "XXL",  available: true },
    { label: "3XL",  available: true },
    { label: "4XL",  available: true },
    { label: "5XL",  available: true },
  ],
  techniques: ["dtf", "dtflex", "broderie", "broderie_illimitee"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:                GILDAN_18500_PRICES.dtf,
    dtflex:             GILDAN_18500_PRICES.dtflex,
    flex:               GILDAN_18500_PRICES.flex,
    broderie:           GILDAN_18500_PRICES.broderie,
    broderie_illimitee: GILDAN_18500_PRICES.broderie_illimitee,
    placements:         GILDAN_18500_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  volumePricingByTechnique: {
    dtf:                GILDAN_18500_DTG_VOLUME,
    dtflex:             GILDAN_18500_DTFLEX_VOLUME,
    broderie:           GILDAN_18500_BRODERIE_VOLUME,
    broderie_illimitee: GILDAN_18500_BRODERIE_ILLIMITEE_VOLUME,
  },
  featured: true,
  visible: true,
  badge: "Hoodie",
  supplierName: "printful",
  ideaPour: ["Associations & BDE", "Sport & Clubs", "Streetwear & Marques"],
  conseil: "Le Gildan 18500 est le hoodie le plus commandé sur Printful — 3 015 avis, 88% satisfaits. Intérieur molleton doux, poche kangourou spacieuse, rendu DTG net et broderie premium disponible.",
  // Mockups — photos fournisseur croppées (printify-cropped, cadrage uniforme).
  // Fix 2026-06-10 : anciens PNG générés remplacés par les vraies photos
  // Printify, maps alignées 1:1 sur les 6 couleurs V1.
  // Alias fichiers : gris-sport → gris-*.
  hmMockupImages: {
    "noir":       "/mockups/printify-cropped/gildan-18500/noir-front.jpg",
    "marine":     "/mockups/printify-cropped/gildan-18500/marine-front.jpg",
    "blanc":      "/mockups/printify-cropped/gildan-18500/blanc-front.jpg",
    "gris-sport": "/mockups/printify-cropped/gildan-18500/gris-front.jpg",
    "rouge":      "/mockups/printify-cropped/gildan-18500/rouge-front.jpg",
    "royal":      "/mockups/printify-cropped/gildan-18500/royal-front.jpg",
  },
  hmMockupImagesBack: {
    "noir":       "/mockups/printify-cropped/gildan-18500/noir-back.jpg",
    "marine":     "/mockups/printify-cropped/gildan-18500/marine-back.jpg",
    "blanc":      "/mockups/printify-cropped/gildan-18500/blanc-back.jpg",
    "gris-sport": "/mockups/printify-cropped/gildan-18500/gris-back.jpg",
    "rouge":      "/mockups/printify-cropped/gildan-18500/rouge-back.jpg",
    "royal":      "/mockups/printify-cropped/gildan-18500/royal-back.jpg",
  },
  hmMockupGallery: {
    "noir":       ["/mockups/printify-cropped/gildan-18500/noir-front.jpg",   "/mockups/printify-cropped/gildan-18500/noir-back.jpg",   "/mockups/printify-cropped/gildan-18500/noir-folded.jpg"],
    "marine":     ["/mockups/printify-cropped/gildan-18500/marine-front.jpg", "/mockups/printify-cropped/gildan-18500/marine-back.jpg", "/mockups/printify-cropped/gildan-18500/marine-folded.jpg"],
    "blanc":      ["/mockups/printify-cropped/gildan-18500/blanc-front.jpg",  "/mockups/printify-cropped/gildan-18500/blanc-back.jpg",  "/mockups/printify-cropped/gildan-18500/blanc-folded.jpg"],
    "gris-sport": ["/mockups/printify-cropped/gildan-18500/gris-front.jpg",   "/mockups/printify-cropped/gildan-18500/gris-back.jpg",   "/mockups/printify-cropped/gildan-18500/gris-folded.jpg"],
    "rouge":      ["/mockups/printify-cropped/gildan-18500/rouge-front.jpg",  "/mockups/printify-cropped/gildan-18500/rouge-back.jpg",  "/mockups/printify-cropped/gildan-18500/rouge-folded.jpg"],
    "royal":      ["/mockups/printify-cropped/gildan-18500/royal-front.jpg",  "/mockups/printify-cropped/gildan-18500/royal-back.jpg",  "/mockups/printify-cropped/gildan-18500/royal-folded.jpg"],
  },
};

// ─── Printify POD — Comfort Colors 1717 Heavyweight Tee (V1) ────────────────
// T-shirt heavyweight 195 g/m² teint en pièce (garment-dyed).
// Provider : Textildruck Europa DE — coût Printify 9,09 € HT (moins cher que Gildan 5000).
// Positionnement HM : T-shirt mode / casual / restauration avec touche garment-dyed.
// 6 couleurs V1 strictes (alignées sur le mapping Printify V1).
export const PRODUCT_COMFORT_COLORS_1717: Product = {
  id: "comfort-colors-1717",
  slug: "tshirt-comfort-colors-heavyweight",
  reference: "Comfort Colors 1717",
  name: "T-shirt Comfort Colors 1717 — Heavyweight teint en pièce",
  shortName: "T-shirt Heavyweight",
  category: "tshirts",
  gender: "unisex",
  tier: "premium",
  description: "Un t-shirt heavyweight au rendu lifestyle, parfait pour du merch premium. Unisexe Comfort Colors 1717 en coton épais 195 g/m² teint en pièce (garment-dyed), effet vintage reconnaissable, double couture, étiquette détachable. Imprimable DTF, DTFlex ou broderie.",
  composition: "100% coton ring-spun teint en pièce",
  weight: "195 g/m²",
  images: [],
  colors: [
    { id: "noir",    label: "Noir",      hex: "#1a1a1a", available: true },
    { id: "blanc",   label: "Blanc",     hex: "#FAFAF6", available: true },
    { id: "gris",    label: "Sport Grey", hex: "#97999B", available: true },
    { id: "marine",  label: "Marine",    hex: "#1b2a4a", available: true },
    { id: "rouge",   label: "Rouge",     hex: "#C1121F", available: true },
    { id: "naturel", label: "Natural",   hex: "#E8DDC5", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf", "dtflex", "broderie", "broderie_illimitee"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:                COMFORT_COLORS_1717_PRICES.dtf,
    dtflex:             COMFORT_COLORS_1717_PRICES.dtflex,
    flex:               COMFORT_COLORS_1717_PRICES.flex,
    broderie:           COMFORT_COLORS_1717_PRICES.broderie,
    broderie_illimitee: COMFORT_COLORS_1717_PRICES.broderie_illimitee,
    placements: COMFORT_COLORS_1717_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  visible: true,
  badge: "Heavyweight",
  supplierName: "printful",
  ideaPour: ["Mode urbaine", "Restauration", "Marques retail"],
  conseil: "T-shirt mode garment-dyed parfait pour une image plus chaleureuse et un effet vintage. Excellent rapport qualité/prix par rapport au Bella+Canvas 3001.",
  volumePricingByTechnique: {
    dtf:                COMFORT_COLORS_1717_DTF_VOLUME,
    dtflex:             COMFORT_COLORS_1717_DTFLEX_VOLUME,
    broderie:           COMFORT_COLORS_1717_BRODERIE_VOLUME,
    broderie_illimitee: COMFORT_COLORS_1717_BRODERIE_ILLIMITEE_VOLUME,
  },
  // Mockups Printify — versions croppées (cadrage uniforme, sans marges
  // blanches). Originaux : /mockups/printify/comfort-colors-1717/
  // (script : refresh-printify-mockups.mjs).
  hmMockupImages: {
    "noir":    "/mockups/printify-cropped/comfort-colors-1717/noir-front.jpg",
    "blanc":   "/mockups/printify-cropped/comfort-colors-1717/blanc-front.jpg",
    "gris":    "/mockups/printify-cropped/comfort-colors-1717/gris-front.jpg",
    "marine":  "/mockups/printify-cropped/comfort-colors-1717/marine-front.jpg",
    "rouge":   "/mockups/printify-cropped/comfort-colors-1717/rouge-front.jpg",
    "naturel": "/mockups/printify-cropped/comfort-colors-1717/naturel-front.jpg",
  },
  hmMockupImagesBack: {
    "noir":    "/mockups/printify-cropped/comfort-colors-1717/noir-back.jpg",
    "blanc":   "/mockups/printify-cropped/comfort-colors-1717/blanc-back.jpg",
    "gris":    "/mockups/printify-cropped/comfort-colors-1717/gris-back.jpg",
    "marine":  "/mockups/printify-cropped/comfort-colors-1717/marine-back.jpg",
    "rouge":   "/mockups/printify-cropped/comfort-colors-1717/rouge-back.jpg",
    "naturel": "/mockups/printify-cropped/comfort-colors-1717/naturel-back.jpg",
  },
  hmMockupGallery: {
    "noir":    ["/mockups/printify-cropped/comfort-colors-1717/noir-front.jpg",    "/mockups/printify-cropped/comfort-colors-1717/noir-back.jpg",    "/mockups/printify-cropped/comfort-colors-1717/noir-folded.jpg"],
    "blanc":   ["/mockups/printify-cropped/comfort-colors-1717/blanc-front.jpg",   "/mockups/printify-cropped/comfort-colors-1717/blanc-back.jpg",   "/mockups/printify-cropped/comfort-colors-1717/blanc-folded.jpg"],
    "gris":    ["/mockups/printify-cropped/comfort-colors-1717/gris-front.jpg",    "/mockups/printify-cropped/comfort-colors-1717/gris-back.jpg",    "/mockups/printify-cropped/comfort-colors-1717/gris-folded.jpg"],
    "marine":  ["/mockups/printify-cropped/comfort-colors-1717/marine-front.jpg",  "/mockups/printify-cropped/comfort-colors-1717/marine-back.jpg",  "/mockups/printify-cropped/comfort-colors-1717/marine-folded.jpg"],
    "rouge":   ["/mockups/printify-cropped/comfort-colors-1717/rouge-front.jpg",   "/mockups/printify-cropped/comfort-colors-1717/rouge-back.jpg",   "/mockups/printify-cropped/comfort-colors-1717/rouge-folded.jpg"],
    "naturel": ["/mockups/printify-cropped/comfort-colors-1717/naturel-front.jpg", "/mockups/printify-cropped/comfort-colors-1717/naturel-back.jpg", "/mockups/printify-cropped/comfort-colors-1717/naturel-folded.jpg"],
  },
};

// ─── Printify POD — Gildan 2400 Ultra Cotton Long Sleeve Tee (V1) ───────────
// T-shirt manches longues 230 g/m². Provider : Textildruck Europa DE — coût 11,72 €.
// Positionnement HM : couvre la demande hiver / restauration / staff polyvalent.
export const PRODUCT_GILDAN_2400_LS: Product = {
  id: "gildan-2400-ls",
  slug: "tshirt-gildan-long-sleeve",
  reference: "Gildan 2400",
  name: "T-shirt manches longues Gildan 2400",
  shortName: "T-shirt manches longues",
  category: "tshirts",
  gender: "unisex",
  tier: "standard",
  description: "Une option manches longues pour la demi-saison, le staff ou les événements. Unisexe Gildan 2400 Ultra Cotton, 230 g/m², coupe régulière, col rond côtelé. Imprimable DTF, DTFlex ou broderie.",
  composition: "100% coton Ultra Cotton",
  weight: "230 g/m²",
  images: [],
  colors: [
    { id: "noir",    label: "Noir",      hex: "#1a1a1a", available: true },
    { id: "blanc",   label: "Blanc",     hex: "#FFFFFF", available: true },
    { id: "gris",    label: "Sport Grey", hex: "#97999B", available: true },
    { id: "marine",  label: "Marine",    hex: "#1b2a4a", available: true },
    { id: "rouge",   label: "Rouge",     hex: "#DC2626", available: true },
    { id: "naturel", label: "Sand",      hex: "#D5C9A7", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf", "dtflex", "broderie", "broderie_illimitee"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:                GILDAN_2400_LS_PRICES.dtf,
    dtflex:             GILDAN_2400_LS_PRICES.dtflex,
    flex:               GILDAN_2400_LS_PRICES.flex,
    broderie:           GILDAN_2400_LS_PRICES.broderie,
    broderie_illimitee: GILDAN_2400_LS_PRICES.broderie_illimitee,
    placements: GILDAN_2400_LS_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  // ⚠️ V1 MASQUÉ — Mai 2026 : blueprint utilisé pour mockups (36) était un t-shirt
  // manches courtes (mauvaise référence). Le vrai Gildan 2400 = blueprint 80,
  // mais Textildruck DE n'expose que 4 couleurs (noir/blanc/marine/rouge).
  // À réintroduire V2 : soit re-générer mockups avec bp 80 chez Textildruck DE
  // (4 couleurs seulement), soit basculer sur Print Clever GB / OPT OnDemand CZ
  // (20+ couleurs mais shipping moins compétitif).
  visible: false,
  badge: "Manches longues",
  supplierName: "printful",
  ideaPour: ["Restauration", "Staff hiver", "Événementiel mi-saison"],
  conseil: "Idéal pour couvrir la saison fraîche et les équipes restauration / accueil. Coton épais 230 g/m² confortable et durable.",
  volumePricingByTechnique: {
    dtf:                GILDAN_2400_LS_DTF_VOLUME,
    dtflex:             GILDAN_2400_LS_DTFLEX_VOLUME,
    broderie:           GILDAN_2400_LS_BRODERIE_VOLUME,
    broderie_illimitee: GILDAN_2400_LS_BRODERIE_ILLIMITEE_VOLUME,
  },
  hmMockupImages: {
    "noir":    "/mockups/printify/gildan-2400-ls/noir-front.jpg",
    "blanc":   "/mockups/printify/gildan-2400-ls/blanc-front.jpg",
    "gris":    "/mockups/printify/gildan-2400-ls/gris-front.jpg",
    "marine":  "/mockups/printify/gildan-2400-ls/marine-front.jpg",
    "rouge":   "/mockups/printify/gildan-2400-ls/rouge-front.jpg",
    "naturel": "/mockups/printify/gildan-2400-ls/naturel-front.jpg",
  },
  hmMockupImagesBack: {
    "noir":    "/mockups/printify/gildan-2400-ls/noir-back.jpg",
    "blanc":   "/mockups/printify/gildan-2400-ls/blanc-back.jpg",
    "gris":    "/mockups/printify/gildan-2400-ls/gris-back.jpg",
    "marine":  "/mockups/printify/gildan-2400-ls/marine-back.jpg",
    "rouge":   "/mockups/printify/gildan-2400-ls/rouge-back.jpg",
    "naturel": "/mockups/printify/gildan-2400-ls/naturel-back.jpg",
  },
  hmMockupGallery: {
    "noir":    ["/mockups/printify/gildan-2400-ls/noir-front.jpg",    "/mockups/printify/gildan-2400-ls/noir-back.jpg",    "/mockups/printify/gildan-2400-ls/noir-folded.jpg"],
    "blanc":   ["/mockups/printify/gildan-2400-ls/blanc-front.jpg",   "/mockups/printify/gildan-2400-ls/blanc-back.jpg",   "/mockups/printify/gildan-2400-ls/blanc-folded.jpg"],
    "gris":    ["/mockups/printify/gildan-2400-ls/gris-front.jpg",    "/mockups/printify/gildan-2400-ls/gris-back.jpg",    "/mockups/printify/gildan-2400-ls/gris-folded.jpg"],
    "marine":  ["/mockups/printify/gildan-2400-ls/marine-front.jpg",  "/mockups/printify/gildan-2400-ls/marine-back.jpg",  "/mockups/printify/gildan-2400-ls/marine-folded.jpg"],
    "rouge":   ["/mockups/printify/gildan-2400-ls/rouge-front.jpg",   "/mockups/printify/gildan-2400-ls/rouge-back.jpg",   "/mockups/printify/gildan-2400-ls/rouge-folded.jpg"],
    "naturel": ["/mockups/printify/gildan-2400-ls/naturel-front.jpg", "/mockups/printify/gildan-2400-ls/naturel-back.jpg", "/mockups/printify/gildan-2400-ls/naturel-folded.jpg"],
  },
};

// ─── Printful POD — Gildan 64800 Polo ───────────────────────────────────────
export const PRODUCT_GILDAN_64800: Product = {
  id: "gildan-64800",
  slug: "polo-gildan-64800",
  reference: "Gildan 64800",
  name: "Polo piqué Gildan 64800 Unisexe",
  shortName: "Polo piqué",
  category: "polos",
  gender: "unisex",
  tier: "standard",
  description: "Polo piqué unisexe à l'allure propre et professionnelle, base idéale pour les équipes, l'accueil, la restauration et les usages corporate. Broderie front sur-mesure de votre logo. Production et expédition UE. Délai 7-12 jours ouvrés après BAT.",
  composition: "100% coton piqué softstyle",
  weight: "Maille piquée",
  images: [],
  colors: [
    { id: "noir",       label: "Noir",       hex: "#1b1b1b", available: true },
    { id: "marine",     label: "Marine",     hex: "#1E3A5F", available: true },
    { id: "gris-sport", label: "Gris sport", hex: "#9ea1a3", available: true },
    { id: "blanc",      label: "Blanc",      hex: "#FFFFFF", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["broderie"],
  techniqueRecommandee: "broderie",
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      0,
    dtflex:   0,
    flex:     0,
    broderie: POLO_PRICES.pique.broderie,
    placements: POLO_GILDAN_64800_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: POLO_GILDAN_64800_PLACEMENT_SURCHARGES,
  },
  featured: false,
  visible: true,
  badge: "Broderie incluse",
  supplierName: "printful",
  ideaPour: ["Corporate", "Restauration", "Accueil & événements"],
  conseil: "Le polo broderie le plus net pour l'image entreprise : maille piquée durable, logo brodé front premium. À partir de 23,90 € l'unité dès 25 pièces.",
  volumePricing: POLO_GILDAN_64800_BRODERIE_VOLUME,
  hmMockupImages: {
    "noir":       "/mockups/polo-gildan-64800/noir-flat.jpg",
    "marine":     "/mockups/polo-gildan-64800/marine-flat.jpg",
    "gris-sport": "/mockups/polo-gildan-64800/gris-sport-flat.jpg",
    "blanc":      "/mockups/polo-gildan-64800/blanc-flat.jpg",
  },
  hmMockupImagesBack: {
    "noir":       "/mockups/polo-gildan-64800/noir-back.jpg",
    "marine":     "/mockups/polo-gildan-64800/marine-back.jpg",
    "gris-sport": "/mockups/polo-gildan-64800/gris-sport-back.jpg",
    "blanc":      "/mockups/polo-gildan-64800/blanc-back.jpg",
  },
  hmMockupGallery: {
    "noir":       ["/mockups/polo-gildan-64800/noir-flat.jpg",       "/mockups/polo-gildan-64800/noir-back.jpg",       "/mockups/polo-gildan-64800/noir-alt.jpg"],
    "marine":     ["/mockups/polo-gildan-64800/marine-flat.jpg",     "/mockups/polo-gildan-64800/marine-back.jpg",     "/mockups/polo-gildan-64800/marine-alt.jpg"],
    "gris-sport": ["/mockups/polo-gildan-64800/gris-sport-flat.jpg", "/mockups/polo-gildan-64800/gris-sport-back.jpg", "/mockups/polo-gildan-64800/gris-sport-alt.jpg"],
    "blanc":      ["/mockups/polo-gildan-64800/blanc-flat.jpg",      "/mockups/polo-gildan-64800/blanc-back.jpg",      "/mockups/polo-gildan-64800/blanc-alt.jpg"],
  },
};

// ─── Printful POD — Cotton Heritage M2480 (RETIRÉ DU CATALOGUE V1) ──────────
// Décision 2026-05-18 : ce produit est retiré du catalogue front-end (visible: false).
// Raison : audit `docs/audits/printify-equivalents-cotton-polo.md` (2026-05-17)
// → un seul provider Printify pour ce blueprint (Printify Choice US-default,
//   pas d'imprimeur EU). Délais 14-21 j + customs FR = non rentable.
// Remplacement V1 : le Sweatshirt Gildan 18000 (PRODUCT_GILDAN_18000 ci-dessus)
// joue désormais le rôle de sweat principal. Il est disponible chez Textildruck
// Europa DE (blueprint Printify 49) — bascule supplier opérationnelle côté admin,
// pas dans le code applicatif (supplierName reste "printful" pour ne pas casser
// les conditions `isPrintful` dans 9 fichiers UI/studio/BAT).
// La définition ci-dessous est conservée pour traçabilité historique des
// commandes existantes — ne pas supprimer l'objet pour ne pas casser les
// routes admin /api/printify/catalog-audit + variant-map-test.
export const PRODUCT_COTTON_HERITAGE_M2480: Product = {
  id: "cotton-heritage-m2480",
  slug: "sweat-cotton-heritage-m2480",
  reference: "Cotton Heritage M2480",
  name: "Sweat premium Cotton Heritage M2480",
  shortName: "Sweat premium",
  category: "hoodies",
  gender: "unisex",
  tier: "premium",
  description: "Sweatshirt premium unisexe à col rond, pensé pour une image plus haut de gamme que le Gildan 18000 tout en restant simple à vendre en B2B, staff ou marque.",
  composition: "Molleton premium coton/polyester",
  weight: "Molleton premium",
  images: [],
  colors: [
    { id: "noir",  label: "Noir",  hex: "#111111", available: true },
    { id: "blanc", label: "Blanc", hex: "#FAFAFA", available: true },
    { id: "marine", label: "Marine", hex: "#1E2A44", available: true },
    { id: "gris",  label: "Gris",  hex: "#CFCFCF", available: true },
    { id: "beige", label: "Beige", hex: "#E3D2B6", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf", "dtflex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      HOODIE_PRICES.sweat.dtf,
    dtflex:   HOODIE_PRICES.sweat.dtflex,
    flex:     HOODIE_PRICES.sweat.flex,
    broderie: HOODIE_PRICES.sweat.broderie,
    placements: PLACEMENT_SURCHARGES.dtf,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: false,
  visible: false, // 2026-05-18 — retiré du catalogue V1, remplacé par Gildan 18000
  badge: "Premium",
  supplierName: "printful",
  ideaPour: ["Marques", "Staff premium", "Corporate soigné"],
  conseil: "Bon upsell quand tu veux un sweat plus propre et plus premium que l'entrée de gamme, sans partir sur une offre trop compliquée.",
  hmMockupImages: {
    "noir":   "/mockups/cotton-heritage-m2480/noir-front.jpg",
    "blanc":  "/mockups/cotton-heritage-m2480/blanc-front.jpg",
    "marine": "/mockups/cotton-heritage-m2480/marine-front.jpg",
    "gris":   "/mockups/cotton-heritage-m2480/gris-front.jpg",
    "beige":  "/mockups/cotton-heritage-m2480/beige-front.jpg",
  },
  hmMockupImagesBack: {
    "noir":   "/mockups/cotton-heritage-m2480/noir-back.jpg",
    "blanc":  "/mockups/cotton-heritage-m2480/blanc-back.jpg",
    "marine": "/mockups/cotton-heritage-m2480/marine-back.jpg",
    "gris":   "/mockups/cotton-heritage-m2480/gris-back.jpg",
    "beige":  "/mockups/cotton-heritage-m2480/beige-back.jpg",
  },
  hmMockupGallery: {
    "noir":   ["/mockups/cotton-heritage-m2480/noir-front.jpg",   "/mockups/cotton-heritage-m2480/noir-back.jpg",   "/mockups/cotton-heritage-m2480/noir-detail.jpg"],
    "blanc":  ["/mockups/cotton-heritage-m2480/blanc-front.jpg",  "/mockups/cotton-heritage-m2480/blanc-back.jpg",  "/mockups/cotton-heritage-m2480/blanc-detail.jpg"],
    "marine": ["/mockups/cotton-heritage-m2480/marine-front.jpg", "/mockups/cotton-heritage-m2480/marine-back.jpg", "/mockups/cotton-heritage-m2480/marine-detail.jpg"],
    "gris":   ["/mockups/cotton-heritage-m2480/gris-front.jpg",   "/mockups/cotton-heritage-m2480/gris-back.jpg",   "/mockups/cotton-heritage-m2480/gris-detail.jpg"],
    "beige":  ["/mockups/cotton-heritage-m2480/beige-front.jpg",  "/mockups/cotton-heritage-m2480/beige-back.jpg",  "/mockups/cotton-heritage-m2480/beige-detail.jpg"],
  },
};

// ─── Spreadshirt POD — Tarification dégressive dès 10 pièces ─────────────────
// Fournisseur : Spreadshirt (BE/DE) — impression DTG + broderie
// Minimum de commande : 10 pièces
// Prix dégressifs par palier — coût base Spreadshirt : Gildan 10,99 € · Hoodie 30,99 €

export const PRODUCT_SPREADSHIRT_GILDAN_TSHIRT: Product = {
  id: "spreadshirt-gildan-tshirt",
  slug: "tshirt-gildan-volume",
  reference: "Gildan Heavy Cotton — Volume",
  name: "T-shirt Gildan Heavy Cotton — Pack dès 10 pièces",
  shortName: "T-shirt Volume",
  category: "tshirts",
  gender: "unisex",
  tier: "standard",
  description: "T-shirt unisexe Gildan 185 g/m² en coton épais. Idéal pour les commandes groupées entreprises, associations ou événements. Prix dégressifs à partir de 10 pièces — plus la quantité est grande, plus le prix unitaire baisse.",
  composition: "100% coton épais",
  weight: "185 g/m²",
  images: [],
  colors: [
    { id: "blanc",     label: "Blanc",       hex: "#FFFFFF", available: true },
    { id: "noir",      label: "Noir",        hex: "#1a1a1a", available: true },
    { id: "gris",      label: "Gris chiné",  hex: "#9CA3AF", available: true },
    { id: "marine",    label: "Marine",      hex: "#1b2a4a", available: true },
    { id: "rouge",     label: "Rouge",       hex: "#DC2626", available: true },
    { id: "bordeaux",  label: "Bordeaux",    hex: "#7F1D1D", available: true },
  ],
  sizes: [
    { label: "S",    available: true },
    { label: "M",    available: true },
    { label: "L",    available: true },
    { label: "XL",   available: true },
    { label: "XXL",  available: true },
    { label: "3XL",  available: true },
  ],
  techniques: ["dtf", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      19.90,
    dtflex:   0,
    flex:     0,
    broderie: 24.90,  // prix palier 10–24 pcs broderie
    placements:                 { coeur: 0, dos: 0, "coeur-dos": 10.00 },
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  minOrderQty: 10,
  volumePricing: SPREADSHIRT_GILDAN_TSHIRT_VOLUME,  // fallback DTF
  volumePricingByTechnique: {
    dtf:      SPREADSHIRT_GILDAN_TSHIRT_VOLUME,
    broderie: SPREADSHIRT_GILDAN_TSHIRT_BRODERIE_VOLUME,
  },
  featured: false,
  visible: false, // Remplacé par les paliers volume intégrés au Gildan 5000 Printful
  badge: "Dès 10 pièces",
  supplierName: "spreadshirt",
  ideaPour: ["Associations", "Équipes", "Événementiel", "Entreprises"],
  conseil: "Meilleur rapport qualité-prix pour les commandes groupées. Le prix unitaire baisse automatiquement selon la quantité commandée.",
  hmMockupImages: {
    "blanc":    "/mockups/gildan-5000/blanc-front.png",
    "noir":     "/mockups/gildan-5000/noir-front.png",
    "gris":     "/mockups/gildan-5000/gris-front.png",
    "marine":   "/mockups/gildan-5000/marine-front.png",
    "rouge":    "/mockups/gildan-5000/rouge-front.png",
    "bordeaux": "/mockups/gildan-5000/bordeaux-front-v2.png",
  },
  hmMockupImagesBack: {
    "blanc":    "/mockups/gildan-5000/blanc-back.png",
    "noir":     "/mockups/gildan-5000/noir-back.png",
    "gris":     "/mockups/gildan-5000/gris-back.png",
    "marine":   "/mockups/gildan-5000/marine-back.png",
    "rouge":    "/mockups/gildan-5000/rouge-back.png",
    "bordeaux": "/mockups/gildan-5000/bordeaux-back-v2.png",
  },
  hmMockupGallery: {
    "blanc":    ["/mockups/gildan-5000/blanc-front.png",       "/mockups/gildan-5000/blanc-back.png",       "/mockups/gildan-5000/blanc-detail.png"],
    "noir":     ["/mockups/gildan-5000/noir-front.png",        "/mockups/gildan-5000/noir-back.png",        "/mockups/gildan-5000/noir-detail.png"],
    "gris":     ["/mockups/gildan-5000/gris-front.png",        "/mockups/gildan-5000/gris-back.png",        "/mockups/gildan-5000/gris-detail.png"],
    "marine":   ["/mockups/gildan-5000/marine-front.png",      "/mockups/gildan-5000/marine-back.png",      "/mockups/gildan-5000/marine-detail.png"],
    "rouge":    ["/mockups/gildan-5000/rouge-front.png",       "/mockups/gildan-5000/rouge-back.png",       "/mockups/gildan-5000/rouge-detail.png"],
    "bordeaux": ["/mockups/gildan-5000/bordeaux-front-v2.png", "/mockups/gildan-5000/bordeaux-back-v2.png", "/mockups/gildan-5000/bordeaux-detail-v2.png"],
  },
};

export const PRODUCT_SPREADSHIRT_HOODIE: Product = {
  id: "spreadshirt-hoodie",
  slug: "hoodie-awdis-volume",
  reference: "AWDis JH001 — Volume",
  name: "Sweat à capuche unisexe — Pack dès 10 pièces",
  shortName: "Hoodie Volume",
  category: "hoodies",
  gender: "unisex",
  tier: "standard",
  description: "Sweat à capuche unisexe 280 g/m². Coupe confortable, cordon de serrage assortit, poche kangourou. Prix dégressifs à partir de 10 pièces — idéal pour équiper une équipe ou une association.",
  composition: "80% coton, 20% polyester",
  weight: "280 g/m²",
  images: [],
  colors: [
    { id: "noir",    label: "Noir",       hex: "#1a1a1a", available: true },
    { id: "blanc",   label: "Blanc",      hex: "#FFFFFF", available: true },
    { id: "marine",  label: "Marine",     hex: "#1b2a4a", available: true },
    { id: "gris",    label: "Gris chiné", hex: "#9CA3AF", available: true },
  ],
  sizes: [
    { label: "S",    available: true },
    { label: "M",    available: true },
    { label: "L",    available: true },
    { label: "XL",   available: true },
    { label: "XXL",  available: true },
  ],
  techniques: ["dtf"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      44.90,
    dtflex:   0,
    flex:     0,
    broderie: 0,
    placements:                 { coeur: 0, dos: 0, "coeur-dos": 6.00 },
    broDeriePlacementSurcharge: { coeur: 0, dos: 0, "coeur-dos": 0   },
  },
  minOrderQty: 10,
  volumePricing: SPREADSHIRT_HOODIE_VOLUME,
  featured: false,
  visible: false, // Masqué temporairement du catalogue public — attente visuel AWDis officiel
  badge: "Dès 10 pièces",
  supplierName: "spreadshirt",
  ideaPour: ["Associations", "Équipes", "Staff événement"],
  conseil: "Hoodie volume — le prix unitaire baisse à partir de 25, 50 et 100 pièces. Idéal pour habiller une équipe avec un budget maîtrisé.",
  hmMockupImages: {
    "noir":   "/mockups/gildan-18500/noir-front.png",
    "blanc":  "/mockups/gildan-18500/blanc-front.png",
    "marine": "/mockups/gildan-18500/marine-front.png",
    "gris":   "/mockups/gildan-18500/gris-front.png",
  },
  hmMockupImagesBack: {
    "noir":   "/mockups/gildan-18500/noir-back.png",
    "blanc":  "/mockups/gildan-18500/blanc-back.png",
    "marine": "/mockups/gildan-18500/marine-back.png",
    "gris":   "/mockups/gildan-18500/gris-back.png",
  },
  hmMockupGallery: {
    "noir":   ["/mockups/gildan-18500/noir-front.png",   "/mockups/gildan-18500/noir-back.png",   "/mockups/gildan-18500/noir-detail.png"],
    "blanc":  ["/mockups/gildan-18500/blanc-front.png",  "/mockups/gildan-18500/blanc-back.png",  "/mockups/gildan-18500/blanc-detail.png"],
    "marine": ["/mockups/gildan-18500/marine-front.png", "/mockups/gildan-18500/marine-back.png", "/mockups/gildan-18500/marine-detail.png"],
    "gris":   ["/mockups/gildan-18500/gris-front.png",   "/mockups/gildan-18500/gris-back.png",   "/mockups/gildan-18500/gris-detail.png"],
  },
};

// ─── Printify V1 — Mug céramique EU 11oz (bp 441 / OPT OnDemand CZ) ──────────
// Pilote goodie Printify EU activé 2026-05-26.
// Audit API : blueprint 441 "Ceramic Mug (EU)" — single provider EU (OPT OnDemand 🇨🇿).
// Cost 11oz : 5.73 USD ≈ 5.37 € HT  |  Shipping EU first 6.59 USD / additional 1.99 USD.
// Marge brute HT ~5 € (1 pc) / ~9 € (10+) à PV 19.90 € TTC (cohérent mug Printful).
// Sublimation pleine couleur sur céramique blanche, wraparound (2717×1146 px).
// Délai total 14-18 j ouvrés (handling 10 j + ship CZ→FR 4-8 j).
// Mockups : 4 angles (front catalogue + right/left/context galerie),
// stockés dans public/mockups/printify/mug-ceramique-eu/ et déclarés dans le manifest.
// Pricing : réutilise MUG_11OZ_PRICES (19.90 € TTC) — source unique mugs.
export const PRODUCT_MUG_CERAMIQUE_EU: Product = {
  id: "mug-ceramique-eu",
  slug: "mug-ceramique-eu",
  reference: "Mug céramique EU 11oz",
  name: "Mug personnalisé céramique EU",
  shortName: "Mug céramique",
  category: "goodies",
  gender: "unisex",
  tier: "appel",
  description:
    "Mug céramique blanc 11 oz (325 ml). Sublimation pleine couleur sur tout le pourtour, finition brillante, résistant au lave-vaisselle. Production et expédition en Union européenne (République tchèque). Délai 10-15 jours ouvrés.",
  composition: "Céramique blanche",
  weight: "320 g",
  images: [],
  colors: [
    { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
  ],
  sizes: [
    { label: "11 oz / 325 ml", available: true },
  ],
  techniques: ["dtf"], // dtf = sublimation pleine couleur pour les mugs
  placements: ["coeur"],
  pricing: {
    dtf:    MUG_11OZ_PRICES.dtf, // 19.90 € TTC (source unique mugs)
    dtflex: 0,
    flex:   0,
    broderie: 0,
    placements: MUG_11OZ_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: MUG_11OZ_PLACEMENT_SURCHARGES,
  },
  featured: false,
  visible: true,
  badge: "Mug personnalisé",
  supplierName: "printful", // V1 catalogue interne — vraie source = PRINTIFY_V1_MAP["mug-ceramique-eu"]
  ideaPour: ["Cadeaux d'entreprise", "Séminaires", "Associations"],
  conseil:
    "Le goodie B2B par excellence. Sublimation pleine couleur sur céramique blanche, couleurs éclatantes, résistant au lave-vaisselle. Idéal pour les séminaires, anniversaires d'entreprise et offres cadeaux clients. Production EU, délai 10-15 jours ouvrés.",
  volumePricing: MUG_11OZ_DTF_VOLUME,
  // Pas de hmMockupImages / hmMockupGallery : la résolution image passe par
  // le pipeline Printify V1 (getV1PrintifyImage + getV1PrintifyGallery), qui
  // lit le manifest /mockups/printify/mug-ceramique-eu/.
};

// ─── Printful POD — Mug blanc 11 oz (LEGACY, visible: false) ─────────────────
// Goodie B2B : sublimation pleine couleur, résistant lave-vaisselle
// Prix d'achat Printful TTC : ~5.50 € | Marge HT cible : ~12 € (1 pc), ~9 € (10+)
// Conservé en code pour rétrocompatibilité commandes — masqué (visible: false).
// Remplacé V1 par PRODUCT_MUG_CERAMIQUE_EU ci-dessus (Printify OPT OnDemand CZ).
export const PRODUCT_MUG_11OZ: Product = {
  id: "mug-11oz",
  slug: "mug-personnalise-11oz",
  reference: "Mug blanc 11 oz",
  name: "Mug personnalisé avec logo",
  shortName: "Mug personnalisé",
  category: "goodies",
  gender: "unisex",
  tier: "appel",
  description: "Mug blanc 11 oz en céramique de qualité. Impression sublimation pleine couleur sur tout le pourtour. Résistant au lave-vaisselle. Expédition directe depuis l'UE.",
  composition: "Céramique blanche",
  weight: "320 g",
  images: [],
  colors: [
    { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
  ],
  sizes: [
    { label: "11 oz / 325 ml", available: true },
  ],
  techniques: ["dtf"],  // dtf = sublimation pleine couleur pour les mugs
  placements: ["coeur"],
  pricing: {
    dtf:    MUG_11OZ_PRICES.dtf,
    dtflex: 0,
    flex:   0,
    broderie: 0,
    placements: MUG_11OZ_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: MUG_11OZ_PLACEMENT_SURCHARGES,
  },
  featured: false,
  visible: false, // Masqué temporairement du catalogue public — attente visuel mug officiel
  badge: "Nouveau",
  supplierName: "printful",
  ideaPour: ["Cadeaux d'entreprise", "Séminaires", "Associations"],
  conseil: "Le goodie B2B par excellence. Impression sublimation pleine couleur, couleurs éclatantes, résistant au lave-vaisselle. Idéal pour les séminaires, anniversaires d'entreprise et offres cadeaux clients.",
  volumePricing: MUG_11OZ_DTF_VOLUME,
  hmMockupImages: {
    "blanc": "/products/goodies/mug-11oz.svg",
  },
  hmMockupGallery: {
    "blanc": ["/products/goodies/mug-11oz.svg"],
  },
};

// ─── Printful POD — Casquettes (broderie front) ──────────────────────────────
// Personnalisables + commande directe : supplierName "printful", broderie front,
// flux upload simple (comme goodies, pas de studio Fabric). Variant_id mappés
// dans lib/printfulVariantMap.ts. Images : photos front Printful officielles
// téléchargées en local (public/mockups/casquettes/...).
export const PRODUCT_CASQUETTE_FLEXFIT_6277: Product = {
  id: "casquette-flexfit-6277",
  slug: "casquette-flexfit-6277",
  reference: "Flexfit 6277",
  name: "Casquette Flexfit 6277 brodée",
  shortName: "Casquette Flexfit",
  category: "casquettes",
  gender: "unisex",
  tier: "premium",
  description:
    "Casquette baseball structurée Flexfit 6277, ajustement stretch sans fermeture (S/M et L/XL). 6 panneaux, visière pré-incurvée, sergé de coton brossé. Broderie front sur-mesure de votre logo. Production et expédition UE. Délai 7-12 jours ouvrés après BAT.",
  composition: "63% coton / 34% polyester / 3% élasthanne",
  weight: "—",
  images: [],
  colors: [
    { id: "noir",       label: "Noir",       hex: "#1b1b1b", available: true },
    { id: "marine",     label: "Marine",     hex: "#171822", available: true },
    { id: "gris",       label: "Gris",       hex: "#717171", available: true },
    { id: "kaki",       label: "Kaki",       hex: "#bdaa97", available: true },
    { id: "rouge",      label: "Rouge",      hex: "#bf0a1b", available: true },
    { id: "bleu-royal", label: "Bleu Royal", hex: "#0b3466", available: true },
    { id: "blanc",      label: "Blanc",      hex: "#ffffff", available: true },
  ],
  sizes: [
    { label: "S/M",  available: true },
    { label: "L/XL", available: true },
  ],
  techniques: ["broderie"],
  placements: ["coeur"],
  pricing: {
    dtf:      CASQUETTE_FLEXFIT_6277_PRICES.dtf,
    dtflex:   CASQUETTE_FLEXFIT_6277_PRICES.dtflex,
    flex:     CASQUETTE_FLEXFIT_6277_PRICES.flex,
    broderie: CASQUETTE_FLEXFIT_6277_PRICES.broderie,
    placements: CASQUETTE_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: CASQUETTE_PLACEMENT_SURCHARGES,
  },
  featured: false,
  visible: true,
  badge: "Broderie incluse",
  supplierName: "printful",
  ideaPour: ["Équipes", "Événementiel", "Marques"],
  conseil:
    "La casquette structurée la plus populaire pour un logo brodé net et durable. Ajustement Flexfit confortable, finition premium. À partir de 18,90 € l'unité dès 25 pièces.",
  volumePricing: CASQUETTE_FLEXFIT_6277_BRODERIE_VOLUME,
  hmMockupImages: {
    "noir":       "/mockups/casquettes/flexfit-6277/noir-front.jpg",
    "marine":     "/mockups/casquettes/flexfit-6277/marine-front.jpg",
    "gris":       "/mockups/casquettes/flexfit-6277/gris-front.jpg",
    "kaki":       "/mockups/casquettes/flexfit-6277/kaki-front.jpg",
    "rouge":      "/mockups/casquettes/flexfit-6277/rouge-front.jpg",
    "bleu-royal": "/mockups/casquettes/flexfit-6277/bleu-royal-front.jpg",
    "blanc":      "/mockups/casquettes/flexfit-6277/blanc-front.jpg",
  },
};

export const PRODUCT_CASQUETTE_YUPOONG_6006: Product = {
  id: "casquette-yupoong-6006",
  slug: "casquette-yupoong-6006",
  reference: "Yupoong 6006",
  name: "Casquette Yupoong 6006 brodée",
  shortName: "Casquette Yupoong",
  category: "casquettes",
  gender: "unisex",
  tier: "standard",
  description:
    "Casquette trucker 5 panneaux Yupoong 6006 (Flexfit), devant mousse profilé, dos en filet respirant, fermeture snapback réglable (taille unique). Broderie front sur-mesure de votre logo. Production et expédition UE. Délai 7-12 jours ouvrés après BAT.",
  composition: "Devant 60% coton / 40% polyester · filet 100% polyester",
  weight: "—",
  images: [],
  colors: [
    { id: "noir",       label: "Noir",       hex: "#24292f", available: true },
    { id: "anthracite", label: "Anthracite", hex: "#554b56", available: true },
    { id: "marine",     label: "Marine",     hex: "#36435d", available: true },
    { id: "blanc",      label: "Blanc",      hex: "#ffffff", available: true },
  ],
  sizes: [
    { label: "One size", available: true },
  ],
  techniques: ["broderie"],
  placements: ["coeur"],
  pricing: {
    dtf:      CASQUETTE_YUPOONG_6006_PRICES.dtf,
    dtflex:   CASQUETTE_YUPOONG_6006_PRICES.dtflex,
    flex:     CASQUETTE_YUPOONG_6006_PRICES.flex,
    broderie: CASQUETTE_YUPOONG_6006_PRICES.broderie,
    placements: CASQUETTE_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: CASQUETTE_PLACEMENT_SURCHARGES,
  },
  featured: false,
  visible: true,
  badge: "Broderie incluse",
  supplierName: "printful",
  ideaPour: ["Associations", "Food trucks", "Événementiel"],
  conseil:
    "La trucker classique au style décontracté, dos filet aéré. Idéale pour un logo brodé sur le devant mousse. À partir de 15,90 € l'unité dès 25 pièces.",
  volumePricing: CASQUETTE_YUPOONG_6006_BRODERIE_VOLUME,
  hmMockupImages: {
    "noir":       "/mockups/casquettes/yupoong-6006/noir-front.jpg",
    "anthracite": "/mockups/casquettes/yupoong-6006/anthracite-front.jpg",
    "marine":     "/mockups/casquettes/yupoong-6006/marine-front.jpg",
    "blanc":      "/mockups/casquettes/yupoong-6006/blanc-front.jpg",
  },
};

// ─── All products ─────────────────────────────────────────────────────────────
// ─── Catalogue complet (toutes catégories) ────────────────────────────────────
// Convention V1 Printful : seuls les produits avec visible: true sont exposés.
// Les anciens produits TopTex/B&C/iDeal/Kariban etc. n'ont pas visible: true
// → filtrés automatiquement, données conservées pour compatibilité commandes.
const _ALL_PRODUCTS: Product[] = [
  // ── T-shirts iDeal — 2 photos CDN par produit
  PRODUCT_IB320,
  PRODUCT_IB321,
  PRODUCT_IB323,

  // ── Hoodies iDeal & Native Spirit — CDN
  PRODUCT_IB400,
  PRODUCT_IB402,
  PRODUCT_NS400,
  PRODUCT_NS401,
  PRODUCT_NS408,

  // ── Softshells B&C — CDN
  PRODUCT_JUI62,
  PRODUCT_JWI63,

  // ── Polos Kariban — CDN
  PRODUCT_K262,
  PRODUCT_K256,    // 1 photo CDN
  PRODUCT_K239,
  PRODUCT_K240,

  // ── Polaires & doudounes iDeal / WK — CDN
  PRODUCT_IB900,
  PRODUCT_IB6175,
  PRODUCT_IB6176,
  PRODUCT_WK904,   // 1 photo CDN

  // ── Casquettes Kariban — CDN
  PRODUCT_KP157,
  PRODUCT_KP162,
  PRODUCT_KP165,
  PRODUCT_KP185,   // 1 photo CDN

  // ── Sacs & tote bags Kimood — CDN
  PRODUCT_KI0262,
  PRODUCT_KI0252,
  PRODUCT_KI0275,
  PRODUCT_KI0274,  // 1 photo CDN

  // ── Enfants iDeal — CDN
  PRODUCT_IB322,
  PRODUCT_IB401,   // 1 photo CDN
  PRODUCT_IB403,   // 1 photo CDN

  // ── Stock HM Global / Falk&Ross — produits en stock atelier ─────────────
  PRODUCT_WG004,              // Sweat col rond B&C ID.332 (pilote "En stock agence")

  // ── Printify POD V1 — catalogue public ───────────────────────────────────
  PRODUCT_GILDAN_5000,        // 19.90 € TTC — produit d'appel
  PRODUCT_BELLA_3001,         // 22.90 € TTC — premium ring-spun
  PRODUCT_COMFORT_COLORS_1717, // 21.90 € TTC — premium garment-dyed (NOUVEAU V1)
  PRODUCT_GILDAN_2400_LS,     // 27.90 € TTC — manches longues (NOUVEAU V1)
  PRODUCT_GILDAN_18000,       // 39.90 € TTC — sweatshirt
  PRODUCT_GILDAN_18500,       // 49.90 € TTC — hoodie
  PRODUCT_GILDAN_64800,       // polo piqué Printful
  PRODUCT_COTTON_HERITAGE_M2480, // sweat premium Printful
  PRODUCT_MUG_CERAMIQUE_EU,   // 19.90 € TTC — goodie Printify EU (bp 441, OPT OnDemand CZ)
  PRODUCT_MUG_11OZ,           // 19.90 € TTC — LEGACY Printful (visible: false)

  // ── Spreadshirt — tarification dégressive dès 10 pièces ──────────────────
  PRODUCT_SPREADSHIRT_GILDAN_TSHIRT,   // 13.90–19.90 € TTC selon palier
  PRODUCT_SPREADSHIRT_HOODIE,          // 35.90–44.90 € TTC selon palier

  // ── Casquettes — Printful POD (broderie incluse, commande directe) ───────
  PRODUCT_CASQUETTE_FLEXFIT_6277,      // Flexfit/Yupoong 6277 — broderie frontale
  PRODUCT_CASQUETTE_YUPOONG_6006,      // Yupoong 6006 trucker — broderie frontale
];

// V1 Printful : seuls les produits avec visible: true explicite sont exposés.
// Les anciens produits (visible absent ou visible: false) sont masqués du catalogue.
// Les données restent intactes pour la compatibilité avec les commandes existantes.
export const ALL_PRODUCTS: Product[] = _ALL_PRODUCTS.filter(
  (p) => p.visible === true
);

// Tous les produits (y compris masqués) — pour l'admin et la compatibilité commandes.
export const ALL_PRODUCTS_ADMIN: Product[] = _ALL_PRODUCTS;

export const PRODUCTS_BY_CATEGORY = {
  tshirts:    ALL_PRODUCTS.filter((p) => p.category === "tshirts"),
  hoodies:    ALL_PRODUCTS.filter((p) => p.category === "hoodies"),
  softshells: ALL_PRODUCTS.filter((p) => p.category === "softshells"),
  polos:      ALL_PRODUCTS.filter((p) => p.category === "polos"),
  polaires:   ALL_PRODUCTS.filter((p) => p.category === "polaires"),
  casquettes: ALL_PRODUCTS.filter((p) => p.category === "casquettes"),
  sacs:       ALL_PRODUCTS.filter((p) => p.category === "sacs"),
  goodies:    ALL_PRODUCTS.filter((p) => p.category === "goodies"),
  enfants:    ALL_PRODUCTS.filter((p) => p.category === "enfants"),
};

export function getProductBySlug(slug: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return ALL_PRODUCTS.filter((p) => p.featured);
}

// ─── Seasonal ordering config ─────────────────────────────────────────────────
export const SEASONAL_ORDER: Record<string, string[]> = {
  printemps: ["tshirts", "polos", "hoodies", "softshells", "casquettes", "sacs", "goodies", "polaires", "enfants"],
  ete:       ["tshirts", "polos", "casquettes", "sacs", "goodies", "hoodies", "softshells", "polaires", "enfants"],
  automne:   ["hoodies", "softshells", "polos", "polaires", "tshirts", "casquettes", "sacs", "goodies", "enfants"],
  hiver:     ["polaires", "hoodies", "softshells", "polos", "tshirts", "casquettes", "goodies", "sacs", "enfants"],
};

// Saison courante — modifier pour changer la saison
export const CURRENT_SEASON = "printemps" as keyof typeof SEASONAL_ORDER;

export const CATEGORY_META: Record<string, { label: string; description: string; icon: string }> = {
  tshirts: {
    label: "T-shirts",
    description: "T-shirts personnalisés DTF, Flex ou Broderie",
    icon: "👕",
  },
  hoodies: {
    label: "Hoodies & Sweats",
    description: "Sweatshirts et hoodies personnalisés",
    icon: "🧥",
  },
  softshells: {
    label: "Softshells & Vestes",
    description: "Vestes softshell premium personnalisées",
    icon: "🫐",
  },
  polos: {
    label: "Polos",
    description: "Polos jersey et piqués — Flex ou Broderie",
    icon: "👔",
  },
  polaires: {
    label: "Polaires & Doudounes",
    description: "Polaires, fleeces et doudounes personnalisés",
    icon: "🧤",
  },
  casquettes: {
    label: "Casquettes & Bonnets",
    description: "Casquettes brodées — Broderie uniquement",
    icon: "🧢",
  },
  sacs: {
    label: "Sacs & Tote bags",
    description: "Tote bags et sacs personnalisés DTF ou Flex",
    icon: "👜",
  },
  goodies: {
    label: "Mugs & Goodies",
    description: "Mugs et objets publicitaires personnalisés",
    icon: "☕",
  },
  enfants: {
    label: "Enfants",
    description: "T-shirts, sweats et hoodies pour les enfants",
    icon: "🧒",
  },
};
