import type { Metadata } from "next";
import HomeHeroPremium from "../components/home/HomeHeroPremium";
import HomePoles from "../components/home/HomePoles";
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
 * Homepage HM Global — entreprise d'abord, puis boutique (2026-06-18, demande Kaan).
 *
 * Retour client : la home donnait trop l'impression d'un « magasin de vêtements ».
 * On présente donc D'ABORD l'AGENCE et ses pôles (textile, impression, enseignes,
 * covering, branding), PUIS les produits — sans casser la conversion (prix,
 * best-sellers, packs secteur et CTA catalogue restent visibles juste en dessous).
 *   1. Hero (message niveau entreprise + CTA « nos services » / catalogue)
 *   2. Pôles (les 5 savoir-faire de l'agence)        ← nouveau
 *   3. Réassurance + logos clients
 *   4. Best-sellers textile        (t-shirts, hoodies — prix affichés)
 *   5. Packs par besoin / secteur  (resto, asso, BTP… le visiteur se reconnaît)
 *   6. Réalisations + avis + process / BAT
 *   7. Textile premium / signalétique / atelier
 *   8. Pack 360 + confiance + CTA final
 */
export default function HomePage() {
  return (
    <>
      <HomeHeroPremium />
      <HomePoles />
      <HomeReassurance />
      <HomeClients />
      <BestSellers />
      <HomeNeedsPacks />
      <HomeVisualShowcase />
      <HomeRealisations />
      <GoogleReviews />
      <LocalTestimonials />
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
