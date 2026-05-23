/**
 * data/mockup-products.ts
 *
 * Catalogue des produits "mockup universel" (print + merch) avec leur config
 * de génération de mockup.
 *
 * Pourquoi un fichier séparé de `data/products.ts` ?
 *   - `data/products.ts` contient le catalogue TEXTILE et son type `Product`
 *     n'a pas de champs mockup (`mockupType`, `printArea`, `availableFinishes`…).
 *   - Le projet sépare déjà volontairement textile et print
 *     (cf. `data/print-products.ts` : "ne pas mélanger textile et print").
 *   - On respecte cette convention en isolant ici les produits pilotés par
 *     l'API de mockups (Mockey.ai) et le composant `UniversalMockupViewer`.
 *
 * ⚠️ Les `printArea` et `basePrice` ci-dessous sont INDICATIFS et doivent être
 *    calibrés/validés (comme les zones textile B3.2-A2). Les prix faisant
 *    autorité pour les cartes de visite vivent déjà dans `data/print-products.ts`.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Mode de rendu du mockup pour ce produit. */
export type MockupType = "tshirt" | "print_flat" | "print_scene" | "embroidery";

/** Famille de produit mockup (print + merch). */
export type MockupProductCategory =
  | "carte_visite"
  | "flyer"
  | "brochure"
  | "sticker"
  | "cap"
  | "beanie"
  | "bag"
  | "apron"
  | "mug";

/**
 * Zone d'impression exprimée en POURCENTAGE (0–100) du mockup,
 * coin supérieur gauche = origine.
 */
export interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MockupProduct {
  id: string;
  name: string;
  category: MockupProductCategory;
  mockupType: MockupType;
  /** Zone d'impression en pourcentage du mockup (à calibrer). */
  printArea: PrintArea;
  /** Finitions disponibles (ex: 'mat', 'brillant', 'soft-touch'). */
  availableFinishes: string[];
  /** Quantité minimale de commande. */
  minQuantity: number;
  /** Prix de base indicatif TTC (à valider — voir print-products.ts pour les CV). */
  basePrice: number;
  /**
   * Identifiant de template Mockey.ai par défaut (optionnel).
   * Si absent, `getMockupTemplates(category)` fournira un choix.
   */
  mockeyTemplateId?: string;
}

// ─── Catalogue ────────────────────────────────────────────────────────────────

/** Cartes de visite. */
const BUSINESS_CARDS: MockupProduct[] = [
  {
    id: "cv-85x55-standard",
    name: "Carte de visite 85×55 mm — standard",
    category: "carte_visite",
    mockupType: "print_flat",
    printArea: { x: 4, y: 4, width: 92, height: 92 },
    availableFinishes: ["mat", "brillant", "soft-touch"],
    minQuantity: 100,
    basePrice: 24.9, // cf. data/print-products.ts (lot de 100, mat)
  },
  {
    id: "cv-85x55-arrondi",
    name: "Carte de visite 85×55 mm — coins arrondis",
    category: "carte_visite",
    mockupType: "print_flat",
    printArea: { x: 4, y: 4, width: 92, height: 92 },
    availableFinishes: ["mat", "brillant", "soft-touch"],
    minQuantity: 100,
    basePrice: 27.9,
  },
  {
    id: "cv-90x50",
    name: "Carte de visite 90×50 mm",
    category: "carte_visite",
    mockupType: "print_flat",
    printArea: { x: 4, y: 4, width: 92, height: 92 },
    availableFinishes: ["mat", "brillant", "soft-touch"],
    minQuantity: 100,
    basePrice: 24.9,
  },
];

/** Flyers. */
const FLYERS: MockupProduct[] = [
  { id: "flyer-a6", name: "Flyer A6", category: "flyer", mockupType: "print_flat", printArea: { x: 3, y: 3, width: 94, height: 94 }, availableFinishes: ["mat", "brillant"], minQuantity: 100, basePrice: 29.9 },
  { id: "flyer-a5", name: "Flyer A5", category: "flyer", mockupType: "print_flat", printArea: { x: 3, y: 3, width: 94, height: 94 }, availableFinishes: ["mat", "brillant"], minQuantity: 100, basePrice: 39.9 },
  { id: "flyer-a4", name: "Flyer A4", category: "flyer", mockupType: "print_flat", printArea: { x: 3, y: 3, width: 94, height: 94 }, availableFinishes: ["mat", "brillant"], minQuantity: 100, basePrice: 59.9 },
  { id: "flyer-dl", name: "Flyer DL (99×210 mm)", category: "flyer", mockupType: "print_flat", printArea: { x: 3, y: 3, width: 94, height: 94 }, availableFinishes: ["mat", "brillant"], minQuantity: 100, basePrice: 34.9 },
];

