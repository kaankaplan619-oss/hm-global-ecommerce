/**
 * data/print-catalogue.ts
 *
 * Catalogue PRINT curé pour la page /impression.
 *
 * Pourquoi ce fichier ?
 *   Avant, la grille /impression affichait le dump brut de l'API Gelato →
 *   tailles en unités mélangées ("2x3.5", "A6", "400x600 mm", "14.1x14.1 cm"),
 *   visuels disparates, aucune cohérence. Ici on cure la sélection façon
 *   Vistaprint / Pixartprinting : noms FR, tailles normalisées (mm/cm),
 *   descriptions claires, un seul style visuel (spec mockup cohérent).
 *
 * Visuels :
 *   Chaque produit a un "spec mockup" généré (support à plat, fond studio
 *   neutre identique, taille annotée) → public/mockups/print/spec/{id}.webp
 *   Générateur : scripts/_gen-print-spec.mjs (manifest aligné sur les id).
 *
 * Commande :
 *   - `direct: true`  → parcours de commande live (configurateur cartes de
 *                       visite + prix réel du lot, cf data/print-products.ts).
 *   - `direct: false` → devis pré-rempli (/contact) en attendant les
 *                       configurateurs flyers/affiches/toiles (V2).
 */

export interface CuratedPrintProduct {
  id:          string;
  name:        string;
  sizeLabel:   string;   // taille normalisée FR (mm / cm)
  description: string;
  priceLabel:  string;   // "dès 34,90 €" (commande directe) ou "Sur devis"
  direct:      boolean;  // true = configurateur live, false = devis
  href:        string;
  badge?:      string;
}

export interface PrintFamilyBlock {
  uid:         "business-cards" | "flyer" | "poster" | "canvas" | "cards";
  products:    CuratedPrintProduct[];
}

const devisHref = (id: string, size: string) =>
  `/contact?sujet=impression&produit=${encodeURIComponent(id)}&format=${encodeURIComponent(size)}`;

const CONFIG_HREF = "/impression/cartes-de-visite";

