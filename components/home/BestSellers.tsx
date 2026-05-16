import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { getFeaturedProducts } from "@/data/products";
import { formatPrice } from "@/data/pricing";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { getVisualMode } from "@/lib/hm-visual-utils";
import HMProductVisual from "@/components/product/HMProductVisual";

export default function BestSellers() {
  const products = getFeaturedProducts().slice(0, 4);

  return (
    <section className="py-18 sm:py-22">
      <div className="container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="section-tag">Sélection rapide</p>
            <h2 className="max-w-[14ch] text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--hm-text)] sm:text-[4.4rem]">
              Les modèles qui convertissent le plus vite.
            </h2>
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
            const defaultColor = product.colors.find((c) => c.available);
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
                <div className="relative aspect-[4/4.55] overflow-hidden border-b border-[var(--hm-line)] bg-white">
                  {isPrintful ? (
                    <Image
                      src={catalogImage || "/mockups/tshirt/blanc-front.jpg"}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1280px) 23vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain p-4 transition duration-500 group-hover:scale-[1.05] [mix-blend-mode:multiply]"
                    />
                  ) : (
                    <HMProductVisual
                      src={catalogImage}
                      alt={product.name}
                      mode={visualMode}
                      fill
                      sizes="(min-width: 1280px) 23vw, (min-width: 640px) 50vw, 100vw"
                      imageClassName={`object-contain transition duration-500 group-hover:scale-[1.04]${visualMode === "hm" ? " p-5 relative z-10" : " p-3"}`}
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

        <div className="mt-10 flex flex-col gap-4 rounded-[1.9rem] border border-[rgba(63,45,88,0.08)] bg-[linear-gradient(180deg,#433053_0%,#3f2d58_100%)] px-6 py-6 text-white shadow-[0_18px_40px_rgba(63,45,88,0.14)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/68">
              Pour aller plus loin
            </p>
            <p className="mt-2 max-w-[44rem] text-sm leading-7 text-white/86 sm:text-[15px]">
              Le catalogue complet reste disponible, mais ces best-sellers sont le meilleur
              raccourci pour faire monter l’envie d’achat sans noyer l’utilisateur.
            </p>
          </div>
          <Link href="/catalogue" className="btn-outline shrink-0 border-white/20 bg-white/10 text-white hover:bg-white hover:text-[var(--hm-text)]">
            Voir tout le catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
