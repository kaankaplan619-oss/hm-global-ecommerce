"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Frame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * HomeVisualShowcase — Section print homepage.
 *
 * Phase polish P1 :
 *   - Orientation "devis cadré" (le print V1 passe par devis, pas commande auto)
 *   - 4 cards plus compactes, hauteur égale, hiérarchie claire
 *   - Visuels existants conservés (carte-visite-premium, etc.) en aspect ratio
 *     moins envahissant (4:3 au lieu de 16:10)
 *   - Fallback graphique premium si visuel absent (icône + gradient)
 *   - Cyan introduit dans les chips et liserés
 *   - Pas d'effet placeholder, pas de surpromesse visuelle
 */

type ShowcaseItem = {
  icon:    LucideIcon;
  label:   string;
  line:    string;
  image:   string;
  href:    string;
  accent:  string;
  fallbackGradient: string;
  /** "cover" pour les photos éditoriales pleine image, "contain" pour les packshots */
  fit?: "cover" | "contain";
};

const ITEMS: ShowcaseItem[] = [
  {
    icon:  CreditCard,
    label: "Cartes de visite",
    line:  "350 g/m² · Mat ou brillant · Coins ronds disponibles",
    image: "/mockups/print/business-card/carte-visite-premium.webp",
    href:  "/contact?sujet=devis&support=cartes-de-visite",
    accent: "var(--hm-cyan)",
    fallbackGradient: "linear-gradient(135deg, #6EC7DD 0%, #54B6D2 60%, #4B2A6F 100%)",
    fit: "contain",
  },
  {
    icon:  FileText,
    label: "Flyers & brochures",
    line:  "A4, A5 · 170 g/m² couché · Recto ou recto-verso",
    image: "/images/home/hm-print-flyers.webp",
    href:  "/contact?sujet=devis&support=flyers",
    accent: "var(--hm-magenta)",
    fallbackGradient: "linear-gradient(135deg, #D64A9A 0%, #C13C8A 55%, #4B2A6F 100%)",
  },
  {
    icon:  ImageIcon,
    label: "Affiches & posters",
    line:  "30×40 à 50×70 cm · 200 g/m² · Grand format",
    image: "/images/home/hm-print-affiches-posters.webp",
    href:  "/contact?sujet=devis&support=affiches",
    accent: "var(--hm-violet)",
    fallbackGradient: "linear-gradient(135deg, #C13C8A 0%, #4B2A6F 55%, #3B235A 100%)",
  },
  {
    icon:  Frame,
    label: "Toiles canvas",
    line:  "Cadre bois FSC · Impression haute résolution",
    image: "/images/home/hm-print-toiles-canvas.webp",
    href:  "/contact?sujet=devis&support=canvas",
    accent: "var(--hm-cyan)",
    fallbackGradient: "linear-gradient(135deg, #54B6D2 0%, #4B2A6F 55%, #C13C8A 100%)",
  },
];

function ItemVisual({ item }: { item: ShowcaseItem }) {
  const [failed, setFailed] = useState(false);
  const Icon = item.icon;

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: item.fallbackGradient }}
      >
        <div
          className="absolute h-2/3 w-2/3 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
            filter: "blur(14px)",
          }}
        />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-white/95"
          style={{ boxShadow: "0 16px 32px rgba(0,0,0,0.22)" }}
        >
          <Icon size={26} style={{ color: item.accent }} />
        </div>
      </div>
    );
  }

  const isContain = item.fit === "contain";

  return (
    <Image
      src={item.image}
      alt={item.label}
      fill
      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 95vw"
      className={
        isContain
          ? "object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
          : "object-cover transition duration-500 group-hover:scale-[1.03]"
      }
      onError={() => setFailed(true)}
    />
  );
}

export default function HomeVisualShowcase() {
  return (
    <section
      className="py-14 sm:py-20"
      style={{ background: "#FAFBFC" }}
    >
      <div className="container">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p
              className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--hm-magenta)" }}
            >
              Impression · Devis cadré
            </p>
            <h2
              className="font-semibold leading-[1.08] tracking-[-0.02em]"
              style={{
                fontSize: "clamp(1.5rem, 2.6vw + 0.4rem, 2.3rem)",
                color: "var(--hm-text-main)",
              }}
            >
              Des supports imprimés{" "}
              <span style={{ color: "var(--hm-violet)" }}>
                prêts pour votre image
              </span>
              .
            </h2>
            <p
              className="mt-3 max-w-[44rem] text-[13.5px] leading-6"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              Cartes, flyers, affiches ou canvas : envoyez votre fichier ou
              votre brief, on cadre le devis et le BAT avant production.
            </p>
          </div>
          <Link
            href="/contact?sujet=devis&support=impression"
            className="btn-hm-violet-outline shrink-0 self-start lg:self-auto"
          >
            Demander un devis print
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] bg-white transition duration-300 hover:-translate-y-1"
                style={{
                  border: "1px solid rgba(45,35,64,0.08)",
                  boxShadow: "0 6px 18px rgba(45,35,64,0.04)",
                }}
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden"
                  style={{ background: "#f6f7f9" }}
                >
                  <ItemVisual item={item} />
                  {/* Liseré couleur subtil */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[3px]"
                    style={{ background: item.accent }}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: "rgba(84,182,210,0.10)",
                        color: item.accent,
                      }}
                    >
                      <Icon size={15} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-[14px] font-semibold leading-snug tracking-[-0.01em]"
                        style={{ color: "var(--hm-text-main)" }}
                      >
                        {item.label}
                      </h3>
                      <p
                        className="mt-1 text-[12px] leading-5"
                        style={{ color: "var(--hm-text-muted-2)" }}
                      >
                        {item.line}
                      </p>
                    </div>
                  </div>

                  <span
                    className="mt-auto inline-flex items-center justify-between gap-1.5 border-t pt-3 text-[11.5px] font-semibold transition group-hover:gap-2.5"
                    style={{
                      borderColor: "rgba(84,182,210,0.16)",
                      color: item.accent,
                    }}
                  >
                    Demander un devis
                    <ArrowRight size={12} />
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
