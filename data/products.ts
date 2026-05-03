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
  BELLA_3001_PRICES,
  BELLA_3001_PLACEMENT_SURCHARGES,
  GILDAN_18000_PRICES,
  GILDAN_18000_PLACEMENT_SURCHARGES,
  GILDAN_18500_PRICES,
  GILDAN_18500_PLACEMENT_SURCHARGES,
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
  ki0262: ["https://cdn.toptex.com/packshots/PS_KI0262_NATURAL.png","https://cdn.toptex.com/packshots/PS_KI0262_BLACK.png","https://cdn.toptex.com/packshots/PS_KI0262_NAVYBLUE.png","https://cdn.toptex.com/packshots/PS_KI0262_CURCUMA.png","https://cdn.toptex.com/packshots/PS_KI0262_METALGREY.png"],
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_PRICES.appel.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_PRICES.appel.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_PRICES.standard.dtf,
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

// Couleurs réelles B&C WG004 (vérifiées sur CDN Toptex — packshots confirmés)
const WG004_COLORS = [
  { id: "noir",          label: "Noir",          hex: "#111111", available: true },
  { id: "blanc",         label: "Blanc cassé",   hex: "#F5F5F5", available: true },
  { id: "gris-melange",  label: "Gris chiné",    hex: "#6B7280", available: true },
  { id: "anthracite",    label: "Anthracite",    hex: "#374151", available: true },
  { id: "marine",        label: "Marine",        hex: "#1E3A5F", available: true },
  { id: "bleu-royal",   label: "Bleu royal",    hex: "#2563EB", available: true },
  { id: "bordeaux",      label: "Bordeaux",      hex: "#7F1D1D", available: true },
  { id: "rouge",         label: "Rouge",         hex: "#DC2626", available: true },
  { id: "vert-bouteille",label: "Vert bouteille",hex: "#166534", available: true },
  { id: "orange",        label: "Orange",        hex: "#EA580C", available: true },
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
    "Sweat col rond classique, coupe droite confortable. Intérieur molletonné doux, idéal pour la communication d'entreprise. Résistant au lavage fréquent.",
  composition: "80% coton, 20% polyester",
  weight: "280 g/m²",
  images: PLACEHOLDER_IMAGES("wg004"),
  colors: WG004_COLORS,
  sizes: HOODIE_SIZES,
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      HOODIE_PRICES.sweat.dtf,
    flex:     HOODIE_PRICES.sweat.flex,
    broderie: HOODIE_PRICES.sweat.broderie,
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
  supplierName: "falk-ross",
  supplierRef: "WG004",
  toptexRef: "CGWG004",
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      HOODIE_PRICES.hoodie.dtf,
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
  techniques: ["broderie", "dtf", "flex"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SOFTSHELL_PRICES.standard.dtf,
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
  techniques: ["broderie", "dtf", "flex"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SOFTSHELL_PRICES.standard.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_IDEAL_PRICES.base.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_IDEAL_PRICES.base.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      TSHIRT_IDEAL_PRICES.longues.dtf,
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
  conseil: POLO_CONSEIL,
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLO_PRICES.jersey.dtf,
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
  conseil: POLO_CONSEIL,
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      POLO_PRICES.pique.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.colRond.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.hoodie.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.ecoSweat.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.ecoHoodie.dtf,
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
  techniques: ["dtf", "flex"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.oversize.dtf,
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
  description: "Tote bag en coton biologique certifié GOTS. 5 coloris naturels. Idéal comme cadeau client, goodies événementiels, sac logo boutique.",
  composition: "100% coton biologique",
  weight: "140 g/m²",
  images: PLACEHOLDER_IMAGES("ki0262"),
  colors: [
    { id: "naturel", label: "Naturel", hex: "#E8DCC8", available: true },
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "bleu-roi", label: "Bleu roi", hex: "#2563EB", available: true },
  ],
  sizes: [{ label: "One size", available: true }],
  techniques: ["dtf", "flex"],
  placements: ["coeur"],
  pricing: {
    dtf:      SAC_PRICES.toteBio.dtf,
    flex:     SAC_PRICES.toteBio.flex,
    broderie: SAC_PRICES.toteBio.broderie,
    placements: SAC_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: SAC_PLACEMENT_SURCHARGES,
  },
  featured: true,
  seasonal: ["printemps", "ete"],
  badge: "Écoresponsable",
  supplierName: "toptex",
  supplierRef: "KI0262",
  ideaPour: ["Cadeaux clients", "Événementiels", "Boutiques & Commerce"],
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
  techniques: ["dtf", "flex"],
  placements: ["coeur"],
  pricing: {
    dtf:      SAC_PRICES.cabasBio.dtf,
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
  techniques: ["dtf", "flex"],
  placements: ["coeur"],
  pricing: {
    dtf:      SAC_PRICES.bicolore.dtf,
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
  techniques: ["dtf", "flex"],
  placements: ["coeur"],
  pricing: {
    dtf:      SAC_PRICES.jute.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos"],
  pricing: {
    dtf:      TSHIRT_IDEAL_PRICES.base.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.colRond.dtf,
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
  techniques: ["dtf", "flex", "broderie"],
  placements: ["coeur", "dos"],
  pricing: {
    dtf:      SWEAT_IDEAL_PRICES.hoodie.dtf,
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
  reference: "Gildan 5000",
  name: "T-shirt Gildan Heavy Cotton Unisexe",
  shortName: "T-shirt Gildan",
  category: "tshirts",
  gender: "unisex",
  tier: "standard",
  description: "T-shirt unisexe 185 g/m² en coton épais. Col rond côtelé, coupe régulière. Impression DTF haute qualité. Expédition directe depuis l'UE (Lettonie / Espagne).",
  composition: "100% coton épais",
  weight: "185 g/m²",
  images: [],
  colors: [
    { id: "blanc",      label: "Blanc",      hex: "#FFFFFF", available: true },
    { id: "noir",       label: "Noir",       hex: "#1a1a1a", available: true },
    { id: "gris-sport", label: "Gris Sport", hex: "#8a9090", available: true },
    { id: "marine",     label: "Marine",     hex: "#1b2a4a", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      GILDAN_5000_PRICES.dtf,
    flex:     GILDAN_5000_PRICES.flex,
    broderie: GILDAN_5000_PRICES.broderie,
    placements: GILDAN_5000_PLACEMENT_SURCHARGES,   // cœur 19.90 / cœur+dos 29.90
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  visible: true,
  badge: "Produit d'appel",
  supplierName: "printful",
  ideaPour: ["Associations", "Événementiel", "Équipes"],
  conseil: "Idéal pour débuter votre communication textile. Le Gildan 5000 est notre best-seller entrée de gamme : coton épais, couleurs intenses, expédition directe depuis l'UE.",
};

// ─── Printful POD — Bella+Canvas 3001 ────────────────────────────────────────
// T-shirt premium jersey / tri-blend 145 g/m²
// Prix V1 : 29.90 € cœur seul — 34.90 € cœur+dos
export const PRODUCT_BELLA_3001: Product = {
  id: "bella-3001",
  slug: "tshirt-bella-canvas-3001",
  reference: "Bella+Canvas 3001",
  name: "T-shirt Bella+Canvas 3001 Unisexe",
  shortName: "T-shirt Premium",
  category: "tshirts",
  gender: "unisex",
  tier: "premium",
  description: "T-shirt jersey premium 145 g/m² en coton ring-spun. Coupe unisexe moderne, col rond sans couture, épaule à épaule. Le choix des marques et des projets haut de gamme.",
  composition: "100% coton ring-spun peigné",
  weight: "145 g/m²",
  images: [],
  colors: [
    { id: "noir",   label: "Noir",    hex: "#1a1a1a", available: true },
    { id: "blanc",  label: "Blanc",   hex: "#FAFAF8", available: true },
    { id: "marine", label: "Marine",  hex: "#1b2a4a", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      BELLA_3001_PRICES.dtf,
    flex:     BELLA_3001_PRICES.flex,
    broderie: BELLA_3001_PRICES.broderie,
    placements: BELLA_3001_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  visible: true,
  badge: "Premium",
  supplierName: "printful",
  ideaPour: ["Marques & Streetwear", "Événementiels premium", "Boutiques"],
  conseil: "Le Bella+Canvas 3001 est la référence des créateurs de marques. Coupe flatteuse, tombé parfait, rendu DTF exceptionnel sur le coton ring-spun.",
};

// ─── Printful POD — Gildan 18000 Sweatshirt ──────────────────────────────────
// Sweatshirt col rond 271 g/m²
// Prix V1 : 39.90 € cœur seul — 45.90 € cœur+dos
export const PRODUCT_GILDAN_18000: Product = {
  id: "gildan-18000",
  slug: "sweat-gildan-18000",
  reference: "Gildan 18000",
  name: "Sweatshirt Gildan 18000 Unisexe",
  shortName: "Sweatshirt",
  category: "hoodies",
  gender: "unisex",
  tier: "standard",
  description: "Sweatshirt col rond 271 g/m² en coton/polyester. Coupe décontractée, col côtelé double épaisseur, poignets et bas de vêtement côtelés. Le classique intemporel à personnaliser.",
  composition: "50% coton, 50% polyester",
  weight: "271 g/m²",
  images: [],
  colors: [
    { id: "noir",       label: "Noir",       hex: "#1a1a1a", available: true },
    { id: "marine",     label: "Marine",     hex: "#1b2a4a", available: true },
    { id: "gris-sport", label: "Gris Sport", hex: "#8a9090", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      GILDAN_18000_PRICES.dtf,
    flex:     GILDAN_18000_PRICES.flex,
    broderie: GILDAN_18000_PRICES.broderie,
    placements: GILDAN_18000_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  visible: true,
  supplierName: "printful",
  ideaPour: ["Associations & Clubs", "BDE & Étudiants", "Corporate & Équipes"],
  conseil: "Le sweatshirt Gildan 18000 est un incontournable du textile personnalisé. Polyvalent, confortable, idéal pour créer des uniformes ou des collections abordables.",
};

// ─── Printful POD — Gildan 18500 Hoodie ──────────────────────────────────────
// Hoodie à capuche 300 g/m²
// Prix V1 : 49.90 € cœur seul — 55.90 € cœur+dos
export const PRODUCT_GILDAN_18500: Product = {
  id: "gildan-18500",
  slug: "hoodie-gildan-18500",
  reference: "Gildan 18500",
  name: "Hoodie Gildan 18500 Unisexe",
  shortName: "Hoodie",
  category: "hoodies",
  gender: "unisex",
  tier: "standard",
  description: "Hoodie à capuche 300 g/m² en coton/polyester. Poche kangourou, cordon de serrage assorti, intérieur doux brossé. Le hoodie de référence pour toutes les saisons.",
  composition: "50% coton, 50% polyester",
  weight: "300 g/m²",
  images: [],
  colors: [
    { id: "noir",       label: "Noir",       hex: "#1a1a1a", available: true },
    { id: "blanc",      label: "Blanc",      hex: "#FFFFFF", available: true },
    { id: "marine",     label: "Marine",     hex: "#1b2a4a", available: true },
    { id: "gris-sport", label: "Gris Sport", hex: "#8a9090", available: true },
  ],
  sizes: [
    { label: "S",   available: true },
    { label: "M",   available: true },
    { label: "L",   available: true },
    { label: "XL",  available: true },
    { label: "XXL", available: true },
  ],
  techniques: ["dtf"],
  placements: ["coeur", "dos", "coeur-dos"],
  pricing: {
    dtf:      GILDAN_18500_PRICES.dtf,
    flex:     GILDAN_18500_PRICES.flex,
    broderie: GILDAN_18500_PRICES.broderie,
    placements: GILDAN_18500_PLACEMENT_SURCHARGES,
    broDeriePlacementSurcharge: PLACEMENT_SURCHARGES.broderie,
  },
  featured: true,
  visible: true,
  badge: "Populaire",
  supplierName: "printful",
  ideaPour: ["Associations & BDE", "Sport & Clubs", "Streetwear & Marques"],
  conseil: "Le Gildan 18500 est le hoodie le plus commandé sur Printful. Intérieur doux brossé, poche kangourou spacieuse, rendu DTF premium sur les couleurs unies.",
};

// ─── All products ─────────────────────────────────────────────────────────────
// ─── Catalogue complet (toutes catégories) ────────────────────────────────────
// Convention V1 Printful : seuls les produits avec visible: true sont exposés.
// Les anciens produits TopTex/B&C/iDeal/Kariban etc. n'ont pas visible: true
// → filtrés automatiquement, données conservées pour compatibilité commandes.
const _ALL_PRODUCTS: Product[] = [
  // ── T-shirts B&C — photos locales complètes ✓
  PRODUCT_TU01T,   // 81 photos couleurs
  PRODUCT_TW02T,   // photos locales
  PRODUCT_TU03T,   // photos locales

  // ── T-shirts iDeal — 2 photos CDN par produit
  PRODUCT_IB320,
  PRODUCT_IB321,
  PRODUCT_IB323,

  // ── Hoodies B&C — photos locales complètes ✓
  PRODUCT_WG004,
  PRODUCT_WU620,

  // ── Hoodies iDeal & Native Spirit — CDN
  PRODUCT_IB400,
  PRODUCT_IB402,
  PRODUCT_NS400,
  PRODUCT_NS401,
  PRODUCT_NS408,

  // ── Softshells B&C — photos locales complètes ✓
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

  // ── Printful POD V1 — catalogue public ───────────────────────────────────
  PRODUCT_GILDAN_5000,    // 19.90 € TTC — produit d'appel
  PRODUCT_BELLA_3001,     // 29.90 € TTC — premium
  PRODUCT_GILDAN_18000,   // 39.90 € TTC — sweatshirt
  PRODUCT_GILDAN_18500,   // 49.90 € TTC — hoodie
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
  printemps: ["tshirts", "polos", "hoodies", "softshells", "casquettes", "sacs", "polaires", "enfants"],
  ete:       ["tshirts", "polos", "casquettes", "sacs", "hoodies", "softshells", "polaires", "enfants"],
  automne:   ["hoodies", "softshells", "polos", "polaires", "tshirts", "casquettes", "sacs", "enfants"],
  hiver:     ["polaires", "hoodies", "softshells", "polos", "tshirts", "casquettes", "sacs", "enfants"],
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
    label: "Sacs & Goodies",
    description: "Tote bags et sacs personnalisés DTF ou Flex",
    icon: "👜",
  },
  enfants: {
    label: "Enfants",
    description: "T-shirts, sweats et hoodies pour les enfants",
    icon: "🧒",
  },
};
