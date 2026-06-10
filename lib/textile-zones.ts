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
  // ── Recalibration 2026-06-10 (demande Kaan : zones identiques sur tous les
  // textiles, alignées fournisseur) ──────────────────────────────────────────
  // Les mockups Studio tshirts/hoodies sont désormais les photos
  // printify-cropped (cadrage uniforme : vêtement ≈ 94 % de largeur, mesuré
  // par bbox : g5000 L.03/T.10/W.94/H.80 · bella L.025/T.055/W.95/H.89 ·
  // cc1717 L.055/T.025/W.89/H.95 · 18000 L.03/T.07/W.945/H.86 ·
  // 18500 L.025/T.045/W.945/H.91).
  // Ancrage cœur conservé de la calibration validée du 2026-05-26 (Bella) en
  // coordonnées RELATIVES au vêtement : centre à 62 % de la largeur bbox
  // (= poitrine GAUCHE du porteur, côté droit de l'image), 31 % de la hauteur.
  // Taille cœur resserrée vers le vrai 10×10 cm (cf. conclusion wg004 iter 8).
  // Dos : centré, dimensionné sur les max fournisseur (≈28×35 cm t-shirt,
  // ≈27×32 cm sweat/hoodie) au lieu des anciens rectangles ~45 cm irréalistes.
  // BAT signés non impactés : bat-renderer.ts utilise uniquement le transform
  // absolu (left/top/scaleX/scaleY/canvasSize), pas ZONES_BY_CATEGORY.
  tshirts:    { coeur: [0.55, 0.27, 0.13, 0.13], dos: [0.33, 0.22, 0.34, 0.42] },
  // Fix bug signalé 2026-06-10 : l'ancien cœur hoodies [0.38, ...] (centre
  // x = 0.46) plaçait le marquage côté DROIT du porteur / centre torse —
  // jamais propagé depuis la recalibration tshirts du 26 mai. Aligné sur la
  // même convention que tshirts (poitrine gauche du porteur).
  hoodies:    { coeur: [0.55, 0.29, 0.13, 0.13], dos: [0.34, 0.24, 0.33, 0.39] },
  // softshells : packshots TopTex inchangés — cœur basculé du centre vers la
  // poitrine gauche du porteur (même convention), dos réaliste.
  softshells: { coeur: [0.53, 0.28, 0.13, 0.13], dos: [0.36, 0.25, 0.28, 0.32] },
  // polos calibré sur le packshot Printful Gildan 64800 (broderie cœur 10×10 cm).
  // Cœur descendu/recentré vs fallback tshirts (zone précédente trop haute/à droite
  // sur le packshot polo). Broderie front uniquement → dos rarement utilisé.
  // Dos calibré sur le placement Printify large_back_embroidery = 3000×1800 px
  // ≈ 25×15 cm (broderie dos paysage), PAS 28×35 (qui est la taille DTF t-shirt).
  polos:      { coeur: [0.54, 0.27, 0.11, 0.11], dos: [0.345, 0.305, 0.31, 0.19] },
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
// Fix 2026-06-10 : le dossier /mockups/tshirt/ ne contient que des .webp —
// les anciennes extensions .jpg/.png pointaient vers des fichiers inexistants
// (canvas Studio vide pour toute couleur passant par ce fallback).
export const MOCKUP_FILES: Record<string, { front: string; back: string }> = {
  blanc:    { front: "/mockups/tshirt/blanc-front.webp",    back: "/mockups/tshirt/blanc-back.webp"    },
  noir:     { front: "/mockups/tshirt/noir-front.webp",     back: "/mockups/tshirt/noir-back.webp"     },
  gris:     { front: "/mockups/tshirt/gris-front.webp",     back: "/mockups/tshirt/gris-back.webp"     },
  marine:   { front: "/mockups/tshirt/marine-front.webp",   back: "/mockups/tshirt/marine-back.webp"   },
  rouge:    { front: "/mockups/tshirt/rouge-front.webp",    back: "/mockups/tshirt/rouge-back.webp"    },
  bleu:     { front: "/mockups/tshirt/bleu-front.webp",     back: "/mockups/tshirt/bleu-back.webp"     },
  vert:     { front: "/mockups/tshirt/vert-front.webp",     back: "/mockups/tshirt/vert-back.webp"     },
  bordeaux: { front: "/mockups/tshirt/bordeaux-front.webp", back: "/mockups/tshirt/bordeaux-back.webp" },
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
