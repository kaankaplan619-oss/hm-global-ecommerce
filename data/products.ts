import type { Product } from "@/types";
import {
  TSHIRT_PRICES,
  HOODIE_PRICES,
  SOFTSHELL_PRICES,
  PLACEMENT_SURCHARGES,
} from "./pricing";

function buildProductImages(productId: string, images: string[]) {
  return images.map((image) => `/images/products/${productId}/${image}`);
}

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
  images: buildProductImages("tu01t", [
    "front-blanc.jpg",
    "front-noir.jpg",
    "back-blanc.jpg",
    "detail-col.jpg",
  ]),
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
  images: buildProductImages("tw02t", [
    "front-blanc.jpg",
    "front-noir.jpg",
    "back-blanc.jpg",
    "detail-coupe.jpg",
  ]),
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
  images: buildProductImages("tu03t", [
    "front-blanc.jpg",
    "front-noir.jpg",
    "back-noir.jpg",
    "detail-tissu.jpg",
  ]),
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
};

// ─── HOODIES / SWEATS ────────────────────────────────────────────────────────

const HOODIE_COLORS = [
  { id: "noir", label: "Noir", hex: "#111111", available: true },
  { id: "blanc", label: "Blanc cassé", hex: "#F5F5F5", available: true },
  { id: "gris-melange", label: "Gris mélangé", hex: "#6B7280", available: true },
  { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
  { id: "bordeaux", label: "Bordeaux", hex: "#7F1D1D", available: true },
  { id: "vert-foret", label: "Vert forêt", hex: "#14532D", available: true },
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
  images: buildProductImages("wg004", [
    "front-noir.jpg",
    "front-gris.jpg",
    "back-noir.jpg",
    "detail-molleton.jpg",
  ]),
  colors: HOODIE_COLORS,
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
  images: buildProductImages("wu620", [
    "front-noir.jpg",
    "front-gris.jpg",
    "back-noir.jpg",
    "detail-capuche.jpg",
  ]),
  colors: HOODIE_COLORS,
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
  images: buildProductImages("jui62", [
    "front-noir.jpg",
    "front-marine.jpg",
    "back-noir.jpg",
    "detail-softshell.jpg",
  ]),
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
  images: buildProductImages("jwi63", [
    "front-noir.jpg",
    "front-marine.jpg",
    "back-noir.jpg",
    "detail-softshell.jpg",
  ]),
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
};

// ─── All products ─────────────────────────────────────────────────────────────
export const ALL_PRODUCTS: Product[] = [
  PRODUCT_TU01T,
  PRODUCT_TW02T,
  PRODUCT_TU03T,
  PRODUCT_WG004,
  PRODUCT_WU620,
  PRODUCT_JUI62,
  PRODUCT_JWI63,
];

export const PRODUCTS_BY_CATEGORY = {
  tshirts:    ALL_PRODUCTS.filter((p) => p.category === "tshirts"),
  hoodies:    ALL_PRODUCTS.filter((p) => p.category === "hoodies"),
  softshells: ALL_PRODUCTS.filter((p) => p.category === "softshells"),
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
// Modifier ici pour changer l'ordre saisonnier sur la home
export const SEASONAL_ORDER: Record<string, string[]> = {
  printemps: ["tshirts", "hoodies", "softshells"],
  ete:       ["tshirts", "hoodies", "softshells"],
  automne:   ["hoodies", "softshells", "tshirts"],
  hiver:     ["hoodies", "softshells", "tshirts"],
};

// Saison courante — modifier pour changer la saison
export const CURRENT_SEASON = "printemps" as keyof typeof SEASONAL_ORDER;

export const CATEGORY_META = {
  tshirts: {
    label: "T-shirts",
    description: "T-shirts personnalisés pour votre entreprise",
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
    icon: "🧦",
  },
};
