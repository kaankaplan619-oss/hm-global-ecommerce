import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import { TechniqueArtById } from "@/components/illustrations/TechniqueArt";
import { getT } from "@/lib/i18n/server";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Layers3,
  Scissors,
  Shirt,
  Sparkles,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Techniques de personnalisation",
  description:
    "Découvrez les différences entre DTF, flex et broderie avec HM Global Agence, et choisissez la technique la plus adaptée à votre textile, votre logo et votre usage.",
};

const TECHNIQUES = [
  {
    id: "dtf",
    icon: Zap,
    labelKey: "techniquesPage.tech.dtf.label",
    taglineKey: "techniquesPage.tech.dtf.tagline",
    accent: "text-[var(--hm-primary)]",
    iconBg: "bg-[var(--hm-accent-soft-rose)]",
    descriptionKey: "techniquesPage.tech.dtf.description",
    strengthKeys: [
      "techniquesPage.tech.dtf.strength1",
      "techniquesPage.tech.dtf.strength2",
      "techniquesPage.tech.dtf.strength3",
    ],
    limitsKey: "techniquesPage.tech.dtf.limits",
    bestForKey: "techniquesPage.tech.dtf.bestFor",
  },
  {
    id: "flex",
    icon: Scissors,
    labelKey: "techniquesPage.tech.flex.label",
    taglineKey: "techniquesPage.tech.flex.tagline",
    accent: "text-[var(--hm-blue)]",
    iconBg: "bg-[var(--hm-accent-soft-blue)]",
    descriptionKey: "techniquesPage.tech.flex.description",
    strengthKeys: [
      "techniquesPage.tech.flex.strength1",
      "techniquesPage.tech.flex.strength2",
      "techniquesPage.tech.flex.strength3",
    ],
    limitsKey: "techniquesPage.tech.flex.limits",
    bestForKey: "techniquesPage.tech.flex.bestFor",
  },
  {
    id: "broderie",
    icon: Award,
    labelKey: "techniquesPage.tech.broderie.label",
    taglineKey: "techniquesPage.tech.broderie.tagline",
    accent: "text-[var(--hm-purple)]",
    iconBg: "bg-[var(--hm-accent-soft-purple)]",
    descriptionKey: "techniquesPage.tech.broderie.description",
    strengthKeys: [
      "techniquesPage.tech.broderie.strength1",
      "techniquesPage.tech.broderie.strength2",
      "techniquesPage.tech.broderie.strength3",
    ],
    limitsKey: "techniquesPage.tech.broderie.limits",
    bestForKey: "techniquesPage.tech.broderie.bestFor",
  },
] as const;

const CHOICE_GUIDE = [
  {
    titleKey: "techniquesPage.choice.multicolor.title",
    answerKey: "techniquesPage.choice.multicolor.answer",
  },
  {
    titleKey: "techniquesPage.choice.text.title",
    answerKey: "techniquesPage.choice.text.answer",
  },
  {
    titleKey: "techniquesPage.choice.premium.title",
    answerKey: "techniquesPage.choice.premium.answer",
  },
  {
    titleKey: "techniquesPage.choice.hesitate.title",
    answerKey: "techniquesPage.choice.hesitate.answer",
  },
] as const;

const PRODUCT_FIT = [
  {
    productKey: "techniquesPage.fit.tshirts.product",
    dtfKey: "techniquesPage.fit.tshirts.dtf",
    flexKey: "techniquesPage.fit.tshirts.flex",
    embroideryKey: "techniquesPage.fit.tshirts.embroidery",
  },
  {
    productKey: "techniquesPage.fit.hoodies.product",
    dtfKey: "techniquesPage.fit.hoodies.dtf",
    flexKey: "techniquesPage.fit.hoodies.flex",
    embroideryKey: "techniquesPage.fit.hoodies.embroidery",
  },
  {
    productKey: "techniquesPage.fit.softshells.product",
    dtfKey: "techniquesPage.fit.softshells.dtf",
    flexKey: "techniquesPage.fit.softshells.flex",
    embroideryKey: "techniquesPage.fit.softshells.embroidery",
  },
] as const;

const PROJECT_SIGNALS = [
  "techniquesPage.signals.signal1",
  "techniquesPage.signals.signal2",
  "techniquesPage.signals.signal3",
  "techniquesPage.signals.signal4",
] as const;

