"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lamp, PanelsTopLeft, Car } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * HomeSignaletique — enseignes, panneaux et véhicules sur l'accueil.
 * Demande Kaan 2026-06-10 : pousser les métiers atelier (enseignes, panneaux
 * chantier, habillage véhicule) avec les vraies photos — parcours devis 24h,
 * pas de prix affiché (fabrication sur mesure).
 */

const ITEMS = [
  {
    icon: Lamp,
    labelKey: "home.signage.item1.label",
    lineKey: "home.signage.item1.line",
    image: "/images/realisations/naga-enseigne-nuit.jpg",
    altKey: "home.signage.item1.alt",
  },
  {
    icon: PanelsTopLeft,
    labelKey: "home.signage.item2.label",
    lineKey: "home.signage.item2.line",
    image: "/images/realisations/illico-panneau.jpg",
    altKey: "home.signage.item2.alt",
  },
  {
    icon: Car,
    labelKey: "home.signage.item3.label",
    lineKey: "home.signage.item3.line",
    image: "/images/realisations/exo-solar-vehicule.jpg",
    altKey: "home.signage.item3.alt",
  },
] as const;

export default function HomeSignaletique() {
  const t = useT();
  return (
    <section className="py-14 sm:py-20" style={{ background: "#fff" }}>
      <div className="container">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--hm-cyan)" }}>
              {t("home.signage.eyebrow")}
            </p>
            <h2
              className="font-semibold leading-[1.08] tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.5rem, 2.6vw + 0.4rem, 2.3rem)", color: "var(--hm-text-main)" }}
            >
              {t("home.signage.heading")}{" "}
              <span style={{ color: "var(--hm-violet)" }}>{t("home.signage.headingAccent")}</span>.
            </h2>
            <p className="mt-3 max-w-[44rem] text-[13.5px] leading-6" style={{ color: "var(--hm-text-muted-2)" }}>
              {t("home.signage.intro")}
            </p>
          </div>
          <Link href="/devis-rapide" className="btn-hm-violet-outline shrink-0 self-start lg:self-auto">
            {t("home.signage.ctaQuote")}
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
          {ITEMS.map((item) => (
            <Link
              key={item.labelKey}
              href="/devis-rapide"
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-white transition duration-300 hover:-translate-y-1"
              style={{ border: "1px solid rgba(45,35,64,0.08)", boxShadow: "0 6px 18px rgba(45,35,64,0.04)" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "#f6f7f9" }}>
                <Image
                  src={item.image}
                  alt={t(item.altKey)}
                  fill
                  sizes="(min-width:640px) 32vw, 95vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: "var(--hm-cyan)" }} />
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(84,182,210,0.10)", color: "var(--hm-cyan)" }}
                  >
                    <item.icon size={15} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold leading-snug tracking-[-0.01em]" style={{ color: "var(--hm-text-main)" }}>
                      {t(item.labelKey)}
                    </h3>
                    <p className="mt-1 text-[12px] leading-5" style={{ color: "var(--hm-text-muted-2)" }}>
                      {t(item.lineKey)}
                    </p>
                  </div>
                </div>
                <span
                  className="mt-auto inline-flex items-center justify-between gap-1.5 border-t pt-3 text-[11.5px] font-semibold transition group-hover:gap-2.5"
                  style={{ borderColor: "rgba(84,182,210,0.16)", color: "var(--hm-cyan)" }}
                >
                  {t("home.signage.cardCta")}
                  <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
