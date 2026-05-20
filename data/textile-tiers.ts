/**
 * data/textile-tiers.ts
 *
 * Helper marketing pour afficher les prix dégressifs textile dans le catalogue.
 *
 * IMPORTANT :
 *   - Ce fichier est en LECTURE SEULE sur data/pricing.ts — il ne modifie aucune valeur.
 *   - Les valeurs affichées par PriceTierBadge sont une approximation marketing
 *     destinée à donner au visiteur un repère "à partir de combien".
 *   - Le prix exact contractuel reste celui calculé par le configurateur et le
 *     panier (qui utilisent getVolumePricedRate() sur les vrais tiers pricing.ts).
 *
 * Paliers d'affichage marketing : 1-9 / 10-24 / 25-49 / 50-99 / 100+
 * Mapping vers les tiers réels existants (1-24 / 25-49 / 50-99 / 100-199 / ...) :
 *   - 1-9   ≈ tier 1-24 (prix de référence affiché "Dès X €")
 *   - 10-24 ≈ tier 1-24 (même prix, signalé "livraison offerte dès 10p")
 *   - 25-49 → tier 25-49
 *   - 50-99 → tier 50-99
 *   - 100+  → "sur devis" (V1 — on ne s'engage pas sans validation marges)
 */

import { getVolumePricedRate } from "./pricing";
import type { Product, Technique, VolumePricingTier } from "@/types";

export interface DisplayTier {
  /** Libellé affiché sous le prix : ex "Dès 50p" */
  label:    string;
  /** Prix unitaire TTC à afficher pour ce palier. */
  unitTTC:  number;
  /** Quantité de référence du palier (pour tooltip). */
  fromQty:  number;
}

export interface ProductDisplayTiers {
  /** Technique de référence retenue pour l'affichage (la moins chère dispo). */
  technique: Technique;
  /** Prix unitaire TTC du premier palier (1 pièce). */
  basePrice: number;
  /** Paliers marketing condensés à afficher dans la carte catalogue. */
  tiers:     DisplayTier[];
  /** True si le produit est éligible au mode "devis 100+". */
  hasDevisTier: boolean;
}

/**
 * Détermine la technique de référence d'un produit pour l'affichage marketing.
 * Ordre de préférence : DTF > flex > broderie. On choisit la moins chère dispo.
 */
function pickReferenceTechnique(product: Product): Technique | null {
  const candidates: ("dtf" | "flex" | "broderie")[] = ["dtf", "flex", "broderie"];
  let best: { tech: Technique; price: number } | null = null;
  for (const tech of candidates) {
    const price = product.pricing[tech];
    if (typeof price === "number" && price > 0) {
      if (best === null || price < best.price) {
        best = { tech, price };
      }
    }
  }
  return best?.tech ?? null;
}

/**
 * Récupère les volume tiers réels du produit pour une technique donnée.
 * - Priorité : volumePricingByTechnique[technique]
 * - Fallback : volumePricing (legacy)
 * - Sinon : tiers virtuels dérivés du prix de base (décote standard).
 */
function getVolumeTiersFor(
  product: Product,
  technique: Technique
): VolumePricingTier[] | null {
  const byTech = product.volumePricingByTechnique?.[technique];
  if (byTech && byTech.length > 0) return byTech;

  if (product.volumePricing && product.volumePricing.length > 0) {
    return product.volumePricing;
  }

  // Pas de tiers configurés : on génère un fallback approximatif (-8% / -18% / -22%)
  const basePrice =
    technique === "dtf" ? product.pricing.dtf
    : technique === "flex" ? product.pricing.flex
    : technique === "broderie" ? product.pricing.broderie
    : technique === "broderie_illimitee" ? (product.pricing.broderie_illimitee ?? 0)
    : technique === "dtflex" ? product.pricing.dtflex
    : 0;
  if (!basePrice || basePrice <= 0) return null;

  return [
    { from: 1,   to: 24,  unitPrice: basePrice },
    { from: 25,  to: 49,  unitPrice: Math.round(basePrice * 0.92 * 100) / 100 },
    { from: 50,  to: 99,  unitPrice: Math.round(basePrice * 0.82 * 100) / 100 },
    { from: 100,          unitPrice: Math.round(basePrice * 0.78 * 100) / 100 },
  ];
}

/**
 * Calcule les paliers marketing à afficher pour un produit.
 * Retourne null si aucune technique n'est applicable (produit sans pricing valide).
 */
export function getProductDisplayTiers(product: Product): ProductDisplayTiers | null {
  const technique = pickReferenceTechnique(product);
  if (!technique) return null;

  const tiers = getVolumeTiersFor(product, technique);
  if (!tiers) return null;

  const basePrice = getVolumePricedRate(tiers, 1);
  const price25   = getVolumePricedRate(tiers, 25);
  const price50   = getVolumePricedRate(tiers, 50);

  // On évite les doublons (si certains paliers ont la même valeur).
  const displayTiers: DisplayTier[] = [];
  if (price25 < basePrice) displayTiers.push({ label: "Dès 25p", unitTTC: price25, fromQty: 25 });
  if (price50 < price25)   displayTiers.push({ label: "Dès 50p", unitTTC: price50, fromQty: 50 });

  return {
    technique,
    basePrice,
    tiers: displayTiers,
    hasDevisTier: true,
  };
}

/**
 * Renvoie le palier le plus parlant à afficher en un seul mot-clé
 * (utilisé par PriceTierBadge compact dans les cartes catalogue).
 */
export function getHeadlineTier(product: Product): DisplayTier | null {
  const dt = getProductDisplayTiers(product);
  if (!dt || dt.tiers.length === 0) return null;
  // On privilégie le palier 50p (signal B2B le plus fort).
  return dt.tiers.find((t) => t.fromQty === 50) ?? dt.tiers[0];
}
