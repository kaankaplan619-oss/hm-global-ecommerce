/**
 * printMockupTemplates.ts — Source de vérité des mockups print HM Global.
 *
 * Chaque entrée décrit un mockup utilisable dans le catalogue `/impression`
 * et, à terme (V2), dans un moteur de preview client maison qui pourra
 * coller le fichier client sur la `printArea` du mockup.
 *
 * Source des mockups V1 (2026-05-27) :
 *   Mockups Design (https://mockups-design.com)
 *   Licence : https://mockups-design.com/license/
 *     - usage commercial autorisé
 *     - usage sur site web, portfolio, clients, social media autorisés
 *     - exports aplatis autorisés (c'est ce qu'on a fait)
 *     - pas d'attribution obligatoire
 *     - interdiction de redistribuer les PSD/sources
 *
 * Les PSD originaux restent dans `~/Desktop/HM-Global-Mockups-Free/downloads/`
 * et ne sont JAMAIS commités (cf .gitignore lignes *.psd *.zip *.tif).
 *
 * Pipeline d'extraction :
 *   1. Ouvrir les PSD avec Photoshop/Photopea (édition Smart Object pour
 *      personnaliser les designs avec le branding HM Global / client)
 *   2. Exporter en JPG aplati depuis Photoshop
 *   3. Convertir en WebP via sharp (script run-time, quality 88, effort 5)
 *   4. Placer dans `public/mockups/print/<family>/`
 *
 * V1 : on utilise les JPG preview inclus dans les ZIP (designs de démo
 * neutres). Toujours adapté pour montrer "à quoi ressemble un vrai support
 * imprimé" dans le catalogue. Personnalisation HM Global → V1.1.
 *
 * V2 : moteur de preview client utilisant `printArea` pour coller le fichier
 * client sur le mockup via CSS transform ou Fabric.js (cf preview-engine-notes.md).
 */

export type PrintMockupFamily =
  | "business-cards"
  | "flyer"
  | "poster"
  | "canvas"
  | "brochure"
  // Familles V2 (pas encore exposées sur /impression mais mockups dispos)
  | "rollup"
  | "sticker"
  | "mug";

export interface PrintMockupTemplate {
  /** ID unique stable (sert de clé React + tracking analytics futur). */
  id: string;
  family: PrintMockupFamily;
  /** Nom de la source pour mention/audit. Pas d'attribution obligatoire mais
   *  on garde la traçabilité pour vérif licence à tout moment. */
  sourceName: "Mockups Design";
  sourceUrl: string;
  licenseUrl: string;
  /** Chemin /public à passer au <img src>. WebP optimisé. */
  sceneImage: string;
  /** Formats compatibles (libellés affichés client + matching Gelato).
   *  Pas une contrainte technique stricte — sert juste à filtrer si on
   *  veut afficher un mockup différent par format choisi par le client. */
  supportedFormats: string[];
  /** Usage cible court (sert au tooltip admin + tri DA). */
  recommendedUse: string;
  /**
   * Zone d'impression sur l'image scène (coordonnées px dans l'image WebP).
   * Sert au moteur de preview V2 pour coller le fichier client.
   *
   * V1 : zones approximatives par défaut (centrées, sans rotation). À
   * affiner produit par produit dans une passe V1.1 quand Kaan voudra
   * lancer le preview client.
   *
   * V2 envisagé : ajout d'un champ `perspective` (matrice 8 floats) pour
   * les mockups avec angle (style citylight oblique, brochure trifold).
   */
  printArea: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotate?: number; // degrés, 0 si omis
  };
}

// ── Mockups Design licence (constante partagée) ──────────────────────────────
const MD_LICENSE = "https://mockups-design.com/license/";

