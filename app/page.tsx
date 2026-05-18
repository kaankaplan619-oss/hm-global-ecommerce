import HomeHeroPremium from "../components/home/HomeHeroPremium";
import HomeQuickEntries from "../components/home/HomeQuickEntries";
import HomeTextilePremium from "../components/home/HomeTextilePremium";
import BestSellers from "../components/home/BestSellers";
import HomeProcessBAT from "../components/home/HomeProcessBAT";
import HomeVisualShowcase from "../components/home/HomeVisualShowcase";
import HomeAtelier from "../components/home/HomeAtelier";
import HomePack360 from "../components/home/HomePack360";
import HomeTrustStrip from "../components/home/HomeTrustStrip";
import HomeFinalCTA from "../components/home/HomeFinalCTA";

/**
 * Homepage HM Global — refonte Corporate Créatif Premium (palette 2026).
 *
 * Structure 10 blocs avec visuels marketing intégrés :
 *   1. Hero principal              (pack agence 360)
 *   2. Entrées rapides             (3 cartes textile / print / pack)
 *   3. Textile premium             (hoodie porté + macro logo)
 *   4. Best-sellers textile        (Printify, intact)
 *   5. Process / BAT validation    (sérieux validation avant production)
 *   6. Section print               (4 cards devis cadré)
 *   7. Atelier / production        (presse atelier, plein écran)
 *   8. Pack communication complet  (livraison client + 5 livrables)
 *   9. Confiance — 4 items
 *   10. CTA final
 */
export default function HomePage() {
  return (
    <>
      <HomeHeroPremium />
      <HomeQuickEntries />
      <HomeTextilePremium />
      <BestSellers />
      <HomeProcessBAT />
      <HomeVisualShowcase />
      <HomeAtelier />
      <HomePack360 />
      <HomeTrustStrip />
      <HomeFinalCTA />
    </>
  );
}
