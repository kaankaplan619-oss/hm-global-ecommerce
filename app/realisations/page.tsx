import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import { ArrowRight, ChevronRight } from "lucide-react";
import RealisationsGallery from "@/components/realisations/RealisationsGallery";
import AtelierVideos from "@/components/realisations/AtelierVideos";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Nos réalisations : textile marqué en DTF, flex, enseignes, print — produites à l'atelier de Souffelweyersheim pour des entreprises d'Alsace.",
};

/**
 * Page Réalisations — volontairement IMAGE-FIRST (demande Kaan 2026-06-10) :
 * héro court → galerie photos réelles → vidéos atelier → CTA. Pas de blocs
 * de texte théoriques (avant/après, services) : la preuve passe par l'image.
 */
export default function RealisationsPage() {
  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <BackLink href="/" label="Retour à l'accueil" />

        {/* Héro court */}
        <section className="mb-10">
          <p className="section-tag">Réalisations HM Global</p>
          <h1 className="mb-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
            Fait à l&apos;atelier, livré à de vraies entreprises.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
            Textile marqué en DTF et flex, enseignes posées, print : tout ce que vous voyez
            ici a été produit chez nous, à Souffelweyersheim.
          </p>
          <div className="mt-6 flex flex-wrap gap-3.5">
            <Link href="/catalogue" className="btn-primary gap-2">
              Voir le catalogue
              <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="btn-outline">
              Demander un devis
            </Link>
          </div>
        </section>

        {/* Galerie photos réelles */}
        <section className="mb-14">
          <RealisationsGallery />
        </section>

        {/* Vidéos atelier / chantier */}
        <section className="mb-14">
          <div className="mb-8 max-w-2xl">
            <p className="section-tag">L&apos;atelier en action</p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
              Produit chez nous, posé par nous.
            </h2>
          </div>

          <AtelierVideos />
        </section>

        {/* CTA final */}
        <section className="rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-blue)] p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="section-tag">Passer à l&apos;action</p>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
                Vous avez un besoin proche de ces réalisations ?
              </h2>
              <p className="text-base leading-7 text-[var(--hm-text-soft)]">
                Textile, enseigne, print ou projet mixte : on cadre votre besoin
                et on produit, comme pour les projets ci-dessus.
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
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
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
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]">
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
