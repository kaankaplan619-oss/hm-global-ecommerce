import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrushCleaning,
  CarFront,
  CheckCircle2,
  ChevronRight,
  FileImage,
  PanelsTopLeft,
  Shirt,
  Signpost,
} from "lucide-react";
import ProductImage from "@/components/product/ProductImage";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Découvrez des exemples de réalisations HM Global Agence en textile personnalisé, habillage véhicule, signalétique et print.",
};

const FEATURED_CASES = [
  {
    id: "textile-equipe",
    label: "Textile personnalisé",
    title: "Tenues d'équipe pour activité terrain",
    summary:
      "Exemple représentatif d'un besoin fréquent : équiper une équipe avec une base textile claire, cohérente et facile à réassortir.",
    image: "/images/products/jui62/PS_CGJUI62_NAVY-NEONGREEN.avif",
    imageAlt: "Softshell personnalisée HM Global",
    tags: ["Softshell", "Broderie", "Équipe terrain"],
  },
  {
    id: "hoodie-staff",
    label: "Textile événementiel",
    title: "Hoodies et sweats pour staff ou association",
    summary:
      "Base de réalisation adaptée aux événements, associations et équipes qui veulent un textile identifiable, confortable et lisible.",
    image: "/images/products/wu620/PS_CGWU620_BLACK.avif",
    imageAlt: "Hoodie personnalisé HM Global",
    tags: ["Hoodie", "DTF", "Staff / Association"],
  },
] as const;

const SERVICE_CASES = [
  {
    id: "vehicle",
    icon: CarFront,
    type: "Habillage véhicule",
    title: "Marquage utilitaire ou véhicule d'entreprise",
    text:
      "Pour les artisans, entreprises terrain ou structures mobiles, HM Global peut cadrer un habillage simple, lisible et cohérent avec l'identité visuelle.",
    bullets: [
      "Lettrage, covering partiel ou signalétique mobile",
      "Support pensé pour la visibilité terrain",
      "Demande de devis recommandée",
    ],
  },
  {
    id: "signage",
    icon: Signpost,
    type: "Signalétique",
    title: "Repérage, panneaux et supports de présence",
    text:
      "La signalétique est traitée comme un outil de visibilité et d'orientation, avec une logique plus fonctionnelle que décorative.",
    bullets: [
      "Panneaux, plaques, supports d'accueil",
      "Usage intérieur ou extérieur",
      "Projet à cadrer selon lieu et format",
    ],
  },
  {
    id: "print",
    icon: FileImage,
    type: "Print",
    title: "Supports imprimés pour diffusion et rendez-vous",
    text:
      "Cartes, flyers, supports salon ou documents commerciaux : la page prépare un emplacement crédible pour présenter ces réalisations plus tard.",
    bullets: [
      "Supports de communication courants",
      "Préparation PAO possible",
      "Compatible avec futurs cas clients réels",
    ],
  },
  {
    id: "design",
    icon: BrushCleaning,
    type: "Préparation visuelle",
    title: "Ajustement de fichiers, logo et cohérence graphique",
    text:
      "Avant une production textile ou print, HM Global peut aussi intervenir sur la mise au propre du visuel et la préparation du bon fichier.",
    bullets: [
      "Logo à reprendre ou simplifier",
      "Déclinaison selon support",
      "Étape utile avant marquage",
    ],
  },
] as const;

const BEFORE_AFTER = [
  {
    title: "Avant",
    text:
      "Le besoin est parfois simple dans l'idée, mais encore flou sur le support, la technique ou le fichier à produire.",
    points: [
      "Logo non adapté au textile",
      "Choix produit encore incertain",
      "Besoin multi-supports ou multi-équipes",
    ],
  },
  {
    title: "Après",
    text:
      "Le projet devient plus lisible : bon support, bonne technique, rendu cohérent et base plus claire pour commander ou demander un devis.",
    points: [
      "Produit et technique mieux cadrés",
      "Visuel prêt à être exploité",
      "Parcours plus simple jusqu'à la production",
    ],
  },
] as const;

const CATEGORY_PILLS = [
  "Textile personnalisé",
  "Habillage véhicule",
  "Signalétique",
  "Print",
  "Avant / Après",
  "Exemples représentatifs",
] as const;

