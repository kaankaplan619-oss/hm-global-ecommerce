/**
 * Témoignages clients curatés — affichés dans <LocalTestimonials />.
 *
 * ⚠️ RÈGLE ABSOLUE : uniquement des témoignages RÉELS, avec l'accord du client.
 * Ne JAMAIS inventer d'avis, de nom ou de note (publicité trompeuse — DGCCRF).
 * Tant que ce tableau est vide, la section ne s'affiche pas.
 *
 * Pour ajouter un témoignage : demander au client son accord, puis remplir
 * un objet ci-dessous (quote = ses mots, author = prénom + initiale ou nom
 * complet selon accord, company/city pour la preuve locale B2B).
 */

export type Testimonial = {
  /** Le témoignage, mot pour mot (ne pas reformuler de façon trompeuse). */
  quote: string;
  /** Nom affiché (prénom + initiale ou nom complet, selon l'accord donné). */
  author: string;
  /** Entreprise / association / club du client. */
  company?: string;
  /** Ville (preuve d'ancrage local). */
  city?: string;
  /** Note 1–5 si le client en a donné une. */
  rating?: number;
};

export const TESTIMONIALS: Testimonial[] = [];
