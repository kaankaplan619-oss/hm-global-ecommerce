"use client";

import { ShieldCheck, MapPin, Layers, FileText } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

/**
 * HomeTrustStrip — Bandeau confiance, 4 items courts.
 *
 * Phase polish P1 :
 *   - Compactage vertical (py-10 au lieu de py-14)
 *   - Cyan dominant sur les pictos (rappel logo HM)
 *   - Magenta uniquement sur 1 picto (variation)
 *   - Lisibilité renforcée (titre plus contrasté, descriptif plus lisible)
 */

const TRUST_ITEMS = [
  {
    icon:     ShieldCheck,
    titleKey: "home.trust.item1.title",
    descKey:  "home.trust.item1.desc",
    tone:     "cyan",
  },
  {
    icon:     MapPin,
    titleKey: "home.trust.item2.title",
    descKey:  "home.trust.item2.desc",
    tone:     "cyan",
  },
  {
    icon:     Layers,
    titleKey: "home.trust.item3.title",
    descKey:  "home.trust.item3.desc",
    tone:     "magenta",
  },
  {
    icon:     FileText,
    titleKey: "home.trust.item4.title",
    descKey:  "home.trust.item4.desc",
    tone:     "cyan",
  },
] as const;

const TONE_BG: Record<"cyan" | "magenta", string> = {
  cyan:
    "linear-gradient(135deg, rgba(84,182,210,0.18) 0%, rgba(84,182,210,0.06) 100%)",
  magenta:
    "linear-gradient(135deg, rgba(193,60,138,0.16) 0%, rgba(193,60,138,0.06) 100%)",
};

const TONE_COLOR: Record<"cyan" | "magenta", string> = {
  cyan:    "var(--hm-cyan)",
  magenta: "var(--hm-magenta)",
};

export default function HomeTrustStrip() {
  const t = useT();
  return (
    <section
      className="py-10 sm:py-14"
      style={{ background: "#ffffff" }}
    >
      <div className="container">
        <div className="mb-8 max-w-2xl">
          <p
            className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--hm-cyan)" }}
          >
            {t("home.trust.eyebrow")}
          </p>
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.02em]"
            style={{
              fontSize: "clamp(1.4rem, 2.2vw + 0.4rem, 2rem)",
              color: "var(--hm-text-main)",
            }}
          >
            {t("home.trust.heading")}
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, titleKey, descKey, tone }) => (
            <div
              key={titleKey}
              className="rounded-[1.2rem] bg-white p-5 transition duration-200 hover:-translate-y-0.5"
              style={{
                border: "1px solid rgba(45,35,64,0.08)",
                boxShadow: "0 6px 18px rgba(45,35,64,0.04)",
              }}
            >
              <div
                className="mb-3.5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: TONE_BG[tone],
                  color: TONE_COLOR[tone],
                }}
              >
                <Icon size={20} strokeWidth={1.7} />
              </div>
              <h3
                className="text-[14.5px] font-semibold leading-snug tracking-[-0.01em]"
                style={{ color: "var(--hm-text-main)" }}
              >
                {t(titleKey)}
              </h3>
              <p
                className="mt-1.5 text-[12.5px] leading-[1.55]"
                style={{ color: "var(--hm-text-muted-2)" }}
              >
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