export const PRINT_CATALOGUE: PrintFamilyBlock[] = [
  {
    uid: "business-cards",
    products: [
      {
        id: "bc-standard",
        name: "Carte de visite standard",
        sizeLabel: "85 × 55 mm",
        description:
          "Le format classique, le plus demandé. Papier 350 g/m², finition mate, brillante ou premium satin velours. Recto seul ou recto-verso.",
        priceLabel: "dès 34,90 €",
        direct: true,
        href: CONFIG_HREF,
        badge: "Commande directe",
      },
      {
        id: "bc-rounded",
        name: "Carte coins arrondis",
        sizeLabel: "85 × 55 mm",
        description:
          "Le standard avec coins arrondis pour une finition douce et moderne. Même papier 350 g/m², toutes finitions disponibles.",
        priceLabel: "dès 39,90 €",
        direct: true,
        href: CONFIG_HREF,
        badge: "Commande directe",
      },
      // Cartes carrée / pliée retirées (étaient "Sur devis") — on ne propose que
      // la commande directe sur les cartes de visite (standard + coins arrondis).
    ],
  },
  {
    uid: "flyer",
    products: [
      {
        id: "flyer-a6",
        name: "Flyer A6",
        sizeLabel: "10,5 × 14,8 cm",
        description:
          "Le tract compact à distribuer en main propre ou en boîte aux lettres. Papier couché 170 g/m², recto ou recto-verso.",
        priceLabel: "dès 31,90 €",
        direct: true,
        badge: "Commande directe",
        href: "/impression/flyer-a6",
      },
      {
        id: "flyer-a5",
        name: "Flyer A5",
        sizeLabel: "14,8 × 21 cm",
        description:
          "Le format polyvalent pour promos, menus et événements. Couché 170 g/m², lisible et économique en volume.",
        priceLabel: "dès 41,90 €",
        direct: true,
        badge: "Commande directe",
        href: "/impression/flyer-a5",
      },
      {
        id: "flyer-a4",
        name: "Flyer / dépliant A4",
        sizeLabel: "21 × 29,7 cm",
        description:
          "Le grand format pour présentations détaillées et offres complètes. Couché 170 g/m², imprimé recto-verso.",
        priceLabel: "dès 43,90 €",
        direct: true,
        badge: "Commande directe",
        href: "/impression/flyer-a4",
      },
    ],
  },
  {
    uid: "poster",
    products: [
      {
        id: "poster-a3",
        name: "Affiche A3",
        sizeLabel: "29,7 × 42 cm",
        description:
          "Le format vitrine et bureau. Papier 200 g/m², impression quadri haute définition, idéal affichage intérieur.",
        priceLabel: "Sur devis",
        direct: false,
        href: devisHref("affiche-a3", "A3 · 29,7 × 42 cm"),
      },
      {
        id: "poster-40x60",
        name: "Affiche 40 × 60 cm",
        sizeLabel: "40 × 60 cm",
        description:
          "Grand format d'accroche pour commerces et événements. 200 g/m² non couché, rendu mat élégant.",
        priceLabel: "Sur devis",
        direct: false,
        href: devisHref("affiche-40x60", "40 × 60 cm"),
      },
      {
        id: "poster-50x70",
        name: "Affiche 50 × 70 cm",
        sizeLabel: "50 × 70 cm",
        description:
          "Le grand format signalétique le plus visible. Impression 4/0 haute définition sur papier 200 g/m².",
        priceLabel: "dès 18,90 €",
        direct: true,
        badge: "Commande directe",
        href: devisHref("affiche-50x70", "50 × 70 cm"),
      },
      {
        id: "poster-a2",
        name: "Affiche A2",
        sizeLabel: "42 × 59,4 cm",
        description:
          "Format premium pour campagnes et expositions. 200 g/m², couleurs profondes et tenue dans le temps.",
        priceLabel: "Sur devis",
        direct: false,
        href: devisHref("affiche-a2", "A2 · 42 × 59,4 cm"),
      },
    ],
  },
  {
    uid: "canvas",
    products: [
      {
        id: "canvas-30x40",
        name: "Toile 30 × 40 cm",
        sizeLabel: "30 × 40 cm",
        description:
          "Petit format déco pour bureau ou accueil. Toile tendue sur châssis bois FSC, prête à accrocher.",
        priceLabel: "dès 67,90 €",
        direct: true,
        badge: "Commande directe",
        href: devisHref("toile-30x40", "30 × 40 cm"),
      },
      {
        id: "canvas-40x60",
        name: "Toile 40 × 60 cm",
        sizeLabel: "40 × 60 cm",
        description:
          "Le format mural polyvalent. Impression sur toile mate, cadre bois FSC 2 cm, finition galerie.",
        priceLabel: "dès 75,90 €",
        direct: true,
        badge: "Commande directe",
        href: devisHref("toile-40x60", "40 × 60 cm"),
      },
      {
        id: "canvas-50x50",
        name: "Toile carrée 50 × 50 cm",
        sizeLabel: "50 × 50 cm",
        description:
          "Format carré contemporain. Idéal logos, visuels d'ambiance et murs d'images. Toile tendue cadre bois.",
        priceLabel: "dès 76,90 €",
        direct: true,
        badge: "Commande directe",
        href: devisHref("toile-50x50", "50 × 50 cm"),
      },
      {
        id: "canvas-60x90",
        name: "Toile 60 × 90 cm",
        sizeLabel: "60 × 90 cm",
        description:
          "Grand format statement pour halls et salles de réunion. Toile tendue, cadre bois FSC renforcé.",
        priceLabel: "Sur devis",
        direct: false,
        href: devisHref("toile-60x90", "60 × 90 cm"),
      },
    ],
  },
  {
    uid: "cards",
    products: [
      {
        id: "card-a6",
        name: "Carton d'invitation A6",
        sizeLabel: "10,5 × 14,8 cm",
        description:
          "Le format invitation classique. Papier 350 g/m² couché satiné, option dorure ou pelliculage brillant.",
        priceLabel: "dès 23,90 €",
        direct: true,
        badge: "Commande directe",
        href: devisHref("invitation-a6", "A6 · 10,5 × 14,8 cm"),
      },
      {
        id: "card-square",
        name: "Carte carrée 14 × 14 cm",
        sizeLabel: "14 × 14 cm",
        description:
          "Format carré élégant pour faire-part et cartes de vœux. 350 g/m² satiné, finitions premium disponibles.",
        priceLabel: "Sur devis",
        direct: false,
        href: devisHref("invitation-carree", "14 × 14 cm"),
      },
      {
        id: "card-folded",
        name: "Carte pliée A6",
        sizeLabel: "10,5 × 14,8 cm pliée",
        description:
          "Carte double volet pour message intérieur. Idéale vœux, remerciements et invitations événementielles.",
        priceLabel: "Sur devis",
        direct: false,
        href: devisHref("invitation-pliee", "A6 pliée · 10,5 × 14,8 cm"),
      },
    ],
  },
];

