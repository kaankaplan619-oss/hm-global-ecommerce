import type { Metadata } from "next";
import Link from "next/link";
import { Home, LayoutGrid } from "lucide-react";
import PackCard from "@/components/shared/PackCard";
import DeliveryBadge from "@/components/shared/DeliveryBadge";
import { getActivePacks } from "@/data/textile-packs";

export const metadata: Metadata = {
  title: "Packs B2B textile — Staff, association, restaurant",
  description:
    "Packs textile prêts à commander : Pack Staff 10, Pack Association. T-shirts personnalisés, BAT visuel inclus, livraison France offerte dès 10 pièces.",
};

export default function PacksHubPage() {
  const packs = getActivePacks();

  return (
    <div className="pt-24 pb-20 md:pt-28">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-10 flex flex-wrap items-center gap-1.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <Home size={11} />
            Accueil
          </Link>
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
          <Link
            href="/catalogue"
            className="flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <LayoutGrid size={11} />
            Catalogue
          </Link>
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
          <span className="rounded-full border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] px-3 py-1.5 text-[11px] font-bold text-[var(--hm-primary)]">
            Packs B2B
          </span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <p className="section-tag">Packs B2B textile</p>
          <h1 className="mb-4 text-3xl font-black text-[var(--hm-text)] md:text-5xl">
            Pas envie de tout configurer ?<br />
            <span className="text-gradient-gold">Choisissez un pack.</span>
          </h1>
          <p className="max-w-2xl text-sm text-[var(--hm-text-soft)]">
            Combos prêts à commander pour les besoins B2B les plus fréquents.
            Prix indicatifs — validés sur devis personnalisé selon vos couleurs et tailles.
          </p>
        </div>

        {/* Delivery strip */}
        <div className="mb-10">
          <DeliveryBadge variant="block" />
        </div>

        {/* Packs grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {packs.map((pack) => (
            <PackCard key={pack.slug} pack={pack} variant="detail" />
          ))}
        </div>

        {/* Notice tarifaire */}
        <div className="mt-10 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
            À propos des prix packs
          </p>
          <p className="text-[12.5px] leading-relaxed text-[var(--hm-text-soft)]">
            Les prix affichés sont indicatifs. Le devis final tient compte de vos
            couleurs, tailles, complexité du logo et adresse de livraison. Notre
            équipe revient vers vous sous 24 h ouvrées avec un devis détaillé et
            un BAT visuel avant production.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="mb-3 text-[12.5px] text-[var(--hm-text-soft)]">
            Besoin d&apos;un pack sur mesure (mélange t-shirts + polos + hoodies) ?
          </p>
          <Link
            href="/contact?sujet=pack-sur-mesure"
            className="btn-outline inline-flex"
          >
            Composer un pack sur mesure
          </Link>
        </div>
      </div>
    </div>
  );
}
