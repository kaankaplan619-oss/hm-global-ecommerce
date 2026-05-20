import type { Metadata } from "next";
import Link from "next/link";
import { Home, LayoutGrid } from "lucide-react";
import UsageCard from "@/components/shared/UsageCard";
import DeliveryBadge from "@/components/shared/DeliveryBadge";
import { TEXTILE_USAGES } from "@/data/textile-usages";

export const metadata: Metadata = {
  title: "Textile par usage — Staff, restaurant, association, événement",
  description:
    "Choisissez le bon textile personnalisé selon votre secteur : équipes staff, restauration, associations, événementiel, BTP, merch premium. Conseil HM Global humain et BAT visuel.",
};

export default function UsagesHubPage() {
  return (
    <div className="pt-24 pb-20 md:pt-28">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-10 flex flex-wrap items-center gap-1.5">
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <Home size={11} />
            Accueil
          </Link>
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
          <Link
            href="/catalogue"
            className="group flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <LayoutGrid size={11} />
            Catalogue
          </Link>
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
          <span className="rounded-full border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] px-3 py-1.5 text-[11px] font-bold text-[var(--hm-primary)]">
            Par usage
          </span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <p className="section-tag">Catalogue par usage</p>
          <h1 className="mb-4 text-3xl font-black text-[var(--hm-text)] md:text-5xl">
            Trouvez le bon textile<br />
            <span className="text-gradient-gold">selon votre secteur</span>
          </h1>
          <p className="max-w-2xl text-sm text-[var(--hm-text-soft)]">
            Chaque secteur a ses contraintes : matière, marquage, budget, délais.
            On vous aide à choisir le bon combo sans perdre de temps en allers-retours.
          </p>
        </div>

        {/* Delivery strip */}
        <div className="mb-10">
          <DeliveryBadge variant="block" />
        </div>

        {/* Grid usages */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {TEXTILE_USAGES.map((usage) => (
            <UsageCard key={usage.slug} usage={usage} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-6 text-center">
          <p className="mb-2 text-sm font-bold text-[var(--hm-text)]">
            Votre usage n&apos;est pas listé ?
          </p>
          <p className="mb-4 text-[12.5px] text-[var(--hm-text-soft)]">
            Parlez-nous de votre projet — on revient sous 24 h avec une recommandation.
          </p>
          <Link
            href="/contact?sujet=devis"
            className="btn-primary inline-flex"
          >
            Demander un conseil personnalisé
          </Link>
        </div>
      </div>
    </div>
  );
}
