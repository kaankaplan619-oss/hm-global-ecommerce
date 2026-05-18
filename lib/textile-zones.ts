/**
 * textile-zones.ts — Source de vérité unique pour les zones de marquage textile.
 *
 * Calibré sur les packshots TopTex (rectangle [left, top, width, height] en fractions
 * du canvas, 0..1). Source aligned with `docs/hermes` brief Phase 1.
 *
 * Consommateurs :
 *   - components/product/MockupViewer.tsx
 *   - components/product/BatPreviewStudio.tsx
 *   - components/product/LightMockupPreview.tsx
 *   - components/studio/StudioCanvas.tsx
 *   - lib/bat-renderer.ts (server-side BAT rendering via Sharp)
 *
 * Ne jamais redéclarer ces constantes ailleurs.
 * Contrainte projet : ne jamais casser MockupViewer (B3.2-A2 validé).
 */

// ── Rectangles principaux par catégorie textile ───────────────────────────────
// [left, top, width, height] en fractions du canvas carré (0..1).
export const ZONES_BY_CATEGORY: Record<
  string,
  {
    coeur: [number, number, number, number];
    dos:   [number, number, number, number];
  }
> = {
  tshirts:    { coeur: [0.38, 0.28, 0.18, 0.18], dos: [0.25, 0.20, 0.50, 0.45] },
  hoodies:    { coeur: [0.40, 0.32, 0.16, 0.16], dos: [0.25, 0.22, 0.50, 0.42] },
  softshells: { coeur: [0.42, 0.30, 0.15, 0.15], dos: [0.26, 0.22, 0.48, 0.40] },
};

// ── Fallback statique pour packshots B&C Exact 190 (B3.2-A2 validé) ──────────
// Utilisé quand aucun packshot dynamique n'est disponible.
export const ZONES_STATIC: {
  coeur: [number, number, number, number];
  dos:   [number, number, number, number];
} = {
  coeur: [0.60, 0.25, 0.14, 0.14],
  dos:   [0.26, 0.13, 0.48, 0.29],
};

// ── Mockup files par couleur générique (fallback quand packshot absent) ──────
export const MOCKUP_FILES: Record<string, { front: string; back: string }> = {
  blanc:    { front: "/mockups/tshirt/blanc-front.jpg",    back: "/mockups/tshirt/blanc-back.png"    },
  noir:     { front: "/mockups/tshirt/noir-front.jpg",     back: "/mockups/tshirt/noir-back.png"     },
  gris:     { front: "/mockups/tshirt/gris-front.jpg",     back: "/mockups/tshirt/gris-back.png"     },
  marine:   { front: "/mockups/tshirt/marine-front.jpg",   back: "/mockups/tshirt/marine-back.png"   },
  rouge:    { front: "/mockups/tshirt/rouge-front.jpg",    back: "/mockups/tshirt/rouge-back.png"    },
  bleu:     { front: "/mockups/tshirt/bleu-front.jpg",     back: "/mockups/tshirt/bleu-back.png"     },
  vert:     { front: "/mockups/tshirt/vert-front.jpg",     back: "/mockups/tshirt/vert-back.png"     },
  bordeaux: { front: "/mockups/tshirt/bordeaux-front.png", back: "/mockups/tshirt/bordeaux-back.png" },
};

// ── Mapping colorId produit → slug mockup générique ──────────────────────────
export const COLOR_TO_MOCKUP: Record<string, string> = {
  "blanc": "blanc", "blanc-casse": "blanc", "naturel": "blanc", "beige": "blanc",
  "jaune": "blanc", "sable": "blanc", "ecru": "blanc",
  "noir": "noir", "anthracite": "noir", "gris-anthracite": "noir",
  "gris": "gris", "gris-melange": "gris", "gris-acier": "gris", "gris-chine": "gris",
  "marine": "marine", "navy": "marine",
  "rouge": "rouge", "rouge-feu": "rouge", "orange": "rouge", "rose": "rouge",
  "bleu-royal": "bleu", "bleu-ciel": "bleu", "bleu": "bleu", "cobalt": "bleu",
  "turquoise": "bleu", "violet": "bleu",
  "vert-bouteille": "vert", "vert-foret": "vert", "vert": "vert", "kaki": "vert",
  "bordeaux": "bordeaux", "bourgogne": "bordeaux",
};

// ── Helpers dérivés du rectangle ─────────────────────────────────────────────

export type Placement2D = "coeur" | "dos";

/**
 * Retourne le rectangle [left, top, width, height] pour la catégorie + placement.
 * Fallback sur `tshirts` si la catégorie est inconnue.
 */
export function getZoneRect(
  category: string | undefined,
  placement: Placement2D,
): [number, number, number, number] {
  const zones = (category ? ZONES_BY_CATEGORY[category] : undefined) ?? ZONES_BY_CATEGORY.tshirts;
  return zones[placement];
}

/**
 * Retourne le centre (cx, cy) du rectangle en fractions du canvas.
 * Utile pour les composants qui positionnent depuis le centre.
 */
export function getZoneCenter(
  category: string | undefined,
  placement: Placement2D,
): [number, number] {
  const [l, t, w, h] = getZoneRect(category, placement);
  return [l + w / 2, t + h / 2];
}

/**
 * Retourne la taille (wFrac, hFrac) du rectangle en fractions du canvas.
 * Utile pour dessiner la zone de guidage.
 */
export function getZoneSize(
  category: string | undefined,
  placement: Placement2D,
): { wFrac: number; hFrac: number } {
  const [, , w, h] = getZoneRect(category, placement);
  return { wFrac: w, hFrac: h };
}
