/**
 * product-image-utils.ts — Sélection de l'image principale catalogue.
 *
 * Priorité :
 *   1. Packshot couleur par défaut (packshot isolé CDN /packshots/)
 *   2. Premier packshot disponible pour n'importe quelle couleur du produit
 *   3. product.images[0] (photo mannequin /pictures/ — dernier recours)
 *
 * Isomorphique (fonctionne en SSR et client). Aucun appel réseau.
 */

import { COLOR_PACKSHOTS } from "@/data/colorPackshots";
import type { Product } from "@/types";

/**
 * Retourne l'URL d'image à afficher sur la carte catalogue.
 * Préfère un packshot produit isolé (fond blanc/neutre) à une photo mannequin.
 */
export function getProductCatalogImage(product: Product): string {
  const packshotsForProduct = COLOR_PACKSHOTS[product.id];

  if (packshotsForProduct) {
    // 1. Packshot de la couleur par défaut (première couleur disponible)
    const defaultColor = product.colors.find((c) => c.available);
    if (defaultColor && packshotsForProduct[defaultColor.id]) {
      return packshotsForProduct[defaultColor.id];
    }

    // 2. Premier packshot disponible pour une couleur disponible
    for (const color of product.colors) {
      if (color.available && packshotsForProduct[color.id]) {
        return packshotsForProduct[color.id];
      }
    }

    // 3. Premier packshot du produit indépendamment de la disponibilité
    const firstPackshot = Object.values(packshotsForProduct)[0];
    if (firstPackshot) return firstPackshot;
  }

  // 4. Dernier recours : photo mannequin (product.images[0])
  return product.images[0] ?? "";
}
