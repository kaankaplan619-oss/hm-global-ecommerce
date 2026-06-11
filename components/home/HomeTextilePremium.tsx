"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Shirt } from "lucide-react";

/**
 * HomeTextilePremium — Section "Des textiles personnalisés pensés pour votre image."
 *
 * Combine deux visuels :
 *   - hoodie noir porté avec logo cœur (image principale grande)
 *   - macro textile avec logo HM Global (image secondaire qualité/détail)
 *
 * Sources attendues :
 *   /images/realisations/good-eye-deer-tshirts.jpg
 *   /images/home/hm-macro-textile-logo.webp
 *
 * Fallback graphique premium si une image est absente.
 */

function TextileImage({
  src,
  alt,
  sizes,
  fallbackIcon: Icon = Shirt,
  fallbackGradient = "linear-gradient(135deg, #6EC7DD 0%, #54B6D2 40%, #4B2A6F 100%)",
  imgClassName = "object-cover",
}: {
  src: string;
  alt: string;
  sizes: string;
  fallbackIcon?: typeof Shirt;
  fallbackGradient?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: fallbackGradient }}
      >
        <div
          className="absolute h-2/3 w-2/3 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
            filter: "blur(16px)",
          }}
        />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-white/95"
          style={{ boxShadow: "0 16px 32px rgba(0,0,0,0.22)" }}
        >
          <Icon size={28} style={{ color: "var(--hm-violet)" }} />
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={imgClassName}
      onError={() => setFailed(true)}
    />
  );
}

export default function HomeTextilePremium() {
  return (
    <section
      className="py-14 sm:py-20"
      style={{ background: "#FAFBFC" }}
    >
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:gap-10">

          {/* ── Visuel principal — hoodie porté ───────────────────────── */}
          <div className="order-2 lg:order-1">
            <div
              className="relative overflow-hidden rounded-[1.6rem] bg-white"
              style={{
                boxShadow: "0 8px 24px rgba(45,35,64,0.05)",
                border: "1px solid rgba(45,35,64,0.08)",
              }}
            >
              <div className="relative aspect-[16/10]">
                <TextileImage
                  src="/images/realisations/good-eye-deer-tshirts.jpg"
                  alt="Série de t-shirts noirs Good Eye Deer marqués en blanc par HM Global — commande client réelle, recto et dos."
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
                {/* Légende discrète bas-gauche */}
                <span
                  className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm"
                  style={{
                    color: "var(--hm-violet)",
                    boxShadow: "0 6px 16px rgba(59,35,90,0.12)",
                    border: "1px solid rgba(84,182,210,0.20)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--hm-cyan)" }}
                  />
                  Logo cœur · broderie
                </span>
              </div>
            </div>
          </div>

          {/* ── Colonne droite : texte + visuel macro ─────────────────── */}
          <div className="order-1 flex flex-col gap-6 lg:order-2 lg:gap-7">
            <div>
              <p
                className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--hm-cyan)" }}
              >
                Textile personnalisé
              </p>
              <h2
                className="font-semibold leading-[1.08] tracking-[-0.02em]"
                style={{
                  fontSize: "clamp(1.45rem, 2.4vw + 0.4rem, 2.1rem)",
                  color: "var(--hm-text-main)",
                }}
              >
                Des textiles personnalisés pensés{" "}
                <span style={{ color: "var(--hm-violet)" }}>
                  pour votre image
                </span>
                .
              </h2>
              <p
                className="mt-4 text-[14px] leading-[1.65]"
                style={{ color: "var(--hm-text-muted-2)" }}
              >
                Logo cœur, marquage dos, broderie, DTF ou flex : nous préparons
                votre BAT avant production pour garantir un rendu propre et
                cohérent.
              </p>
              <div className="mt-5">
                <Link
                  href="/catalogue"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition hover:gap-2.5"
                  style={{ color: "var(--hm-magenta)" }}
                >
                  Voir les textiles
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Visuel macro logo */}
            <div
              className="relative overflow-hidden rounded-[1.4rem]"
              style={{
                boxShadow: "0 8px 24px rgba(45,35,64,0.05)",
                border: "1px solid rgba(45,35,64,0.08)",
              }}
            >
              <div className="relative aspect-[4/3]">
                <TextileImage
                  src="/images/home/hm-macro-textile-logo.webp"
                  alt="Macro textile avec logo HM Global brodé, gros plan sur la qualité du marquage."
                  sizes="(min-width: 1024px) 25vw, 100vw"
                  fallbackGradient="linear-gradient(135deg, #54B6D2 0%, #4B2A6F 60%, #3B235A 100%)"
                />
                <span
                  className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold backdrop-blur-sm"
                  style={{
                    color: "var(--hm-violet)",
                    boxShadow: "0 6px 16px rgba(59,35,90,0.12)",
                    border: "1px solid rgba(84,182,210,0.20)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--hm-magenta)" }}
                  />
                  Détail finition
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