export const PRINT_MOCKUP_TEMPLATES: PrintMockupTemplate[] = [
  // ─── BUSINESS CARDS ────────────────────────────────────────────────────────
  // 3 scènes différentes (stack vertical / piles éparses / cards face) →
  // évite la répétition visuelle dans la grille catalogue
  {
    id: "business-card-stack-01",
    family: "business-cards",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-business-cards-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/business-card/business-card-stack-01.webp",
    supportedFormats: ["85×55 mm standard", "85×55 mm coins ronds", "90×50 mm"],
    recommendedUse: "Catalogue principal — pile de cartes en perspective",
    printArea: { x: 320, y: 280, width: 560, height: 340, rotate: -2 },
  },
  {
    id: "business-card-stack-02",
    family: "business-cards",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-business-cards-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/business-card/business-card-stack-02.webp",
    supportedFormats: ["85×55 mm standard", "Carrée 70×70 mm"],
    recommendedUse: "Variante grille — cartes face visible",
    printArea: { x: 280, y: 260, width: 600, height: 360 },
  },
  {
    id: "business-card-stack-03",
    family: "business-cards",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-business-cards-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/business-card/business-card-stack-03.webp",
    supportedFormats: ["85×55 mm", "Slim 85×40 mm"],
    recommendedUse: "Variante grille — composition recto/verso",
    printArea: { x: 300, y: 280, width: 580, height: 340 },
  },

  // ─── FLYERS ────────────────────────────────────────────────────────────────
  // 4 scènes shadow A4 → varie l'angle d'ombre + position du flyer
  {
    id: "flyer-shadow-01",
    family: "flyer",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/shadowed-us-flyer-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/flyer/flyer-shadow-01.webp",
    supportedFormats: ["A4 (210×297 mm)", "US Letter (8.5×11 in)"],
    recommendedUse: "Catalogue principal — flyer fond uni avec ombre douce",
    printArea: { x: 270, y: 90, width: 860, height: 870 },
  },
  {
    id: "flyer-shadow-02",
    family: "flyer",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/shadowed-us-flyer-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/flyer/flyer-shadow-02.webp",
    supportedFormats: ["A4", "A5"],
    recommendedUse: "Variante — flyer plié, scène lifestyle",
    printArea: { x: 290, y: 100, width: 820, height: 850 },
  },
  {
    id: "flyer-shadow-03",
    family: "flyer",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/shadowed-us-flyer-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/flyer/flyer-shadow-03.webp",
    supportedFormats: ["A4", "A5", "A6"],
    recommendedUse: "Variante — flyer multi-papiers",
    printArea: { x: 300, y: 100, width: 800, height: 850 },
  },
  {
    id: "flyer-shadow-04",
    family: "flyer",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/shadowed-us-flyer-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/flyer/flyer-shadow-04.webp",
    supportedFormats: ["A4", "A5"],
    recommendedUse: "Variante — flyer fond clair haut contraste",
    printArea: { x: 280, y: 95, width: 840, height: 860 },
  },

  // ─── POSTERS ───────────────────────────────────────────────────────────────
  // 2 scènes encadrées intérieur + 2 scènes citylight urbain extérieur
  {
    id: "poster-framed-01",
    family: "poster",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-framed-poster-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/poster/poster-framed-01.webp",
    supportedFormats: ["30×40 cm", "40×60 cm", "A3", "A2"],
    recommendedUse: "Catalogue — affiche encadrée mur intérieur",
    printArea: { x: 380, y: 120, width: 640, height: 820 },
  },
  {
    id: "poster-framed-02",
    family: "poster",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-framed-poster-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/poster/poster-framed-02.webp",
    supportedFormats: ["30×40 cm", "40×60 cm"],
    recommendedUse: "Variante — poster en situation salon",
    printArea: { x: 360, y: 130, width: 660, height: 800 },
  },
  {
    id: "poster-citylight-01",
    family: "poster",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-urban-citylight-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/poster/poster-citylight-01.webp",
    supportedFormats: ["120×176 cm citylight", "A0", "A1"],
    recommendedUse: "Affichage urbain événementiel B2B",
    printArea: { x: 400, y: 130, width: 600, height: 820 },
  },
  {
    id: "poster-citylight-02",
    family: "poster",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-urban-citylight-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/poster/poster-citylight-02.webp",
    supportedFormats: ["120×176 cm citylight", "A0"],
    recommendedUse: "Variante affichage urbain angle différent",
    printArea: { x: 380, y: 140, width: 620, height: 800 },
  },

  // ─── CANVAS ────────────────────────────────────────────────────────────────
  // 6 scènes : panoramique salon / portrait bureau / grand format / petit / multi-tailles
  {
    id: "canvas-01",
    family: "canvas",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-canvas-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/canvas/canvas-01.webp",
    supportedFormats: ["30×30 cm carré", "40×40 cm carré"],
    recommendedUse: "Catalogue — toile carrée tendue, ambiance intérieure",
    printArea: { x: 380, y: 260, width: 640, height: 520 },
  },
  {
    id: "canvas-02",
    family: "canvas",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-canvas-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/canvas/canvas-02.webp",
    supportedFormats: ["40×60 cm portrait", "60×90 cm panoramique"],
    recommendedUse: "Variante — toile portrait bureau",
    printArea: { x: 400, y: 200, width: 600, height: 650 },
  },
  {
    id: "canvas-03",
    family: "canvas",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-canvas-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/canvas/canvas-03.webp",
    supportedFormats: ["60×90 cm panoramique"],
    recommendedUse: "Variante — toile panoramique salon",
    printArea: { x: 280, y: 280, width: 840, height: 500 },
  },
  {
    id: "canvas-04",
    family: "canvas",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-canvas-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/canvas/canvas-04.webp",
    supportedFormats: ["30×40 cm", "40×60 cm"],
    recommendedUse: "Variante — toile en situation déco",
    printArea: { x: 380, y: 200, width: 640, height: 700 },
  },
  {
    id: "canvas-05",
    family: "canvas",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-canvas-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/canvas/canvas-05.webp",
    supportedFormats: ["40×60 cm", "60×90 cm"],
    recommendedUse: "Variante — toile grand format wall art",
    printArea: { x: 320, y: 200, width: 760, height: 660 },
  },
  {
    id: "canvas-06",
    family: "canvas",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-canvas-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/canvas/canvas-06.webp",
    supportedFormats: ["30×30 cm carré", "40×40 cm carré"],
    recommendedUse: "Variante — toile carrée ambiance",
    printArea: { x: 400, y: 280, width: 600, height: 500 },
  },

  // ─── BROCHURE ──────────────────────────────────────────────────────────────
  // 1 scène trifold dépliée — utilisée pour la famille "cards / invitations"
  // qui inclut plaquettes et dépliants 3 volets
  {
    id: "brochure-trifold-01",
    family: "brochure",
    sourceName: "Mockups Design",
    sourceUrl: "https://mockups-design.com/free-scene-creator-files/trifold-brochure-mockup/",
    licenseUrl: MD_LICENSE,
    sceneImage: "/mockups/print/brochure/brochure-trifold-01.webp",
    supportedFormats: ["DL 3 volets (210×99 mm)", "A4 plié 3 volets"],
    recommendedUse: "Catalogue — brochure trifold dépliée vue plongée",
    printArea: { x: 200, y: 280, width: 1000, height: 490 },
  },
];

