"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Hammer,
  Scissors,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

type NeedCard = {
  titleKey: string;
  textKey: string;
  href: string;
  icon: LucideIcon;
  accent: string;
};

const NEEDS: NeedCard[] = [
  {
    titleKey: "home.packs.needs.company.title",
    textKey: "home.packs.needs.company.text",
    href: "/devis-rapide?besoin=tenues-entreprise",
    icon: BriefcaseBusiness,
    accent: "var(--hm-cyan)",
  },
  {
    titleKey: "home.packs.needs.restaurant.title",
    textKey: "home.packs.needs.restaurant.text",
    href: "/devis-rapide?besoin=restaurant-commerce",
    icon: Scissors,
    accent: "var(--hm-magenta)",
  },
  {
    titleKey: "home.packs.needs.event.title",
    textKey: "home.packs.needs.event.text",
    href: "/devis-rapide?besoin=evenement-association",
    icon: Users,
    accent: "var(--hm-violet)",
  },
  {
    titleKey: "home.packs.needs.site.title",
    textKey: "home.packs.needs.site.text",
    href: "/devis-rapide?besoin=chantier-nettoyage",
    icon: Hammer,
    accent: "var(--hm-cyan)",
  },
  {
    titleKey: "home.packs.needs.brand.title",
    textKey: "home.packs.needs.brand.text",
    href: "/devis-rapide?besoin=marque-createur",
    icon: Store,
    accent: "var(--hm-magenta)",
  },
  {
    titleKey: "home.packs.needs.erasmus.title",
    textKey: "home.packs.needs.erasmus.text",
    href: "/devis-rapide?besoin=erasmus-ecole",
    icon: GraduationCap,
    accent: "var(--hm-violet)",
  },
];

const METHOD = [
  "home.packs.method.step1",
  "home.packs.method.step2",
  "home.packs.method.step3",
  "home.packs.method.step4",
  "home.packs.method.step5",
];

export default function HomeNeedsPacks() {
  const t = useT();
  return (
    <>
      <section className="py-12 sm:py-16" style={{ background: "#FAFBFC" }}>
        <div className="container">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--hm-cyan)" }}>
                {t("home.packs.eyebrow")}
              </p>
              <h2 className="font-semibold leading-[1.1] tracking-[-0.02em]" style={{ fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.2rem)", color: "var(--hm-text-main)" }}>
                {t("home.packs.heading")}
              </h2>
            </div>
            <Link href="/devis-rapide" className="btn-hm-magenta w-full justify-center sm:w-auto">
              {t("home.packs.cta")}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {NEEDS.map(({ titleKey, textKey, href, icon: Icon, accent }) => (
              <Link
                key={titleKey}
                href={href}
                className="group flex h-full flex-col rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-5 shadow-[0_10px_24px_rgba(63,45,88,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(63,45,88,0.08)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(84,182,210,0.10)", color: accent }}>
                  <Icon size={18} />
                </div>
                <h3 className="text-[1rem] font-semibold leading-snug tracking-[-0.015em] text-[var(--hm-text)]">{t(titleKey)}</h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-6 text-[var(--hm-text-soft)]">{t(textKey)}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold transition group-hover:gap-2.5" style={{ color: accent }}>
                  {t("home.packs.seePack")}
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16" style={{ background: "#FAFBFC" }}>
        <div className="container">
          <div className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_12px_30px_rgba(63,45,88,0.05)] sm:p-8">
            <div className="mb-7 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--hm-accent-soft-purple)] text-[var(--hm-violet)]">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--hm-text-muted)]">{t("home.packs.method.eyebrow")}</p>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--hm-text)]">{t("home.packs.method.heading")}</h2>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-5 sm:gap-3">
              {METHOD.map((stepKey, index) => (
                <div
                  key={stepKey}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-3 sm:flex-col sm:items-start sm:p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-bold text-[var(--hm-primary)] shadow-sm sm:mb-3 sm:h-7 sm:w-7 sm:text-[11px]">
                    {index + 1}
                  </span>
                  <p className="text-[14px] font-semibold leading-5 text-[var(--hm-text)] sm:text-[12.5px]">{t(stepKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