export default async function TechniquesPage() {
  const t = await getT();
  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <BackLink href="/" label={t("techniquesPage.back")} />

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div>
              <p className="section-tag">{t("techniquesPage.hero.tag")}</p>
              <h1 className="mb-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
                {t("techniquesPage.hero.titleLine1")}
                <br />
                {t("techniquesPage.hero.titleLine2")}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
                {t("techniquesPage.hero.intro")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link href="/catalogue" className="btn-primary gap-2">
                  {t("techniquesPage.hero.ctaProducts")}
                  <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="btn-outline">
                  {t("techniquesPage.hero.ctaAdvice")}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {TECHNIQUES.map(({ id, icon: Icon, labelKey, taglineKey, iconBg, accent }) => (
                <article
                  key={id}
                  className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 shadow-[0_14px_34px_rgba(63,45,88,0.05)]"
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${accent}`} />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-[var(--hm-text)]">{t(labelKey)}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{t(taglineKey)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">{t("techniquesPage.understand.tag")}</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              {t("techniquesPage.understand.title")}
            </h2>
            <p className="text-base leading-7 text-[var(--hm-text-soft)]">
              {t("techniquesPage.understand.intro")}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {TECHNIQUES.map(({ id, icon: Icon, labelKey, taglineKey, descriptionKey, strengthKeys, limitsKey, bestForKey, iconBg, accent }) => (
              <article
                key={id}
                className="flex h-full flex-col rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                      {t(labelKey)}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[var(--hm-text)]">{t(taglineKey)}</h3>
                  </div>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${accent}`} />
                  </span>
                </div>

                <div className={`mt-5 rounded-[1.25rem] ${iconBg} px-3 py-4`}>
                  <TechniqueArtById id={id} className="h-auto w-full" />
                </div>

                <p className="mt-5 text-sm leading-7 text-[var(--hm-text-soft)]">{t(descriptionKey)}</p>

                <div className="mt-6 rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                    {t("techniquesPage.card.idealFor")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text)]">{t(bestForKey)}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {strengthKeys.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--hm-rose)]" />
                      <p className="text-sm leading-6 text-[var(--hm-text)]">{t(item)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-[var(--hm-line)] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                    {t("techniquesPage.card.caution")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{t(limitsKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-7 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--hm-accent-soft-blue)]">
                <Layers3 className="h-5 w-5 text-[var(--hm-blue)]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                  {t("techniquesPage.choice.tag")}
                </p>
                <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                  {t("techniquesPage.choice.title")}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {CHOICE_GUIDE.map((item) => (
                <div
                  key={item.titleKey}
                  className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4"
                >
                  <p className="text-sm font-semibold text-[var(--hm-text)]">{t(item.titleKey)}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{t(item.answerKey)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <Shirt className="h-5 w-5 text-[var(--hm-primary)]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                  {t("techniquesPage.fit.tag")}
                </p>
                <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                  {t("techniquesPage.fit.title")}
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {PRODUCT_FIT.map((row) => (
                <div
                  key={row.productKey}
                  className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4"
                >
                  <p className="text-sm font-semibold text-[var(--hm-text)]">{t(row.productKey)}</p>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--hm-text-soft)]">
                    <p>
                      <span className="font-medium text-[var(--hm-text)]">{t("techniquesPage.fit.dtfLabel")}</span> {t(row.dtfKey)}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--hm-text)]">{t("techniquesPage.fit.flexLabel")}</span> {t(row.flexKey)}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--hm-text)]">{t("techniquesPage.fit.embroideryLabel")}</span> {t(row.embroideryKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14 rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-7 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="section-tag">{t("techniquesPage.quote.tag")}</p>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                {t("techniquesPage.quote.title")}
              </h2>
              <p className="text-base leading-7 text-[var(--hm-text-soft)]">
                {t("techniquesPage.quote.intro")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PROJECT_SIGNALS.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hm-primary)]" />
                    <p className="text-sm leading-6 text-[var(--hm-text)]">{t(item)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-white p-8 text-center shadow-[0_18px_48px_rgba(63,45,88,0.06)] sm:p-10">
          <p className="mx-auto mb-3 inline-flex items-center justify-center rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
            {t("techniquesPage.final.tag")}
          </p>
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-[var(--hm-text)] sm:text-4xl">
            {t("techniquesPage.final.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--hm-text-soft)]">
            {t("techniquesPage.final.intro")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/catalogue" className="btn-primary gap-2">
              {t("techniquesPage.final.ctaCatalogue")}
              <ChevronRight size={16} />
            </Link>
            <Link href="/contact" className="btn-outline">
              {t("techniquesPage.final.ctaQuote")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