// ─── Helpers d'accès ─────────────────────────────────────────────────────────

/**
 * Retourne tous les mockups d'une famille (ordre d'insertion = ordre
 * d'utilisation dans la grille catalogue → respecte la rotation visuelle).
 */
export function getMockupsByFamily(family: PrintMockupFamily): PrintMockupTemplate[] {
  return PRINT_MOCKUP_TEMPLATES.filter((t) => t.family === family);
}

/**
 * Retourne un mockup à index donné dans sa famille, avec wrap modulo si
 * l'index dépasse le nombre de mockups disponibles. Garantit pas de
 * doublon adjacent tant que la famille a au moins 2 mockups.
 */
export function getMockupByIndex(family: PrintMockupFamily, index: number): PrintMockupTemplate | null {
  const list = getMockupsByFamily(family);
  if (list.length === 0) return null;
  return list[index % list.length];
}

/**
 * Mapping famille uid (cf app/impression/page.tsx) → famille mockup.
 * Le "cards" du catalogue → famille "brochure" (dépliants/invitations).
 */
export function resolveMockupFamily(catalogUid: string): PrintMockupFamily | null {
  switch (catalogUid) {
    case "business-cards": return "business-cards";
    case "flyer":          return "flyer";
    case "poster":         return "poster";
    case "canvas":         return "canvas";
    case "cards":          return "brochure"; // cards/invitations → brochure trifold
    default:               return null;
  }
}
