/**
 * Utilitaires mockup t-shirt — importables sans déclencher Fabric.js.
 * MockupViewer lui-même doit être chargé via dynamic({ ssr: false }).
 */

// Mapping couleur produit → slug mockup
const COLOR_TO_MOCKUP: Record<string, string> = {
  "blanc": "blanc", "blanc-casse": "blanc", "naturel": "blanc",
  "noir": "noir",
  "gris": "gris", "gris-melange": "gris", "gris-acier": "gris",
  "marine": "marine",
  "rouge": "rouge",
  "bleu-royal": "bleu", "bleu-ciel": "bleu",
  "vert-bouteille": "vert", "vert-foret": "vert",
  "bordeaux": "bordeaux",
};

/** Retourne true si un mockup existe pour cet ID de couleur produit. */
export function hasMockup(colorId: string): boolean {
  return colorId in COLOR_TO_MOCKUP;
}
