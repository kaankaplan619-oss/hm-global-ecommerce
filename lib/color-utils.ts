/**
 * Utilitaires partagés pour la détection couleur textile + effet logo.
 * Utilisé par MockupViewer (Fabric.js) et LightMockupPreview (CSS overlay).
 */

/** Identifiants de couleur produit considérés comme "sombres". */
const DARK_COLOR_IDS = new Set([
  "noir", "anthracite", "gris-anthracite",
  "marine", "navy",
  "bordeaux", "bourgogne",
  "vert-bouteille", "vert-foret", "vert",
  "kaki",
  "rouge", "rouge-feu",
  "bleu-royal", "bleu", "cobalt",
  "violet",
  "gris", "gris-melange", "gris-chine",
]);

/**
 * Retourne `true` si le colorId correspond à un textile sombre
 * nécessitant une protection de lisibilité du logo.
 */
export function isColorDark(colorId: string): boolean {
  return DARK_COLOR_IDS.has(colorId);
}

/** Effets de lisibilité du logo disponibles. */
export type LogoEffect = "none" | "white-outline" | "white-bg";

/** Options d'effet pour les sélecteurs UI. */
export const EFFECT_OPTIONS: { value: LogoEffect; label: string }[] = [
  { value: "none",          label: "Aucun"         },
  { value: "white-outline", label: "Contour blanc"  },
  { value: "white-bg",      label: "Fond blanc"     },
];
