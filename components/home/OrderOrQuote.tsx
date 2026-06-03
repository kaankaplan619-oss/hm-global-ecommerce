import Link from "next/link";
import {
  ShoppingCart,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/**
 * OrderOrQuote — section "Commande rapide ou devis volume" (homepage).
 *
 * Issue de l'audit fournisseurs (docs/audits/textile-suppliers-comparison.md) :
 * deux chemins clairement différenciés, sans promesse de prix bas garanti.
 *
 *   1. Commande rapide en ligne : prix affiché direct, Printify auto.
 *   2. Devis volume entreprise : tarif optimisé sur devis dès 20-30 pièces,
 *      production via fournisseur API ou atelier HM Global selon le volume.
 *
 * Wording strict :
 *   - Pas de "12,90 € garanti"
 *   - Pas de promesse de prix précis pour 1 pièce
 *   - Seulement "tarif optimisé selon quantité" / "prix selon devis"
 */

const FEATURES_QUICK = [
  "Idéal pour petites séries (1 à 19 pièces)",
  "Prix affiché directement sur la fiche produit",
  "BAT envoyé avant production",
  "Production via fournisseur connecté",
] as const;

const FEATURES_QUOTE = [
  "Idéal dès 20 à 30 pièces et au-delà",
  "Tarif optimisé selon quantité, textile et marquage",
  "Possibilité de production atelier HM Global",
  "Délai confirmé après validation du BAT",
] as const;

export default function OrderOrQuote() {
  return (
    <section className="py-16 sm:py-20" id="commande-ou-devis">
      <div className="container">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="section-tag justify-center">Deux chemins simples</p>
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--hm-text)]"
            style={{ fontSize: "clamp(1.6rem, 2.8vw + 0.5rem, 2.4rem)" }}
          >
            Commande rapide ou devis volume
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-[var(--hm-text-soft)]">
            Petite série prête à lancer ou besoin entreprise sur 20-30 pièces et plus —
            les deux parcours existent et ne demandent pas les mêmes outils.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          {/* ── Carte 1 : Commande rapide ────────────────────────────────── */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--hm-line)] bg-white p-7 shadow-[0_12px_30px_rgba(63,45,88,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]">
            <span
              aria-hidden="true"
              className="absolute inset-x-7 top-0 h-[3px] rounded-b-full"
              style={{ background: "var(--hm-primary)" }}
            />

            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "rgba(177,63,116,0.10)",
                color: "var(--hm-primary)",
              }}
            >
              <ShoppingCart size={20} />
            </div>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--hm-text-muted)]">
              Commande rapide en ligne
            </p>
            <h3 className="mt-2 text-[1.25rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--hm-text)]">
              Une commande simple quand le besoin est clair.
            </h3>
            <p className="mt-3 text-[13px] leading-6 text-[var(--hm-text-soft)]">
              Vous savez ce que vous voulez : textile, couleur, technique, quantité.
              Passez la commande directement, on s&apos;occupe du reste.
            </p>

            <ul className="mt-5 space-y-2.5">
              {FEATURES_QUICK.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-6 text-[var(--hm-text-soft)]">
                  <CheckCircle2
                    size={14}
                    className="mt-1 shrink-0"
                    style={{ color: "var(--hm-primary)" }}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/catalogue"
              className="btn-primary mt-7 w-full justify-center gap-2 px-6 py-3 text-[12px]"
            >
              Voir le catalogue textile
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* ── Carte 2 : Devis volume ───────────────────────────────────── */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--hm-line)] bg-white p-7 shadow-[0_12px_30px_rgba(63,45,88,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]">
            <span
              aria-hidden="true"
              className="absolute inset-x-7 top-0 h-[3px] rounded-b-full"
              style={{ background: "var(--hm-purple)" }}
            />

            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "rgba(76,47,111,0.10)",
                color: "var(--hm-purple)",
              }}
            >
              <ClipboardList size={20} />
            </div>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--hm-text-muted)]">
              Devis volume entreprise
            </p>
            <h3 className="mt-2 text-[1.25rem] font-semibold leading-snug tracking-[-0.02em] text-[var(--hm-text)]">
              Un devis quand le volume ou le support demande conseil.
            </h3>
            <p className="mt-3 text-[13px] leading-6 text-[var(--hm-text-soft)]">
              Pour les entreprises, clubs et associations qui partent sur 20, 30 pièces
              ou plus : prix optimisé selon quantité, textile et marquage, sur devis.
            </p>

            <ul className="mt-5 space-y-2.5">
              {FEATURES_QUOTE.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-6 text-[var(--hm-text-soft)]">
                  <CheckCircle2
                    size={14}
                    className="mt-1 shrink-0"
                    style={{ color: "var(--hm-purple)" }}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/contact?sujet=devis-volume-textile"
              className="btn-outline mt-7 w-full justify-center gap-2 px-6 py-3 text-[12px]"
              style={{
                borderColor: "var(--hm-purple)",
                color: "var(--hm-purple)",
              }}
            >
              Demander un devis volume
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Note discrète sous les cartes — wording neutre, pas de chiffre garanti */}
        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-6 text-[var(--hm-text-muted)]">
          Tarif volume possible selon quantité, textile et marquage. Devis transmis sous
          24h ouvrées après réception de votre brief.
        </p>
      </div>
    </section>
  );
}
