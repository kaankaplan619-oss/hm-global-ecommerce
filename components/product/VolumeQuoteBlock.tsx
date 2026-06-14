"use client";

import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * VolumeQuoteBlock — bloc discret "Besoin de 20 ou 30 pièces ?"
 *
 * Affiché sur les fiches produit textile pour orienter les pros vers le
 * formulaire devis volume sans casser le parcours commande individuelle.
 *
 * Wording :
 *   - Pas de prix garanti
 *   - Pas de promesse "12,90 €"
 *   - Seulement "solution de production optimisée" / "tarif volume possible"
 *
 * CTA :
 *   /contact?sujet=devis-volume-textile&produit={productSlug}
 *
 * Issu de la stratégie post-audit (docs/audits/textile-suppliers-comparison.md
 * + docs/strategy/internal-textile-production.md).
 */
interface VolumeQuoteBlockProps {
  productSlug: string;
}

export default function VolumeQuoteBlock({ productSlug }: VolumeQuoteBlockProps) {
  const t = useT();
  const href = `/contact?sujet=devis-volume-textile&produit=${encodeURIComponent(productSlug)}`;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-5 sm:flex-row sm:items-center sm:gap-5"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "rgba(76,47,111,0.10)",
          color: "var(--hm-purple)",
        }}
      >
        <ClipboardList size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[var(--hm-text)]">
          {t("volumeQuote.title")}
        </p>
        <p className="mt-1 text-[11.5px] leading-5 text-[var(--hm-text-soft)]">
          {t("volumeQuote.description")}
        </p>
      </div>

      <Link
        href={href}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-semibold transition hover:gap-2.5"
        style={{
          borderColor: "var(--hm-purple)",
          color: "var(--hm-purple)",
        }}
      >
        {t("volumeQuote.cta")}
        <ArrowRight size={11} />
      </Link>
    </div>
  );
}
