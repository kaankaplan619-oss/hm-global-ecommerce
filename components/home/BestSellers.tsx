import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { getFeaturedProducts } from "@/data/products";
import { formatPrice } from "@/data/pricing";
import ProductImage from "@/components/product/ProductImage";

/**
 * BestSellers — Section home "les modèles les plus demandés"
 *
 * Cartes propres avec object-contain (produits sur fond blanc).
 * N'utilise pas ProductCard pour garder le contrôle visuel
 * sans toucher au composant partagé avec le catalogue.
 */
export default function BestSellers() {
  const products = getFeaturedProducts().slice(0, 4);

  return (
    <section className="bg-[var(--hm-surface)] py-20 sm:py-24">
      <div className="container">

        {/* ── En-tête ────────────────────────────────────────────────── */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-tag">Best-sellers</p>
            <h2 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-[var(--hm-ink)] md:text-4xl">
              Les produits les plus faciles à choisir pour une commande textile pro.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-[var(--hm-muted)] sm:text-base">
              Une sélection courte, claire et pensée pour aller vite : choisir le bon support,
              visualiser le rendu et commander sans se perdre.
            </p>
          </div>

          <Link
            href="/catalogue"
            className="btn-outline gap-2 self-start shrink-0 lg:self-auto"
          >
            Voir tout le catalogue
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── Grille produits ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => {
            const prices = [product.pricing.dtf, product.pricing.flex, product.pricing.broderie].filter((p) => p > 0);
            const basePrice = prices.length > 0 ? Math.min(...prices) : 0;
            const shortDesc =
              product.category === "tshirts"
                ? "Le plus simple pour équiper une équipe ou lancer une opération."
                : product.category === "hoodies"
                ? "Le bon choix pour un rendu plus premium et plus visible."
                : "La version pro pour les équipes terrain et les projets corporate.";
            const categoryLabel =
              product.category === "tshirts"
                ? "T-shirt"
                : product.category === "hoodies"
                ? "Hoodie / Sweat"
                : "Softshell";

            return (
              <Link
                key={product.id}
                href={`/produits/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border
                  border-[var(--hm-border)] bg-white transition-all duration-300
                  hover:border-[rgba(177,63,116,0.22)]
                  hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]
                  hover:-translate-y-0.5"
              >
                {/* ── Zone image ── */}
                <div className="relative aspect-[4/4.8] overflow-hidden bg-[var(--hm-surface)]">
                  <ProductImage
                    src={undefined}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    label="Visuel à venir"
                  />

                  {/* Badge produit */}
                  {product.badge && (
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full border border-[var(--hm-border)] bg-white/95 px-3 py-1
                        text-[10px] font-semibold tracking-[0.14em] text-[var(--hm-primary)] shadow-sm backdrop-blur-sm">
                        {product.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Infos produit ── */}
                <div className="flex flex-1 flex-col p-5">

                  <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--hm-muted)]">
                    <span className="flex items-center gap-1">
                      <Layers3 size={10} />
                      {categoryLabel}
                    </span>
                  </div>

                  <h3 className="mb-2 text-[16px] font-semibold leading-snug text-[var(--hm-ink)]
                    transition-colors group-hover:text-[var(--hm-primary)]">
                    {product.shortName}
                  </h3>

                  <p className="mb-5 flex-1 text-[13px] leading-6 text-[var(--hm-muted)]">
                    {shortDesc}
                  </p>

                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {product.techniques.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-[var(--hm-border)] bg-[var(--hm-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--hm-text-soft)]"
                      >
                        {tech === "broderie" ? "Broderie" : tech.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--hm-border)] pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--hm-muted)]">
                        À partir de
                      </p>
                      <span className="text-lg font-semibold text-[var(--hm-primary)]">
                        {formatPrice(basePrice)}
                      </span>
                      <span className="ml-1 text-[10px] text-[var(--hm-muted)]">TTC</span>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--hm-primary)] transition-all duration-200 group-hover:gap-1.5">
                      Voir le produit
                      <ArrowRight
                        size={11}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Ligne de réassurance bas de section ────────────────────── */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2
          border-t border-[var(--hm-border)] pt-8 text-[12px] text-[var(--hm-muted)]">
          {[
            "Livraison offerte dès 10 pièces",
            "Validation fichier avant production",
            "Réassort possible sur les mêmes références",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[var(--hm-blue)]" />
              {item}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
