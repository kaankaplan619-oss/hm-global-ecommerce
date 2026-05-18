"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * HeroPackImage — image hero "pack agence 360" avec chaîne de fallback.
 *
 * Ordre de chargement :
 *   1. /images/home/hm-hero-agence-360.webp   (priorité — image marketing premium)
 *   2. /images/home/hm-hero-agence-360.jpg    (fallback compat)
 *   3. Fallback brand : logo HM blanc inversé + tagline sur gradient cyan/violet/magenta
 *
 * Image LCP : `priority` activé.
 */

const SOURCES = [
  "/images/home/hm-hero-agence-360.webp",
  "/images/home/hm-hero-agence-360.jpg",
] as const;

const ALT_TEXT =
  "Pack agence 360 HM Global : laptop avec logo HM Global, tablette, hoodie noir HM Global plié, t-shirt blanc HM Global, carte de visite, enveloppe et palette de couleurs sur table en bois clair.";

export default function HeroPackImage() {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [allFailed,   setAllFailed]   = useState(false);

  const handleError = () => {
    if (sourceIndex < SOURCES.length - 1) {
      setSourceIndex((i) => i + 1);
    } else {
      setAllFailed(true);
    }
  };

  if (allFailed) {
    // Fallback brand : logo HM Global centré sur gradient signature.
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex flex-col items-center justify-center px-6"
        style={{
          background:
            "linear-gradient(135deg, #6EC7DD 0%, #54B6D2 28%, #4B2A6F 68%, #C13C8A 100%)",
        }}
      >
        <div
          className="absolute h-72 w-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div className="relative">
          <Image
            src="/logo/hm-global-logo.png"
            alt="HM Global Agence"
            width={420}
            height={108}
            priority
            className="h-auto w-[60%] max-w-[360px] sm:w-[55%]"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
        <p className="relative mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-white/85 sm:text-[12px]">
          Textile · Print · Communication visuelle
        </p>
      </div>
    );
  }

  return (
    <Image
      src={SOURCES[sourceIndex]}
      alt={ALT_TEXT}
      fill
      priority
      sizes="(min-width: 1024px) 45vw, 100vw"
      className="object-cover"
      onError={handleError}
    />
  );
}
