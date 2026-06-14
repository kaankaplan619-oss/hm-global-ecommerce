"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * HomeFinalCTA — Bloc CTA final homepage.
 *
 * Version épurée :
 *   - Fond section blanc, card wrap blanche avec très léger gradient
 *     (cyan→blanc→magenta très subtil pour rappeler la palette du logo HM)
 *   - Titre violet sombre, "votre entreprise" en magenta
 *   - Texte sub gris
 *   - Bouton principal magenta (créatif), secondaire outline violet
 */

export default function HomeFinalCTA() {
  const t = useT();
  return (
    <section className="py-12 sm:py-18" style={{ background: "#ffffff" }}>
      <div className="container">
        <div
          className="relative overflow-hidden rounded-[1.8rem] px-6 py-12 text-center sm:px-12 sm:py-16"
          style={{
            background:
              "linear-gradient(135deg, #f4f8fb 0%, #ffffff 50%, #faf3f7 100%)",
            border: "1px solid rgba(45,35,64,0.06)",
            boxShadow: "0 10px 32px rgba(45,35,64,0.06)",
          }}
        >
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2
              className="font-semibold leading-[1.08] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.55rem, 2.8vw + 0.4rem, 2.4rem)",
                color: "var(--hm-text-main)",
              }}
            >
              {t("home.finalcta.titleLead")}{" "}
              <span style={{ color: "var(--hm-magenta)" }}>
                {t("home.finalcta.titleHighlight")}
              </span>{" "}
              ?
            </h2>

            <p
              className="mt-4 text-[14px] leading-[1.7] sm:text-[14.5px]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              {t("home.finalcta.subtitle")}
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link
                href="/contact?sujet=devis"
                className="btn-hm-magenta w-full sm:w-auto"
              >
                {t("home.finalcta.ctaQuote")}
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/catalogue"
                className="btn-hm-violet-outline w-full sm:w-auto"
              >
                {t("home.finalcta.ctaCatalogue")}
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
