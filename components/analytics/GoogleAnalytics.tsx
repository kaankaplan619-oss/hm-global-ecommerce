"use client";

/**
 * GoogleAnalytics — GA4, chargé UNIQUEMENT si :
 *   1. NEXT_PUBLIC_GA_ID est défini (sinon no-op), et
 *   2. le consentement « analytics » est donné.
 *
 * Aucun script Google n'est injecté avant le consentement (privacy-first,
 * conforme CNIL). Réagit à l'événement `hm-consent-change` pour s'activer
 * dès que l'utilisateur accepte.
 */

import Script from "next/script";
import { useEffect, useState } from "react";
import { getStoredConsent } from "@/components/layout/CookieConsent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = () => setAllowed(getStoredConsent()?.analytics === true);
    check();
    window.addEventListener("hm-consent-change", check);
    return () => window.removeEventListener("hm-consent-change", check);
  }, []);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
