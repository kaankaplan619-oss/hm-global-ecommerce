import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Layers, Truck, Star } from "lucide-react";

/**
 * HomeHeroPremium — Hero principal homepage HM Global.
 *
 * V3 (2026-06-10, demande Kaan) : 100 % authentique HM Global.
 *   - Visuel = collage de VRAIES photos (atelier + réalisations clients),
 *     plus aucune image marketing générique. Textile mis en avant
 *     (produit le plus rentable), enseigne en appui (preuve d'atelier).
 *   - Copy textile-first, ancrée atelier Souffelweyersheim / depuis 2018.
 *   - Mise en page conservée : texte à gauche, visuel à droite.
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
              Atelier &amp; agence · Souffelweyersheim · depuis 2018
            </p>

            <h1
              className="font-semibold leading-[1.04] tracking-[-0.025em]"
              style={{
                fontSize: "clamp(2rem, 3.8vw + 0.6rem, 3.4rem)",
                color: "var(--hm-text-main)",
              }}
            >
              Vos textiles personnalisés, marqués dans notre atelier en Alsace.
            </h1>

            <p
              className="mt-5 max-w-[38rem] text-[14.5px] leading-[1.65] sm:text-[15px]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              T-shirts, sweats et polos à votre logo — DTF, flex ou broderie —
              et tous vos supports imprimés. BAT validé avant chaque
              production. En photo : notre atelier et de vraies commandes
              clients.
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

          {/* ── Colonne droite : collage de VRAIES photos HM Global ───────
              Grande image = marquage DTF à la presse dans l'atelier (textile,
              cœur du business). Deux petites = textile client livré (Prestige)
              + enseigne MiAMMi en fabrication (preuve d'atelier). */}
          <div className="order-2 relative lg:order-2">
            <div
              className="relative overflow-hidden rounded-[1.8rem] bg-white p-2.5 sm:p-3"
              style={{
                boxShadow: "0 20px 48px rgba(45,35,64,0.08)",
                border: "1px solid rgba(45,35,64,0.06)",
              }}
            >
              <div className="grid gap-2.5 sm:gap-3">
                <div
                  className="relative aspect-[16/9] overflow-hidden rounded-[1.3rem]"
                  style={{ background: "#f6f7f9" }}
                >
                  <Image
                    src="/images/home/hm-atelier-production-textile.jpg"
                    alt="Marquage DTF d'un t-shirt à la presse à chaud dans l'atelier HM Global à Souffelweyersheim"
                    fill
                    priority
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />

                  {/* Badges flottants sur la photo principale */}
                  <div className="absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
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

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem]"
                    style={{ background: "#f6f7f9" }}
                  >
                    <Image
                      src="/images/realisations/prestige-tshirts.jpg"
                      alt="T-shirts noirs marqués en DTF pour Prestige Bar à Vin, réalisés par HM Global"
                      fill
                      priority
                      sizes="(min-width: 1024px) 22vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem]"
                    style={{ background: "#f6f7f9" }}
                  >
                    <Image
                      src="/images/realisations/miammi-fabrication.jpg"
                      alt="Lettres d'enseigne rétroéclairées MiAMMi en fabrication à l'atelier HM Global"
                      fill
                      priority
                      sizes="(min-width: 1024px) 22vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
