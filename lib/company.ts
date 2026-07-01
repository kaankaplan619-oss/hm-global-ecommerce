/**
 * lib/company.ts
 *
 * Coordonnées RÉELLES de HM Global Agence — source unique pour les composants
 * de confiance/SEO (bloc atelier, FAQ, pages locales). Valeurs alignées sur
 * components/seo/LocalBusinessJsonLd.tsx (fiche schema.org).
 *
 * Ne pas inventer : toute modification doit refléter une donnée réelle validée.
 */

export const COMPANY = {
  name: "HM Global Agence",
  streetAddress: "20 Rue des Tuileries",
  postalCode: "67460",
  city: "Souffelweyersheim",
  region: "Alsace",
  phone: "+33676161188",
  phoneDisplay: "06 76 16 11 88",
  email: "contact@hmga.fr",
  hoursDisplay: "Lun–Ven, 9h–18h",
} as const;

/** Lien Google Maps vers l'atelier (recherche par nom + ville). */
export const COMPANY_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(
    `${COMPANY.name} ${COMPANY.streetAddress} ${COMPANY.postalCode} ${COMPANY.city}`,
  );
