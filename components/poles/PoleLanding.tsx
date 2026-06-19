import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
import BackLink from "@/components/ui/BackLink";

/**
 * PoleLanding — gabarit réutilisable des pages de pôle HM Global
 * (/enseignes, /covering, /branding).
 *
 * Présentationnel : la page (server component) résout l'i18n via getT() puis
 * passe les chaînes déjà traduites. DA HM Global (tokens --hm-*, section-tag,
 * cartes arrondies), aligné sur app/entreprises/page.tsx. Aucun chiffre/avis
 * inventé : uniquement de la prestation.
 */

export type PoleFeature = { title: string; desc: string };

export type PoleLandingProps = {
  backLabel: string;
  Icon: LucideIcon;
  accent: string;
  accentSoft: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  featuresTag: string;
  featuresHeading: string;
  features: PoleFeature[];
  processTag: string;
  processHeading: string;
  steps: string[];
  closingTag: string;
  closingHeading: string;
  closingText: string;
};

export default function PoleLanding(props: PoleLandingProps) {
  const {
    backLabel, Icon, accent, accentSoft,
    tag, title, subtitle,
    ctaPrimaryLabel, ctaPrimaryHref, ctaSecondaryLabel, ctaSecondaryHref,
    featuresTag, featuresHeading, features,
    processTag, processHeading, steps,
    closingTag, closingHeading, closingText,
  } = props;

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <BackLink href="/#nos-poles" label={backLabel} />

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="section-tag">{tag}</p>
              <h1 className="mb-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
                {subtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link href={ctaPrimaryHref} className="btn-primary gap-2">
                  {ctaPrimaryLabel}
                  <ArrowRight size={16} />
                </Link>
                <Link href={ctaSecondaryHref} className="btn-outline">
                  {ctaSecondaryLabel}
                </Link>
              </div>
            </div>

            {/* Panneau icône + prestations incluses */}
            <div className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: accentSoft, color: accent }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                {featuresTag}
              </p>
              <div className="mt-4 grid gap-2.5">
                {features.map((f) => (
                  <div key={f.title} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: accentSoft, color: accent }}
                    >
                      <Check size={12} />
                    </span>
                    <p className="text-sm leading-6 text-[var(--hm-text)]">{f.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Prestations détaillées ───────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">{featuresTag}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              {featuresHeading}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <article
                key={f.title}
                className="flex flex-col rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
              >
                <span
                  className="mb-4 inline-block h-[3px] w-10 rounded-full"
                  style={{ background: accent }}
                />
                <h3 className="text-lg font-semibold text-[var(--hm-text)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Process ──────────────────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">{processTag}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              {processHeading}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step}
                className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: accentSoft, color: accent }}
                >
                  {i + 1}
                </span>
                <p className="mt-4 text-sm font-medium leading-6 text-[var(--hm-text)]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA final ────────────────────────────────────────────────────── */}
        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="section-tag">{closingTag}</p>
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                {closingHeading}
              </h2>
              <p className="text-base leading-7 text-[var(--hm-text-soft)]">{closingText}</p>
            </div>
            <div className="flex flex-wrap gap-3.5 lg:justify-end">
              <Link href={ctaPrimaryHref} className="btn-primary gap-2">
                {ctaPrimaryLabel}
                <ArrowRight size={16} />
              </Link>
              <Link href={ctaSecondaryHref} className="btn-outline">
                {ctaSecondaryLabel}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
