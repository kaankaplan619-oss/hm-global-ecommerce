import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

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
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              <span
                className="inline-block h-px w-8"
                style={{ background: "rgba(45,35,64,0.22)" }}
              />
              Atelier &amp; agence · Souffelweyersheim · depuis 2018
            </p>

            <h1
              className="font-bold [text-wrap:balance]"
              style={{
                fontSize: "clamp(2.1rem, 3.7vw + 0.65rem, 3.55rem)",
                lineHeight: 1.07,
                letterSpacing: "-0.03em",
                color: "var(--hm-text-main)",
              }}
            >
              On habille votre équipe, vos murs et votre vitrine.
            </h1>

            <p
              className="mt-5 max-w-[38rem] text-[14.5px] leading-[1.65] sm:text-[15px]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              Textile à votre logo, supports imprimés et enseignes — un seul
              atelier, à Souffelweyersheim. Vous validez votre BAT avant
              qu&apos;on lance la machine.
            </p>

            {/* CTAs orientés achat (trafic Instagram → boutique directe).
                Le devis rapide reste accessible via le menu, la section
                signalétique et le CTA final. */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Link
                href="/catalogue"
                className="btn-hm-magenta w-full justify-center sm:w-auto"
              >
                Je personnalise mon textile
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/devis-rapide"
                className="btn-hm-violet-outline w-full justify-center sm:w-auto"
              >
                Devis gratuit en 24h
              </Link>
            </div>

            {/* Chips preuve sociale sous les CTAs */}
            <div
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <Star size={13} className="fill-current" style={{ color: "var(--hm-magenta)" }} />
                <span>
                  <strong style={{ color: "var(--hm-text-main)" }}>4,9/5</strong>{" "}
                  · 200+ projets livrés
                </span>
              </span>
              <span
                aria-hidden
                className="hidden h-3 w-px sm:inline-block"
                style={{ background: "rgba(45,35,64,0.15)" }}
              />
              <span>Réponse à votre devis sous 24h</span>
            </div>
          </div>

          {/* ── Colonne droite : visuel principal + 2 vraies réalisations ──
              Grande image = ambiance « tout-en-un » (IA, choix Kaan 2026-06-11).
              V2 après retour Kaan : style « vraie photo d'atelier PME au
              smartphone » (murs blancs, rayonnages, lumière neutre) pour rester
              raccord avec les vraies photos — plus de rendu showroom. Aucun
              texte lisible, aucun produit vendable. Les deux petites restent de
              VRAIES commandes clients (Atelier du Pide + enseigne MiAMMi). */}
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
                    src="/images/home/hm-hero-atelier-v2.jpg"
                    alt="Atelier de communication visuelle : presse à chaud textile, supports imprimés et enseigne lumineuse"
                    fill
                    priority
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="hm-kenburns object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem]"
                    style={{ background: "#f6f7f9" }}
                  >
                    {/* Photo fournie par Kaan (2026-06-11, IMG_1917) : t-shirt
                        noir floqué blanc « Atelier du Pide » (logo bien lisible),
                        t-shirt kaki en appui. Crop 4:3 centré sur le logo. */}
                    <Image
                      src="/images/realisations/atelier-du-pide-hero-v2.jpg"
                      alt="T-shirt noir floqué « Atelier du Pide » et t-shirt kaki, réalisés par HM Global"
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
