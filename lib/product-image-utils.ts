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

  // 4. Dernier recours : photo mannequin (product.images[0])
  return product.images[0] ?? "";
}
