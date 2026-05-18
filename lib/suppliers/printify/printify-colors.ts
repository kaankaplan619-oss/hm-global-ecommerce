/**
 * lib/suppliers/printify/printify-colors.ts
 *
 * Source de vérité couleur pour les 4 produits Printify V1.
 *
 * Rôle :
 *   1. Définir le mapping bijectif `HM colorId ↔ Printify colorId` par produit.
 *   2. Filtrer les couleurs HM à l'affichage : on n'expose que celles
 *      réellement disponibles dans le manifest Printify local + mapping variant_id.
 *   3. Centraliser la résolution couleur pour mockups et stock.
 *
 * Principe strict :
 *   Le client ne voit que des couleurs qui ont à la fois :
 *     - un variant_id Printify (lib/suppliers/printify/printify-v1-map.ts)
 *     - un mockup local généré (public/mockups/printify/manifest.json)
 *
 * Si une couleur HM n'a pas d'équivalent Printify pour ce produit, elle
 * est filtrée du sélecteur, du catalogue et du panier — par construction.
 */

import type { ProductColor } from "@/types";
import { PRINTIFY_V1_MAP, getMappedColors } from "./printify-v1-map";
import {
  hasPrintifyMockups,
  getPrintifyLocalMockup,
} from "./mockups-local";

// ─── Mapping HM colorId → Printify colorId (par produit) ─────────────────────
//
// Justifications :
//   - gildan-5000 utilise des HM colorIds standards (noir, blanc, marine, dark-heather)
//     mais data/products.ts en expose seulement 4. Pour V1, on aligne strictement
//     sur ce qui existe ET côté HM ET côté Printify.
//   - gildan-18000 et gildan-18500 utilisent "gris-sport" en HM → mappé à "gris" Printify.
//   - bella-3001 utilise "athletic-heather" en HM → mappé à "gris" Printify ;
//     "true-royal" HM → "royal" Printify.

export const HM_TO_PRINTIFY_COLOR: Record<string, Record<string, string>> = {
  // Gildan 5000 Heavy Cotton Tee
  // data/products.ts V1 : blanc, noir, gris (Sport Grey), marine, rouge, royal
  // dark-heather retiré : pas de mockup Dark Heather dédié (fallback gris trompeur)
  "gildan-5000": {
    blanc:  "blanc",
    noir:   "noir",
    gris:   "gris",   // HM "gris" → Printify "gris" (Sport Grey)
    marine: "marine",
    rouge:  "rouge",
    royal:  "royal",
  },

  // Bella+Canvas 3001 Unisex Tee
  // data/products.ts expose 38 couleurs → on n'en garde que celles ayant un équivalent V1
  "bella-3001": {
    noir:               "noir",
    blanc:              "blanc",
    marine:             "marine",
    "athletic-heather": "gris",
    rouge:              "rouge",
    "true-royal":       "royal",
  },

  // Gildan 18000 Crewneck — V1 : 5 couleurs (Royal retiré, cf printify-v1-map.ts)
  "gildan-18000": {
    noir:         "noir",
    blanc:        "blanc",
    "gris-sport": "gris",
    marine:       "marine",
    rouge:        "rouge",
  },

  // Comfort Colors 1717 (NOUVEAU V1) — Textildruck DE, 6 couleurs
  "comfort-colors-1717": {
    noir:    "noir",
    blanc:   "blanc",
    gris:    "gris",
    marine:  "marine",
    rouge:   "rouge",
    naturel: "naturel",  // Natural — couleur signature garment-dyed Comfort Colors
  },

  // Gildan 2400 Long Sleeve (NOUVEAU V1) — Textildruck DE, 6 couleurs
  "gildan-2400-ls": {
    noir:    "noir",
    blanc:   "blanc",
    gris:    "gris",
    marine:  "marine",
    rouge:   "rouge",
    naturel: "naturel",  // Sand
  },

  // Gildan 18500 Hoodie
  "gildan-18500": {
    noir:         "noir",
    blanc:        "blanc",
    "gris-sport": "gris",
    marine:       "marine",
    rouge:        "rouge",
    royal:        "royal",
  },
};

