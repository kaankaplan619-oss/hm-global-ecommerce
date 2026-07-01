import Link from "next/link";
import { MapPin, Clock, Phone, PenTool, Truck, ShieldCheck } from "lucide-react";
import { COMPANY, COMPANY_MAPS_URL } from "@/lib/company";

/**
 * AtelierAlsaceBlock — bandeau de confiance « atelier local en Alsace ».
 *
 * Met en avant l'ancrage local RÉEL (adresse Souffelweyersheim, près de
 * Strasbourg) + les atouts que les concurrents locaux n'ont pas en ligne
 * (studio, prix immédiat, commande en ligne). Réutilisé sur les pages SEO
 * locales et la page FAQ. DA HM Global (tokens --hm-*, accent rose).
 *
 * Aucune donnée inventée : coordonnées issues de lib/company.ts.
 */

const PROOF = [
  {
    Icon: PenTool,
    title: "Studio de personnalisation en ligne",
    desc: "Créez votre marquage, visualisez le rendu et voyez le prix immédiatement — sans attendre un devis.",
  },
  {
    Icon: MapPin,
    title: "Atelier local en Alsace",
    desc: `Notre atelier est à ${COMPANY.city}, à quelques minutes de Strasbourg.`,
  },
  {
    Icon: Truck,
    title: "Production et livraison",
    desc: "Nous produisons vos commandes et les livrons partout en France.",
  },
  {
    Icon: ShieldCheck,
    title: "Commande et paiement en ligne",
    desc: "Réglez par carte bancaire ou virement, en tant qu'invité ou depuis votre compte.",
  },
];

export default function AtelierAlsaceBlock() {
  return (
    <section className="rounded-[2rem] border border-[var(--hm-line)] bg-[var(--hm-accent-soft-rose)] p-8 sm:p-10">
      <p className="section-tag">Pourquoi HM Global</p>
      <h2 className="mb-6 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
        Un atelier local en Alsace, avec la commande en ligne en plus
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        {PROOF.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3.5">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--hm-rose)] shadow-[var(--hm-shadow-xs)]">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-[var(--hm-text)]">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--hm-text-soft)]">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 border-t border-[var(--hm-line)] pt-6 text-sm text-[var(--hm-text)] sm:grid-cols-3">
        <a
          href={COMPANY_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 transition-colors hover:text-[var(--hm-rose)]"
        >
          <MapPin className="h-4 w-4 shrink-0 text-[var(--hm-rose)]" />
          <span>
            {COMPANY.streetAddress}, {COMPANY.postalCode} {COMPANY.city}
          </span>
        </a>
        <a
          href={`tel:${COMPANY.phone}`}
          className="flex items-center gap-2.5 transition-colors hover:text-[var(--hm-rose)]"
        >
          <Phone className="h-4 w-4 shrink-0 text-[var(--hm-rose)]" />
          <span>{COMPANY.phoneDisplay}</span>
        </a>
        <span className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 shrink-0 text-[var(--hm-rose)]" />
          <span>{COMPANY.hoursDisplay}</span>
        </span>
      </div>

      <div className="mt-7">
        <Link href="/contact" className="btn-outline">
          Contacter l&apos;atelier
        </Link>
      </div>
    </section>
  );
}
