"use client";

/**
 * AnalyticsTracker — Pages vues FIRST-PARTY (RGPD).
 *
 * Monté une fois dans le layout. Envoie un `pageview` à chaque changement de
 * route, UNIQUEMENT si le consentement « analytics » est donné (cf. lib/track).
 * Les autres événements (add_to_cart, begin_checkout, purchase…) sont émis via
 * `track()` directement depuis les composants/stores concernés.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  // Pageview à chaque navigation
  useEffect(() => {
    track("pageview");
  }, [pathname]);

  // Si l'utilisateur accepte le consentement en cours de session, enregistre la
  // page courante immédiatement (sans attendre la prochaine navigation).
  useEffect(() => {
    const onConsent = () => track("pageview");
    window.addEventListener("hm-consent-change", onConsent);
    return () => window.removeEventListener("hm-consent-change", onConsent);
  }, []);

  return null;
}
