import type { Product } from "@/types";
import {
  TSHIRT_PRICES,
  HOODIE_PRICES,
  SOFTSHELL_PRICES,
  PLACEMENT_SURCHARGES,
} from "./pricing";

// ─── T-SHIRTS ─────────────────────────────────────────────────────────────────

const TSHIRT_SIZES = [
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: true },
  { label: "XXL", available: true },
  { label: "3XL", available: true },
];

const TSHIRT_SIZES_XS = [
  { label: "XS", available: true },
  ...TSHIRT_SIZES,
];

export const PRODUCT_GILDAN5000: Product = {
  id: "gildan5000",
  slug: "tshirt-gildan-heavy-cotton-5000",
  reference: "Gildan 5000",
  name: "T-shirt Gildan Heavy Cotton",
  shortName: "T-shirt Unisexe",
  category: "tshirts",
  gender: "unisex",
  tier: "appel",
  description:
    "Le T-shirt incontournable de HM Global Agence. Coton épais 185 g/m², col rond côtelé, double aiguille aux manches et au bas. Coupe classique unisexe, résistant au lavage fréquent. Idéal pour les commandes d'entreprise et la personnalisation textile.",
  composition: "100% coton (Gris sport : 90% coton, 10% polyester)",
  weight: "185 g/m²",
  images: [
    "/images/products/gildan5000-blanc.jpg",
    "/images/products/gildan5000-noir.jpg",
    "/images/products/gildan5000-blanc-detail.jpg",
  ],
  previewImages: {
    "blanc":      "/images/products/gildan5000-blanc-coeur.jpg",
    "noir":       "/images/products/gildan5000-noir-coeur.jpg",
    "gris-sport": "/images/products/gildan5000-gris-coeur.jpg",
    "marine":     "/images/products/gildan5000-marine-coeur.jpg",
  },
  colors: [
    { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "gris-sport", label: "Gris sport", hex: "#9CA3AF", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "bleu-royal", label: "Bleu royal", hex: "#2563EB", available: true },
    { id: "vert-bouteille", label: "Vert bouteille", hex: "#166534", available: true },
    { id: "bordeaux", label: "Bordeaux", hex: "#7F1D1D", available: true },
  ],
  sizes: TSHIRT_SIZES_XS,
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
  supplierName: "toptex",
  supplierRef: "G5000",
};

export const PRODUCT_BC3001: Product = {
  id: "bc3001",
  slug: "tshirt-bella-canvas-3001-unisexe",
  reference: "Bella+Canvas 3001",
  name: "T-shirt Bella+Canvas 3001 Unisexe",
  shortName: "T-shirt Premium",
  category: "tshirts",
  gender: "unisex",
  tier: "standard",
  description:
    "Le t-shirt premium de référence. Coton peigné filé à l'anneau ultra-doux, tombé impeccable, encolure côtelée 1×1. Coupe moderne légèrement ajustée. Résultat d'impression exceptionnel en DTF et flex. Le choix des marques qui veulent se démarquer.",
  composition: "100% coton peigné filé à l'anneau (certains coloris : mélange)",
  weight: "145 g/m²",
  images: [
    "/images/products/bc3001-blanc.jpg",
    "/images/products/bc3001-noir.jpg",
    "/images/products/bc3001-blanc-detail.jpg",
  ],
  colors: [
    { id: "blanc", label: "Blanc", hex: "#FFFFFF", available: true },
    { id: "noir", label: "Noir", hex: "#111111", available: true },
    { id: "gris-sport", label: "Gris sport", hex: "#9CA3AF", available: true },
    { id: "marine", label: "Marine", hex: "#1E3A5F", available: true },
    { id: "rouge", label: "Rouge", hex: "#DC2626", available: true },
    { id: "bleu-royal", label: "Bleu royal", hex: "#2563EB", available: true },
    { id: "vert-bouteille", label: "Vert bouteille", hex: "#166534", available: true },
    { id: "bordeaux", label: "Bordeaux", hex: "#7F1D1D", available: true },
  ],
  sizes: TSHIRT_SIZES_XS,
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
  badge: "Premium",
  supplierName: "toptex",
  supplierRef: "BC3001",
};

// ─── HOODIES / SWEATS ────────────────────────────────────────────────────────

const HOODIE_COLORS = [
  { id: "noir", label: "Noir", hex: "#111111", available: true },
  { id: "blanc", label: "Blanc", hex: "#F5F5F5", available: true },
  { id: "gris-sport", label: "Gris sport", hex: "#9CA3AF", available: true },
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

export const PRODUCT_GILDAN18000: Product = {
  id: "gildan18000",
  slug: "sweat-gildan-heavy-blend-18000",
  reference: "Gildan 18000",
  name: "Sweatshirt Gildan Heavy Blend",
  shortName: "Sweat Col Rond",
  category: "hoodies",
  gender: "unisex",
  tier: "appel",
  description:
    "Sweatshirt col rond Gildan Heavy Blend 271 g/m². Intérieur molletonné ultra-doux, col côtelé, bandes aux poignets et à la ceinture. Coupe droite confortable, résistant au lavage fréquent. Idéal pour la personnalisation d'entreprise.",
  composition: "50% coton, 50% polyester",
  weight: "271 g/m²",
  images: [
    "/images/products/gildan18000-noir.jpg",
    "/images/products/gildan18000-marine.jpg",
    "/images/products/gildan18000-gris.jpg",
  ],
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
  supplierName: "toptex",
  supplierRef: "G18000",
};

export const PRODUCT_GILDAN18500: Product = {
  id: "gildan18500",
  slug: "hoodie-gildan-heavy-blend-18500",
  reference: "Gildan 18500",
  name: "Hoodie Gildan Heavy Blend",
  shortName: "Hoodie",
  category: "hoodies",
  gender: "unisex",
  tier: "standard",
  description:
    "Hoodie à capuche Gildan Heavy Blend 271 g/m². Capuche double épaisseur avec cordon assorti, poche kangourou, bandes aux poignets et ceinture côtelées. Le classique incontournable pour toute garde-robe corporate. Confort premium, résultat d'impression impeccable.",
  composition: "50% coton, 50% polyester",
  weight: "271 g/m²",
  images: [
    "/images/products/gildan18500-noir.jpg",
    "/images/products/gildan18500-blanc.jpg",
    "/images/products/gildan18500-gris.jpg",
    "/images/products/gildan18500-marine.jpg",
  ],
  previewImages: {
    "noir":       "/images/products/gildan18500-noir-coeur.jpg",
    "blanc":      "/images/products/gildan18500-blanc-coeur.jpg",
    "gris-sport": "/images/products/gildan18500-gris-coeur.jpg",
    "marine":     "/images/products/gildan18500-marine-coeur.jpg",
  },
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
  supplierName: "toptex",
  supplierRef: "G18500",
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
  images: ["/images/products/jui62-noir.jpg", "/images/products/jui62-marine.jpg"],
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
  images: ["/images/products/jwi63-noir.jpg", "/images/products/jwi63-marine.jpg"],
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
  PRODUCT_GILDAN5000,
  PRODUCT_BC3001,
  PRODUCT_GILDAN18000,
  PRODUCT_GILDAN18500,
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