/** Brochures. */
const BROCHURES: MockupProduct[] = [
  { id: "brochure-a5-recto", name: "Brochure A5 — recto", category: "brochure", mockupType: "print_scene", printArea: { x: 5, y: 5, width: 90, height: 90 }, availableFinishes: ["mat", "brillant"], minQuantity: 50, basePrice: 79.9 },
  { id: "brochure-a5-rectoverso", name: "Brochure A5 — recto-verso", category: "brochure", mockupType: "print_scene", printArea: { x: 5, y: 5, width: 90, height: 90 }, availableFinishes: ["mat", "brillant"], minQuantity: 50, basePrice: 99.9 },
  { id: "brochure-a4-recto", name: "Brochure A4 — recto", category: "brochure", mockupType: "print_scene", printArea: { x: 5, y: 5, width: 90, height: 90 }, availableFinishes: ["mat", "brillant"], minQuantity: 50, basePrice: 119.9 },
  { id: "brochure-a4-rectoverso", name: "Brochure A4 — recto-verso", category: "brochure", mockupType: "print_scene", printArea: { x: 5, y: 5, width: 90, height: 90 }, availableFinishes: ["mat", "brillant"], minQuantity: 50, basePrice: 149.9 },
];

/** Stickers. */
const STICKERS: MockupProduct[] = [
  { id: "sticker-carre", name: "Sticker carré", category: "sticker", mockupType: "print_flat", printArea: { x: 6, y: 6, width: 88, height: 88 }, availableFinishes: ["mat", "brillant", "transparent"], minQuantity: 50, basePrice: 19.9 },
  { id: "sticker-rond", name: "Sticker rond", category: "sticker", mockupType: "print_flat", printArea: { x: 8, y: 8, width: 84, height: 84 }, availableFinishes: ["mat", "brillant", "transparent"], minQuantity: 50, basePrice: 19.9 },
  { id: "sticker-rectangle", name: "Sticker rectangle", category: "sticker", mockupType: "print_flat", printArea: { x: 4, y: 10, width: 92, height: 80 }, availableFinishes: ["mat", "brillant", "transparent"], minQuantity: 50, basePrice: 19.9 },
  { id: "sticker-decoupe", name: "Sticker découpe à la forme", category: "sticker", mockupType: "print_flat", printArea: { x: 6, y: 6, width: 88, height: 88 }, availableFinishes: ["mat", "brillant", "transparent", "holographique"], minQuantity: 50, basePrice: 24.9 },
];

/** Merch textile / objets. */
const MERCH: MockupProduct[] = [
  { id: "cap-classique", name: "Casquette brodée", category: "cap", mockupType: "embroidery", printArea: { x: 30, y: 35, width: 40, height: 25 }, availableFinishes: ["broderie"], minQuantity: 10, basePrice: 14.9 },
  { id: "beanie-classique", name: "Bonnet brodé", category: "beanie", mockupType: "embroidery", printArea: { x: 30, y: 45, width: 40, height: 22 }, availableFinishes: ["broderie"], minQuantity: 10, basePrice: 12.9 },
  { id: "bag-tote", name: "Tote bag imprimé", category: "bag", mockupType: "print_scene", printArea: { x: 25, y: 30, width: 50, height: 45 }, availableFinishes: ["dtf", "serigraphie"], minQuantity: 10, basePrice: 9.9 },
  { id: "apron-tablier", name: "Tablier imprimé", category: "apron", mockupType: "print_scene", printArea: { x: 30, y: 30, width: 40, height: 35 }, availableFinishes: ["dtf", "broderie"], minQuantity: 10, basePrice: 16.9 },
  { id: "mug-blanc", name: "Mug personnalisé", category: "mug", mockupType: "print_scene", printArea: { x: 20, y: 30, width: 60, height: 40 }, availableFinishes: ["sublimation"], minQuantity: 12, basePrice: 11.9 },
];

/** Catalogue complet des produits mockup. */
export const MOCKUP_PRODUCTS: MockupProduct[] = [
  ...BUSINESS_CARDS,
  ...FLYERS,
  ...BROCHURES,
  ...STICKERS,
  ...MERCH,
];

/** Lookup rapide par id. */
export const MOCKUP_PRODUCTS_LOOKUP: Record<string, MockupProduct> = Object.fromEntries(
  MOCKUP_PRODUCTS.map((p) => [p.id, p]),
);

/**
 * Retourne les produits mockup d'une catégorie donnée.
 * @param category Catégorie de produit mockup.
 */
export function getMockupProductsByCategory(category: MockupProductCategory): MockupProduct[] {
  return MOCKUP_PRODUCTS.filter((p) => p.category === category);
}
