"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, Check, Package } from "lucide-react";

/**
 * HomePack360 — "Tout pour lancer ou renforcer votre image."
 *
 * Version épurée :
 *   - Fond section blanc, card wrap blanche avec très léger gradient
 *     (cyan→blanc→magenta sur les bords pour rappeler la palette du logo HM)
 *   - Texte sombre lisible
 *   - Eyebrow cyan, accent typo cyan/magenta sur le titre
 *   - Image colis dominante à droite avec card propre
 *   - Livrables checkmarks cyan dans liste sobre
 *   - CTA magenta conservé
 */

const DELIVERABLES = [
  "Logo & identité visuelle",
  "Textile équipe personnalisé",
  "Cartes & flyers",
  "Enseigne & signalétique",
  "Supports entreprise cohérents",
] as const;

function PackClientImage() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "#f6f7f9" }}
      >
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-xl"
          style={{
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(45,35,64,0.10)",
          }}
        >
          <Package size={28} style={{ color: "var(--hm-violet)" }} />
        </div>
      </div>
    );
  }

  return (
    <Image
      src="/images/realisations/hm-global-print.jpg"
      alt="Cartes de visite et flyers HM Global imprimés, en piles, prêts à livrer — commande réelle."
      fill
      sizes="(min-width: 1024px) 45vw, 100vw"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function HomePack360() {
  return (
    <section className="py-12 sm:py-16" style={{ background: "#ffffff" }}>
      <div className="container">
        <div
          className="relative overflow-hidden rounded-[1.8rem]"
          style={{
            background:
              "linear-gradient(135deg, #f4f8fb 0%, #ffffff 45%, #faf3f7 100%)",
            border: "1px solid rgba(45,35,64,0.06)",
            boxShadow: "0 10px 32px rgba(45,35,64,0.06)",
          }}
        >
          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-10">

            {/* ── Colonne gauche : texte + livrables ─────────────────── */}
            <div className="px-6 pb-2 pt-10 sm:px-10 sm:pt-12 lg:py-14 lg:pl-14 lg:pr-0">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{
                  borderColor: "rgba(84,182,210,0.30)",
                  background: "rgba(84,182,210,0.06)",
                  color: "var(--hm-violet)",
                }}
              >
                <Sparkles size={11} style={{ color: "var(--hm-cyan)" }} />
                Pack communication complet
              </span>

              <h2
                className="mt-5 font-semibold leading-[1.06] tracking-[-0.02em]"
                style={{
                  fontSize: "clamp(1.55rem, 2.8vw + 0.4rem, 2.4rem)",
                  color: "var(--hm-text-main)",
                }}
              >
                Tout pour lancer ou renforcer{" "}
                <span style={{ color: "var(--hm-magenta)" }}>
                  votre image
                </span>
                .
              </h2>

              <p
                className="mt-4 max-w-[40rem] text-[14px] leading-[1.7] sm:text-[14.5px]"
                style={{ color: "var(--hm-text-muted-2)" }}
              >
                Cartes de visite, flyers, textile, enseignes, supports imprimés
                et communication digitale : vous gardez un seul interlocuteur.
              </p>

              {/* Liste livrables — checkmarks cyan sur fond clair */}
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {DELIVERABLES.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[13px]"
                    style={{ color: "var(--hm-text-main)" }}
                  >
                    <span
                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "rgba(84,182,210,0.16)" }}
                    >
                      <Check
                        size={10}
                        strokeWidth={2.5}
                        style={{ color: "var(--hm-cyan)" }}
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Link href="/contact" className="btn-hm-magenta">
                  Parler de mon projet
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* ── Colonne droite : image pack client ──────────────────── */}
            <div className="relative px-6 pb-10 sm:px-10 sm:pb-12 lg:py-8 lg:pl-0 lg:pr-8">
              <div
                className="relative h-full overflow-hidden rounded-[1.3rem] bg-white"
                style={{
                  boxShadow: "0 12px 32px rgba(45,35,64,0.10)",
                  border: "1px solid rgba(45,35,64,0.06)",
                  minHeight: "260px",
                }}
              >
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[360px]">
                  <PackClientImage />
                  <span
                    className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold backdrop-blur-sm"
                    style={{
                      color: "var(--hm-violet)",
                      boxShadow: "0 6px 16px rgba(45,35,64,0.10)",
                      border: "1px solid rgba(45,35,64,0.06)",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--hm-cyan)" }}
                    />
                    Livré clé en main
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
