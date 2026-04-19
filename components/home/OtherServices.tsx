import Link from "next/link";
import {
  ArrowRight,
  BrushCleaning,
  FileStack,
  Landmark,
  Palette,
  Sticker,
  Truck,
  BadgeCheck,
} from "lucide-react";

// ─── Données ──────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: Sticker,
    title: "Lettrage",
    description:
      "Vitrines, bureaux, ateliers ou véhicules : HM Global prépare et pose un marquage lisible, durable et cohérent avec votre image.",
    useCase: "Idéal pour signaler un point de vente ou habiller une flotte.",
    iconBg: "bg-[var(--hm-accent-soft-rose)]",
    iconColor: "text-[var(--hm-rose)]",
  },
  {
    icon: Truck,
    title: "Habillage véhicule",
    description:
      "Du lettrage simple au covering partiel, le projet est cadré selon le support, les contraintes de pose et l'objectif de visibilité.",
    useCase: "Pour artisans, entreprises terrain, équipes commerciales ou utilitaires.",
    iconBg: "bg-[var(--hm-accent-soft-blue)]",
    iconColor: "text-[var(--hm-blue)]",
  },
  {
    icon: Landmark,
    title: "Totems & supports extérieurs",
    description:
      "HM Global accompagne les besoins de présence physique avec des supports pensés pour être vus, compris et intégrés à votre environnement.",
    useCase: "Zones d'accueil, sites d'activité, accès clients.",
    iconBg: "bg-[var(--hm-accent-soft-purple)]",
    iconColor: "text-[var(--hm-purple)]",
  },
  {
    icon: BadgeCheck,
    title: "Signalétique",
    description:
      "Panneaux, plaques, repérage intérieur ou extérieur : la signalétique est traitée comme un outil pratique, pas comme un simple décor.",
    useCase: "Pour orienter, rassurer et professionnaliser vos espaces.",
    iconBg: "bg-[var(--hm-accent-soft-rose)]",
    iconColor: "text-[var(--hm-rose)]",
  },
  {
    icon: FileStack,
    title: "Print",
    description:
      "Cartes, flyers, supports commerciaux et impressions utiles, préparés avec une logique d'usage, de lisibilité et de cohérence graphique.",
    useCase: "Pour vos besoins terrain, salons, rendez-vous et diffusion locale.",
    iconBg: "bg-[var(--hm-accent-soft-blue)]",
    iconColor: "text-[var(--hm-blue)]",
  },
  {
    icon: Palette,
    title: "Design, PAO & logo",
    description:
      "Création ou reprise de visuels, préparation de fichiers, déclinaisons et cadrage graphique avant impression ou production.",
    useCase: "Quand il faut remettre au propre ou faire avancer un projet rapidement.",
    iconBg: "bg-[var(--hm-accent-soft-purple)]",
    iconColor: "text-[var(--hm-purple)]",
  },
] as const;

// ─── Composant ────────────────────────────────────────────────────────────────

export default function OtherServices() {
  return (
    <section className="section bg-white" id="savoir-faire">
      <div className="container">

        {/* ── En-tête ────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-tag">Autres services</p>
            <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight
              text-[var(--hm-text)] md:text-4xl">
              Le textile n'est qu'une partie
              <br />
              <span className="text-gradient-gold">du savoir-faire HM Global</span>
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
              Signalétique, habillage véhicule, print, design — HM Global accompagne
              aussi les besoins de communication visuelle. Ces prestations se cadrent
              avec vous avant de partir en production : un échange rapide permet
              d'orienter vers le bon devis.
            </p>
          </div>

          {/* Pill "approche projet" — contexte en un coup d'œil */}
          <div className="flex shrink-0 items-start gap-3 rounded-2xl border
            border-[var(--hm-line)] bg-[var(--hm-surface)]
            px-4 py-3 self-start lg:self-auto lg:max-w-[260px]">
            <BrushCleaning size={15} className="mt-0.5 shrink-0 text-[var(--hm-rose)]" />
            <p className="text-[11px] leading-relaxed text-[var(--hm-text-soft)]">
              Ces prestations ne se commandent pas en un clic.
              HM Global les cadre avec vous selon le support,
              les contraintes et l'objectif.
            </p>
          </div>
        </div>

        {/* ── Grille services ───────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="group flex flex-col rounded-2xl border border-[var(--hm-line)]
                  bg-[var(--hm-surface)] p-5 transition-all duration-300
                  hover:border-[rgba(177,63,116,0.22)]
                  hover:shadow-[0_10px_28px_rgba(63,45,88,0.08)]
                  hover:-translate-y-0.5"
              >
                {/* Icône */}
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center
                  rounded-xl ${service.iconBg}`}>
                  <Icon size={17} className={service.iconColor} />
                </div>

                {/* Titre */}
                <h3 className="mb-2 text-[15px] font-black text-[var(--hm-text)]
                  transition-colors group-hover:text-[var(--hm-rose)]">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mb-3 flex-1 text-[12px] leading-relaxed
                  text-[var(--hm-text-soft)]">
                  {service.description}
                </p>

                {/* Cas d'usage */}
                <p className="mb-4 rounded-xl border border-[var(--hm-line)]
                  bg-white px-3 py-2 text-[11px] leading-snug
                  text-[var(--hm-text-muted)]">
                  {service.useCase}
                </p>

                {/* CTA carte */}
                <Link
                  href="/contact"
                  className="flex items-center gap-1.5 text-[11px] font-bold
                    text-[var(--hm-text-soft)] transition-all duration-200
                    group-hover:text-[var(--hm-rose)]"
                >
                  Demander un devis
                  <ArrowRight
                    size={10}
                    className="transition-transform duration-200
                      group-hover:translate-x-0.5"
                  />
                </Link>
              </article>
            );
          })}
        </div>

        {/* ── CTA bas de section ─────────────────────────────────────────── */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="btn-primary gap-2 px-6 py-3 text-[0.8rem]"
          >
            Demander un devis global
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/a-propos"
            className="btn-outline px-6 py-3 text-[0.8rem]"
          >
            Découvrir l'agence
          </Link>
        </div>

      </div>
    </section>
  );
}
