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
 * IMMÉDIATEMENT les produits achetables et leurs prix. Ordre :
 *   1. Hero (vraies photos atelier + CTA catalogue/impression)
 *   2. Best-sellers textile        (t-shirts, hoodies — prix affichés)
 *   3. Section print               (cartes, flyers, affiches, canvas — prix)
 *   4. Réalisations                (preuve : vrais projets — remplace les
 *      « entrées rapides » aux images stock, retirées le 2026-06-10)
 *   5. Process / BAT validation
 *   6. Textile premium             (qualité matière)
 *   7. Signalétique / enseignes    (devis)
 *   8. Atelier / production
 *   9. Packs par besoin + Pack 360 + confiance + CTA final
 */
export default function HomePage() {
  return (
    <>
      <HomeHeroPremium />
      <HomeReassurance />
      <HomeClients />
      <BestSellers />
      <HomeVisualShowcase />
      <HomeRealisations />
      <GoogleReviews />
      <HomeProcessBAT />
      <HomeTextilePremium />
      <HomeSignaletique />
      <HomeAtelier />
      <HomeNeedsPacks />
      <HomePack360 />
      <HomeTrustStrip />
      <HomeFinalCTA />
    </>
  );
}
