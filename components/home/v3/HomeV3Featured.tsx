import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getT } from "@/lib/i18n/server";
import { getFeaturedProducts } from "@/data/products";
import ScrollCarousel from "./ScrollCarousel";
import FeaturedProductCard from "./FeaturedProductCard";

/**
 * HomeV3Featured — carrousel défilant « prix d'appel » (demande Kaan).
 * TEXTILE UNIQUEMENT pour l'instant (vrais packshots catalogue + prix d'appel).
 * Le PRINT est retiré tant que les visuels produit (ex. Affiches A3) ne sont
 * pas prêts — à réintégrer plus tard. Placé en bas de l'accueil, après le CTA.
 */
export default async function HomeV3Featured() {
  const t = await getT();
  const textile = getFeaturedProducts()
    .filter((p) => p.visible !== false && p.category !== "goodies")
    .slice(0, 8);

  return (
    <section className="bg-[var(--hm-surface)] py-14 sm:py-20">
      <div className="container">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-tag">{t("home.featured.tag")}</p>
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--hm-text)] sm:text-4xl">
              {t("home.featured.title")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--hm-text-soft)]">
              {t("home.featured.subtitle")}
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]"
          >
            {t("home.featured.ctaAll")} <ArrowUpRight size={15} />
          </Link>
        </div>

        <ScrollCarousel prevLabel={t("home.featured.prev")} nextLabel={t("home.featured.next")}>
          {textile.map((p) => (
            <FeaturedProductCard key={p.id} product={p} />
          ))}
        </ScrollCarousel>
      </div>
    </section>
  );
}
