"use client";

/**
 * page.tsx — Checkout / Paiement
 *
 * ⚠️  NE PAS importer @stripe/stripe-js ni @stripe/react-stripe-js ici.
 *     Ces packages accèdent à `location` / `window` au chargement du module,
 *     ce qui crashe les serverless functions Next.js (ReferenceError: location).
 *
 *     Tout le code Stripe est isolé dans _stripe-payment.tsx, chargé avec
 *     `ssr: false` — il ne s'exécute que dans le navigateur.
 */

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Chargé uniquement côté client — empêche @stripe/stripe-js d'être évalué
// dans le bundle SSR / Node.js de Next.js.
const StripePayment = dynamic(
  () => import("./_stripe-payment"),
  {
    ssr: false,
    loading: () => (
      <div className="pt-24 pb-20 flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-[var(--hm-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function PaiementPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 pb-20 flex items-center justify-center min-h-[50vh]">
          <div className="w-6 h-6 border-2 border-[var(--hm-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <StripePayment />
    </Suspense>
  );
}
