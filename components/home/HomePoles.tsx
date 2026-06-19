import Link from "next/link";
import { ArrowRight, Shirt, Printer, Store, Truck, Palette } from "lucide-react";
import { getT } from "@/lib/i18n/server";

/**
 * HomePoles — grille des pôles HM Global, placée juste sous le hero.
 *
 * Objectif (demande Kaan, 2026-06-18) : présenter d'abord L'AGENCE et ses
 * savoir-faire (textile, impression, enseignes, covering, branding) pour ne
 * pas donner l'impression d'un simple « magasin de vêtements ». La conversion
 * est préservée : la première carte renvoie au catalogue, la seconde à
 * l'impression en ligne, les autres au devis.
 *
 * Textes 100 % i18n (home.poles.*), style aligné sur UniversCards/OtherServices.
 */

const POLES = [
  { key: "textile",    icon: Shirt,   href: "/catalogue",     accent: "var(--hm-primary)", accentSoft: "rgba(177,63,116,0.10)" },
  { key: "impression", icon: Printer, href: "/impression",    accent: "var(--hm-blue)",    accentSoft: "rgba(110,193,223,0.16)" },
  { key: "enseignes",  icon: Store,   href: "/enseignes",     accent: "var(--hm-purple)",  accentSoft: "rgba(76,47,111,0.10)" },
  { key: "covering",   icon: Truck,   href: "/covering",      accent: "var(--hm-rose)",    accentSoft: "rgba(177,63,116,0.10)" },
  { key: "branding",   icon: Palette, href: "/branding",      accent: "var(--hm-primary)", accentSoft: "rgba(177,63,116,0.10)" },
] as const;

export default async function HomePoles() {
  const t = await getT();
  return (
    <section id="nos-poles" className="scroll-mt-24 py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 max-w-2xl">
          <p className="section-tag">{t("home.poles.tag")}</p>
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--hm-text)]"
            style={{ fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.3rem)" }}
          >
            {t("home.poles.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--hm-text-soft)]">
            {t("home.poles.subtitle")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {POLES.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.key}
                href={p.href}
                className="group relative flex flex-col rounded-2xl border border-[var(--hm-line)] bg-white p-6 shadow-[0_10px_24px_rgba(63,45,88,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(63,45,88,0.08)]"
              >
                <span
                  className="absolute inset-x-6 top-0 h-[3px] rounded-b-full"
                  style={{ background: p.accent }}
                />

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: p.accentSoft, color: p.accent }}
                >
                  <Icon size={20} />
                </div>

                <h3 className="mt-5 text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--hm-text)]">
                  {t(`home.poles.${p.key}.title`)}
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                  {t(`home.poles.${p.key}.desc`)}
                </p>

                <span
                  className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold transition group-hover:gap-2.5"
                  style={{ color: p.accent }}
                >
                  {t(`home.poles.${p.key}.cta`)}
                  <ArrowRight size={13} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
