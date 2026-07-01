import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Plus } from "lucide-react";
import BackLink from "@/components/ui/BackLink";
import AtelierAlsaceBlock from "@/components/local/AtelierAlsaceBlock";
import { REALISATIONS } from "@/data/realisations";
import type { LocalServicePageData } from "@/data/local-seo";

/**
 * LocalServicePage — gabarit des pages SEO locales (« <service> Strasbourg »).
 *
 * Server component présentationnel : reçoit le contenu réel (data/local-seo.ts)
 * et illustre avec de VRAIES réalisations (data/realisations.ts) filtrées par
 * catégorie. DA HM Global (tokens --hm-*, accent rose, cartes arrondies).
 * FAQ en <details> natif → contenu dans le DOM (bon pour le SEO, sans JS).
 */

export default function LocalServicePage({ data }: { data: LocalServicePageData }) {
  const realisations = data.realisationCategory
    ? REALISATIONS.filter((r) => r.category === data.realisationCategory).slice(0, 6)
    : [];

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <BackLink href="/" label="Accueil" />

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(249,237,243,0.6)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="section-tag">{data.tag}</p>
              <h1 className="mb-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
                {data.h1}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
                {data.intro}
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link href={data.ctaPrimaryHref} className="btn-primary gap-2">
                  {data.ctaPrimaryLabel}
                  <ArrowRight size={16} />
                </Link>
                <Link href={data.ctaSecondaryHref} className="btn-outline">
                  {data.ctaSecondaryLabel}
                </Link>
              </div>
            </div>

            {/* Atouts différenciants */}
            <div className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                Ce qui nous distingue
              </p>
              <div className="mt-4 grid gap-2.5">
                {data.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)]">
                      <Check size={12} />
                    </span>
                    <p className="text-sm leading-6 text-[var(--hm-text)]">{h}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ─────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">Nos techniques</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              Des marquages adaptés à chaque support
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {data.services.map((s) => (
              <article
                key={s.title}
                className="flex flex-col rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
              >
                <span className="mb-4 inline-block h-[3px] w-10 rounded-full bg-[var(--hm-rose)]" />
                <h3 className="text-lg font-semibold text-[var(--hm-text)]">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Réalisations réelles ─────────────────────────────────────────── */}
        {realisations.length > 0 && (
          <section className="mb-14">
            <div className="mb-8 max-w-2xl">
              <p className="section-tag">Réalisations</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                Des projets réels, en Alsace
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {realisations.map((r) => (
                <figure
                  key={r.id}
                  className="overflow-hidden rounded-[1.5rem] border border-[var(--hm-line)] bg-white"
                >
                  <div className="relative aspect-[4/3] w-full bg-[var(--hm-surface)]">
                    <Image
                      src={r.image}
                      alt={r.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="p-4">
                    <p className="text-sm font-semibold text-[var(--hm-text)]">{r.title}</p>
                    <p className="mt-1 text-xs text-[var(--hm-text-muted)]">
                      {r.tags.join(" · ")}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="mt-7">
              <Link href="/realisations" className="btn-outline">
                Voir toutes les réalisations
              </Link>
            </div>
          </section>
        )}

        {/* ── Process ──────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">Comment ça marche</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              De l&apos;idée à la livraison, en ligne
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.process.map((step, i) => (
              <div
                key={step}
                className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-sm font-bold text-[var(--hm-rose)]">
                  {i + 1}
                </span>
                <p className="mt-4 text-sm font-medium leading-6 text-[var(--hm-text)]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bloc atelier local ───────────────────────────────────────────── */}
        <div className="mb-14">
          <AtelierAlsaceBlock />
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        {data.faq.length > 0 && (
          <section className="mb-14">
            <div className="mb-8 max-w-2xl">
              <p className="section-tag">Questions fréquentes</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                Vous vous demandez peut-être…
              </h2>
            </div>

            <div className="grid gap-3">
              {data.faq.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[var(--hm-text)]">
                    {f.q}
                    <Plus className="h-4 w-4 shrink-0 text-[var(--hm-rose)] transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[var(--hm-text-soft)]">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA final ────────────────────────────────────────────────────── */}
        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="section-tag">Lancez votre projet</p>
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                Prêt à personnaliser à Strasbourg ?
              </h2>
              <p className="text-base leading-7 text-[var(--hm-text-soft)]">
                Composez votre marquage en ligne et obtenez votre prix immédiatement, ou demandez un devis pour un projet sur mesure.
              </p>
            </div>
            <div className="flex flex-wrap gap-3.5 lg:justify-end">
              <Link href={data.ctaPrimaryHref} className="btn-primary gap-2">
                {data.ctaPrimaryLabel}
                <ArrowRight size={16} />
              </Link>
              <Link href={data.ctaSecondaryHref} className="btn-outline">
                {data.ctaSecondaryLabel}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
