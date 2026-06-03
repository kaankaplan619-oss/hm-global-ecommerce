import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { getFeaturedProducts } from "@/data/products";
import { formatPrice } from "@/data/pricing";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { getVisualMode } from "@/lib/hm-visual-utils";
import { getDisplayedColors } from "@/lib/suppliers/printify/printify-colors";
import HMProductVisual from "@/components/product/HMProductVisual";
import ProductImageStage from "@/components/product/ProductImageStage";

export default function BestSellers() {
  const products = getFeaturedProducts().slice(0, 4);

  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p
              className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--hm-cyan)" }}
            >
              Bestsellers textile
            </p>
            <h2
              className="max-w-[22ch] font-semibold leading-[1.05] tracking-[-0.025em]"
              style={{
                fontSize: "clamp(1.6rem, 2.8vw + 0.4rem, 2.6rem)",
                color: "var(--hm-text-main)",
              }}
            >
              Les textiles{" "}
              <span style={{ color: "var(--hm-violet)" }}>
                les plus demandés par nos clients
              </span>
              .
            </h2>
            <p
              className="mt-3 max-w-[40rem] text-[13.5px] leading-6"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              Pour équiper une équipe, lancer un événement ou créer une tenue
              professionnelle cohérente.
            </p>
            {/* Mini-réassurance proche du titre */}
            <div
              className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--hm-cyan)" }}
                />
                BAT avant production
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--hm-magenta)" }}
                />
                Logo cœur ou dos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--hm-violet)" }}
                />
                DTF · Flex · Broderie
              </span>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_14px_30px_rgba(63,45,88,0.05)]">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(177,63,116,0.08)] text-[var(--hm-primary)]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--hm-text)]">
                  Commandez en 3 étapes, livré en 7-10 jours
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    "Choisissez votre support et technique",
                    "Envoyez votre logo — on adapte le fichier",
                    "Validez le BAT, on lance la production",
                  ].map((step) => (
                    <div key={step} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
                      <span className="text-[13px] leading-6 text-[var(--hm-text-soft)]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => {
            const isPrintful = product.supplierName === "printful";
            const displayedColors = getDisplayedColors(product.id, product.colors);
            const defaultColor =
              displayedColors.find((c) => c.available) ?? displayedColors[0] ?? product.colors[0];
            const catalogImage = getProductCatalogImage(product, defaultColor?.id);
            const visualMode = isPrintful ? "supplier" : getVisualMode(product);
            const prices = [product.pricing.dtf, product.pricing.flex, product.pricing.broderie].filter((p) => p > 0);
            const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

            return (
              <Link
                key={product.id}
                href={`/produits/${product.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-[var(--hm-line)] bg-white shadow-[0_16px_34px_rgba(63,45,88,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(177,63,116,0.18)] hover:shadow-[0_20px_42px_rgba(63,45,88,0.08)]"
              >
                <div className="relative aspect-[4/4.4] overflow-hidden">
                  {isPrintful ? (
                    /* Scène image identique à ProductCard catalogue — cohérence visuelle stricte */
                    <div className="absolute inset-0">
                      <ProductImageStage
                        src={catalogImage || "/mockups/tshirt/blanc-front.webp"}
                        alt={product.name}
                        category={product.category}
                        variant="best-sellers"
                        sizes="(min-width: 1280px) 23vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : (
                    <HMProductVisual
                      src={catalogImage}
                      alt={product.name}
                      mode={visualMode}
                      fill
                      sizes="(min-width: 1280px) 23vw, (min-width: 640px) 50vw, 100vw"
                      // WG004 — fond blanc pur (cf. ProductCard.tsx) pour
                      // matcher visuellement le packshot 100% blanc et éviter
                      // le halo gris #fafafa par défaut du mode supplier.
                      bgColor={product.id === "wg004" ? "#ffffff" : undefined}
                      imageClassName={`object-contain transition duration-500 group-hover:scale-[1.04]${
                        product.id === "wg004"
                          ? ""
                          : visualMode === "hm" ? " p-5 relative z-10" : " p-3"
                      }`}
                      showBadge={false}
                    />
                  )}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {product.badge ? (
                      <span className="rounded-full border border-[var(--hm-line)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-primary)]">
                        {product.badge}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-[var(--hm-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--hm-text-soft)]">
                      {product.category === "tshirts" ? "T-shirt" : product.category === "hoodies" ? "Hoodie / Sweat" : "Corporate"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-[var(--hm-text)] transition group-hover:text-[var(--hm-primary)]">
                    {product.shortName}
                  </h3>
                  <p className="mt-2 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                    {product.category === "tshirts"
                      ? "Le point d’entrée le plus simple pour une commande rapide et nette."
                      : product.category === "hoodies"
                      ? "Une option plus premium pour renforcer la présence de marque."
                      : "Un support pensé pour les équipes visibles et les besoins terrain."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.techniques.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--hm-text-soft)]"
                      >
                        {tech === "broderie" ? "Broderie" : tech.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="rounded-[1.2rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-muted)]">
                        À partir de
                      </p>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--hm-primary)]">
                            {formatPrice(basePrice)}
                          </p>
                          <p className="text-[11px] text-[var(--hm-text-soft)]">TTC</p>
                        </div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--hm-text)] transition group-hover:text-[var(--hm-primary)]">
                          Voir
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div
          className="mt-10 flex flex-col gap-4 rounded-[1.6rem] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(45,35,64,0.08)",
            boxShadow: "0 8px 24px rgba(45,35,64,0.05)",
          }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--hm-cyan)" }}
            >
              Pour aller plus loin
            </p>
            <p
              className="mt-2 max-w-[44rem] text-[14px] leading-7 sm:text-[15px]"
              style={{ color: "var(--hm-text-muted-2)" }}
            >
              Retrouvez une sélection courte de textiles efficaces pour lancer
              rapidement une commande propre et professionnelle.
            </p>
          </div>
          <Link href="/catalogue" className="btn-hm-violet-outline shrink-0">
            Voir tout le catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
