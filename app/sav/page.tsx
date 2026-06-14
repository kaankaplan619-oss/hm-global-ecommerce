import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft, PackageSearch, AlertTriangle, RefreshCcw, Phone, Mail,
  Clock, ShieldCheck, FileQuestion, ArrowRight,
} from "lucide-react";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "SAV & suivi de commande — HM Global Agence",
  description:
    "Un souci avec votre commande ? Suivi, fichier à corriger, article défectueux : le SAV HM Global répond sous 24 h ouvrées et réimprime en cas de défaut avéré.",
};

/**
 * Page SAV (demande Kaan 2026-06-12 : « au cas où c'est le client qui demande
 * un truc, il faudra mettre un SAV que j'ai oublié »).
 *
 * Volontairement simple et honnête : 3 situations → la bonne marche à suivre,
 * FAQ courte (produits personnalisés = règles spécifiques de rétractation),
 * contact direct. Pas de formulaire dédié en V1 — email + téléphone suffisent
 * et créent du contact humain (l'argument HM Global face aux pure players).
 */

export default async function SavPage() {
  const t = await getT();

  const SITUATIONS = [
    {
      icon: PackageSearch,
      title: t("sav.situations.track.title"),
      text: t("sav.situations.track.text"),
      cta: { label: t("sav.situations.track.cta"), href: "/mon-compte/commandes" },
    },
    {
      icon: AlertTriangle,
      title: t("sav.situations.problem.title"),
      text: t("sav.situations.problem.text"),
      cta: { label: t("sav.situations.problem.cta"), href: "mailto:contact@hmga.fr?subject=SAV%20—%20commande%20%23" },
    },
    {
      icon: RefreshCcw,
      title: t("sav.situations.reprint.title"),
      text: t("sav.situations.reprint.text"),
      cta: { label: t("sav.situations.reprint.cta"), href: "/engagements" },
    },
  ];

  const FAQ = [
    {
      q: t("sav.faq.cancel.q"),
      a: t("sav.faq.cancel.a"),
    },
    {
      q: t("sav.faq.withdrawal.q"),
      a: t("sav.faq.withdrawal.a"),
    },
    {
      q: t("sav.faq.fileRejected.q"),
      a: t("sav.faq.fileRejected.a"),
    },
    {
      q: t("sav.faq.delivery.q"),
      a: t("sav.faq.delivery.a"),
    },
    {
      q: t("sav.faq.preview.q"),
      a: t("sav.faq.preview.a"),
    },
  ];

  const BADGES = [
    { icon: Clock, label: t("sav.hero.badge.response") },
    { icon: ShieldCheck, label: t("sav.hero.badge.reprint") },
    { icon: Phone, label: t("sav.hero.badge.human") },
  ];

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#e6e8ee] bg-white px-4 py-2 text-sm font-semibold text-[#3f2d58] shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-colors hover:border-[#c4c0cf] hover:text-[#7B4FA6]"
        >
          <ChevronLeft size={16} className="shrink-0" />
          {t("sav.backHome")}
        </Link>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-3xl">
            <p className="section-tag">{t("sav.hero.tag")}</p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
              {t("sav.hero.title")}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
              {t("sav.hero.subtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {BADGES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-semibold"
                  style={{ color: "var(--hm-text-main)", border: "1px solid rgba(45,35,64,0.08)" }}
                >
                  <Icon size={13} style={{ color: "var(--hm-cyan)" }} strokeWidth={1.8} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3 situations ──────────────────────────────────────────────── */}
        <div className="mb-14 grid gap-5 md:grid-cols-3">
          {SITUATIONS.map(({ icon: Icon, title, text, cta }) => (
            <article key={title} className="flex flex-col rounded-[1.6rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_12px_30px_rgba(63,45,88,0.06)]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--hm-accent-soft-rose)]">
                <Icon size={18} className="text-[var(--hm-primary)]" />
              </div>
              <h2 className="mb-2 text-base font-semibold text-[var(--hm-text)]">{title}</h2>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--hm-text-soft)]">{text}</p>
              <Link
                href={cta.href}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--hm-primary)] hover:underline"
              >
                {cta.label} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <div className="mb-14 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-purple)]">
                <FileQuestion size={16} className="text-[var(--hm-purple)]" />
              </div>
              <h2 className="text-lg font-semibold tracking-[-0.015em] text-[var(--hm-text)]">
                {t("sav.faq.title")}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group rounded-2xl border border-[var(--hm-line)] bg-white px-5 py-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--hm-text)] marker:hidden">
                    {q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--hm-text-soft)]">{a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* ── Contact direct ───────────────────────────────────────────── */}
          <aside className="h-fit rounded-[1.6rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6">
            <h2 className="mb-2 text-base font-semibold text-[var(--hm-text)]">{t("sav.contact.title")}</h2>
            <p className="mb-5 text-sm leading-relaxed text-[var(--hm-text-soft)]">
              {t("sav.contact.intro")}
            </p>
            <div className="flex flex-col gap-3">
              <a href="mailto:contact@hmga.fr?subject=SAV%20—%20commande%20%23" className="btn-primary justify-center gap-2 text-sm">
                <Mail size={15} /> {t("sav.contact.email")}
              </a>
              <a href="tel:+33676161188" className="btn-outline justify-center gap-2 text-sm">
                <Phone size={15} /> 06 76 16 11 88
              </a>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[var(--hm-text-muted)]">
              {t("sav.contact.hours")}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