/** Image spec mockup générée pour un produit (cf scripts/_gen-print-spec.mjs). */
export function printSpecImage(id: string): string {
  return `/mockups/print/spec/${id}.webp`;
}

// ─── Specs techniques par produit (pour le configurateur générique) ──────────
// widthMm × heightMm = format FINI (orientation portrait par défaut pour les
// formats hauts). faces = recto/verso possible. orientationToggle = on propose
// paysage/portrait (inutile sur les formats carrés). bleedMm = fond perdu.

export interface PrintSpec {
  widthMm:           number;
  heightMm:          number;
  faces:             boolean;
  orientationToggle: boolean;
  bleedMm:           number;
}

export const PRINT_SPECS: Record<string, PrintSpec> = {
  "bc-standard": { widthMm: 85,  heightMm: 55,  faces: true,  orientationToggle: true,  bleedMm: 3 },
  "bc-rounded":  { widthMm: 85,  heightMm: 55,  faces: true,  orientationToggle: true,  bleedMm: 3 },
  "bc-square":   { widthMm: 55,  heightMm: 55,  faces: true,  orientationToggle: false, bleedMm: 3 },
  "bc-folded":   { widthMm: 85,  heightMm: 55,  faces: true,  orientationToggle: true,  bleedMm: 3 },
  "flyer-a6":    { widthMm: 105, heightMm: 148, faces: true,  orientationToggle: true,  bleedMm: 3 },
  "flyer-a5":    { widthMm: 148, heightMm: 210, faces: true,  orientationToggle: true,  bleedMm: 3 },
  "flyer-a4":    { widthMm: 210, heightMm: 297, faces: true,  orientationToggle: true,  bleedMm: 3 },
  "poster-a3":   { widthMm: 297, heightMm: 420, faces: false, orientationToggle: true,  bleedMm: 3 },
  "poster-40x60":{ widthMm: 400, heightMm: 600, faces: false, orientationToggle: true,  bleedMm: 5 },
  "poster-50x70":{ widthMm: 500, heightMm: 700, faces: false, orientationToggle: true,  bleedMm: 5 },
  "poster-a2":   { widthMm: 420, heightMm: 594, faces: false, orientationToggle: true,  bleedMm: 5 },
  "canvas-30x40":{ widthMm: 300, heightMm: 400, faces: false, orientationToggle: true,  bleedMm: 20 },
  "canvas-40x60":{ widthMm: 400, heightMm: 600, faces: false, orientationToggle: true,  bleedMm: 20 },
  "canvas-50x50":{ widthMm: 500, heightMm: 500, faces: false, orientationToggle: false, bleedMm: 20 },
  "canvas-60x90":{ widthMm: 600, heightMm: 900, faces: false, orientationToggle: true,  bleedMm: 20 },
  "card-a6":     { widthMm: 105, heightMm: 148, faces: true,  orientationToggle: true,  bleedMm: 3 },
  "card-square": { widthMm: 140, heightMm: 140, faces: true,  orientationToggle: false, bleedMm: 3 },
  "card-folded": { widthMm: 105, heightMm: 148, faces: true,  orientationToggle: true,  bleedMm: 3 },
};

// Produits routés vers le configurateur cartes dédié (85×55, gère prix + coins).
const CARD_NATIVE_IDS = new Set(["bc-standard", "bc-rounded"]);

/** Liste à plat de tous les produits. */
export const ALL_PRINT_PRODUCTS: CuratedPrintProduct[] =
  PRINT_CATALOGUE.flatMap((b) => b.products);

/** Récupère un produit + sa famille + sa spec par id. */
export function getPrintProduct(id: string):
  | { product: CuratedPrintProduct; family: PrintFamilyBlock["uid"]; spec: PrintSpec }
  | null {
  for (const block of PRINT_CATALOGUE) {
    const product = block.products.find((p) => p.id === id);
    if (product && PRINT_SPECS[id]) {
      return { product, family: block.uid, spec: PRINT_SPECS[id] };
    }
  }
  return null;
}

/**
 * Destination du bouton "Personnaliser maintenant" de la grille /impression.
 * Cartes natives 85×55 → configurateur dédié (prix + commande directe).
 * Tout le reste → configurateur générique /impression/[slug].
 */
export function printConfigHref(id: string): string {
  return CARD_NATIVE_IDS.has(id) ? "/impression/cartes-de-visite" : `/impression/${id}`;
}

/** true si ce produit a un parcours de commande directe (prix connu). */
export function isDirectOrder(id: string): boolean {
  return CARD_NATIVE_IDS.has(id);
}
