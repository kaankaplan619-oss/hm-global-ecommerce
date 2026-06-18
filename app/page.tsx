import type { Metadata } from "next";
import HomeHeroPremium from "../components/home/HomeHeroPremium";
import HomeReassurance from "../components/home/HomeReassurance";
import HomeClients from "../components/home/HomeClients";
import HomeNeedsPacks from "../components/home/HomeNeedsPacks";
import HomeTextilePremium from "../components/home/HomeTextilePremium";
import BestSellers from "../components/home/BestSellers";
import HomeProcessBAT from "../components/home/HomeProcessBAT";
import HomeRealisations from "../components/home/HomeRealisations";
import GoogleReviews from "../components/home/GoogleReviews";
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
 * Homepage HM Global — orientation boutique (2026-06-10, demande Kaan).
 *
 * Le trafic arrive surtout d'Instagram (reels) : le visiteur doit voir
 * IMMÉDIATEMENT les produits achetables et leurs prix, PUIS se reconnaître
 * par secteur (entrée « par besoin » remontée le 2026-06-15 — conversion).
 *   1. Hero (vraies photos atelier + CTA catalogue/impression)
 *   2. Réassurance + logos clients
 *   3. Best-sellers textile        (t-shirts, hoodies — prix affichés)
 *   4. Packs par besoin / secteur  (resto, asso, BTP… le visiteur se reconnaît)
 *   5. Réalisations + avis + process / BAT
 *   6. Textile premium / signalétique / atelier
 *   7. Pack 360 + confiance + CTA final
 */
export default function HomePage() {
  return (
    <>
      <HomeHeroPremium />
      <HomeReassurance />
      <HomeClients />
      <BestSellers />
      <HomeNeedsPacks />
      <HomeVisualShowcase />
      <HomeRealisations />
      <GoogleReviews />
      <HomeProcessBAT />
      <HomeTextilePremium />
      <HomeSignaletique />
      <HomeAtelier />
      <HomePack360 />
      <HomeTrustStrip />
      <HomeFinalCTA />
    </>
  );
}
