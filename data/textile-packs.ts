/**
 * data/textile-packs.ts
 *
 * Packs B2B textile prêts à acheter — V1 marketing.
 *
 * IMPORTANT V1 :
 *   - Les packs V1 ne passent PAS par le panier directement (pas de support
 *     multi-produits packagé natif dans store/cart.ts).
 *   - Le CTA principal renvoie vers /contact?sujet=pack-textile&pack={slug}
 *     ou /devis?type=pack-textile&pack={slug} pour qualification commerciale.
 *   - Le prix affiché est INDICATIF — il sera confirmé lors du devis selon
 *     personnalisation finale (couleurs, tailles, complexité logo).
 *
 * V2 : intégration panier directe quand le store/cart supportera le mode
 *      "bundle multi-items".
 */

export type TextilePackSlug = "staff-10" | "association";

export interface TextilePackItem {
  /** Description courte de la ligne (sans référence produit interne pour rester souple). */
  label:     string;
  /** Quantité de la ligne. */
  quantity:  number;
  /** Précisions optionnelles (technique, placement, etc.). */
  detail?:   string;
}

export interface TextilePack {
  slug:        TextilePackSlug;
  /** Nom commercial. */
  name:        string;
  /** Cible (1 ligne). */
  target:      string;
  /** Tagline pitch (1-2 lignes). */
  tagline:     string;
  /** Contenu détaillé du pack. */
  items:       TextilePackItem[];
  /** Prix public TTC indicatif. */
  priceTTC:    number;
  /** Économie estimée vs achat séparé (% ou €). */
  savings?:    string;
  /** Délai annoncé. */
  delay:       string;
  /** CTA principal. */
  ctaLabel:    string;
  /** Lien CTA — toujours vers contact / devis en V1. */
  ctaHref:     string;
  /** Bénéfices clés. */
  benefits:    string[];
  /** Statut V1 — toujours "active" pour les packs publiés. */
  status:      "active";
}

export const TEXTILE_PACKS: TextilePack[] = [
  {
    slug:    "staff-10",
    name:    "Pack Staff 10",
    target:  "Petite équipe, lancement entreprise, première vague d'embauche.",
    tagline: "10 t-shirts premium + DTF logo cœur. BAT 24h, livraison 10 jours.",
    items: [
      {
        label:    "T-shirts premium personnalisés",
        quantity: 10,
        detail:   "DTF cœur, 1 logo, choix de couleurs et tailles",
      },
      {
        label:    "BAT visuel HM Global",
        quantity: 1,
        detail:   "Validation logo + placement avant production",
      },
      {
        label:    "Livraison France métropolitaine",
        quantity: 1,
        detail:   "Offerte (dès 10 pièces)",
      },
    ],
    priceTTC: 239,
    savings:  "Soit 23,90 €/pièce — équivalent au palier 10-24p",
    delay:    "BAT sous 24 h · Production 7-10 jours ouvrés",
    ctaLabel: "Demander mon pack",
    ctaHref:  "/contact?sujet=pack-textile&pack=staff-10",
    benefits: [
      "Stock par taille — chaque collaborateur sa pièce",
      "BAT visuel humain avant production",
      "Conseil technique inclus (choix textile et placement)",
      "Renouvellement facile à l'identique",
    ],
    status: "active",
  },

  {
    slug:    "association",
    name:    "Pack Association",
    target:  "Associations, clubs sportifs, bénévoles, événements caritatifs.",
    tagline: "20 t-shirts économiques + DTF logo + livraison offerte.",
    items: [
      {
        label:    "T-shirts économiques personnalisés",
        quantity: 20,
        detail:   "DTF cœur, 1 logo asso, couleurs et tailles libres",
      },
      {
        label:    "BAT visuel HM Global",
        quantity: 1,
        detail:   "Validation logo + couleur avant production",
      },
      {
        label:    "Livraison France métropolitaine",
        quantity: 1,
        detail:   "Offerte (déjà incluse dès 10 pièces)",
      },
    ],
    priceTTC: 359,
    savings:  "Soit 17,95 €/pièce — équivalent palier 10-24p",
    delay:    "BAT sous 24 h · Production 7-10 jours ouvrés",
    ctaLabel: "Recevoir un devis pack",
    ctaHref:  "/contact?sujet=pack-textile&pack=association",
    benefits: [
      "Tarif accessible adapté budget asso",
      "Livraison France offerte",
      "BAT visuel pour valider la couleur du logo",
      "Possibilité d'ajouter tote bags et casquettes en option",
    ],
    status: "active",
  },
];

export function getPackBySlug(slug: string): TextilePack | undefined {
  return TEXTILE_PACKS.find((p) => p.slug === slug);
}

export function getActivePacks(): TextilePack[] {
  return TEXTILE_PACKS.filter((p) => p.status === "active");
}
