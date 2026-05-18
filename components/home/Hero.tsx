import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Clock3 } from "lucide-react";

/**
 * Hero homepage — version sobre e-commerce (refonte).
 *
 * Objectif : moins kitsch que la version précédente, plus professionnel.
 * Mise en avant claire des 3 axes HM : textile + impression + accompagnement.
 *
 * Pas de superpositions complexes, pas de cartes flottantes,
 * juste un titre clair, 3 CTA, et un visuel propre.
 */

const PROOF_POINTS = [
  "Validation fichier avant production",
  "Accompagnement humain à chaque étape",
  "Livraison France entière, paiement sécurisé",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-[var(--site-header-offset)]">
      {/* Fond sobre */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #fafafa 60%, #f5f4f1 100%)",
        }}
      />
      {/* Lueur rose ultra-discrète */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px]"
        style={{ background: "radial-gradient(circle, rgba(177,63,116,0.05) 0%, transparent 65%)" }}
      />

      <div className="container relative z-10 pb-14 pt-10 md:pb-20 md:pt-14 lg:pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">

          {/* ── Colonne gauche : titre + CTAs ─────────────────────────────── */}
          <div className="max-w-[40rem]">

            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)] bg-white px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--hm-text-soft)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--hm-primary)]" />
              HM Global Agence · Alsace
            </p>

            <h1
              className="font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--hm-text)]"
              style={{ fontSize: "clamp(2rem, 4vw + 0.5rem, 3.6rem)" }}
            >
              Textile personnalisé,{" "}
              <span className="text-[var(--hm-primary)]">print &amp; supports de communication</span>{" "}
              pour les pros.
            </h1>

            <p className="mt-5 max-w-[38rem] text-[15px] leading-7 text-[var(--hm-text-soft)] sm:text-base">
              T-shirts, sweats, cartes de visite, flyers, affiches et signalétique :
              commandez en ligne ou demandez un accompagnement HM Global.
            </p>

            {/* ── 3 CTAs ────────────────────────────────────────────────── */}
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Link
                href="/catalogue"
                className="btn-primary w-full justify-center gap-2 px-6 py-3.5 text-[12px] sm:w-auto"
              >
                Commander du textile
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/impression"
                className="btn-outline w-full justify-center gap-2 px-6 py-3.5 text-[12px] sm:w-auto"
              >
                Voir le catalogue print
              </Link>
              <Link
                href="/contact?sujet=devis"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[12px] font-semibold text-[var(--hm-text-soft)] transition hover:text-[var(--hm-primary)] sm:w-auto"
              >
                Demander un devis
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* ── Engagements ────────────────────────────────────────────── */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              {PROOF_POINTS.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <BadgeCheck size={14} className="shrink-0 text-[var(--hm-primary)]" />
                  <span className="text-[12px] leading-5 text-[var(--hm-text-soft)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne droite : visuel sobre (textile + print) ─────────── */}
          <div className="relative">
            <div className="grid gap-4 sm:grid-cols-2">

              {/* Carte textile — hoodie noir mockup Printify */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-3 shadow-[0_12px_32px_rgba(63,45,88,0.06)]">
                <div
                  className="relative aspect-square overflow-hidden rounded-xl"
                  style={{ background: "#fafaf9" }}
                >
                  <Image
                    src="/mockups/printify/gildan-18500/noir-front.jpg"
                    alt="Hoodie noir HM Global"
                    fill
                    priority
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-contain p-2"
                  />
                </div>
                <div className="mt-3 px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-muted)]">
                    Textile
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[var(--hm-text)]">
                    Hoodie, sweat, T-shirt
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--hm-text-soft)]">
                    DTF · Flex · Broderie
                  </p>
                </div>
              </div>

              {/* Carte print — vrai mockup carte de visite premium */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-3 shadow-[0_12px_32px_rgba(63,45,88,0.06)] sm:mt-8">
                <div
                  className="relative aspect-square overflow-hidden rounded-xl"
                  style={{ background: "linear-gradient(160deg, #f7f6f4 0%, #ebe8e2 100%)" }}
                >
                  <Image
                    src="/mockups/print/business-card/carte-visite-premium.webp"
                    alt="Cartes de visite premium imprimées par HM Global"
                    fill
                    priority
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-contain p-2"
                  />
                </div>
                <div className="mt-3 px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-muted)]">
                    Impression
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[var(--hm-text)]">
                    Cartes, flyers, affiches
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--hm-text-soft)]">
                    BAT validé · Devis avant production
                  </p>
                </div>
              </div>
            </div>

            {/* Bandeau délai discret sous le visuel */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)] bg-white px-4 py-2 shadow-sm">
              <Clock3 size={13} className="text-[var(--hm-primary)]" />
              <span className="text-[11px] font-semibold text-[var(--hm-text)]">
                Premier retour sous 24h
              </span>
              <span className="text-[11px] text-[var(--hm-text-soft)]">
                · Production 7–10 jours
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
