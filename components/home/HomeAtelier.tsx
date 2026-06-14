"use client";

import Image from "next/image";
import { useState } from "react";
import { Factory, MapPin } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * HomeAtelier — Section "Une production suivie, pas automatisée à l'aveugle."
 *
 * Visuel : employé à la presse à chaud / production atelier textile.
 * Source attendue : /images/home/hm-atelier-production-textile.webp
 *
 * Format : section pleine largeur avec image dominante + bandeau texte
 *          superposé en bas (visuel premium éditorial, mobile-safe).
 */

function AtelierImage() {
  const t = useT();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #172033 0%, #3B235A 55%, #C13C8A 100%)",
        }}
      >
        <div
          className="absolute h-2/3 w-2/3 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(110,199,221,0.30) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white/95"
          style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.30)" }}
        >
          <Factory size={42} style={{ color: "var(--hm-violet)" }} />
        </div>
      </div>
    );
  }

  return (
    <Image
      src="/images/realisations/miammi-fabrication.jpg"
      alt={t("home.atelier.imageAlt")}
      fill
      sizes="100vw"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function HomeAtelier() {
  const t = useT();
  return (
    <section className="py-14 sm:py-20">
      <div className="container">
        <div
          className="relative overflow-hidden rounded-[1.8rem]"
          style={{
            boxShadow: "0 16px 40px rgba(45,35,64,0.08)",
            border: "1px solid rgba(45,35,64,0.08)",
          }}
        >
          {/* Image en aspect 21:9 desktop, 4:3 mobile */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
            <AtelierImage />

            {/* Voile sombre en bas pour lisibilité du texte */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(23,32,51,0.85) 100%)",
              }}
            />

            {/* Trait cyan en haut */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(110,199,221,0.55) 50%, transparent)",
              }}
            />

            {/* Contenu superposé en bas */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-12">
              <div className="max-w-2xl">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur-sm"
                  style={{
                    borderColor: "rgba(110,199,221,0.40)",
                    background: "rgba(255,255,255,0.10)",
                    color: "rgba(255,255,255,0.92)",
                  }}
                >
                  <MapPin size={11} style={{ color: "var(--hm-cyan-light)" }} />
                  {t("home.atelier.badge")}
                </span>

                <h2
                  className="mt-4 font-semibold leading-[1.05] tracking-[-0.02em] text-white"
                  style={{
                    fontSize: "clamp(1.4rem, 2.6vw + 0.4rem, 2.2rem)",
                  }}
                >
                  {t("home.atelier.headingLead")}{" "}
                  <span style={{ color: "var(--hm-cyan-light)" }}>
                    {t("home.atelier.headingHighlight")}
                  </span>
                  .
                </h2>
                <p
                  className="mt-3 max-w-[36rem] text-[13.5px] leading-[1.65]"
                  style={{ color: "rgba(255,255,255,0.82)" }}
                >
                  {t("home.atelier.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
