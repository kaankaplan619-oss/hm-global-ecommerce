import Link from "next/link";
import { ArrowRight, FolderKanban, ShoppingBag } from "lucide-react";

const PATHS = [
  {
    icon: ShoppingBag,
    eyebrow: "Commande simple",
    title: "Commander du textile personnalisé",
    description:
      "Si votre besoin est déjà cadré, vous pouvez passer par le catalogue pour choisir le produit, le marquage et transmettre votre logo.",
    points: [
      "Parcours adapté aux besoins textiles standards",
      "Choix du support, du marquage et de l'emplacement",
      "Commande en ligne avec suivi ensuite",
    ],
    href: "/catalogue",
    cta: "Accéder au catalogue",
    variant: "primary" as const,
  },
  {
    icon: FolderKanban,
    eyebrow: "Projet sur mesure",
    title: "Demander un devis et un accompagnement",
    description:
      "Si le besoin est spécifique, multi-supports ou encore à cadrer, HM Global reprend le projet avec vous avant de lancer la bonne solution.",
    points: [
      "Utile pour signalétique, marquage véhicule, print ou besoin mixte",
      "Échange plus pertinent pour les demandes techniques ou urgentes",
      "Devis construit selon votre contexte réel",
    ],
    href: "/contact",
    cta: "Demander un devis",
    variant: "outline" as const,
  },
] as const;

export default function CTASection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center rounded-full border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)]">
            Passer à l'action
          </span>
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-[var(--hm-ink)] sm:text-4xl">
            Deux chemins simples pour avancer selon votre besoin.
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-[var(--hm-muted)] sm:text-lg">
            Si le besoin est clair, le catalogue vous permet de commander rapidement.
            Si le projet demande plus d'accompagnement, la demande de devis est le bon point d'entrée.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {PATHS.map((path) => {
            const Icon = path.icon;
            const isPrimary = path.variant === "primary";

            return (
              <article
                key={path.title}
                className={`flex h-full flex-col rounded-[2rem] border p-7 shadow-[var(--hm-shadow-soft)] sm:p-8 ${
                  isPrimary
                    ? "border-[var(--hm-primary)]/20 bg-[linear-gradient(180deg,rgba(100,189,228,0.10)_0%,rgba(255,255,255,1)_40%)]"
                    : "border-[var(--hm-border)] bg-[var(--hm-surface)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)]">
                      {path.eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-[var(--hm-ink)]">
                      {path.title}
                    </h3>
                  </div>
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--hm-primary)] shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-[var(--hm-muted)] sm:text-base">
                  {path.description}
                </p>

                <div className="mt-6 grid gap-3">
                  {path.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl border border-[var(--hm-border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--hm-ink)]"
                    >
                      {point}
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link
                    href={path.href}
                    className={
                      isPrimary
                        ? "btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
                        : "btn-outline inline-flex items-center gap-2 px-6 py-3 text-sm"
                    }
                  >
                    {path.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="rounded-[1.75rem] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-6 py-5 text-center shadow-[var(--hm-shadow-soft)] sm:px-8">
          <p className="text-sm leading-7 text-[var(--hm-muted)] sm:text-base">
            Catalogue pour les besoins textiles simples. Demande de devis pour les projets
            spécifiques, les volumes particuliers ou les supports de communication visuelle.
          </p>
        </div>
      </div>
    </section>
  );
}
