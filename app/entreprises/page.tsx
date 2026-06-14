import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import { SectorArt } from "@/components/illustrations/SectorArt";
import { getT } from "@/lib/i18n/server";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  HardHat,
  Shirt,
  Store,
  Truck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solutions pour les entreprises",
  description:
    "HM Global Agence accompagne les entreprises, associations, restaurateurs, équipes terrain et organisateurs d'événements avec des solutions textiles et visuelles adaptées à leurs besoins concrets.",
};

export default async function CompaniesPage() {
  const t = await getT();

  const SECTORS = [
    {
      id: "btp",
      icon: HardHat,
      label: t("entreprises.sectors.btp.label"),
      needs: [
        t("entreprises.sectors.btp.need1"),
        t("entreprises.sectors.btp.need2"),
        t("entreprises.sectors.btp.need3"),
      ],
      products: t("entreprises.sectors.btp.products"),
      techniques: t("entreprises.sectors.btp.techniques"),
      path: t("entreprises.sectors.btp.path"),
    },
    {
      id: "restauration",
      icon: Store,
      label: t("entreprises.sectors.restauration.label"),
      needs: [
        t("entreprises.sectors.restauration.need1"),
        t("entreprises.sectors.restauration.need2"),
        t("entreprises.sectors.restauration.need3"),
      ],
      products: t("entreprises.sectors.restauration.products"),
      techniques: t("entreprises.sectors.restauration.techniques"),
      path: t("entreprises.sectors.restauration.path"),
    },
    {
      id: "associations",
      icon: Users,
      label: t("entreprises.sectors.associations.label"),
      needs: [
        t("entreprises.sectors.associations.need1"),
        t("entreprises.sectors.associations.need2"),
        t("entreprises.sectors.associations.need3"),
      ],
      products: t("entreprises.sectors.associations.products"),
      techniques: t("entreprises.sectors.associations.techniques"),
      path: t("entreprises.sectors.associations.path"),
    },
    {
      id: "evenements",
      icon: BriefcaseBusiness,
      label: t("entreprises.sectors.evenements.label"),
      needs: [
        t("entreprises.sectors.evenements.need1"),
        t("entreprises.sectors.evenements.need2"),
        t("entreprises.sectors.evenements.need3"),
      ],
      products: t("entreprises.sectors.evenements.products"),
      techniques: t("entreprises.sectors.evenements.techniques"),
      path: t("entreprises.sectors.evenements.path"),
    },
    {
      id: "pme",
      icon: Building2,
      label: t("entreprises.sectors.pme.label"),
      needs: [
        t("entreprises.sectors.pme.need1"),
        t("entreprises.sectors.pme.need2"),
        t("entreprises.sectors.pme.need3"),
      ],
      products: t("entreprises.sectors.pme.products"),
      techniques: t("entreprises.sectors.pme.techniques"),
      path: t("entreprises.sectors.pme.path"),
    },
    {
      id: "terrain",
      icon: Truck,
      label: t("entreprises.sectors.terrain.label"),
      needs: [
        t("entreprises.sectors.terrain.need1"),
        t("entreprises.sectors.terrain.need2"),
        t("entreprises.sectors.terrain.need3"),
      ],
      products: t("entreprises.sectors.terrain.products"),
      techniques: t("entreprises.sectors.terrain.techniques"),
      path: t("entreprises.sectors.terrain.path"),
    },
  ] as const;

  const DECISION_RULES = [
    {
      title: t("entreprises.decision.catalogue.title"),
      items: [
        t("entreprises.decision.catalogue.item1"),
        t("entreprises.decision.catalogue.item2"),
        t("entreprises.decision.catalogue.item3"),
        t("entreprises.decision.catalogue.item4"),
      ],
    },
    {
      title: t("entreprises.decision.devis.title"),
      items: [
        t("entreprises.decision.devis.item1"),
        t("entreprises.decision.devis.item2"),
        t("entreprises.decision.devis.item3"),
        t("entreprises.decision.devis.item4"),
      ],
    },
  ] as const;

  const COMMON_REQUESTS = [
    t("entreprises.common.req1"),
    t("entreprises.common.req2"),
    t("entreprises.common.req3"),
    t("entreprises.common.req4"),
  ] as const;

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <BackLink href="/" label={t("entreprises.back")} />

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
            <div>
              <p className="section-tag">{t("entreprises.hero.tag")}</p>
              <h1 className="mb-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
                {t("entreprises.hero.title")}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
                {t("entreprises.hero.subtitle")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link href="/catalogue" className="btn-primary gap-2">
                  {t("entreprises.hero.ctaCatalogue")}
                  <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="btn-outline">
                  {t("entreprises.hero.ctaDevis")}
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--hm-accent-soft-blue)]">
                  <Shirt className="h-5 w-5 text-[var(--hm-blue)]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                    {t("entreprises.common.tag")}
                  </p>
                  <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                    {t("entreprises.common.heading")}
                  </h2>
                </div>
              </div>

              <div className="grid gap-3">
                {COMMON_REQUESTS.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-4 text-sm leading-6 text-[var(--hm-text)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">{t("entreprises.sectors.tag")}</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              {t("entreprises.sectors.heading")}
            </h2>
            <p className="text-base leading-7 text-[var(--hm-text-soft)]">
              {t("entreprises.sectors.intro")}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {SECTORS.map(({ id, icon: Icon, label, needs, products, techniques, path }) => (
              <article
                key={id}
                className="flex h-full flex-col rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
              >
                <div className="mb-5 overflow-hidden rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-rose)] px-4 py-3">
                  <SectorArt id={id} />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                      {t("entreprises.sectors.sectorLabel")}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[var(--hm-text)]">{label}</h3>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                    <Icon className="h-5 w-5 text-[var(--hm-primary)]" />
                  </span>
                </div>

                <div className="mt-6 rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                    {t("entreprises.sectors.needsLabel")}
                  </p>
                  <div className="mt-3 space-y-2">
                    {needs.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hm-primary)]" />
                        <p className="text-sm leading-6 text-[var(--hm-text)]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                      {t("entreprises.sectors.productsLabel")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--hm-text)]">{products}</p>
                  </div>

                  <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                      {t("entreprises.sectors.techniquesLabel")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--hm-text)]">{techniques}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-[var(--hm-line)] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                    {t("entreprises.sectors.pathLabel")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{path}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 grid gap-6 lg:grid-cols-2">
          {DECISION_RULES.map((block) => (
            <article
              key={block.title}
              className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-7 shadow-[0_18px_48px_rgba(63,45,88,0.06)]"
            >
              <h2 className="text-2xl font-semibold text-[var(--hm-text)]">{block.title}</h2>
              <div className="mt-5 space-y-3">
                {block.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-4"
                  >
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hm-primary)]" />
                    <p className="text-sm leading-6 text-[var(--hm-text)]">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="section-tag">{t("entreprises.choose.tag")}</p>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                {t("entreprises.choose.heading")}
              </h2>
              <p className="text-base leading-7 text-[var(--hm-text-soft)]">
                {t("entreprises.choose.intro")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/catalogue"
                className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 transition-all duration-200 hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                  {t("entreprises.choose.catalogue.tag")}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--hm-text)]">
                  {t("entreprises.choose.catalogue.title")}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--hm-text-soft)]">
                  {t("entreprises.choose.catalogue.desc")}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
                  {t("entreprises.choose.catalogue.link")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <Link
                href="/contact"
                className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 transition-all duration-200 hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                  {t("entreprises.choose.devis.tag")}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--hm-text)]">
                  {t("entreprises.choose.devis.title")}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--hm-text-soft)]">
                  {t("entreprises.choose.devis.desc")}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
                  {t("entreprises.choose.devis.link")}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
