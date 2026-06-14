"use client";

import Image from "next/image";
import { useState } from "react";
import { ShieldCheck, Eye, Pencil, Sparkles } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * HomeProcessBAT — Section "Un BAT validé avant chaque production."
 *
 * Visuel : BAT officiel rempli à la main (logo au cœur, encre bleue),
 * posé sur l'établi — généré par scripts/gen-bat-home-image.ts.
 * Source attendue : /images/home/hm-bat-validation-v4.jpg
 *
 * Message : sérieux de la validation, anti-erreur coûteuse.
 * 3 étapes visualisées en colonnes sous l'image.
 */

const STEPS = [
  {
    icon: Eye,
    labelKey: "home.process.step1Label",
    descKey:  "home.process.step1Desc",
  },
  {
    icon: Pencil,
    labelKey: "home.process.step2Label",
    descKey:  "home.process.step2Desc",
  },
  {
    icon: ShieldCheck,
    labelKey: "home.process.step3Label",
    descKey:  "home.process.step3Desc",
  },
] as const;

function BATImage() {
  const t = useT();
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #6EC7DD 0%, #54B6D2 35%, #4B2A6F 100%)",
        }}
      >
        <div
          className="absolute h-2/3 w-2/3 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%)",
            filter: "blur(18px)",
          }}
        />
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/95"
          style={{ boxShadow: "0 18px 36px rgba(0,0,0,0.22)" }}
        >
          <ShieldCheck size={36} style={{ color: "var(--hm-cyan)" }} />
        </div>
      </div>
    );
  }

  return (
    <Image
      src="/images/home/hm-bat-validation-v4.jpg"
      alt={t("home.process.imageAlt")}
      fill
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function HomeProcessBAT() {
  const t = useT();
  return (
    <section
      className="py-14 sm:py-20"
      style={{ background: "#ffffff" }}
    >
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">

          {/* ── Image BAT ────────────────────────────────────────────── */}
          <div className="order-2 lg:order-1">
            <div
              className="relative overflow-hidden rounded-[1.6rem]"
              style={{
                boxShadow: "0 8px 24px rgba(45,35,64,0.05)",
                border: "1px solid rgba(45,35,64,0.08)",
              }}
            >
              <div className="relative aspect-[4/3]">
                <BATImage />
                <span
                  className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm"
                  style={{
                    color: "var(--hm-violet)",
                    boxShadow: "0 6px 16px rgba(59,35,90,0.12)",
                    border: "1px solid rgba(84,182,210,0.20)",
                  }}
                >
                  <Sparkles size={12} style={{ color: "var(--hm-cyan)" }} />
                  {t("home.process.badge")}
                </span>
              </div>
            </div>
          </div>

          {/* ── Colonne texte + steps ────────────────────────────────── */}
          <div className="order-1 lg:order-2">
            <p
              className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--hm-cyan)" }}
            >
              {t("home.process.eyebrow")}
            </p>
            <h2
              className="font-semibold leading-[1.08] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.45rem, 2.4vw + 0.4rem, 2.1rem)",
                color: "var(--hm-text-main)",
              }}
            >
              {t("home.process.headingLead")}{" "}
              <span style={{ color: "var(--hm-violet)" }}>
                {t("home.process.headingHighlight")}
              </span>
              .
            </h2>
            <p
              className="mt-4 text-[14px] leading-[1.65]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              {t("home.process.intro")}
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-3">
              {STEPS.map(({ icon: Icon, labelKey, descKey }) => (
                <li
                  key={labelKey}
                  className="rounded-[1rem] bg-white p-4"
                  style={{
                    border: "1px solid rgba(45,35,64,0.08)",
                    boxShadow: "0 4px 12px rgba(45,35,64,0.04)",
                  }}
                >
                  <div
                    className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(84,182,210,0.10)",
                      color: "var(--hm-cyan)",
                    }}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </div>
                  <p
                    className="text-[12.5px] font-semibold leading-tight"
                    style={{ color: "var(--hm-text-main)" }}
                  >
                    {t(labelKey)}
                  </p>
                  <p
                    className="mt-1 text-[11.5px] leading-[1.5]"
                    style={{ color: "var(--hm-text-muted-2)" }}
                  >
                    {t(descKey)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
