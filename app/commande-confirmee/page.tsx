"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Mail, Clock } from "lucide-react";
import { useAuthStore } from "@/store/auth";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId     = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 pt-[var(--site-header-offset)] pb-20">
      <div className="w-full max-w-lg text-center">

        {/* Icône succès */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full
          bg-[#dcfce7] border-2 border-[#86efac]">
          <CheckCircle2 size={40} className="text-[#166534]" />
        </div>

        {/* Titre */}
        <h1 className="mb-3 text-3xl font-black text-[var(--hm-text)]">
          Commande confirmée !
        </h1>

        {orderNumber && (
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)]
            bg-[var(--hm-surface)] px-4 py-2 text-sm font-semibold text-[var(--hm-text-soft)]">
            Référence : <span className="font-black text-[var(--hm-primary)]">{orderNumber}</span>
          </p>
        )}

        {/* Message principal */}
        <div className="mb-8 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6 text-left">
          <div className="flex items-start gap-3 mb-4">
            <Mail size={16} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--hm-text)] mb-1">
                Un email de confirmation va vous être envoyé
              </p>
              <p className="text-xs leading-6 text-[var(--hm-text-soft)]">
                Conservez le numéro de commande ci-dessus pour tout suivi.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--hm-text)] mb-1">
                Votre fichier sera vérifié avant production
              </p>
              <p className="text-xs leading-6 text-[var(--hm-text-soft)]">
                Nous vous contacterons si votre fichier nécessite des ajustements
                avant le lancement en production. Aucune pièce n&apos;est produite sans
                votre validation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={16} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--hm-text)] mb-1">
                Délai de production : 7 à 10 jours ouvrés
              </p>
              <p className="text-xs leading-6 text-[var(--hm-text-soft)]">
                Après validation du fichier. Livraison par transporteur avec numéro de suivi.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isAuthenticated && orderId && (
            <Link
              href={`/mon-compte/commandes/${orderId}`}
              className="btn-primary gap-2"
            >
              Voir ma commande
              <ArrowRight size={14} />
            </Link>
          )}
          <Link href="/catalogue" className="btn-outline gap-2">
            Continuer mes achats
          </Link>
        </div>

        {/* Contact */}
        <p className="mt-8 text-xs text-[var(--hm-text-muted)]">
          Une question ?{" "}
          <Link href="/contact" className="font-semibold text-[var(--hm-primary)] hover:underline">
            Contactez-nous
          </Link>
          {" "}— nous répondons sous 24h ouvrées.
        </p>

      </div>
    </div>
  );
}

export default function CommandeConfirmeePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--hm-primary)] border-t-transparent" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
