import Link from "next/link";
import {
  BadgeCheck,
  BrushCleaning,
  FileStack,
  Landmark,
  MoveRight,
  Palette,
  Sticker,
  Truck,
} from "lucide-react";

const SERVICES = [
  {
    icon: Sticker,
    title: "Lettrage",
    description:
      "Vitrines, bureaux, ateliers ou véhicules : HM Global prépare et pose un marquage lisible, durable et cohérent avec votre image.",
    useCase: "Idéal pour signaler un point de vente ou habiller une flotte.",
  },
  {
    icon: Truck,
    title: "Habillage véhicule",
    description:
      "Du lettrage simple au covering partiel, le projet est cadré selon le support, les contraintes de pose et l'objectif de visibilité.",
    useCase: "Pour artisans, entreprises terrain, équipes commerciales ou utilitaires.",
  },
  {
    icon: Landmark,
    title: "Totems et supports extérieurs",
    description:
      "HM Global accompagne les besoins de présence physique avec des supports pensés pour être vus, compris et intégrés à votre environnement.",
    useCase: "Utile pour zones d'accueil, sites d'activité et accès clients.",
  },
  {
    icon: BadgeCheck,
    title: "Signalétique",
    description:
      "Panneaux, plaques, repérage intérieur ou extérieur : la signalétique est traitée comme un outil pratique, pas comme un simple décor.",
    useCase: "Pour orienter, rassurer et professionnaliser vos espaces.",
  },
  {
    icon: FileStack,
    title: "Print",
    description:
      "Cartes, flyers, supports commerciaux et impressions utiles sont préparés avec une logique d'usage, de lisibilité et de cohérence graphique.",
    useCase: "Pour vos besoins terrain, salons, rendez-vous et diffusion locale.",
  },
  {
    icon: Palette,
    title: "Design, PAO et logo",
    description:
      "Création ou reprise de visuels, préparation de fichiers, déclinaisons et cadrage graphique avant impression ou production.",
    useCase: "Quand il faut remettre au propre ou faire avancer un projet rapidement.",
  },
] as const;

const PROJECT_RULES = [
  "Projet étudié selon le support, le lieu, l'usage et la pose",
  "Orientation vers un devis sur mesure plutôt qu'un achat standardisé",
  "Accompagnement possible du fichier jusqu'à la fabrication",
] as const;

export default function OtherServices() {
  return (
    <section className="bg-[var(--hm-surface)] py-20 sm:py-24" id="savoir-faire">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full border border-[var(--hm-border)] bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)] shadow-[var(--hm-shadow-soft)]">
              Autres services HM Global
            </span>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-[var(--hm-ink)] sm:text-4xl">
              Le textile n'est qu'une partie du savoir-faire HM Global.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-[var(--hm-muted)] sm:text-lg">
              HM Global accompagne aussi les besoins de communication visuelle, de
              signalétique et de production sur mesure. L'objectif n'est pas de vendre
              un catalogue générique, mais de reprendre un besoin concret et de l'orienter
              vers une demande de devis claire.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[var(--hm-border)] bg-white p-6 shadow-[var(--hm-shadow-soft)] sm:p-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--hm-primary-soft)] text-[var(--hm-primary)]">
                <BrushCleaning className="h-5 w-5" />
              </span>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)]">
                  Approche projet
                </p>
                <h3 className="text-2xl font-semibold text-[var(--hm-ink)]">
                  Des prestations à cadrer avec vous, pas à commander en un clic.
                </h3>
                <p className="text-sm leading-6 text-[var(--hm-muted)] sm:text-base">
                  Pour ces services, HM Global privilégie un échange rapide afin de définir
                  le support, les contraintes techniques, les dimensions, la pose éventuelle
                  et le bon niveau de fabrication.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {PROJECT_RULES.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 py-3 text-sm leading-6 text-[var(--hm-ink)]"
                >
                  {rule}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn-primary px-6 py-3 text-sm">
                Demander un devis
              </Link>
              <Link href="/a-propos" className="btn-outline px-6 py-3 text-sm">
                Découvrir l'agence
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="flex h-full flex-col rounded-[1.75rem] border border-[var(--hm-border)] bg-white p-6 shadow-[var(--hm-shadow-soft)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--hm-primary-soft)] text-[var(--hm-primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[var(--hm-ink)]">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--hm-muted)] sm:text-[15px]">
                  {service.description}
                </p>
                <p className="mt-4 rounded-2xl border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 py-3 text-sm leading-6 text-[var(--hm-ink)]">
                  {service.useCase}
                </p>
              </article>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--hm-border)] bg-white px-6 py-6 shadow-[var(--hm-shadow-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)]">
              Besoin spécifique
            </p>
            <p className="max-w-2xl text-sm leading-6 text-[var(--hm-muted)] sm:text-base">
              Si votre besoin mélange textile, signalétique, marquage ou création graphique,
              le plus efficace reste une demande de devis unique pour cadrer l'ensemble.
            </p>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)] transition-opacity hover:opacity-80">
            Ouvrir la demande de devis
            <MoveRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
