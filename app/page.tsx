import type { Metadata } from "next";
import HomeClients from "../components/home/HomeClients";
import GoogleReviews from "../components/home/GoogleReviews";
import HomeV3Hero from "../components/home/v3/HomeV3Hero";
import HomeV3Journeys from "../components/home/v3/HomeV3Journeys";
import HomeV3Proof from "../components/home/v3/HomeV3Proof";
import HomeV3Featured from "../components/home/v3/HomeV3Featured";
import HomeV3Reels from "../components/home/v3/HomeV3Reels";
import HomeV3Process from "../components/home/v3/HomeV3Process";
import HomeV3Shop from "../components/home/v3/HomeV3Shop";
import HomeV3Agence from "../components/home/v3/HomeV3Agence";
import HomeV3Erasmus from "../components/home/v3/HomeV3Erasmus";
import HomeV3FinalCTA from "../components/home/v3/HomeV3FinalCTA";

export const metadata: Metadata = {
  title: "Agence de communication visuelle à Strasbourg",
  description:
    "Textile personnalisé, impression, enseignes et signalétique pour les entreprises à Strasbourg et en Alsace. Atelier local, BAT avant production et devis sous 24h.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HM Global — Communication visuelle, textile et enseignes en Alsace",
    description:
      "Un atelier local pour habiller votre équipe, vos murs et votre vitrine. Textile personnalisé, print, enseignes et signalétique.",
    url: "/",
    images: [
      {
        url: "/images/home/hm-hero-atelier-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Atelier HM Global à Souffelweyersheim",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HM Global — Communication visuelle à Strasbourg",
    description:
      "Textile personnalisé, impression, enseignes et signalétique depuis notre atelier en Alsace.",
    images: ["/images/home/hm-hero-atelier-v2.jpg"],
  },
};

/**
 * Homepage V3 — agence locale d'abord, commande directe ensuite.
 * Trois parcours distincts : projet complet, boutique express et entreprises.
 * Les preuves réelles précèdent les produits pour installer la confiance.
 */
export default function HomePage() {
  return (
    <>
      <HomeV3Hero />
      <HomeV3Journeys />
      <HomeV3Proof />
      <HomeV3Reels />
      <HomeV3Process />
      <HomeClients />
      <GoogleReviews />
      <HomeV3Shop />
      <HomeV3Agence />
      <HomeV3Erasmus />
      <HomeV3FinalCTA />
      <HomeV3Featured />
    </>
  );
}
