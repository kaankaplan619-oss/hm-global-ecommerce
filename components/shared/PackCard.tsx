import Link from "next/link";
import { ArrowRight, Package2, Clock3 } from "lucide-react";
import { formatPrice } from "@/data/pricing";
import type { TextilePack } from "@/data/textile-packs";

interface PackCardProps {
  pack: TextilePack;
  /** "strip" = format horizontal home / "detail" = grand format hub. */
  variant?: "strip" | "detail";
}

/**
 * Carte pack B2B textile.
 *
 * V1 — pas d'ajout panier direct. CTA renvoie vers contact / devis pré-rempli.
 */
export default function PackCard({ pack, variant = "strip" }: PackCardProps) {
  return (
    <Link
      href={pack.ctaHref}
      className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-[var(--hm-line)] bg-white transition duration-300 hover:-translate-y-1 hover:border-[var(--hm-rose)]/40 hover:shadow-[0_18px_36px_rgba(177,63,116,0.10)]"
    >
      {/* Header coloré (pas d'image fournisseur — gradient brand) */}
      <div
        className="relative flex items-center gap-3 px-5 py-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(177,63,116,0.10) 0%, rgba(95,168,210,0.08) 100%)",
          borderBottom: "1px solid var(--hm-line)",
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
          <Package2 size={18} className="text-[var(--hm-rose)]" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
            Pack B2B prêt à commander
          </p>
          <h3 className="mt-0.5 text-base font-bold leading-tight text-[var(--hm-text)]">
            {pack.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-3 text-[12.5px] font-semibold text-[var(--hm-text)]">
          {pack.tagline}
        </p>
        <p className="mb-4 text-[11.5px] leading-relaxed text-[var(--hm-text-soft)]">
          Pour : {pack.target}
        </p>

        {variant === "detail" && (
          <ul className="mb-4 space-y-1.5 text-[11.5px] text-[var(--hm-text-soft)]">
            {pack.items.map((item) => (
              <li key={item.label} className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--hm-rose)]" />
                <span>
                  <strong className="text-[var(--hm-text)]">{item.quantity}×</strong>{" "}
                  {item.label}
                  {item.detail && (
                    <span className="text-[10.5px] text-[var(--hm-text-muted)]"> · {item.detail}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-[var(--hm-text-soft)]">Indicatif </span>
              <span className="text-xl font-black text-[var(--hm-rose)]">
                {formatPrice(pack.priceTTC)}
              </span>
              <span className="text-[10px] text-[var(--hm-text-soft)]"> TTC</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10.5px] text-[var(--hm-text-soft)]">
              <Clock3 size={11} />
              {pack.delay.split("·")[0].trim()}
            </span>
          </div>

          {pack.savings && (
            <p className="text-[10.5px] text-[var(--hm-text-soft)]">
              {pack.savings}
            </p>
          )}

          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--hm-rose)] transition group-hover:gap-2.5">
            {pack.ctaLabel}
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
