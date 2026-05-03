import Link from "next/link";
import { ArrowRight, CheckCircle2, BadgeCheck, Clock } from "lucide-react";
import ProductImage from "@/components/product/ProductImage";

// ─── Données ──────────────────────────────────────────────────────────────────

const REASSURANCE = [
  "Livraison offerte dès 10 pièces",
  "Fichier vérifié avant production",
  "Paiement sécurisé Stripe",
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-[var(--site-header-offset)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 88% 18%, rgba(100, 189, 228, 0.14), transparent 24%), radial-gradient(circle at 8% 80%, rgba(177, 63, 116, 0.08), transparent 22%), linear-gradient(180deg, rgba(247,250,252,0.92) 0%, rgba(255,255,255,1) 62%)",
        }}
      />

      <div className="container relative z-10 pb-16 pt-12 md:pb-24 md:pt-16 lg:pt-14">
        <div className="grid items-center gap-10 lg:min-h-[calc(100vh-var(--site-header-offset)-5.5rem)] lg:grid-cols-[0.98fr_1.02fr] lg:gap-18">

          {/* ── Colonne gauche : copy ─────────────────────────────────────── */}
          <div className="max-w-[35rem]">

            {/* Pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--hm-border)]
              bg-[var(--hm-surface)] px-3.5 py-1.5 shadow-[0_10px_22px_rgba(63,45,88,0.04)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--hm-blue)]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-primary)]">
                Agence créative · Atelier textile · Alsace
              </span>
            </div>

            {/* H1 — outcome-focused, pas feature-focused */}
            <h1 className="mb-5 max-w-[10.5ch] text-[2.45rem] font-semibold leading-[1] tracking-tight
              text-[var(--hm-text)] sm:max-w-[11ch] sm:text-[3.05rem] lg:text-[3.45rem]">
              Textile personnalisé
              <br />
              <span className="text-[var(--hm-primary)]">
                pour équipes, marques
                <br />
                et projets pros.
              </span>
            </h1>

            {/* Sous-titre — court, concret, 2 lignes max */}
            <p className="mb-9 max-w-[31rem] text-[15px] leading-7 text-[var(--hm-text-soft)] md:text-[16px]">
              T-shirts, hoodies, sweats et softshells avec accompagnement humain,
              contrôle fichier avant production et parcours clair de la commande
              jusqu&apos;à l&apos;expédition.
            </p>

            {/* CTAs — 2 actions claires, lien /techniques supprimé (route inexistante) */}
            <div className="mb-9 flex flex-wrap gap-3">
              <Link href="/catalogue" className="btn-primary gap-2 px-6 py-3.25 text-[0.78rem]">
                Commander du textile
                <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="btn-outline px-6 py-3.25 text-[0.78rem]">
                Demander un devis
              </Link>
            </div>

            {/* Réassurance inline — plus léger que 3 cartes séparées */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--hm-border)] pt-4.5">
              {REASSURANCE.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="shrink-0 text-[var(--hm-primary)]" />
                  <span className="text-[11px] text-[var(--hm-text-soft)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne droite : vitrine produits ────────────────────────── */}
          <div className="relative lg:pl-2">
            <div className="absolute inset-x-10 top-8 bottom-8 hidden rounded-[2.2rem] bg-[linear-gradient(180deg,rgba(100,189,228,0.05)_0%,rgba(255,255,255,0.35)_100%)] lg:block" />

            <div className="grid grid-cols-[1.14fr_0.86fr] gap-4.5">

              {/* Carte principale — T-shirt (bestseller, prix visible) */}
              <Link
                href="/catalogue"
                className="group relative flex flex-col overflow-hidden rounded-2xl border
                  border-[var(--hm-border)] bg-white shadow-[var(--hm-shadow-soft)]
                  transition-all duration-300 hover:border-[rgba(177,63,116,0.22)]
                  hover:shadow-[0_22px_50px_rgba(63,45,88,0.10)]"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full bg-[linear-gradient(180deg,#fbfcfe_0%,var(--hm-surface)_100%)]">
                  <ProductImage
                    src={undefined}
                    alt="T-shirt Gildan Heavy Cotton"
                    fill
                    priority
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-contain"
                  />
                </div>

                {/* Info */}
                <div className="border-t border-[var(--hm-border)] p-4.5">
                  {/* Badge inline — évite le chevauchement avec le badge flottant "Délai" */}
                  <span className="mb-2 inline-flex items-center rounded-full border border-[var(--hm-border)]
                    bg-[var(--hm-surface)] px-2.5 py-0.5 text-[9px] font-semibold tracking-[0.14em]
                    text-[var(--hm-primary)]">
                    Textile pro
                  </span>
                  <p className="mb-1 text-[15px] font-semibold text-[var(--hm-text)]">
                    T-shirt personnalisé
                  </p>
                  <p className="mb-3 text-[11px] text-[var(--hm-text-soft)]">
                    DTF, flex ou broderie selon votre projet
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--hm-primary)]">
                      Dès 19,90 €
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold
                      text-[var(--hm-primary)] transition-all duration-200 group-hover:gap-1.5">
                      Voir le produit <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Colonne droite : Hoodie + Softshell empilés */}
              <div className="flex flex-col gap-4.5">

                {/* Hoodie */}
                <Link
                  href="/catalogue"
                  className="group flex flex-col overflow-hidden rounded-2xl border
                    border-[var(--hm-border)] bg-white transition-all duration-300
                    hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_14px_32px_rgba(63,45,88,0.08)]"
                >
                  <div className="relative aspect-[1/0.94] w-full bg-[linear-gradient(180deg,#fbfcfe_0%,var(--hm-surface)_100%)]">
                    <ProductImage
                      src={undefined}
                      alt="Hoodie Gildan Heavy Blend"
                      fill
                      sizes="(min-width: 1024px) 14vw, 35vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="border-t border-[var(--hm-border)] p-3.5">
                    <p className="text-[12px] font-semibold text-[var(--hm-text)]">Hoodie</p>
                    <p className="text-[10px] text-[var(--hm-text-soft)]">Dès 49,90 €</p>
                  </div>
                </Link>

                {/* Softshell */}
                <Link
                  href="/catalogue"
                  className="group flex flex-col overflow-hidden rounded-2xl border
                    border-[var(--hm-border)] bg-white transition-all duration-300
                    hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_14px_32px_rgba(63,45,88,0.08)]"
                >
                  <div className="relative aspect-[1/0.94] w-full bg-[linear-gradient(180deg,#fbfcfe_0%,var(--hm-surface)_100%)]">
                    <ProductImage
                      src={undefined}
                      alt="T-shirt Bella+Canvas 3001"
                      fill
                      sizes="(min-width: 1024px) 14vw, 35vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="border-t border-[var(--hm-border)] p-3.5">
                    <p className="text-[12px] font-semibold text-[var(--hm-text)]">T-shirt Premium</p>
                    <p className="text-[10px] text-[var(--hm-text-soft)]">Bella+Canvas 3001</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Badge flottant haut gauche — délai concret */}
            <div className="hm-float absolute -left-2 top-5 hidden rounded-[1.1rem] border border-[var(--hm-border)]
              bg-white/94 px-3.5 py-2.5 shadow-[0_12px_28px_rgba(63,45,88,0.06)] backdrop-blur-sm lg:block">
              <div className="flex items-center gap-2.5">
                <Clock size={14} className="shrink-0 text-[var(--hm-primary)]" />
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-muted)]">
                    Délai de production
                  </p>
                  <p className="text-[12px] font-semibold text-[var(--hm-text)]">
                    7 à 10 jours ouvrés
                  </p>
                </div>
              </div>
            </div>

            {/* Badge flottant bas droite — service différenciateur */}
            <div className="hm-float-delayed absolute bottom-4 right-1 hidden rounded-[1.1rem] border border-[var(--hm-border)]
              bg-white/92 px-3.5 py-2.5 shadow-[0_12px_28px_rgba(63,45,88,0.06)] lg:block">
              <div className="flex items-center gap-2.5">
                <BadgeCheck size={14} className="shrink-0 text-[var(--hm-primary)]" />
                <div>
                  <p className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-muted)]">
                    Accompagnement inclus
                  </p>
                  <p className="whitespace-nowrap text-[12px] font-semibold text-[var(--hm-text)]">
                    Relecture du fichier avant lancement
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
