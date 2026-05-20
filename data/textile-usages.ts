/**
 * data/textile-usages.ts
 *
 * Entrées catalogue par usage métier — V1 marketing.
 *
 * 3 usages actifs avec landing dédiée :
 *   - staff
 *   - restaurant
 *   - association
 *
 * 3 usages "bientôt disponibles" — visibles en hub mais CTA renvoie vers /devis :
 *   - evenement
 *   - btp
 *   - merch
 *
 * Pas de visuels fournisseur — on s'appuie sur des illustrations CSS / pictos.
 * Images optionnelles : si présentes sous /public/images/usages/{slug}.jpg, elles
 * remplacent l'illustration par défaut. Sinon, fallback gradient + picto Lucide.
 */

export type TextileUsageSlug =
  | "staff"
  | "restaurant"
  | "association"
  | "evenement"
  | "btp"
  | "merch";

export interface TextileUsage {
  slug:          TextileUsageSlug;
  /** Titre court affiché sur la carte (hub + home grid). */
  title:         string;
  /** Sous-titre / pitch courte (1-2 lignes, max ~80 caractères). */
  tagline:       string;
  /** Icône Lucide (string name) — résolue via mapping dans le composant. */
  icon:          "Users" | "ChefHat" | "Handshake" | "Calendar" | "HardHat" | "Sparkles";
  /** Statut : active = landing détaillée ; coming_soon = CTA devis uniquement. */
  status:        "active" | "coming_soon";
  /** Catégories produits suggérées (pour landing active). */
  suggestedCategories?: ("tshirts" | "polos" | "hoodies" | "sacs" | "casquettes")[];
  /** Techniques mises en avant pour cet usage. */
  highlightedTechniques?: ("dtf" | "flex" | "broderie")[];
  /** Texte hero landing détaillée (active uniquement). */
  heroDescription?: string;
  /** Bénéfices clés pour le secteur. */
  benefits?: string[];
}

export const TEXTILE_USAGES: TextileUsage[] = [
  {
    slug:    "staff",
    title:   "Équiper mon équipe",
    tagline: "T-shirts, polos et sweats pour staff. Logo brodé ou DTF.",
    icon:    "Users",
    status:  "active",
    suggestedCategories:    ["tshirts", "polos", "hoodies"],
    highlightedTechniques:  ["dtf", "broderie"],
    heroDescription:
      "Habillez votre équipe avec un rendu professionnel et homogène. " +
      "DTF pour des logos couleur précis, broderie pour une finition premium durable. " +
      "BAT validé avant production, dégressif dès 10 pièces.",
    benefits: [
      "BAT visuel sous 24 h ouvrées",
      "Dégressif clair dès 10 pièces",
      "Stock par taille — chaque collaborateur sa pièce",
      "Conseil technique humain (DTF / broderie selon textile)",
    ],
  },
  {
    slug:    "restaurant",
    title:   "Tenues restaurant & café",
    tagline: "Heavyweight ou polo brodé pour brigade et salle.",
    icon:    "ChefHat",
    status:  "active",
    suggestedCategories:    ["tshirts", "polos", "casquettes"],
    highlightedTechniques:  ["broderie", "dtf"],
    heroDescription:
      "Pour les brigades et le service en salle : textile robuste, marquage tenu " +
      "dans le temps, broderie discrète ou DTF haute définition. Renouvellement " +
      "facile grâce à la dégressivité.",
    benefits: [
      "Broderie premium qui tient au lavage haute température",
      "Heavyweight 200g+ adapté à la cuisine",
      "Tabliers et casquettes en option",
      "Renouvellement facile (commandes récurrentes)",
    ],
  },
  {
    slug:    "association",
    title:   "Association & club",
    tagline: "T-shirts économiques DTF — dès 20 pièces, livraison offerte.",
    icon:    "Handshake",
    status:  "active",
    suggestedCategories:    ["tshirts", "sacs", "casquettes"],
    highlightedTechniques:  ["dtf"],
    heroDescription:
      "Équipez vos bénévoles ou membres sans exploser le budget. T-shirts économiques " +
      "DTF, prix dégressifs sérieux, livraison France offerte dès 10 pièces. " +
      "BAT visuel pour valider le logo asso avant production.",
    benefits: [
      "Prix dégressifs visibles — pas besoin de devis pour <100p",
      "Livraison France offerte dès 10 pièces",
      "BAT visuel pour valider la couleur du logo",
      "Tote bags et casquettes assortis disponibles",
    ],
  },
  {
    slug:    "evenement",
    title:   "Staff événementiel",
    tagline: "Bientôt disponible — contactez-nous pour un devis express.",
    icon:    "Calendar",
    status:  "coming_soon",
  },
  {
    slug:    "btp",
    title:   "Artisan & BTP",
    tagline: "Bientôt disponible — contactez-nous pour un devis chantier.",
    icon:    "HardHat",
    status:  "coming_soon",
  },
  {
    slug:    "merch",
    title:   "Merch premium",
    tagline: "Bientôt disponible — contactez-nous pour votre projet marque.",
    icon:    "Sparkles",
    status:  "coming_soon",
  },
];

export function getUsageBySlug(slug: string): TextileUsage | undefined {
  return TEXTILE_USAGES.find((u) => u.slug === slug);
}

export function getActiveUsages(): TextileUsage[] {
  return TEXTILE_USAGES.filter((u) => u.status === "active");
}
