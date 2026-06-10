import HomeHeroPremium from "../components/home/HomeHeroPremium";
import HomeQuickEntries from "../components/home/HomeQuickEntries";
import HomeNeedsPacks from "../components/home/HomeNeedsPacks";
import HomeTextilePremium from "../components/home/HomeTextilePremium";
import BestSellers from "../components/home/BestSellers";
import HomeProcessBAT from "../components/home/HomeProcessBAT";
import HomeRealisations from "../components/home/HomeRealisations";
import HomeVisualShowcase from "../components/home/HomeVisualShowcase";
import HomeSignaletique from "../components/home/HomeSignaletique";
import HomeAtelier from "../components/home/HomeAtelier";
import HomePack360 from "../components/home/HomePack360";
import HomeTrustStrip from "../components/home/HomeTrustStrip";
import HomeFinalCTA from "../components/home/HomeFinalCTA";

/**
 * Homepage HM Global — orientation boutique (2026-06-10, demande Kaan).
 *
 * Le trafic arrive surtout d'Instagram (reels) : le visiteur doit voir
 * IMMÉDIATEMENT les produits achetables et leurs prix. Ordre :
 *   1. Hero (visuel textiles + CTA catalogue/impression)
 *   2. Best-sellers textile        (t-shirts, hoodies — prix affichés)
 *   3. Section print               (cartes, flyers, affiches, canvas — prix)
 *   4. Entrées rapides             (3 cartes textile / print / pack)
 *   5. Réalisations                (preuve : vrais projets)
 *   6. Process / BAT validation
 *   7. Textile premium             (qualité matière)
 *   8. Signalétique / enseignes    (devis)
 *   9. Atelier / production
 *   10. Packs par besoin + Pack 360 + confiance + CTA final
 */
export default function HomePage() {
  return (
    <>
      <HomeHeroPremium />
      <BestSellers />
      <HomeVisualShowcase />
      <HomeQuickEntries />
      <HomeRealisations />
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
