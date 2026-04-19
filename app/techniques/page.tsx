import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Layers3,
  Scissors,
  Shirt,
  Sparkles,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Techniques de personnalisation",
  description:
    "Découvrez les différences entre DTF, flex et broderie avec HM Global Agence, et choisissez la technique la plus adaptée à votre textile, votre logo et votre usage.",
};

const TECHNIQUES = [
  {
    id: "dtf",
    icon: Zap,
    label: "DTF",
    tagline: "Le bon choix pour les visuels détaillés et les logos en couleur",
    accent: "text-[var(--hm-primary)]",
    iconBg: "bg-[var(--hm-accent-soft-rose)]",
    description:
      "Le DTF permet d'imprimer des visuels riches, avec plusieurs couleurs, dégradés ou détails fins. C'est la solution la plus polyvalente quand le logo ou le graphisme ne se limite pas à une forme simple.",
    strengths: [
      "Très bon rendu sur les logos multicolores",
      "Adapté aux petites et moyennes séries",
      "Bon équilibre entre qualité visuelle et souplesse",
    ],
    limits: "Moins pertinent si le besoin est très simple et monocolore.",
    bestFor: "T-shirts, sweats, hoodies, événements, équipes, visuels détaillés",
  },
  {
    id: "flex",
    icon: Scissors,
    label: "Flex",
    tagline: "Une solution nette et efficace pour les marquages simples",
    accent: "text-[var(--hm-blue)]",
    iconBg: "bg-[var(--hm-accent-soft-blue)]",
    description:
      "Le flex convient très bien aux lettrages, noms, numéros et logos simples. Le rendu est net, propre et lisible. C'est une bonne option quand le besoin est clair et sans complexité graphique.",
    strengths: [
      "Très lisible sur textes et formes simples",
      "Intéressant pour les séries courtes ou ciblées",
      "Rendu propre sur vêtements de travail ou de sport",
    ],
    limits: "Pas adapté aux dégradés, photos ou visuels très complexes.",
    bestFor: "Textes, numéros, marquages simples, petites séries, tenues de travail",
  },
  {
    id: "broderie",
    icon: Award,
    label: "Broderie",
    tagline: "La finition premium pour une image plus corporate",
    accent: "text-[var(--hm-purple)]",
    iconBg: "bg-[var(--hm-accent-soft-purple)]",
    description:
      "La broderie apporte du relief, de la tenue et une perception plus haut de gamme. Elle est particulièrement pertinente sur les supports plus épais ou quand le rendu doit être durable, sobre et valorisant.",
    strengths: [
      "Très bonne tenue dans le temps",
      "Rendu premium sur les vêtements professionnels",
      "Parfait pour les logos corporate ou institutionnels",
    ],
    limits: "Moins adaptée aux détails très fins ou aux visuels trop complexes.",
    bestFor: "Softshells, polos, vestes, tenues corporate, logos sobres",
  },
] as const;

const CHOICE_GUIDE = [
  {
    title: "Vous avez un logo multicolore ou détaillé",
    answer: "Le DTF est généralement la solution la plus naturelle.",
  },
  {
    title: "Vous avez un texte, un nom ou un marquage simple",
    answer: "Le flex est souvent le plus lisible et le plus direct.",
  },
  {
    title: "Vous cherchez un rendu plus premium et durable",
    answer: "La broderie est à privilégier sur les bons supports.",
  },
  {
    title: "Vous hésitez entre plusieurs supports ou usages",
    answer: "Le plus efficace est de nous demander conseil avant validation.",
  },
] as const;

const PRODUCT_FIT = [
  {
    product: "T-shirts",
    dtf: "Très adapté",
    flex: "Très adapté",
    embroidery: "Possible selon le projet",
  },
  {
    product: "Hoodies / Sweats",
    dtf: "Très adapté",
    flex: "Adapté",
    embroidery: "Très adapté",
  },
  {
    product: "Softshells / Vestes",
    dtf: "Possible selon le visuel",
    flex: "Plus rare",
    embroidery: "Le plus cohérent",
  },
] as const;

const PROJECT_SIGNALS = [
  "Le visuel n'est pas encore prêt ou doit être ajusté",
  "Vous avez un mix de produits ou plusieurs supports",
  "Le besoin est corporate, événementiel ou récurrent",
  "Vous voulez éviter une mauvaise technique dès le départ",
] as const;

