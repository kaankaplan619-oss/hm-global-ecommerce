/**
 * data/local-seo.ts
 *
 * Contenu des pages SEO locales (Strasbourg / Alsace). OBJECTIF : capter les
 * recherches « <service> Strasbourg » que les concurrents locaux occupent, avec
 * une vraie expérience en ligne (studio + prix immédiat) qu'eux n'ont pas.
 *
 * RÈGLE ANTI-INVENTION : le contenu ci-dessous est rédigé UNIQUEMENT à partir de
 * faits vérifiables dans le code (techniques réelles cf. data/techniques.ts,
 * seuil atelier ATELIER_QTY_THRESHOLD = 10, adresse réelle Souffelweyersheim,
 * fonctionnalités réelles : studio en ligne, BAT, paiement CB/virement). Aucun
 * chiffre client, avis, délai précis ou partenariat inventé.
 *
 * À VALIDER / COMPLÉTER PAR KAAN avant d'ouvrir d'autres pages. Pour ajouter une
 * page locale : ajouter une entrée dans LOCAL_SERVICE_PAGES (elle est alors
 * automatiquement routée via app/[localSlug] et ajoutée au sitemap).
 *
 * Pages volontairement en FRANÇAIS (cible : recherche locale francophone).
 */

import type { RealisationCategory } from "@/data/realisations";

export interface LocalServiceFAQ {
  q: string;
  a: string;
}

export interface LocalServiceItem {
  title: string;
  desc: string;
}

export interface LocalServicePageData {
  /** Slug de la route (app/<slug>/page.tsx). */
  slug: string;
  metaTitle: string;
  metaDescription: string;
  /** Type de service pour les données structurées schema.org. */
  serviceType: string;
  tag: string;
  h1: string;
  intro: string;
  /** Atouts différenciants (tous réels). */
  highlights: string[];
  services: LocalServiceItem[];
  process: string[];
  faq: LocalServiceFAQ[];
  /** Catégorie de réalisations RÉELLES à illustrer (cf. data/realisations.ts). */
  realisationCategory?: RealisationCategory;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

export const LOCAL_SERVICE_PAGES: LocalServicePageData[] = [
  {
    slug: "textile-personnalise-strasbourg",
    metaTitle:
      "Textile personnalisé à Strasbourg — broderie, DTF, flex | HM Global",
    metaDescription:
      "Personnalisez vos vêtements à Strasbourg : t-shirts, polos, sweats et softshells en broderie, DTF, DTFlex et flex. Studio en ligne, prix immédiat, atelier local en Alsace.",
    serviceType: "Marquage et broderie textile",
    tag: "Textile personnalisé · Strasbourg & Alsace",
    h1: "Textile personnalisé à Strasbourg",
    intro:
      "HM Global est une agence de communication visuelle en Alsace. Nous personnalisons vos t-shirts, polos, sweats, softshells, casquettes et sacs pour vos équipes, événements et clients. La différence : vous créez votre marquage dans notre studio en ligne, vous voyez le prix immédiatement et vous commandez sans attendre un devis. Notre atelier est à Souffelweyersheim, à quelques minutes de Strasbourg.",
    highlights: [
      "Studio en ligne : composez votre marquage et voyez le prix en temps réel",
      "Commande et paiement en ligne, par carte bancaire ou virement",
      "Atelier local à Souffelweyersheim, près de Strasbourg",
      "De la pièce unique à la série : production atelier dès 10 pièces",
    ],
    services: [
      {
        title: "DTF",
        desc: "Direct To Film — couleurs illimitées, rendu vif, idéal pour les visuels complexes et les dégradés.",
      },
      {
        title: "DTFlex",
        desc: "Dernière génération : toucher soyeux, excellente tenue sur tissus foncés, rendu premium.",
      },
      {
        title: "Flex / Vinyle",
        desc: "Découpe thermocollante — trait net, look sport et corporate, parfait pour logos simples et typographies.",
      },
      {
        title: "Broderie",
        desc: "Broderie machine haute définition — rendu premium et durable sur polos, vestes et softshells.",
      },
    ],
    process: [
      "Choisissez votre produit et votre technique dans le catalogue",
      "Personnalisez dans le studio en ligne (logo, texte, visuel) et visualisez le rendu",
      "Validez votre devis et votre bon à tirer (BAT)",
      "Nous produisons à l'atelier et vous livrons",
    ],
    faq: [
      {
        q: "Quelle quantité minimum pour personnaliser mes textiles ?",
        a: "Vous pouvez commander à partir d'une seule pièce en impression à la demande. À partir de 10 pièces, la production bascule sur notre atelier local pour un meilleur tarif.",
      },
      {
        q: "Quelles techniques de marquage proposez-vous ?",
        a: "DTF, DTFlex, flex / vinyle et broderie machine (dont broderie couleur illimitée). Nous vous orientons vers la technique la plus adaptée à votre visuel et à votre textile.",
      },
      {
        q: "Puis-je voir le rendu avant de commander ?",
        a: "Oui. Le studio en ligne affiche un aperçu en temps réel de votre marquage sur le produit, et un bon à tirer (BAT) vous est présenté avant la production.",
      },
      {
        q: "Puis-je commander et payer en ligne ?",
        a: "Oui, directement sur le site, par carte bancaire ou par virement bancaire. Vous n'êtes pas obligé de créer un compte pour commander.",
      },
      {
        q: "Où êtes-vous situés et livrez-vous ?",
        a: "Notre atelier est à Souffelweyersheim (67460), à quelques minutes de Strasbourg. Nous intervenons dans le Bas-Rhin et en Alsace, et livrons vos commandes partout en France.",
      },
    ],
    realisationCategory: "textile",
    ctaPrimaryLabel: "Personnaliser en ligne",
    ctaPrimaryHref: "/catalogue",
    ctaSecondaryLabel: "Demander un devis",
    ctaSecondaryHref: "/devis-rapide",
  },
];

/** Recherche une page locale par slug (pour generateStaticParams / generateMetadata). */
export function getLocalServicePage(slug: string): LocalServicePageData | undefined {
  return LOCAL_SERVICE_PAGES.find((p) => p.slug === slug);
}
