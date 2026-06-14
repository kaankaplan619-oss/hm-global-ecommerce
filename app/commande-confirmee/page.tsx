"use client";

import { Suspense, useEffect, useState } from "react";
import { track } from "@/lib/track";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Mail, Clock, Landmark, Copy, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/data/pricing";
import { useT } from "@/components/i18n/I18nProvider";

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
  const t = useT();
  const [bank,  setBank]  = useState<BankInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payment/bank-info")
      .then(async (res) => {
        if (!res.ok) throw new Error(t("confirmation.bank.unavailableError"));
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
      { key: "beneficiary", label: t("confirmation.bank.beneficiary"), value: bank.beneficiary },
      { key: "iban",        label: "IBAN",          value: bank.iban, mono: true },
      { key: "bic",         label: "BIC",           value: bank.bic,  mono: true },
    ] : []),
    ...(totalTTC !== null ? [
      { key: "amount",      label: t("confirmation.bank.exactAmount"), value: formatPrice(totalTTC) },
    ] : []),
    { key: "reference",     label: t("confirmation.bank.reference"), value: orderNumber, mono: true },
  ];

  return (
    <div className="mb-8 rounded-2xl border border-[var(--hm-primary)]/30 bg-white p-6 text-left shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]">
          <Landmark size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--hm-text)]">{t("confirmation.bank.title")}</p>
          <p className="text-[11px] text-[var(--hm-text-soft)]">
            {t("confirmation.bank.subtitle")}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <span>
            {t("confirmation.bank.errorText")} <strong>{orderNumber}</strong>.
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
                aria-label={`${t("confirmation.bank.copyAria")} ${row.label}`}
                title={t("confirmation.bank.copy")}
              >
                <Copy size={11} />
              </button>
              {copied === row.key && (
                <span className="text-[10px] font-semibold text-[#16a34a]">{t("confirmation.bank.copied")}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-[11px] leading-relaxed text-[#92400e]">
        ⏳ <strong>{t("confirmation.bank.noticeLead")}</strong>{" "}
        {t("confirmation.bank.noticeBefore")} <span className="font-mono font-bold">{orderNumber}</span>{" "}
        {t("confirmation.bank.noticeAfter")}
      </p>
    </div>
  );
}

// ─── Confirmation content ─────────────────────────────────────────────────────

function ConfirmationContent() {
  const t = useT();
  const searchParams = useSearchParams();
  const orderId     = searchParams.get("orderId");
  const orderNumber = searchParams.get("orderNumber");
  const method      = searchParams.get("method");
  const { isAuthenticated } = useAuthStore();

  const isBankTransfer = method === "bank_transfer";

  // Mesure : achat confirmé (une fois)
  useEffect(() => {
    track("purchase", { orderNumber: orderNumber ?? undefined, method: method ?? undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {isBankTransfer ? t("confirmation.hero.titleBank") : t("confirmation.hero.title")}
        </h1>

        {orderNumber && (
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)]
            bg-[var(--hm-surface)] px-4 py-2 text-sm font-semibold text-[var(--hm-text-soft)]">
            {t("confirmation.referenceLabel")} <span className="font-black text-[var(--hm-primary)]">{orderNumber}</span>
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
                {t("confirmation.email.title")}
              </p>
              <p className="text-xs leading-6 text-[var(--hm-text-soft)]">
                {t("confirmation.email.body")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--hm-text)] mb-1">
                {t("confirmation.check.title")}
              </p>
              <p className="text-xs leading-6 text-[var(--hm-text-soft)]">
                {t("confirmation.check.body")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={16} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--hm-text)] mb-1">
                {t("confirmation.delay.title")}
              </p>
              <p className="text-xs leading-6 text-[var(--hm-text-soft)]">
                {isBankTransfer
                  ? t("confirmation.delay.bodyBank")
                  : t("confirmation.delay.body")}
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
              {t("confirmation.cta.viewOrder")}
              <ArrowRight size={14} />
            </Link>
          )}
          <Link href="/catalogue" className="btn-outline gap-2">
            {t("confirmation.cta.continueShopping")}
          </Link>
        </div>

        {/* Contact */}
        <p className="mt-8 text-xs text-[var(--hm-text-muted)]">
          {t("confirmation.contact.lead")}{" "}
          <Link href="/contact" className="font-semibold text-[var(--hm-primary)] hover:underline">
            {t("confirmation.contact.link")}
          </Link>
          {" "}{t("confirmation.contact.tail")}
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
