import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  HardHat,
  Shirt,
  Store,
  Truck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solutions pour les entreprises",
  description:
    "HM Global Agence accompagne les entreprises, associations, restaurateurs, équipes terrain et organisateurs d'événements avec des solutions textiles et visuelles adaptées à leurs besoins concrets.",
};

const SECTORS = [
  {
    id: "btp",
    icon: HardHat,
    label: "BTP",
    needs: [
      "Tenues lisibles et robustes pour les équipes chantier",
      "Marquage simple, visible et durable",
      "Réassort possible sur les mêmes références",
    ],
    products: "T-shirts, hoodies, sweats et softshells",
    techniques: "Flex pour les marquages simples, broderie sur softshells, DTF selon le visuel",
    path: "Catalogue si le besoin est cadré. Devis si plusieurs équipes, tailles ou usages terrain.",
  },
  {
    id: "restauration",
    icon: Store,
    label: "Restauration",
    needs: [
      "Tenues cohérentes pour le personnel en salle ou en cuisine",
      "Image plus propre et plus identifiable face aux clients",
      "Supports adaptés à un usage régulier",
    ],
    products: "T-shirts, sweats, hoodies, polos ou vestes selon le cadre",
    techniques: "Broderie pour une image premium, DTF si le logo comporte plusieurs couleurs",
    path: "Catalogue pour les séries simples. Devis si tenue complète, logo à retravailler ou besoin récurrent.",
  },
  {
    id: "associations",
    icon: Users,
    label: "Associations",
    needs: [
      "Petites ou moyennes séries pour clubs, bureaux ou bénévoles",
      "Budget encadré avec rendu lisible",
      "Textile adapté aux événements, adhérents ou encadrants",
    ],
    products: "T-shirts, hoodies et sweats",
    techniques: "DTF pour les visuels détaillés, flex pour noms et marquages simples",
    path: "Catalogue pour les besoins standards. Devis si mix produits, quantités variables ou événement spécifique.",
  },
  {
    id: "evenements",
    icon: BriefcaseBusiness,
    label: "Événements",
    needs: [
      "Habiller rapidement une équipe ou un staff",
      "Créer un textile visible et cohérent avec l'identité de l'événement",
      "Coordonner plusieurs profils ou fonctions",
    ],
    products: "T-shirts, hoodies, sweats, softshells selon la saison",
    techniques: "DTF pour les visuels complets, flex pour staff, rôles et numérotation",
    path: "Catalogue si le besoin est simple et daté. Devis si urgence, volume ou plusieurs supports.",
  },
  {
    id: "pme",
    icon: Building2,
    label: "PME",
    needs: [
      "Uniformiser l'image de l'équipe",
      "Créer une base textile professionnelle pour les collaborateurs",
      "Avoir un rendu cohérent avec la communication globale",
    ],
    products: "T-shirts, sweats, hoodies, softshells et vestes corporate",
    techniques: "Broderie pour le rendu corporate, DTF pour les logos plus complexes",
    path: "Catalogue si les références sont déjà choisies. Devis si projet global ou besoin multi-supports.",
  },
  {
    id: "terrain",
    icon: Truck,
    label: "Équipes terrain / commerce",
    needs: [
      "Tenues pratiques et visibles pour déplacements et rendez-vous",
      "Marque plus identifiable sur le terrain",
      "Supports adaptés à la météo et à l'usage quotidien",
    ],
    products: "Softshells, sweats, hoodies et t-shirts",
    techniques: "Broderie sur vestes et softshells, flex ou DTF sur textiles plus légers",
    path: "Catalogue si le besoin est déjà clair. Devis si l'image doit être harmonisée sur plusieurs supports.",
  },
] as const;

const DECISION_RULES = [
  {
    title: "Passer par le catalogue",
    items: [
      "Le produit est déjà identifié",
      "Le logo est prêt à l'emploi",
      "La technique peut être choisie simplement",
      "Le besoin porte surtout sur du textile standard",
    ],
  },
  {
    title: "Demander un devis",
    items: [
      "Le besoin mélange plusieurs produits ou usages",
      "Le visuel doit être repris, adapté ou clarifié",
      "Le projet concerne plusieurs équipes ou plusieurs sites",
      "Vous avez besoin de textile et d'autres supports de communication",
    ],
  },
] as const;

