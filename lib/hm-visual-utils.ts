/**
 * hm-visual-utils.ts — Direction visuelle HM Global (B2).
 *
 * Gère la sélection d'image mockup premium et le mode d'affichage
 * pour chaque produit du catalogue.
 *
 * Priorité d'image (avant TopTex) :
 *   0a. product.hmMockupImages[colorId]  — override par coloris (per-product)
 *   0b. product.hmHeroImage              — hero HM Global par produit
 *   0c. TSHIRT_MOCKUP_BY_COLOR[colorId] — mockup famille t-shirt par coloris
 *   0d. TSHIRT_MOCKUP_DEFAULT            — mockup famille t-shirt (blanc)
 *   — null → fallback TopTex dans product-image-utils.ts
 *
 * Les familles sans mockups HM réels (hoodie, polo, softshell, veste, sac,
 * casquette) retournent null → TopTex packshot affiché en mode "supplier".
 * Dès que des photos HM arrivent, il suffit de renseigner hmMockupImages
 * ou hmHeroImage sur le produit concerné.
 */

import type { Product, ProductFamilyVisual } from "@/types";

// ── Mockups famille T-shirt existants dans /public/mockups/tshirt/ ────────────
// Les fichiers sont déjà présents — front uniquement pour la carte catalogue.

const TSHIRT_MOCKUP_BY_COLOR: Record<string, string> = {
  blanc:    "/mockups/tshirt/blanc-front.jpg",
  noir:     "/mockups/tshirt/noir-front.jpg",
  bleu:     "/mockups/tshirt/bleu-front.jpg",
  bordeaux: "/mockups/tshirt/bordeaux-front.png",
  gris:     "/mockups/tshirt/gris-front.jpg",
  marine:   "/mockups/tshirt/marine-front.jpg",
  rouge:    "/mockups/tshirt/rouge-front.jpg",
  vert:     "/mockups/tshirt/vert-front.jpg",
};

const TSHIRT_MOCKUP_DEFAULT = "/mockups/tshirt/blanc-front.jpg";

/**
 * Familles pour lesquelles des assets mockup HM Global sont disponibles
 * dans /public/mockups/.
 * Mettre à true au fur et à mesure que les photos HM arrivent.
 */
const FAMILY_HAS_HM_ASSETS: Partial<Record<ProductFamilyVisual, boolean>> = {
  tshirt:    true,
  // hoodie:    false, // en attente de visuels HM
  // polo:      false,
  // softshell: false,
  // veste:     false,
  // casquette: false,
  // sac:       false,
};

// ── Résolution de la famille visuelle ────────────────────────────────────────

function resolveFamily(product: Product): ProductFamilyVisual | undefined {
  if (product.familyVisualType) return product.familyVisualType;
  // Inférence depuis la catégorie produit
  switch (product.category) {
    case "tshirts":    return "tshirt";
    case "hoodies":    return "hoodie";
    case "polos":      return "polo";
    case "softshells": return "softshell";
    case "polaires":   return "veste";
    case "casquettes": return "casquette";
    case "sacs":       return "sac";
    default:           return undefined;
  }
}

// ── API publique ──────────────────────────────────────────────────────────────

/**
 * Retourne le chemin de l'image mockup HM Global pour un produit + coloris.
 * Retourne `null` si aucun asset HM n'est disponible pour ce produit
 * (→ les callers doivent alors utiliser le packshot TopTex).
 */
export function getHMMockupPath(
  product: Product,
  colorId?: string,
): string | null {
  // 0a. Override par coloris (per-product, priorité absolue)
  if (colorId && product.hmMockupImages?.[colorId]) {
    return product.hmMockupImages[colorId];
  }

  // 0b. Hero HM Global par produit
  if (product.hmHeroImage) return product.hmHeroImage;

  // 0c/0d. Famille T-shirt — assets existants dans /public/mockups/tshirt/
  const family = resolveFamily(product);
  if (family && FAMILY_HAS_HM_ASSETS[family]) {
    if (family === "tshirt") {
      if (colorId && TSHIRT_MOCKUP_BY_COLOR[colorId]) {
        return TSHIRT_MOCKUP_BY_COLOR[colorId];
      }
      return TSHIRT_MOCKUP_DEFAULT;
    }
    // Autres familles avec assets HM : à câbler ici au fur et à mesure
  }

  return null; // Pas d'asset HM → fallback TopTex
}

/**
 * Vrai si le produit dispose d'au moins un asset mockup HM Global
 * (même le fallback couleur par défaut).
 */
export function hasHMMockup(product: Product): boolean {
  return getHMMockupPath(product) !== null;
}

/**
 * Détermine le mode d'affichage visuel :
 * - "hm"       → fond sombre premium, lumière latérale, badge HM Global
 * - "supplier" → fond clair, shadow subtile, badge "Photo fournisseur"
 */
export function getVisualMode(product: Product): "hm" | "supplier" {
  return hasHMMockup(product) ? "hm" : "supplier";
}
