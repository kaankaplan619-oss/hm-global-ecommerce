import Link from "next/link";
import { ArrowRight, Upload, FileText, ClipboardCheck, Truck } from "lucide-react";
import { getT } from "@/lib/i18n/server";

/**
 * HomeHowItWorks — parcours « Comment ça marche ? » en 4 étapes
 * (demande Kaan 2026-06-19 : transformer la home en machine à devis).
 *
 * Du logo au produit livré : envoyer le besoin → devis → BAT → production.
 * DA HM Global (magenta/tokens), responsive, CTA « Demander un devis rapide ».
 * Textes 100 % i18n (home.howItWorks.*).
 */

const STEPS = [
  { key: "step1", icon: Upload },
  { key: "step2", icon: FileText },
  { key: "step3", icon: ClipboardCheck },
  { key: "step4", icon: Truck },
] as const;

export default async function HomeHowItWorks() {
  const t = await getT();
  return (
    <section id="comment-ca-marche" className="scroll-mt-24 py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 max-w-2xl">
          <p className="section-tag">{t("home.howItWorks.tag")}</p>
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--hm-text)]"
            style={{ fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.3rem)" }}
          >
            {t("home.howItWorks.heading")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--hm-text-soft)]">
            {t("home.howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="flex flex-col rounded-2xl border border-[var(--hm-line)] bg-white p-6 shadow-[0_10px_24px_rgba(63,45,88,0.04)]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-sm font-bold text-[var(--hm-primary)]">
                    {i + 1}
                  </span>
                  <Icon size={20} className="text-[var(--hm-primary)]" />
                </div>
                <h3 className="text-[1.02rem] font-semibold leading-snug text-[var(--hm-text)]">
                  {t(`home.howItWorks.${s.key}.title`)}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                  {t(`home.howItWorks.${s.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Link href="/devis-rapide" className="btn-primary inline-flex min-h-12 items-center gap-2">
            {t("home.howItWorks.cta")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