const COMMON_REQUESTS = [
  "Habiller une équipe de chantier ou un personnel terrain",
  "Créer une tenue cohérente pour restaurant, commerce ou PME",
  "Préparer un textile pour association, club ou événement",
  "Lancer une base textile corporate avec possibilité de réassort",
] as const;

export default function CompaniesPage() {
  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--hm-text-soft)]">
          <Link href="/" className="hover:text-[var(--hm-rose)]">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">Entreprises</span>
        </nav>

        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
            <div>
              <p className="section-tag">Entreprises & structures</p>
              <h1 className="mb-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
                Des solutions adaptées à la réalité des équipes, pas un discours générique.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
                HM Global travaille avec des structures qui ont des besoins concrets :
                habiller une équipe, rendre une activité plus visible, uniformiser un rendu,
                préparer un événement ou cadrer un textile professionnel qui tienne dans le temps.
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

            <div className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--hm-accent-soft-blue)]">
                  <Shirt className="h-5 w-5 text-[var(--hm-blue)]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                    Besoins fréquents
                  </p>
                  <h2 className="text-2xl font-semibold text-[var(--hm-text)]">
                    Ce qui revient le plus souvent
                  </h2>
                </div>
              </div>

              <div className="grid gap-3">
                {COMMON_REQUESTS.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-4 text-sm leading-6 text-[var(--hm-text)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">Par type de structure</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              À chaque secteur, ses besoins réels et ses bons supports.
            </h2>
            <p className="text-base leading-7 text-[var(--hm-text-soft)]">
              Le produit et la technique ne se choisissent pas de la même manière pour un
              restaurant, une équipe chantier, une association ou une PME. L'objectif est
              d'aller vers une solution simple à exploiter, cohérente et durable.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {SECTORS.map(({ id, icon: Icon, label, needs, products, techniques, path }) => (
              <article
                key={id}
                className="flex h-full flex-col rounded-[1.75rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-soft)]">
                      Secteur
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[var(--hm-text)]">{label}</h3>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                    <Icon className="h-5 w-5 text-[var(--hm-primary)]" />
                  </span>
                </div>

                <div className="mt-6 rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                    Besoins fréquents
                  </p>
                  <div className="mt-3 space-y-2">
                    {needs.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hm-primary)]" />
                        <p className="text-sm leading-6 text-[var(--hm-text)]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                      Produits adaptés
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--hm-text)]">{products}</p>
                  </div>

                  <div className="rounded-[1.25rem] border border-[var(--hm-line)] bg-white p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                      Techniques souvent pertinentes
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--hm-text)]">{techniques}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-[var(--hm-line)] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-soft)]">
                    Parcours recommandé
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{path}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-14 grid gap-6 lg:grid-cols-2">
          {DECISION_RULES.map((block) => (
            <article
              key={block.title}
              className="rounded-[1.75rem] border border-[var(--hm-line)] bg-white p-7 shadow-[0_18px_48px_rgba(63,45,88,0.06)]"
            >
              <h2 className="text-2xl font-semibold text-[var(--hm-text)]">{block.title}</h2>
              <div className="mt-5 space-y-3">
                {block.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-4"
                  >
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hm-primary)]" />
                    <p className="text-sm leading-6 text-[var(--hm-text)]">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="section-tag">Choisir le bon chemin</p>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                Besoin simple ou projet à cadrer : HM Global vous oriente sans détour.
              </h2>
              <p className="text-base leading-7 text-[var(--hm-text-soft)]">
                Si le produit, le visuel et la technique sont déjà clairs, le catalogue permet
                d'avancer rapidement. Si le projet concerne plusieurs équipes, plusieurs usages
                ou une logique de communication plus large, la demande de devis reste le bon point d'entrée.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/catalogue"
                className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 transition-all duration-200 hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                  Commande catalogue
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--hm-text)]">
                  Pour un besoin textile déjà cadré
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--hm-text-soft)]">
                  Produit identifié, logo prêt, besoin standard : vous pouvez commander en ligne.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
                  Accéder au catalogue
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <Link
                href="/contact"
                className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 transition-all duration-200 hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                  Demande de devis
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--hm-text)]">
                  Pour un projet multi-équipes ou sur mesure
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--hm-text-soft)]">
                  Plusieurs profils, plusieurs supports, besoin de conseil ou cadrage plus large.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
                  Ouvrir la demande
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
