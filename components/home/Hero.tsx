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
    <section className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 88% 18%, rgba(100, 189, 228, 0.14), transparent 24%), radial-gradient(circle at 8% 80%, rgba(177, 63, 116, 0.08), transparent 22%), linear-gradient(180deg, rgba(247,250,252,0.92) 0%, rgba(255,255,255,1) 62%)",
        }}
      />

      <div className="container relative z-10 pt-40 pb-16 md:pt-48 md:pb-24 lg:pt-44">
        <div className="grid items-center gap-12 lg:min-h-[calc(100vh-6.5rem)] lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">

          {/* ── Colonne gauche : copy ─────────────────────────────────────── */}
          <div className="max-w-xl">

            {/* Pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--hm-border)]
              bg-[var(--hm-surface)] px-4 py-2 shadow-[var(--hm-shadow-soft)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--hm-blue)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-primary)]">
                Agence créative · Atelier textile · Alsace
              </span>
            </div>

            {/* H1 — outcome-focused, pas feature-focused */}
            <h1 className="mb-5 text-[2.6rem] font-semibold leading-[1.02] tracking-tight
              text-[var(--hm-ink)] sm:text-5xl lg:text-[3.35rem]">
              Textile personnalisé
              <br />
              <span className="text-[var(--hm-primary)]">pour équipes, marques et projets pros.</span>
            </h1>

            {/* Sous-titre — court, concret, 2 lignes max */}
            <p className="mb-8 max-w-lg text-[15px] leading-7 text-[var(--hm-muted)] md:text-base">
              T-shirts, hoodies, sweats et softshells avec accompagnement humain,
              contrôle fichier avant production et parcours clair de la commande
              jusqu&apos;à l&apos;expédition.
            </p>

            {/* CTAs — 2 actions claires, lien /techniques supprimé (route inexistante) */}
            <div className="mb-8 flex flex-wrap gap-3.5">
              <Link href="/catalogue" className="btn-primary gap-2 px-7 py-3.5 text-[0.8rem]">
                Commander du textile
                <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="btn-outline px-7 py-3.5 text-[0.8rem]">
                Demander un devis
              </Link>
            </div>

            {/* Réassurance inline — plus léger que 3 cartes séparées */}
            <div className="flex flex-wrap gap-x-5 gap-y-2.5 border-t border-[var(--hm-border)] pt-5">
              {REASSURANCE.map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="shrink-0 text-[var(--hm-primary)]" />
                  <span className="text-[12px] text-[var(--hm-muted)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Colonne droite : vitrine produits ────────────────────────── */}
          <div className="relative">
            <div className="absolute inset-x-8 top-10 bottom-10 hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(100,189,228,0.06)_0%,rgba(255,255,255,0.2)_100%)] lg:block" />

            <div className="grid grid-cols-[1.2fr_0.8fr] gap-3.5">

              {/* Carte principale — T-shirt (bestseller, prix visible) */}
              <Link
                href="/catalogue"
                className="group relative flex flex-col overflow-hidden rounded-2xl border
                  border-[var(--hm-border)] bg-white shadow-[var(--hm-shadow-soft)]
                  transition-all duration-300 hover:border-[rgba(177,63,116,0.22)]
                  hover:shadow-[0_18px_44px_rgba(63,45,88,0.10)]"
              >
                <div className="absolute left-3 top-3 z-10 rounded-full border border-[var(--hm-border)]
                  bg-white/95 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-[var(--hm-primary)]
                  backdrop-blur-sm">
                  Textile pro
                </div>

                {/* Image */}
                <div className="relative aspect-[3/4] w-full bg-[var(--hm-surface)]">
                  <ProductImage
                    src="/images/products/tu01t/front-blanc.jpg"
                    alt="T-shirt personnalisé"
                    fill
                    priority
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-contain"
                  />
                </div>

                {/* Info */}
                <div className="border-t border-[var(--hm-border)] p-4">
                  <p className="mb-1 text-[14px] font-semibold text-[var(--hm-ink)]">
                    T-shirt personnalisé
                  </p>
                  <p className="mb-3 text-[11px] text-[var(--hm-muted)]">
                    DTF, flex ou broderie selon votre projet
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--hm-primary)]">
                      Dès 8,50 €
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold
                      text-[var(--hm-primary)] transition-all duration-200 group-hover:gap-1.5">
                      Voir le produit <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Colonne droite : Hoodie + Softshell empilés */}
              <div className="flex flex-col gap-3">

                {/* Hoodie */}
                <Link
                  href="/catalogue"
                  className="group flex flex-col overflow-hidden rounded-2xl border
                    border-[var(--hm-border)] bg-white transition-all duration-300
                    hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_12px_28px_rgba(63,45,88,0.08)]"
                >
                  <div className="relative aspect-square w-full bg-[var(--hm-surface)]">
                    <ProductImage
                      src="/images/products/wu620/front-noir.jpg"
                      alt="Hoodie personnalisé"
                      fill
                      sizes="(min-width: 1024px) 14vw, 35vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="border-t border-[var(--hm-border)] p-3.5">
                    <p className="text-[12px] font-semibold text-[var(--hm-ink)]">Hoodie</p>
                    <p className="text-[10px] text-[var(--hm-muted)]">Dès 18,50 €</p>
                  </div>
                </Link>

                {/* Softshell */}
                <Link
                  href="/catalogue"
                  className="group flex flex-col overflow-hidden rounded-2xl border
                    border-[var(--hm-border)] bg-white transition-all duration-300
                    hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_12px_28px_rgba(63,45,88,0.08)]"
                >
                  <div className="relative aspect-square w-full bg-[var(--hm-surface)]">
                    <ProductImage
                      src="/images/products/jui62/front-marine.jpg"
                      alt="Softshell personnalisé"
                      fill
                      sizes="(min-width: 1024px) 14vw, 35vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="border-t border-[var(--hm-border)] p-3.5">
                    <p className="text-[12px] font-semibold text-[var(--hm-ink)]">Softshell</p>
                    <p className="text-[10px] text-[var(--hm-muted)]">Broderie premium</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Badge flottant haut gauche — délai concret */}
            <div className="absolute -left-3 top-6 hidden rounded-[1.25rem] border border-[var(--hm-border)]
              bg-white/96 px-4 py-3 shadow-[var(--hm-shadow-soft)] backdrop-blur-sm lg:block">
              <div className="flex items-center gap-2.5">
                <Clock size={15} className="shrink-0 text-[var(--hm-primary)]" />
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-muted)]">
                    Délai de production
                  </p>
                  <p className="text-[13px] font-semibold text-[var(--hm-ink)]">
                    7 à 10 jours ouvrés
                  </p>
                </div>
              </div>
            </div>

            {/* Badge flottant bas droite — service différenciateur */}
            <div className="absolute bottom-5 right-0 hidden rounded-[1.25rem] border border-[var(--hm-border)]
              bg-[var(--hm-surface)] px-4 py-3 shadow-[var(--hm-shadow-soft)] lg:block">
              <div className="flex items-center gap-2.5">
                <BadgeCheck size={15} className="shrink-0 text-[var(--hm-primary)]" />
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-muted)]">
                    Accompagnement inclus
                  </p>
                  <p className="text-[13px] font-semibold text-[var(--hm-ink)]">
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
