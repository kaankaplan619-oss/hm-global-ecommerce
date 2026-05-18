/**
 * hm-visual-utils.ts — Direction visuelle HM Global (B2).
 *
 * Gère la sélection d'image mockup premium et le mode d'affichage
 * pour chaque produit du catalogue.
 *
 * Priorité d'image :
 *   P0. Produits Printful → mockup local HM Global (JAMAIS images CDN ghost-mannequin)
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
import { MOCKUP_URLS } from "@/lib/mockup-urls";
import { getPrintifyMockupForHMColor } from "@/lib/suppliers/printify/printify-colors";

interface MockupUrlTree {
  [key: string]: string | MockupUrlTree;
}

const SUPABASE_MOCKUP_URL_BY_PATH = (() => {
  const urls: Record<string, string> = {};

  function visit(value: string | MockupUrlTree) {
    if (typeof value === "string") {
      const marker = "/mockups/";
      const markerIndex = value.indexOf(marker);
      if (markerIndex !== -1) {
        urls[value.slice(markerIndex + marker.length)] = value;
      }
      return;
    }

    for (const child of Object.values(value)) {
      visit(child);
    }
  }

  visit(MOCKUP_URLS as unknown as MockupUrlTree);
  return urls;
})();

export function resolveMockupAssetUrl(assetPath: string): string {
  if (!assetPath.startsWith("/mockups/")) return assetPath;

  const storagePath = assetPath.slice("/mockups/".length);
  return SUPABASE_MOCKUP_URL_BY_PATH[storagePath] ?? assetPath;
}

// ── Mockups locaux pour produits Printful ─────────────────────────────────────
// Direction visuelle HM Global : produit seul, sans mannequin, sans fond CDN.
// Ces mockups 1254×1254 px (fond plat) sont utilisés dans le catalogue,
// les fiches produits ET le studio/personnalisateur.
//
// ⚠️  Sweatshirts (18000) et hoodies (18500) Printful n'ont pas encore de mockup
//     dédié → on utilise les mockups t-shirt comme visuels temporaires.
//     À remplacer par de vraies photos HM sweat/hoodie quand disponibles.
const PRINTFUL_LOCAL_BY_COLOR: Record<string, string> = {
  "blanc":        "/mockups/tshirt/blanc-front.webp",
  "noir":         "/mockups/tshirt/noir-front.webp",
  "gris-sport":   "/mockups/tshirt/gris-front.webp",     // Gildan 5000 / 18000 / 18500
  "dark-heather": "/mockups/tshirt/gris-front.webp",     // Gildan 5000
  "marine":       "/mockups/tshirt/marine-front.webp",
  // Extensions futures :
  "rouge":        "/mockups/tshirt/rouge-front.webp",
  "bleu":         "/mockups/tshirt/bleu-front.webp",
  "vert":         "/mockups/tshirt/vert-front.webp",
  "bordeaux":     "/mockups/tshirt/bordeaux-front.webp",
  "gris":         "/mockups/tshirt/gris-front.webp",
};
const PRINTFUL_LOCAL_DEFAULT = "/mockups/tshirt/blanc-front.webp";

// ── Mockups famille T-shirt existants dans /public/mockups/tshirt/ ────────────
// Les fichiers sont déjà présents — front uniquement pour la carte catalogue.

const TSHIRT_MOCKUP_BY_COLOR: Record<string, string> = {
  blanc:    "/mockups/tshirt/blanc-front.webp",
  noir:     "/mockups/tshirt/noir-front.webp",
  bleu:     "/mockups/tshirt/bleu-front.webp",
  bordeaux: "/mockups/tshirt/bordeaux-front.webp",
  gris:     "/mockups/tshirt/gris-front.webp",
  marine:   "/mockups/tshirt/marine-front.webp",
  rouge:    "/mockups/tshirt/rouge-front.webp",
  vert:     "/mockups/tshirt/vert-front.webp",
};

const TSHIRT_MOCKUP_DEFAULT = "/mockups/tshirt/blanc-front.webp";

// ── Assets HM propres — nouvelle génération (webp 1500×1500, fond propre) ─────
// Structure : productId → colorId → { front, back }
// Fallback automatique : si l'entrée est absente, l'ancien système (hmMockupImages
// sur le produit) prend le relais sans interruption.
// Pour désactiver un test : retirer l'entrée colorId du map.
const HM_TEXTILE_ASSETS: Record<string, Record<string, { front: string; back: string }>> = {
  "gildan-18000": {
    "noir": {
      front: "/mockups/hm/textile/gildan-18000/noir/front.webp",
      back:  "/mockups/hm/textile/gildan-18000/noir/back.webp",
    },
  },
};

/**
 * Retourne le chemin de l'image face avant HM propre (webp nouvelle génération)
 * pour un produit + coloris, ou `null` si aucun asset de ce type n'est enregistré
 * (→ fallback vers hmMockupImages du produit).
 */
