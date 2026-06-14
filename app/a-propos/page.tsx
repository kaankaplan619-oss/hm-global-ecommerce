import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import { getT } from "@/lib/i18n/server";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Phone,
  GraduationCap,
  MessageSquare,
  Lightbulb,
  FileCheck2,
  Factory,
  Shirt,
  Lamp,
  Car,
  Printer,
  Store,
  PenTool,
} from "lucide-react";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "HM Global Agence : atelier de production et agence créative à Souffelweyersheim. Textile DTF, enseignes, habillage véhicule, print — produit chez nous, en Alsace.",
};

/**
 * Page À propos — refonte image-first (demande Kaan 2026-06-10) :
 * la preuve passe par les vraies photos d'atelier et de chantier, pas par des
 * listes de texte. Métiers en cartes photo, approche en 4 étapes courtes.
 */

export default async function AboutPage() {
  const t = await getT();

  const METIERS = [
    {
      title: t("about.metiers.textile.title"),
      chips: [t("about.metiers.textile.chip1"), t("about.metiers.textile.chip2"), t("about.metiers.textile.chip3")],
      image: "/images/realisations/prestige-tshirts.jpg",
      alt: t("about.metiers.textile.alt"),
      href: "/catalogue",
      icon: Shirt,
    },
    {
      title: t("about.metiers.enseignes.title"),
      chips: [t("about.metiers.enseignes.chip1"), t("about.metiers.enseignes.chip2"), t("about.metiers.enseignes.chip3")],
      image: "/images/realisations/miammi-fabrication.jpg",
      alt: t("about.metiers.enseignes.alt"),
      href: "/realisations",
      icon: Lamp,
    },
    {
      title: t("about.metiers.vehicule.title"),
      chips: [t("about.metiers.vehicule.chip1"), t("about.metiers.vehicule.chip2")],
      image: "/images/realisations/vehicule-scorpion.jpg",
      alt: t("about.metiers.vehicule.alt"),
      href: "/realisations",
      icon: Car,
    },
    {
      title: t("about.metiers.print.title"),
      chips: [t("about.metiers.print.chip1"), t("about.metiers.print.chip2"), t("about.metiers.print.chip3")],
      image: "/images/realisations/hm-global-print.jpg",
      alt: t("about.metiers.print.alt"),
      href: "/impression",
      icon: Printer,
    },
    {
      title: t("about.metiers.vitrines.title"),
      chips: [t("about.metiers.vitrines.chip1"), t("about.metiers.vitrines.chip2")],
      image: "/images/realisations/selim-vitrine.jpg",
      alt: t("about.metiers.vitrines.alt"),
      href: "/realisations",
      icon: Store,
    },
    {
      title: t("about.metiers.design.title"),
      chips: [t("about.metiers.design.chip1"), t("about.metiers.design.chip2")],
      image: "/images/realisations/scorpion-creation.jpg",
      alt: t("about.metiers.design.alt"),
      href: "/contact",
      icon: PenTool,
    },
  ] as const;

  const APPROACH = [
    {
      icon: MessageSquare,
      title: t("about.approach.step1.title"),
      text: t("about.approach.step1.text"),
    },
    {
      icon: Lightbulb,
      title: t("about.approach.step2.title"),
      text: t("about.approach.step2.text"),
    },
    {
      icon: FileCheck2,
      title: t("about.approach.step3.title"),
      text: t("about.approach.step3.text"),
    },
    {
      icon: Factory,
      title: t("about.approach.step4.title"),
      text: t("about.approach.step4.text"),
    },
  ] as const;

  const FACTS = [
    { value: "2018", label: t("about.facts.year") },
    { value: "100 %", label: t("about.facts.production") },
    { value: "BAT", label: t("about.facts.bat") },
    { value: "410", label: t("about.facts.erasmus") },
  ] as const;

  const HISTOIRE = [
    {
      image: "/images/histoire/presse-yilmaz-2018.jpg",
      year: "2018",
      caption: t("about.histoire.yilmaz.caption"),
      alt: t("about.histoire.yilmaz.alt"),
    },
    {
      image: "/images/histoire/vehicule-home-style-2018.jpg",
      year: "2018",
      caption: t("about.histoire.homestyle.caption"),
      alt: t("about.histoire.homestyle.alt"),
    },
    {
      image: "/images/histoire/bache-oeillets-2018.jpg",
      year: "2018",
      caption: t("about.histoire.bache.caption"),
      alt: t("about.histoire.bache.alt"),
    },
    {
      image: "/images/histoire/camion-yilmaz-2018.jpg",
      year: "2018",
      caption: t("about.histoire.camion.caption"),
      alt: t("about.histoire.camion.alt"),
    },
    {
      image: "/images/histoire/enseigne-bar-actifs.jpg",
      year: t("about.histoire.actifs.year"),
      caption: t("about.histoire.actifs.caption"),
      alt: t("about.histoire.actifs.alt"),
    },
  ] as const;

  const CONTACT = [
    { icon: MapPin, label: t("about.contact.address.label"), value: "20 Rue des Tuileries, 67460 Souffelweyersheim" },
    { icon: Clock3, label: t("about.contact.hours.label"), value: t("about.contact.hours.value") },
    { icon: Phone, label: t("about.contact.phone.label"), value: "06 76 16 11 88" },
  ] as const;

  return (
    <div className="pt-24 pb-20 bg-white">
      <div className="container">
        <BackLink href="/" label={t("about.back")} />

        {/* Héro : texte court + vraies photos */}
        <section className="mb-12 grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="section-tag">{t("about.hero.tag")}</p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
              {t("about.hero.title")}
            </h1>
            <p className="max-w-xl text-base leading-8 text-[var(--hm-text-soft)]">
              {t("about.hero.text")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3.5">
              <Link href="/realisations" className="btn-primary gap-2">
                {t("about.hero.ctaRealisations")}
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-outline">
                {t("about.hero.ctaContact")}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)]">
              <Image
                src="/videos/realisations/presse-marquage-poster.jpg"
                alt={t("about.hero.image1Alt")}
                fill
                sizes="(min-width:1024px) 24vw, 48vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="grid gap-3.5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)]">
                <Image
                  src="/images/realisations/miammi-fabrication.jpg"
                  alt={t("about.hero.image2Alt")}
                  fill
                  sizes="(min-width:1024px) 24vw, 48vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)]">
                <Image
                  src="/images/realisations/naga-enseigne.jpg"
                  alt={t("about.hero.image3Alt")}
                  fill
                  sizes="(min-width:1024px) 24vw, 48vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Chiffres / repères */}
        <section className="mb-14 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div
              key={f.label}
              className="rounded-[1.4rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-5 py-4"
            >
              <p className="text-2xl font-semibold tracking-tight text-[var(--hm-rose)]">{f.value}</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--hm-text-soft)]">{f.label}</p>
            </div>
          ))}
        </section>

        {/* Métiers en cartes photo */}
        <section className="mb-14">
          <div className="mb-7 max-w-2xl">
            <p className="section-tag">{t("about.metiers.tag")}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              {t("about.metiers.title")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {METIERS.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="group relative block overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(63,45,88,0.12)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={m.image}
                    alt={m.alt}
                    fill
                    sizes="(min-width:1024px) 32vw, (min-width:640px) 48vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[var(--hm-rose)]">
                        <m.icon size={14} />
                      </span>
                      <p className="text-[15px] font-semibold text-white drop-shadow">{m.title}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.chips.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-white/20 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur-sm"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Histoire depuis 2018 */}
        <section className="mb-14">
          <div className="mb-7 max-w-2xl">
            <p className="section-tag">{t("about.histoire.tag")}</p>
            <h2 className="mb-3 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              {t("about.histoire.title")}
            </h2>
            <p className="text-sm leading-7 text-[var(--hm-text-soft)]">
              {t("about.histoire.text")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
            {HISTOIRE.map((h) => (
              <figure
                key={h.image}
                className="overflow-hidden rounded-[1.4rem] border border-[var(--hm-line)] bg-white"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={h.image}
                    alt={h.alt}
                    fill
                    sizes="(min-width:1024px) 19vw, (min-width:640px) 32vw, 48vw"
                    className="object-cover"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm" style={{ color: "var(--hm-rose)" }}>
                    {h.year}
                  </span>
                </div>
                <figcaption className="p-3 text-[12px] font-medium leading-snug text-[var(--hm-text-soft)]">
                  {h.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Approche en 4 étapes */}
        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-7 sm:p-9">
          <div className="mb-7 max-w-2xl">
            <p className="section-tag">{t("about.approach.tag")}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              {t("about.approach.title")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {APPROACH.map((step, i) => (
              <div key={step.title} className="relative rounded-[1.4rem] border border-[var(--hm-line)] bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)]">
                    <step.icon size={18} />
                  </span>
                  <span className="text-xs font-black tracking-wide text-[var(--hm-text-soft)]/60">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mb-1 text-base font-semibold text-[var(--hm-text)]">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-[var(--hm-text-soft)]">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Erasmus + réalisations */}
        <section className="mb-14 grid items-stretch gap-4 lg:grid-cols-2">
          <div className="flex flex-col rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-rose)] p-7 sm:p-8">
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--hm-rose)]">
              <GraduationCap size={20} />
            </span>
            <h2 className="mb-3 text-2xl font-semibold text-[var(--hm-text)]">
              {t("about.erasmus.title")}
            </h2>
            <p className="mb-6 text-sm leading-7 text-[var(--hm-text-soft)]">
              {t("about.erasmus.textBefore")}{" "}
              <strong className="text-[var(--hm-text)]">{t("about.erasmus.highlight")}</strong>{" "}
              {t("about.erasmus.textAfter")}
            </p>
            <Link href="/engagements" className="btn-outline mt-auto gap-2 self-start">
              {t("about.erasmus.cta")}
              <ArrowRight size={16} />
            </Link>
          </div>

          <Link
            href="/realisations"
            className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[2rem] border border-[var(--hm-line)]"
          >
            <Image
              src="/images/realisations/miammi-pose.jpg"
              alt={t("about.realisations.imageAlt")}
              fill
              sizes="(min-width:1024px) 48vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <div className="relative p-7 sm:p-8">
              <h2 className="mb-2 text-2xl font-semibold text-white drop-shadow">
                {t("about.realisations.title")}
              </h2>
              <p className="mb-4 max-w-md text-sm leading-6 text-white/90">
                {t("about.realisations.text")}
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--hm-text)]">
                {t("about.realisations.cta")}
                <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        </section>

        {/* Coordonnées compactes */}
        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-7 sm:p-8">
          <h2 className="mb-5 text-2xl font-semibold text-[var(--hm-text)]">
            {t("about.contact.title")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {CONTACT.map((c) => (
              <div key={c.label} className="flex items-start gap-3 rounded-[1.2rem] bg-white p-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-rose)]">
                  <c.icon size={15} />
                </span>
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)]">
                    {c.label}
                  </p>
                  <p className="text-sm leading-snug text-[var(--hm-text)]">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-white p-8 text-center shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
          <h2 className="mb-3 text-2xl font-semibold text-[var(--hm-text)]">
            {t("about.cta.title")}
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            {t("about.cta.text")}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="btn-primary gap-2">
              {t("about.cta.ctaContact")}
              <ArrowRight size={16} />
            </Link>
            <Link href="/catalogue" className="btn-outline">
              {t("about.cta.ctaCatalogue")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
