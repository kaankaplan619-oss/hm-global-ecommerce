import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import { getT } from "@/lib/i18n/server";
import {
  ArrowRight,
  GraduationCap,
  Globe2,
  Users,
  HeartHandshake,
  MapPin,
  Leaf,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nos engagements",
  description:
    "HM Global Agence, une structure ancrée en Alsace et ouverte sur l'Europe : accueil d'échanges Erasmus, transmission, production locale et accompagnement humain.",
};

export default async function EngagementsPage() {
  const t = await getT();

  const STATS = [
    { value: "410", label: t("engagements.stats.students.label"), sub: t("engagements.stats.students.sub") },
    { value: "Erasmus", label: t("engagements.stats.program.label"), sub: t("engagements.stats.program.sub") },
    { value: "Alsace", label: t("engagements.stats.local.label"), sub: t("engagements.stats.local.sub") },
    { value: t("engagements.stats.human.value"), label: t("engagements.stats.human.label"), sub: t("engagements.stats.human.sub") },
  ];

  const VALUES = [
    {
      icon: MapPin,
      title: t("engagements.values.local.title"),
      text: t("engagements.values.local.text"),
    },
    {
      icon: Globe2,
      title: t("engagements.values.europe.title"),
      text: t("engagements.values.europe.text"),
    },
    {
      icon: HeartHandshake,
      title: t("engagements.values.transmission.title"),
      text: t("engagements.values.transmission.text"),
    },
    {
      icon: Leaf,
      title: t("engagements.values.responsible.title"),
      text: t("engagements.values.responsible.text"),
    },
  ];

  const REASONS = [
    t("engagements.reasons.item1"),
    t("engagements.reasons.item2"),
    t("engagements.reasons.item3"),
    t("engagements.reasons.item4"),
  ];

  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="container">
        <BackLink href="/a-propos" label={t("engagements.back")} />

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <p className="section-tag">{t("engagements.hero.tag")}</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--hm-text)] leading-tight tracking-tight mb-5">
            {t("engagements.hero.title")}
          </h1>
          <p className="text-base text-[var(--hm-text-soft)] max-w-3xl leading-8">
            {t("engagements.hero.intro")}
          </p>
        </section>

        <section className="mb-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
            >
              <p className="text-3xl md:text-4xl font-semibold text-[var(--hm-rose)] leading-none mb-2">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-[var(--hm-text)] mb-1">{stat.label}</p>
              <p className="text-xs text-[var(--hm-text-soft)] leading-relaxed">{stat.sub}</p>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 mb-14">
          <div className="rounded-3xl border border-[var(--hm-line)] bg-white shadow-[0_18px_48px_rgba(63,45,88,0.08)] p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)] flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </span>
              <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                {t("engagements.erasmus.title")}
              </h2>
            </div>
            <p className="text-sm text-[var(--hm-text-soft)] leading-7 mb-4">
              {t("engagements.erasmus.p1a")}{" "}
              <strong className="text-[var(--hm-text)]">{t("engagements.erasmus.p1strong")}</strong>
              {t("engagements.erasmus.p1b")}
            </p>
            <p className="text-sm text-[var(--hm-text-soft)] leading-7">
              {t("engagements.erasmus.p2")}
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-white text-[var(--hm-rose)] flex items-center justify-center shrink-0">
                <Users size={20} />
              </span>
              <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                {t("engagements.reasons.title")}
              </h2>
            </div>
            <ul className="space-y-4">
              {REASONS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Sparkles size={16} className="text-[var(--hm-rose)] mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--hm-text-soft)] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-6">
            <p className="section-tag">{t("engagements.valuesSection.tag")}</p>
            <h2 className="text-2xl md:text-3xl font-semibold text-[var(--hm-text)]">
              {t("engagements.valuesSection.title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="rounded-3xl border border-[var(--hm-line)] bg-white p-6"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)] flex items-center justify-center mb-4">
                    <Icon size={18} />
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--hm-text)] mb-2">{value.title}</h3>
                  <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed">{value.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--hm-line)] bg-white shadow-[0_18px_48px_rgba(63,45,88,0.06)] p-8 text-center">
          <h2 className="text-2xl font-semibold text-[var(--hm-text)] mb-4">
            {t("engagements.cta.title")}
          </h2>
          <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed max-w-2xl mx-auto mb-6">
            {t("engagements.cta.text")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/contact" className="btn-primary gap-2">
              {t("engagements.cta.contact")}
              <ArrowRight size={16} />
            </Link>
            <Link href="/a-propos" className="btn-outline">
              {t("engagements.cta.more")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
