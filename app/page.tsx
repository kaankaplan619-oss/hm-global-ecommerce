import type { Metadata } from "next";
import HomeHeroPremium from "../components/home/HomeHeroPremium";
import HomePoles from "../components/home/HomePoles";
import HomeAbout from "../components/home/HomeAbout";
import HomeHowItWorks from "../components/home/HomeHowItWorks";
import HomeReassurance from "../components/home/HomeReassurance";
import HomeClients from "../components/home/HomeClients";
import HomeNeedsPacks from "../components/home/HomeNeedsPacks";
import HomeTextilePremium from "../components/home/HomeTextilePremium";
import BestSellers from "../components/home/BestSellers";
import HomeProcessBAT from "../components/home/HomeProcessBAT";
import HomeRealisations from "../components/home/HomeRealisations";
import GoogleReviews from "../components/home/GoogleReviews";
import LocalTestimonials from "../components/home/LocalTestimonials";
import HomeVisualShowcase from "../components/home/HomeVisualShowcase";
import HomeSignaletique from "../components/home/HomeSignaletique";
import HomeAtelier from "../components/home/HomeAtelier";
import HomePack360 from "../components/home/HomePack360";
import HomeTrustStrip from "../components/home/HomeTrustStrip";
import HomeFinalCTA from "../components/home/HomeFinalCTA";

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
 * Homepage HM Global — l'agence d'abord, les produits en proposition (2026-06-19).
 *
 * Retour client (maman de Kaan) : les vêtements étaient trop mis en avant par
 * rapport à QUI on est. On renforce donc l'identité agence en haut (pôles +
 * « qui sommes-nous » + comment ça marche + preuve), et les produits/best-sellers
 * descendent plus bas, comme une PROPOSITION (la vente directe reste accessible).
 *   1. Hero (niveau entreprise) → Pôles → Qui sommes-nous → Comment ça marche
 *   2. Réassurance + logos clients + réalisations + avis + process / BAT
 *   3. Produits (best-sellers, packs secteur, textile premium) — en proposition
 *   4. Signalétique / atelier / pack 360 / confiance / CTA final
 */
export default function HomePage() {
  return (
    <>
      <HomeHeroPremium />
      <HomePoles />
      <HomeAbout />
      <HomeHowItWorks />
      <HomeReassurance />
      <HomeClients />
      <HomeVisualShowcase />
      <HomeRealisations />
      <GoogleReviews />
      <LocalTestimonials />
      <HomeProcessBAT />
      <BestSellers />
      <HomeNeedsPacks />
      <HomeTextilePremium />
      <HomeSignaletique />
      <HomeAtelier />
      <HomePack360 />
      <HomeTrustStrip />
      <HomeFinalCTA />
    </>
  );
}