export default function RealisationsPage() {
  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--hm-text-soft)]">
          <Link href="/" className="hover:text-[var(--hm-rose)]">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">Réalisations</span>
        </nav>

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div>
              <p className="section-tag">Réalisations HM Global</p>
              <h1 className="mb-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
                Une base visuelle crédible pour montrer ce que HM Global peut produire.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
                Cette page présente des exemples représentatifs de travaux textiles et de
                communication visuelle. Elle est pensée pour être utile dès maintenant, tout en
                restant prête à accueillir plus tard de vraies réalisations clients, des visuels
                terrain et des cas avant / après plus précis.
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link href="/catalogue" className="btn-primary gap-2">
                  Voir le catalogue
                  <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="btn-outline">
                  Demander un devis
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {CATEGORY_PILLS.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white px-4 py-4 text-sm leading-6 text-[var(--hm-text)] shadow-[0_14px_34px_rgba(63,45,88,0.04)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">Mises en situation</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              Des exemples représentatifs pour aider à se projeter.
            </h2>
            <p className="text-base leading-7 text-[var(--hm-text-soft)]">
              Même si tous les cas clients finaux ne sont pas encore publiés, la page montre déjà
              le type de réalisations que HM Global peut traiter et la manière dont elles
              pourront être présentées à terme.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {FEATURED_CASES.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[1.75rem] border border-[var(--hm-line)] bg-white shadow-[0_18px_48px_rgba(63,45,88,0.06)]"
              >
                <div className="relative aspect-[16/11] bg-[var(--hm-surface)]">
                  <ProductImage
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-contain"
                    label="Visuel de réalisation à venir"
                  />
                  <div className="absolute left-4 top-4 rounded-full border border-[var(--hm-line)] bg-white/95 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-[var(--hm-primary)] backdrop-blur-sm">
                    {item.label}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-[var(--hm-text)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--hm-text-soft)]">
                    {item.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-1 text-[11px] font-medium text-[var(--hm-text)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">Autres réalisations</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              Textile, véhicule, signalétique, print : une structure déjà prête à évoluer.
            </h2>
            <p className="text-base leading-7 text-[var(--hm-text-soft)]">
              Les blocs ci-dessous servent dès maintenant de base crédible pour présenter
              différents types de réalisations. Ils pourront être enrichis ensuite avec des
              photos réelles, noms de projets, détails techniques ou galeries complémentaires.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {SERVICE_CASES.map(({ id, icon: Icon, type, title, text, bullets }) => (
              <article
                key={id}
                className="flex h-full flex-col rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                      {type}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[var(--hm-text)]">{title}</h3>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                    <Icon className="h-5 w-5 text-[var(--hm-primary)]" />
                  </span>
                </div>

                <div className="mt-5 rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <PanelsTopLeft className="h-4 w-4 text-[var(--hm-primary)]" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                      Emplacement visuel prêt à recevoir un cas réel
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--hm-text-soft)]">{text}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {bullets.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hm-primary)]" />
                      <p className="text-sm leading-6 text-[var(--hm-text)]">{item}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 grid gap-6 lg:grid-cols-2">
          {BEFORE_AFTER.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-7 shadow-[0_18px_48px_rgba(63,45,88,0.05)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                {item.title} / après projet
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--hm-text)]">
                {item.title === "Avant"
                  ? "Le besoin est là, mais pas encore bien cadré"
                  : "Le projet devient plus lisible et plus exploitable"}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--hm-text-soft)]">{item.text}</p>

              <div className="mt-6 space-y-3">
                {item.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-4 text-sm leading-6 text-[var(--hm-text)]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="section-tag">Passer à l'action</p>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                Vous avez un besoin proche de ces réalisations ?
              </h2>
              <p className="text-base leading-7 text-[var(--hm-text-soft)]">
                Si le projet est déjà cadré, le catalogue vous permet d'avancer rapidement sur le
                textile. Si le besoin est plus large ou plus spécifique, HM Global peut reprendre
                le projet avec vous et construire la bonne réponse.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/catalogue"
                className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 transition-all duration-200 hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                  Commande textile
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--hm-text)]">
                  Voir les produits disponibles
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--hm-text-soft)]">
                  Pour un besoin textile déjà identifié et une commande plus directe.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
                  Accéder au catalogue
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>

              <Link
                href="/contact"
                className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 transition-all duration-200 hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                  Projet sur mesure
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--hm-text)]">
                  Demander un devis ou un cadrage
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--hm-text-soft)]">
                  Pour un projet mixte, visuel, signalétique, véhicule ou besoin encore à structurer.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
                  Ouvrir la demande
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
