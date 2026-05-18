"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Shirt, Printer, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * HomeQuickEntries — 3 portes d'entrée premium (textile / print / pack 360).
 *
 * Chaque carte utilise une chaîne d'images :
 *   1. Image dédiée /images/home/hm-card-*.webp (à uploader)
 *   2. Fallback image marketing existante (hoodie / BAT / pack)
 *   3. Fallback graphique brand (gradient + icône) si toutes absentes
 */

type Entry = {
  icon:    LucideIcon;
  title:   string;
  desc:    string;
  sources: readonly string[]; // chaîne webp + fallback image
  cta:     string;
  href:    string;
  accent:  string;
  fallbackGradient: string;
  fallbackIcon: LucideIcon;
};

const ENTRIES: Entry[] = [
  {
    icon:  Shirt,
    title: "Textile personnalisé",
    desc:  "T-shirts, sweats, hoodies, polos — DTF, flex et broderie pour équipes, clubs et événements.",
    sources: [
      "/images/home/hm-card-textile-premium-v2.webp",
      "/images/home/hm-card-textile-premium-v2.jpg",
    ],
    cta:   "Voir le textile",
    href:  "/catalogue",
    accent: "var(--hm-cyan)",
    fallbackGradient: "linear-gradient(135deg, #6EC7DD 0%, #54B6D2 50%, #4B2A6F 100%)",
    fallbackIcon: Shirt,
  },
  {
    icon:  Printer,
    title: "Impression & supports",
    desc:  "Cartes de visite, flyers, affiches, brochures — devis cadré, BAT validé avant production.",
    sources: [
      "/images/home/hm-card-print-supports-v2.webp",
      "/images/home/hm-card-print-supports-v2.jpg",
    ],
    cta:   "Demander un devis print",
    href:  "/impression",
    accent: "var(--hm-magenta)",
    fallbackGradient: "linear-gradient(135deg, #D64A9A 0%, #C13C8A 50%, #4B2A6F 100%)",
    fallbackIcon: Printer,
  },
  {
    icon:  Package,
    title: "Pack communication complet",
    desc:  "Logo, identité, textile, signalétique, supports entreprise — un seul interlocuteur pour toute votre image.",
    sources: [
      "/images/home/hm-card-pack-complet.webp",
      "/images/home/hm-pack-communication-complet.webp",
      "/images/home/hm-hero-agence-360.webp",
    ],
    cta:   "Parler de mon projet",
    href:  "/contact",
    accent: "var(--hm-violet)",
    fallbackGradient: "linear-gradient(135deg, #54B6D2 0%, #4B2A6F 55%, #C13C8A 100%)",
    fallbackIcon: Package,
  },
];

function EntryVisual({ entry }: { entry: Entry }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [allFailed,   setAllFailed]   = useState(false);
  const FallbackIcon = entry.fallbackIcon;

  if (allFailed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: entry.fallbackGradient }}
      >
        <div
          className="absolute h-2/3 w-2/3 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%)",
            filter: "blur(16px)",
          }}
        />
        <div
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/95"
          style={{ boxShadow: "0 18px 36px rgba(0,0,0,0.22)" }}
        >
          <FallbackIcon size={32} style={{ color: entry.accent }} />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={entry.sources[sourceIndex]}
      alt={entry.title}
      fill
      sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
      className="object-cover transition duration-500 group-hover:scale-[1.03]"
      onError={() => {
        if (sourceIndex < entry.sources.length - 1) {
          setSourceIndex((i) => i + 1);
        } else {
          setAllFailed(true);
        }
      }}
    />
  );
}

export default function HomeQuickEntries() {
  return (
    <section
      className="py-12 sm:py-16"
      style={{ background: "#ffffff" }}
    >
      <div className="container">
        <div className="mb-8 max-w-2xl">
          <p
            className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--hm-cyan)" }}
          >
            Par où commencer
          </p>
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.02em]"
            style={{
              fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.2rem)",
              color: "var(--hm-text-main)",
            }}
          >
            Que souhaitez-vous créer aujourd&apos;hui&nbsp;?
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {ENTRIES.map((entry) => {
            const Icon = entry.icon;
            return (
              <Link
                key={entry.title}
                href={entry.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-white transition duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid rgba(45,35,64,0.08)",
                  boxShadow: "0 6px 18px rgba(45,35,64,0.04)",
                }}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <EntryVisual entry={entry} />
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[3px]"
                    style={{ background: entry.accent }}
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div
                    className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(84,182,210,0.10)",
                      color: entry.accent,
                    }}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                  </div>

                  <h3
                    className="text-[1.05rem] font-semibold leading-snug tracking-[-0.015em]"
                    style={{ color: "var(--hm-text-main)" }}
                  >
                    {entry.title}
                  </h3>
                  <p
                    className="mt-1.5 flex-1 text-[13px] leading-6"
                    style={{ color: "var(--hm-text-muted-2)" }}
                  >
                    {entry.desc}
                  </p>

                  <span
                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold transition group-hover:gap-2.5"
                    style={{ color: entry.accent }}
                  >
                    {entry.cta}
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
