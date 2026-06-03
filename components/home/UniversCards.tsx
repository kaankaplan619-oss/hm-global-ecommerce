import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  ClipboardList,
  LayoutGrid,
} from "lucide-react";

/**
 * UniversCards — 3 entrées concrètes sous le hero.
 *
 * Réécrit pour parler aux pros : événement, club, entreprise multi-support.
 * Chaque carte porte un exemple chiffré et un CTA explicite.
 *
 * Pas d'icône abstraite type "Sparkles" — on parle d'un parcours qui existe :
 *   1. Commande en ligne (volume connu, support standard)
 *   2. Devis volume (≥ 50 pièces ou demande spécifique)
 *   3. Projet multi-support (textile + print + signalétique pour entreprise)
 */

const PATHS = [
  {
    icon: ShoppingBag,
    eyebrow: "Commande en ligne",
    title: "Une commande simple quand le besoin est clair",
    desc: "Vous savez ce que vous voulez : t-shirt, hoodie, technique, taille. Commandez directement.",
    example: "Ex. 10 t-shirts DTF pour un événement associatif",
    cta: "Voir le catalogue textile",
    href: "/catalogue",
    accent: "var(--hm-primary)",
    accentSoft: "rgba(177,63,116,0.10)",
  },
  {
    icon: ClipboardList,
    eyebrow: "Devis volume",
    title: "Un devis quand le volume ou le support demande conseil",
    desc: "Tarif dégressif au-delà de 50 pièces, BAT inclus, conseils sur la meilleure technique.",
    example: "Ex. 50 sweats brodés pour un club ou une équipe",
    cta: "Demander un devis volume",
    href: "/contact?sujet=devis",
    accent: "var(--hm-purple)",
    accentSoft: "rgba(76,47,111,0.10)",
  },
  {
    icon: LayoutGrid,
    eyebrow: "Projet multi-support",
    title: "Un accompagnement quand il faut plusieurs supports",
    desc: "Textile équipe + cartes de visite + flyers + signalétique : un seul interlocuteur du fichier à la livraison.",
    example: "Ex. ouverture d'un restaurant ou rebranding PME",
    cta: "Parler de votre projet",
    href: "/contact",
    accent: "var(--hm-blue)",
    accentSoft: "rgba(110,193,223,0.16)",
  },
] as const;

export default function UniversCards() {
  return (
    <section className="py-10 sm:py-14">
      <div className="container">
        <div className="mb-8 max-w-2xl">
          <p className="section-tag">Trois façons de travailler avec nous</p>
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--hm-text)]"
            style={{ fontSize: "clamp(1.5rem, 2.4vw + 0.4rem, 2.3rem)" }}
          >
            Du t-shirt unitaire à l&apos;identité visuelle complète, on couvre les trois cas.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {PATHS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.title}
                href={p.href}
                className="group relative flex flex-col rounded-2xl border border-[var(--hm-line)] bg-white p-6 shadow-[0_10px_24px_rgba(63,45,88,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(63,45,88,0.08)]"
              >
                {/* Liseré de couleur en haut */}
                <span
                  className="absolute inset-x-6 top-0 h-[3px] rounded-b-full"
                  style={{ background: p.accent }}
                />

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: p.accentSoft, color: p.accent }}
                >
                  <Icon size={20} />
                </div>

                <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--hm-text-muted)]">
                  {p.eyebrow}
                </p>
                <h3 className="mt-2 text-[1.05rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--hm-text)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                  {p.desc}
                </p>

                {/* Exemple concret encadré */}
                <p
                  className="mt-4 rounded-lg border border-dashed px-3 py-2 text-[11px] leading-5 text-[var(--hm-text-soft)]"
                  style={{
                    borderColor: p.accentSoft.replace(/0\.\d+/, "0.30"),
                    background: p.accentSoft.replace(/0\.\d+/, "0.04"),
                  }}
                >
                  {p.example}
                </p>

                <span
                  className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold transition group-hover:gap-2.5"
                  style={{ color: p.accent }}
                >
                  {p.cta}
                  <ArrowRight size={13} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
