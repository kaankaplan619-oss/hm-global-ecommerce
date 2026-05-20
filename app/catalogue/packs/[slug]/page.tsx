import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Home, LayoutGrid, CheckCircle2, ArrowRight, Package2 } from "lucide-react";
import DeliveryBadge from "@/components/shared/DeliveryBadge";
import { formatPrice } from "@/data/pricing";
import { TEXTILE_PACKS, getPackBySlug } from "@/data/textile-packs";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return TEXTILE_PACKS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pack = getPackBySlug(slug);
  if (!pack) return {};
  return {
    title: `${pack.name} — Pack textile B2B`,
    description: pack.tagline,
  };
}

export default async function PackDetailPage({ params }: Props) {
  const { slug } = await params;
  const pack = getPackBySlug(slug);
  if (!pack) notFound();

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
            href="/catalogue/packs"
            className="flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <LayoutGrid size={11} />
            Packs B2B
          </Link>
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>
          <span className="rounded-full border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] px-3 py-1.5 text-[11px] font-bold text-[var(--hm-primary)]">
            {pack.name}
          </span>
        </nav>

        {/* Hero */}
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="section-tag">Pack B2B textile</p>
            <h1 className="mb-3 text-3xl font-black text-[var(--hm-text)] md:text-5xl">
              {pack.name}
            </h1>
            <p className="mb-4 text-base text-[var(--hm-text)] font-semibold">
              {pack.tagline}
            </p>
            <p className="text-sm text-[var(--hm-text-soft)]">
              <strong>Pour :</strong> {pack.target}
            </p>
            <p className="mt-4 text-[12px] text-[var(--hm-text-soft)]">
              ⏱ {pack.delay}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={pack.ctaHref} className="btn-primary inline-flex">
                {pack.ctaLabel}
                <ArrowRight size={14} className="ml-1" />
              </Link>
              <Link href="/catalogue/packs" className="btn-outline inline-flex">
                Voir les autres packs
              </Link>
            </div>
          </div>

          {/* Price card */}
          <div
            className="card p-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(177,63,116,0.06) 0%, rgba(95,168,210,0.05) 100%)",
            }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Package2 size={18} className="text-[var(--hm-rose)]" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                Tarif indicatif
              </p>
            </div>
            <p className="mb-2">
              <span className="text-3xl font-black text-[var(--hm-rose)]">
                {formatPrice(pack.priceTTC)}
              </span>
              <span className="ml-1 text-xs font-semibold text-[var(--hm-text-soft)]">TTC</span>
            </p>
            {pack.savings && (
              <p className="mb-3 text-[11.5px] text-[var(--hm-text-soft)]">
                {pack.savings}
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-[var(--hm-text-soft)]">
              Le devis final tient compte de vos couleurs, tailles, et complexité
              du logo. Réponse sous 24 h ouvrées avec BAT visuel.
            </p>
          </div>
        </div>

        {/* Delivery strip */}
        <div className="mb-10">
          <DeliveryBadge variant="block" />
        </div>

        {/* Contenu détaillé du pack */}
        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="mb-4 text-lg font-black text-[var(--hm-text)]">
              Contenu du pack
            </h2>
            <ul className="space-y-3">
              {pack.items.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-[11px] font-bold text-[var(--hm-rose)]">
                    {item.quantity}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--hm-text)]">
                      {item.label}
                    </p>
                    {item.detail && (
                      <p className="text-[11.5px] text-[var(--hm-text-soft)]">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-black text-[var(--hm-text)]">
              Pourquoi ce pack
            </h2>
            <ul className="space-y-2.5">
              {pack.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--hm-rose)]" />
                  <p className="text-[12.5px] leading-snug text-[var(--hm-text-soft)]">{b}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-6 text-center">
          <p className="mb-2 text-sm font-bold text-[var(--hm-text)]">
            Ce pack ne correspond pas exactement à votre besoin ?
          </p>
          <p className="mb-4 text-[12.5px] text-[var(--hm-text-soft)]">
            On adapte facilement le contenu (autre textile, autre marquage, plus de pièces).
          </p>
          <Link href={pack.ctaHref} className="btn-primary inline-flex">
            Adapter ce pack à mon projet
          </Link>
        </div>
      </div>
    </div>
  );
}
