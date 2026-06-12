/**
 * LocalBusinessJsonLd.tsx
 *
 * Données structurées schema.org "LocalBusiness" pour le SEO LOCAL
 * (Strasbourg / Alsace) : Google peut afficher la fiche (adresse, horaires,
 * téléphone, zone desservie, réseaux sociaux) dans les résultats et la carte.
 *
 * Coordonnées RÉELLES (cf. footer / page À propos). Injecté une fois dans le
 * layout → présent sur tout le site.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr";

const DATA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: "HM Global Agence",
  description:
    "Agence de communication visuelle en Alsace : textile personnalisé (broderie, DTF, flex), impression (cartes, flyers, affiches), signalétique et accompagnement graphique pour les entreprises.",
  url: SITE_URL,
  logo: `${SITE_URL}/logo/hm-global-logo.png`,
  image: `${SITE_URL}/logo/hm-global-logo.png`,
  email: "contact@hmga.fr",
  telephone: "+33676161188",
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: "20 Rue des Tuileries",
    postalCode: "67460",
    addressLocality: "Souffelweyersheim",
    addressRegion: "Grand Est",
    addressCountry: "FR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 48.6306,
    longitude: 7.7560,
  },
  areaServed: [
    { "@type": "City", name: "Strasbourg" },
    { "@type": "AdministrativeArea", name: "Bas-Rhin" },
    { "@type": "AdministrativeArea", name: "Alsace" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/hmglobalagence/",
    "https://www.facebook.com/HmGlobalAgence",
  ],
};

export default function LocalBusinessJsonLd() {
  return (
    <script
      type="application/ld+json"
      // JSON statique maîtrisé → injection sûre.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(DATA) }}
    />
  );
}
