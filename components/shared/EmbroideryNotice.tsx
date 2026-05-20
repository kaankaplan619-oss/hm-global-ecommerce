import { Info } from "lucide-react";

/**
 * Information broderie — frais de programme + paliers indicatifs.
 *
 * Affiché conditionnellement sur les fiches produits qui proposent la broderie.
 * Pas de calcul dynamique en V1 — uniquement explication.
 * Le tarif exact reste celui du configurateur.
 */
export default function EmbroideryNotice() {
  return (
    <section className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-accent-soft-purple)] p-5">
      <div className="mb-3 flex items-start gap-2.5">
        <Info size={16} className="mt-0.5 shrink-0 text-[var(--hm-purple)]" />
        <h3 className="text-sm font-bold text-[var(--hm-text)]">
          Broderie — comment ça marche
        </h3>
      </div>
      <p className="mb-4 text-[12.5px] leading-relaxed text-[var(--hm-text-soft)]">
        La broderie est un marquage premium qui demande une préparation
        spécifique (programmation machine) facturée une seule fois par logo.
        Une fois le programme créé, il reste utilisable pour vos commandes
        suivantes — relancer une production devient plus rapide et économique.
      </p>

      <ul className="space-y-2 text-[12px] text-[var(--hm-text-soft)]">
        <li className="flex items-start gap-2">
          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--hm-rose)]" />
          <span>
            <strong className="text-[var(--hm-text)]">Frais de programme broderie cœur</strong> —
            facturés une fois par logo (offerts dès 50 pièces commandées).
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--hm-rose)]" />
          <span>
            <strong className="text-[var(--hm-text)]">Broderie dos</strong> —
            tarification spécifique (zone plus grande), validée sur devis personnalisé.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--hm-rose)]" />
          <span>
            <strong className="text-[var(--hm-text)]">Conseil HM Global</strong> —
            pour les logos très détaillés ou les dégradés, le DTF est souvent plus
            net que la broderie. Demandez notre avis avant production.
          </span>
        </li>
      </ul>
    </section>
  );
}
