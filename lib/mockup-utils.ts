/**
 * Utilitaires mockup t-shirt — importables sans déclencher Fabric.js.
 * MockupViewer lui-même doit être chargé via dynamic({ ssr: false }).
 */

// Mapping couleur produit → slug mockup
// Must stay in sync with MockupViewer.tsx COLOR_TO_MOCKUP
const COLOR_TO_MOCKUP: Record<string, string> = {
  "blanc": "blanc", "blanc-casse": "blanc", "naturel": "blanc", "beige": "blanc",
  "jaune": "blanc", "sable": "blanc", "ecru": "blanc",
  "noir": "noir", "anthracite": "noir", "gris-anthracite": "noir",
  "gris": "gris", "gris-melange": "gris", "gris-acier": "gris", "gris-chine": "gris",
  "marine": "marine", "navy": "marine",
  "rouge": "rouge", "rouge-feu": "rouge", "orange": "rouge",
  "rose": "rouge",
  "bleu-royal": "bleu", "bleu-ciel": "bleu", "bleu": "bleu", "cobalt": "bleu",
  "turquoise": "bleu", "violet": "bleu",
  "vert-bouteille": "vert", "vert-foret": "vert", "vert": "vert", "kaki": "vert",
  "bordeaux": "bordeaux", "bourgogne": "bordeaux",
};

/** Retourne true si un mockup existe pour cet ID de couleur produit. */
export function hasMockup(colorId: string): boolean {
  return colorId in COLOR_TO_MOCKUP;
}
