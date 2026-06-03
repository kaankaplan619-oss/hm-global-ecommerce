"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Mail, Clock, Landmark, Copy, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/data/pricing";

// ─── Bank transfer block ──────────────────────────────────────────────────────

interface BankInfo {
  beneficiary: string;
  iban:        string;
  bic:         string;
}

function BankTransferDetails({
  orderNumber,
  totalTTC,
}: {
  orderNumber: string;
  totalTTC:    number | null;
}) {
  const [bank,  setBank]  = useState<BankInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payment/bank-info")
      .then(async (res) => {
        if (!res.ok) throw new Error("Coordonnées bancaires indisponibles");
        return res.json();
      })
      .then((data) => { if (!cancelled) setBank(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, []);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {/* clipboard refused — silent */}
  };

  const rows: { key: string; label: string; value: string; mono?: boolean }[] = [
    ...(bank ? [
      { key: "beneficiary", label: "Bénéficiaire",  value: bank.beneficiary },
      { key: "iban",        label: "IBAN",          value: bank.iban, mono: true },
      { key: "bic",         label: "BIC",           value: bank.bic,  mono: true },
    ] : []),
    ...(totalTTC !== null ? [
      { key: "amount",      label: "Montant exact", value: formatPrice(totalTTC) },
    ] : []),
    { key: "reference",     label: "Référence (obligatoire)", value: orderNumber, mono: true },
  ];

  return (
    <div className="mb-8 rounded-2xl border border-[var(--hm-primary)]/30 bg-white p-6 text-left shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]">
          <Landmark size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--hm-text)]">Coordonnées bancaires</p>
          <p className="text-[11px] text-[var(--hm-text-soft)]">
            Effectuez le virement depuis votre banque en utilisant les informations ci-dessous.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>
            Coordonnées bancaires temporairement indisponibles.
            Contactez-nous pour obtenir l&rsquo;IBAN — référence : <strong>{orderNumber}</strong>.
          </span>
        </div>
      )}

      <dl className="flex flex-col divide-y divide-[var(--hm-line)]">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-[var(--hm-text-muted)]">
              {row.label}
            </dt>
            <dd className="flex items-center gap-2">
              <span className={`text-sm text-[var(--hm-text)] ${row.mono ? "font-mono" : "font-semibold"}`}>
                {row.value}
              </span>
              <button
                type="button"
                onClick={() => copy(row.value, row.key)}
                className="rounded-md border border-[var(--hm-line)] p-1.5 text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                aria-label={`Copier ${row.label}`}
                title="Copier"
              >
                <Copy size={11} />
              </button>
              {copied === row.key && (
                <span className="text-[10px] font-semibold text-[#16a34a]">Copié</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-[11px] leading-relaxed text-[#92400e]">
        ⏳ <strong>La production démarre après réception du virement.</strong>{" "}
        Indiquez bien la référence <span className="font-mono font-bold">{orderNumber}</span> dans
        le libellé de votre virement pour que nous puissions associer le paiement à votre commande.
      </p>
    </div>
  );
}

// ─── Confirmation content ─────────────────────────────────────────────────────

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId     = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const method      = searchParams.get("method");
  const { isAuthenticated } = useAuthStore();

  const isBankTransfer = method === "bank_transfer";

  // Récupère le total depuis l'API pour les commandes virement (l'URL ne le
  // porte pas, contrairement au flux Stripe). Sécurisé : la route renvoie
  // 401/404 si le user n'est pas owner / admin.
  const [orderTotalTTC, setOrderTotalTTC] = useState<number | null>(null);

  useEffect(() => {
    if (!isBankTransfer || !orderId) return;
    let cancelled = false;
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled || !data?.order) return;
        setOrderTotalTTC(data.order.totalTTC ?? null);
      })
      .catch(() => {/* ignore — fallback affiche sans montant */});
    return () => { cancelled = true; };
  }, [isBankTransfer, orderId]);

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
          {isBankTransfer ? "Commande enregistrée !" : "Commande confirmée !"}
        </h1>

        {orderNumber && (
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)]
            bg-[var(--hm-surface)] px-4 py-2 text-sm font-semibold text-[var(--hm-text-soft)]">
            Référence : <span className="font-black text-[var(--hm-primary)]">{orderNumber}</span>
          </p>
        )}

        {/* Bloc virement bancaire — affiché uniquement si method=bank_transfer */}
        {isBankTransfer && orderNumber && (
          <BankTransferDetails
            orderNumber={orderNumber}
            totalTTC={orderTotalTTC}
          />
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
                {isBankTransfer
                  ? "Décompté à partir de la réception de votre virement et de la validation du fichier."
                  : "Après validation du fichier. Livraison par transporteur avec numéro de suivi."}
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