export default function TechniquesPage() {
  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--hm-text-soft)]">
          <Link href="/" className="hover:text-[var(--hm-rose)]">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">Techniques</span>
        </nav>

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div>
              <p className="section-tag">Techniques de marquage</p>
              <h1 className="mb-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
                DTF, flex ou broderie :
                <br />
                choisir la bonne technique sans complexifier le projet.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
                Cette page aide à comprendre les différences entre les trois principales
                techniques utilisées par HM Global. Le but n&apos;est pas d&apos;entrer dans
                une fiche technique brute, mais de savoir ce qui convient le mieux selon
                le textile, le visuel et l&apos;usage attendu.
              </p>

              <div className="mt-8 flex flex-wrap gap-3.5">
                <Link href="/catalogue" className="btn-primary gap-2">
                  Voir les produits
                  <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="btn-outline">
                  Demander un conseil
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {TECHNIQUES.map(({ id, icon: Icon, label, tagline, iconBg, accent }) => (
                <article
                  key={id}
                  className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 shadow-[0_14px_34px_rgba(63,45,88,0.05)]"
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${accent}`} />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-[var(--hm-text)]">{label}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{tagline}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">Comprendre simplement</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              Trois techniques, trois logiques d&apos;usage.
            </h2>
            <p className="text-base leading-7 text-[var(--hm-text-soft)]">
              Le bon choix dépend rarement d&apos;un seul critère. Il faut regarder le visuel,
              le textile, la durabilité attendue et l&apos;image que vous voulez donner.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {TECHNIQUES.map(({ id, icon: Icon, label, tagline, description, strengths, limits, bestFor, iconBg, accent }) => (
              <article
                key={id}
                className="flex h-full flex-col rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                      {label}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[var(--hm-text)]">{tagline}</h3>
                  </div>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${accent}`} />
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-[var(--hm-text-soft)]">{description}</p>

                <div className="mt-6 rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                    Idéal pour
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text)]">{bestFor}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {strengths.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--hm-rose)]" />
                      <p className="text-sm leading-6 text-[var(--hm-text)]">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-[var(--hm-line)] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                    Point de vigilance
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{limits}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-7 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--hm-accent-soft-blue)]">
                <Layers3 className="h-5 w-5 text-[var(--hm-blue)]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                  Aide au choix
                </p>
                <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                  Quel marquage pour quel besoin ?
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {CHOICE_GUIDE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4"
                >
                  <p className="text-sm font-semibold text-[var(--hm-text)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                <Shirt className="h-5 w-5 text-[var(--hm-primary)]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                  Selon le support
                </p>
                <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                  Lecture rapide par famille de produit
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {PRODUCT_FIT.map((row) => (
                <div
                  key={row.product}
                  className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4"
                >
                  <p className="text-sm font-semibold text-[var(--hm-text)]">{row.product}</p>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--hm-text-soft)]">
                    <p>
                      <span className="font-medium text-[var(--hm-text)]">DTF :</span> {row.dtf}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--hm-text)]">Flex :</span> {row.flex}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--hm-text)]">Broderie :</span> {row.embroidery}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-14 rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-7 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="section-tag">Quand demander un devis</p>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                Le bon choix technique ne se décide pas toujours seul.
              </h2>
              <p className="text-base leading-7 text-[var(--hm-text-soft)]">
                Si le projet mélange plusieurs supports, un visuel à adapter, une demande urgente
                ou une logique corporate plus poussée, HM Global peut vous orienter avant de lancer
                la commande.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PROJECT_SIGNALS.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hm-primary)]" />
                    <p className="text-sm leading-6 text-[var(--hm-text)]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-white p-8 text-center shadow-[0_18px_48px_rgba(63,45,88,0.06)] sm:p-10">
          <p className="mx-auto mb-3 inline-flex items-center justify-center rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
            Aller plus loin
          </p>
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-[var(--hm-text)] sm:text-4xl">
            Vous savez déjà quoi commander, ou vous préférez être guidé ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--hm-text-soft)]">
            Si votre besoin est simple, le catalogue permet d&apos;avancer rapidement.
            Si le projet mérite un conseil ou un devis, HM Global reprend le sujet avec vous.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/catalogue" className="btn-primary gap-2">
              Voir le catalogue
              <ChevronRight size={16} />
            </Link>
            <Link href="/contact" className="btn-outline">
              Demander un devis
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
