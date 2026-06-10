import Link from "next/link";
import { ArrowRight, ShieldCheck, Layers, Truck, Star } from "lucide-react";
import HeroPackImage from "./HeroPackImage";

/**
 * HomeHeroPremium — Hero principal homepage HM Global (palette 2026).
 *
 * Phase polish P1 :
 *   - Compactage vertical (paddings réduits, layout plus dense)
 *   - Plus de cyan (halos, badges, micro-traits) pour rappeler le logo HM
 *   - CTA principal magenta (créatif) + outline violet (sérieux)
 *   - Chips de preuve sociale sous les CTAs
 *   - Badges flottants en bas de l'image (cohabite mieux avec le sujet visuel)
 *   - Cadre image plus large, halo cyan + magenta plus présents
 */

const HERO_BADGES = [
  { icon: ShieldCheck, label: "BAT avant production" },
  { icon: Layers,      label: "Textile + print" },
  { icon: Truck,       label: "Livraison France" },
] as const;

export default function HomeHeroPremium() {
  return (
    <section
      className="relative overflow-hidden pt-[var(--site-header-offset)]"
      style={{ background: "#ffffff" }}
    >

      <div className="container relative z-10 pb-12 pt-6 md:pb-16 md:pt-10 lg:pb-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">

          {/* ── Colonne gauche : texte + CTAs ─────────────────────────── */}
          <div className="order-1 max-w-[42rem] lg:order-1">

            <p
              className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{
                borderColor: "rgba(45,35,64,0.10)",
                color: "var(--hm-violet)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--hm-cyan)" }}
              />
              Agence de communication · Alsace
            </p>

            <h1
              className="font-semibold leading-[1.04] tracking-[-0.025em]"
              style={{
                fontSize: "clamp(2rem, 3.8vw + 0.6rem, 3.4rem)",
                color: "var(--hm-text-main)",
              }}
            >
              Textile personnalisé, print et communication pour entreprises.
            </h1>

            <p
              className="mt-5 max-w-[38rem] text-[14.5px] leading-[1.65] sm:text-[15px]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              HM Global vous accompagne de la création du visuel jusqu&apos;à la
              production : textiles professionnels, supports imprimés,
              signalétique et BAT avant fabrication.
            </p>

            {/* CTAs orientés achat (trafic Instagram → boutique directe).
                Le devis rapide reste accessible via le menu, la section
                signalétique et le CTA final. */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Link
                href="/catalogue"
                className="btn-hm-magenta w-full justify-center sm:w-auto"
              >
                Voir le catalogue textile
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/impression"
                className="btn-hm-violet-outline w-full justify-center sm:w-auto"
              >
                Commander une impression
              </Link>
            </div>

            {/* Chips preuve sociale sous les CTAs */}
            <div
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Star size={13} className="fill-current" style={{ color: "var(--hm-cyan)" }} />
                <span>
                  <strong style={{ color: "var(--hm-text-main)" }}>4.9/5</strong>{" "}
                  · 200+ projets livrés
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--hm-magenta)" }}
                />
                Réponse devis sous 24h
              </span>
            </div>
          </div>

          {/* ── Colonne droite : grande card visuelle ─────────────────── */}
          <div className="order-2 relative lg:order-2">
            <div
              className="relative overflow-hidden rounded-[1.8rem] bg-white p-2.5 sm:p-3"
              style={{
                boxShadow: "0 20px 48px rgba(45,35,64,0.08)",
                border: "1px solid rgba(45,35,64,0.06)",
              }}
            >

              <div
                className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem]"
                style={{ background: "#f6f7f9" }}
              >
                {/* Image hero — chaîne de fallback WebP → JPG → fallback graphique */}
                <HeroPackImage />

                {/* Badges flottants en bas (cohabitent avec le sujet visuel) */}
                <div className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center justify-center gap-1.5 sm:inset-x-4 sm:bottom-4 sm:gap-2">
                  {HERO_BADGES.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-[11px]"
                      style={{
                        color: "var(--hm-violet)",
                        boxShadow: "0 6px 16px rgba(59,35,90,0.12)",
                        border: "1px solid rgba(84,182,210,0.20)",
                      }}
                    >
                      <Icon size={12} style={{ color: "var(--hm-cyan)" }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
