import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Home, LayoutGrid, CheckCircle2, ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import DeliveryBadge from "@/components/shared/DeliveryBadge";
import TechniqueComparator from "@/components/shared/TechniqueComparator";
import { TEXTILE_USAGES, getUsageBySlug } from "@/data/textile-usages";
import { ALL_PRODUCTS } from "@/data/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return TEXTILE_USAGES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const usage = getUsageBySlug(slug);
  if (!usage) return {};
  return {
    title: `${usage.title} — Textile personnalisé`,
    description: usage.tagline,
  };
}

export default async function UsageLandingPage({ params }: Props) {
  const { slug } = await params;
  const usage = getUsageBySlug(slug);
  if (!usage) notFound();

  // Si usage "coming_soon" : page allégée renvoyant vers devis
  if (usage.status === "coming_soon") {
    return (
      <div className="pt-24 pb-20 md:pt-28">
        <div className="container max-w-2xl text-center">
          <p className="section-tag">{usage.title}</p>
          <h1 className="mb-4 text-3xl font-black text-[var(--hm-text)] md:text-4xl">
            Bientôt disponible
          </h1>
          <p className="mb-6 text-sm text-[var(--hm-text-soft)]">
            Cette catégorie d&apos;usage est en cours de construction. En attendant,
            on traite vos demandes individuellement — réponse sous 24 h ouvrées.
          </p>
          <Link
            href={`/contact?sujet=textile-usage&usage=${usage.slug}`}
            className="btn-primary inline-flex"
          >
            Demander un devis pour {usage.title.toLowerCase()}
          </Link>
        </div>
      </div>
    );
  }

  // Produits suggérés depuis les catégories
  const suggested = usage.suggestedCategories
    ? ALL_PRODUCTS.filter((p) => usage.suggestedCategories!.includes(p.category as never)).slice(0, 6)
    : [];

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
            href="/catalogue/usages"
            className="flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <LayoutGrid size={11} />
            Par usage
          </Link>
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
          <span className="rounded-full border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] px-3 py-1.5 text-[11px] font-bold text-[var(--hm-primary)]">
            {usage.title}
          </span>
        </nav>

        {/* Hero */}
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="section-tag">Usage métier</p>
            <h1 className="mb-4 text-3xl font-black text-[var(--hm-text)] md:text-5xl">
              {usage.title}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
              {usage.heroDescription ?? usage.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/catalogue" className="btn-primary">
                Voir tous les produits
              </Link>
              <Link
                href={`/contact?sujet=textile-usage&usage=${usage.slug}`}
                className="btn-outline"
              >
                Demander un devis
              </Link>
            </div>
          </div>

          {usage.benefits && usage.benefits.length > 0 && (
            <div className="card p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                Pourquoi HM Global pour ce secteur
              </p>
              <ul className="space-y-2.5">
                {usage.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--hm-rose)]" />
                    <p className="text-[12.5px] leading-snug text-[var(--hm-text-soft)]">{b}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Delivery */}
        <div className="mb-10">
          <DeliveryBadge variant="block" />
        </div>

        {/* Produits suggérés */}
        {suggested.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-lg font-bold text-[var(--hm-text)]">
                Sélection pour cet usage
              </h2>
              <div className="h-[1px] flex-1 bg-[var(--hm-line)]" />
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-1 text-xs text-[var(--hm-primary)] hover:underline"
              >
                Voir tout le catalogue
                <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {suggested.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Comparatif techniques */}
        <section>
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-bold text-[var(--hm-text)]">
              Quelle technique pour cet usage ?
            </h2>
            <p className="max-w-xl text-[12.5px] text-[var(--hm-text-soft)]">
              On vous résume vite — et notre équipe valide votre choix avant production.
            </p>
          </div>
          <TechniqueComparator />
        </section>
      </div>
    </div>
  );
}