// ─── Labels propres pour les pastilles HM (déjà cohérent avec products.ts) ──
// Garde la cohérence linguistique HM (français) — Printify utilise l'anglais
// interne ("Black", "Sport Grey") mais HM affiche "Noir", "Sport Grey".

export const HM_COLOR_LABELS: Record<string, string> = {
  noir:               "Noir",
  blanc:              "Blanc",
  marine:             "Marine",
  rouge:              "Rouge",
  royal:              "Royal",
  "gris-sport":       "Sport Grey",
  "dark-heather":     "Dark Heather",
  "athletic-heather": "Athletic Heather",
  "true-royal":       "True Royal",
};

// ─── API publique ────────────────────────────────────────────────────────────

/**
 * Vrai si le produit est un produit V1 Printify (mapping + mockups dispos).
 * Permet aux composants de décider d'appliquer le filtre strict ou non.
 */
export function isPrintifyV1Product(productId: string): boolean {
  return Boolean(PRINTIFY_V1_MAP[productId]) && hasPrintifyMockups(productId);
}

/**
 * Liste des HM colorIds disponibles pour un produit Printify V1.
 * Renvoie [] si le produit n'est pas un V1 (caller doit gérer fallback).
 */
export function getPrintifyAvailableColors(productId: string): string[] {
  return Object.keys(HM_TO_PRINTIFY_COLOR[productId] ?? {});
}

/**
 * Vrai si la couleur HM est disponible pour ce produit V1 Printify.
 */
export function hasPrintifyColor(productId: string, hmColorId: string): boolean {
  return Boolean(HM_TO_PRINTIFY_COLOR[productId]?.[hmColorId]);
}

/**
 * Convertit un colorId HM en colorId Printify (pour lookup mockup / variant_id).
 * Renvoie null si le mapping n'existe pas.
 */
export function getPrintifyColorIdForHM(
  productId: string,
  hmColorId: string,
): string | null {
  return HM_TO_PRINTIFY_COLOR[productId]?.[hmColorId] ?? null;
}

/**
 * Filtre les couleurs d'un produit pour ne garder que celles disponibles
 * Printify V1. Pour les produits non-V1, retourne la liste complète inchangée.
 *
 * À utiliser dans tous les composants qui affichent des swatches couleur
 * (ProductCard, BestSellers, ProductDetailClient, sélecteurs).
 */
export function getDisplayedColors(
  productId: string,
  colors: ProductColor[],
): ProductColor[] {
  if (!isPrintifyV1Product(productId)) return colors;
  return colors.filter((c) => hasPrintifyColor(productId, c.id));
}

/**
 * Variante du `getDisplayedColors` qui ne garde que les couleurs disponibles
 * ET marquées `available: true`. Utile pour le sélecteur de la fiche produit
 * où on doit aussi exclure les coloris en rupture.
 */
export function getDisplayedAvailableColors(
  productId: string,
  colors: ProductColor[],
): ProductColor[] {
  return getDisplayedColors(productId, colors).filter((c) => c.available);
}

/**
 * Pour un produit Printify V1 + un colorId HM, retourne le chemin mockup
 * local (front/back/folded) en passant automatiquement par l'alias couleur.
 * Renvoie null si la combinaison n'existe pas.
 */
export function getPrintifyMockupForHMColor(
  productId: string,
  hmColorId: string | undefined,
  view: "front" | "back" | "back-2" | "folded" | "front-collar-closeup" = "front",
): string | null {
  if (!hmColorId) return null;
  const printifyColorId = getPrintifyColorIdForHM(productId, hmColorId);
  if (!printifyColorId) return null;
  return getPrintifyLocalMockup(productId, printifyColorId, view);
}

/**
 * Re-export du helper de listage pour usage interne (debug, audits).
 */
export { getMappedColors };