export function getHMTextileFrontPath(productId: string, colorId?: string): string | null {
  // Printify local (priorité) — front, avec alias HM → Printify color
  const printifyFront = getPrintifyMockupForHMColor(productId, colorId, "front");
  if (printifyFront) return printifyFront;

  const assetPath = HM_TEXTILE_ASSETS[productId]?.[colorId ?? ""]?.front;
  return assetPath ? resolveMockupAssetUrl(assetPath) : null;
}

/**
 * Retourne le chemin de l'image face dos HM propre (webp nouvelle génération)
 * pour un produit + coloris, ou `null` si aucun asset de ce type n'est enregistré
 * (→ fallback vers hmMockupImagesBack du produit).
 */
export function getHMTextileBackPath(productId: string, colorId?: string): string | null {
  // Printify local (priorité) — back, avec alias HM → Printify color
  const printifyBack = getPrintifyMockupForHMColor(productId, colorId, "back");
  if (printifyBack) return printifyBack;

  const assetPath = HM_TEXTILE_ASSETS[productId]?.[colorId ?? ""]?.back;
  return assetPath ? resolveMockupAssetUrl(assetPath) : null;
}

/**
 * Familles pour lesquelles des assets mockup HM Global sont disponibles
 * dans /public/mockups/.
 * Mettre à true au fur et à mesure que les photos HM arrivent.
 *
 * ⚠️ tshirt retiré : les mockups blanc HM rendaient tous les t-shirts identiques.
 *    Tous les t-shirts utilisent désormais les packshots TopTex (supplier mode),
 *    cohérents avec les sweats iDeal et Native Spirit approuvés.
 *    Remettre tshirt: true quand des photos HM individuelles par produit existent.
 */
const FAMILY_HAS_HM_ASSETS: Partial<Record<ProductFamilyVisual, boolean>> = {
  tshirt: true,
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
  // P-2. Mockups Printify locaux auto-générés — PRIORITÉ ABSOLUE pour les 4 produits V1
  // (script : scripts/refresh-printify-mockups.mjs ; manifest : /public/mockups/printify/manifest.json)
  // Alias HM colorId → Printify colorId géré dans getPrintifyMockupForHMColor.
  const printifyLocal = getPrintifyMockupForHMColor(product.id, colorId, "front");
  if (printifyLocal) return printifyLocal;

  // P-1. Assets HM propres nouvelle génération (webp 1500×1500) — fallback
  const hmTextileFront =
    product.id === "gildan-18000" ? null : getHMTextileFrontPath(product.id, colorId);
  if (hmTextileFront) return hmTextileFront;

  // P0. Produits Printful → mockups locaux HM Global (jamais images CDN ghost-mannequin)
  if (product.supplierName === "printful") {
    // P0a. Mockup propre au produit + coloris (priorité absolue)
    if (colorId && product.hmMockupImages?.[colorId]) {
      return resolveMockupAssetUrl(product.hmMockupImages[colorId]);
    }
    // P0b. Fallback générique par coloris — uniquement si le produit a des hmMockupImages définis.
    // Évite d'afficher un t-shirt pour les goodies/mugs et autres POD sans assets locaux.
    if (product.hmMockupImages) {
      return resolveMockupAssetUrl((colorId && PRINTFUL_LOCAL_BY_COLOR[colorId]) || PRINTFUL_LOCAL_DEFAULT);
    }
    return null; // Pas d'assets définis → "Visuel à venir" (HMProductVisual isEmpty)
  }

  // 0a. Override par coloris (per-product, priorité absolue)
  if (colorId && product.hmMockupImages?.[colorId]) {
    return resolveMockupAssetUrl(product.hmMockupImages[colorId]);
  }

  // 0b. Hero HM Global par produit
  if (product.hmHeroImage) return resolveMockupAssetUrl(product.hmHeroImage);

  // 0c/0d. Famille T-shirt — assets existants dans /public/mockups/tshirt/
  const family = resolveFamily(product);
  if (family && FAMILY_HAS_HM_ASSETS[family]) {
    if (family === "tshirt") {
      if (colorId && TSHIRT_MOCKUP_BY_COLOR[colorId]) {
        return resolveMockupAssetUrl(TSHIRT_MOCKUP_BY_COLOR[colorId]);
      }
      return resolveMockupAssetUrl(TSHIRT_MOCKUP_DEFAULT);
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
