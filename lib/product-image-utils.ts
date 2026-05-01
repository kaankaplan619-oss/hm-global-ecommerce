/**
 * product-image-utils.ts — Sélection de l'image principale catalogue.
 *
 * Priorité (B2 — direction visuelle HM Global) :
 *   0. Mockup HM Global par coloris (getHMMockupPath)
 *   1. Packshot TopTex couleur par défaut (CDN /packshots/)
 *   2. Premier packshot TopTex disponible pour n'importe quelle couleur
 *   3. Premier packshot TopTex indépendamment de la disponibilité
 *   4. product.images[0] (photo mannequin /pictures/ — dernier recours)
 *
 * Isomorphique (fonctionne en SSR et client). Aucun appel réseau.
 */

import { COLOR_PACKSHOTS } from "@/data/colorPackshots";
import { getHMMockupPath } from "@/lib/hm-visual-utils";
import type { Product } from "@/types";

/**
 * Produits dont product.images[0] est une photo éditoriale avec mannequin.
 * On préfère un placeholder HM Global propre à une photo mannequin en catalogue.
 * Les images restent disponibles dans les données pour une galerie secondaire future.
 */
const NO_CATALOG_EDITORIAL = new Set([
  "ib900",   // Polaire iDéal — photo mannequin groupe
  "ib6175",  // Doudoune Homme iDéal — photo mannequin
  "ib6176",  // Doudoune Femme iDéal — photo mannequin
  "wk904",   // Micropolaire Éco — photo mannequin
  "kp157",   // Casquette 5P K-up — photo CDN 404 + évite requête inutile
  "kp162",   // Casquette Coton K-up — photo mannequin avec personne
]);

/**
 * Retourne l'URL d'image à afficher sur la carte catalogue.
 *
 * @param product  Produit à afficher.
 * @param colorId  Coloris sélectionné (optionnel) — permet de choisir le
 *                 mockup HM ou le packshot TopTex correspondant.
 */
export function getProductCatalogImage(product: Product, colorId?: string): string {
  // 0. Mockup HM Global (priorité absolue — direction visuelle B2)
  const hmMockup = getHMMockupPath(product, colorId);
  if (hmMockup) return hmMockup;

  const packshotsForProduct = COLOR_PACKSHOTS[product.id];

  if (packshotsForProduct) {
    // 1. Packshot TopTex de la couleur demandée ou de la couleur par défaut
    const targetColorId = colorId ?? product.colors.find((c) => c.available)?.id;
    if (targetColorId && packshotsForProduct[targetColorId]) {
      return packshotsForProduct[targetColorId];
    }

    // 2. Premier packshot TopTex disponible pour une couleur disponible
    for (const color of product.colors) {
      if (color.available && packshotsForProduct[color.id]) {
        return packshotsForProduct[color.id];
      }
    }

    // 3. Premier packshot du produit indépendamment de la disponibilité
    const firstPackshot = Object.values(packshotsForProduct)[0];
    if (firstPackshot) return firstPackshot;
  }

  // 4. Dernier recours : photo éditoriale/mannequin
  // Si le produit est dans la liste de blocage, on retourne "" pour afficher
  // le placeholder "Visuel à venir" plutôt qu'une photo mannequin.
  if (NO_CATALOG_EDITORIAL.has(product.id)) return "";
  return product.images[0] ?? "";
}
