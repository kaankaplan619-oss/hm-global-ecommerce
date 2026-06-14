import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import ProductCard from "@/components/product/ProductCard";
import { ALL_PRODUCTS, SEASONAL_ORDER, CURRENT_SEASON } from "@/data/products";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Catalogue — Textile personnalisé",
  description:
    "T-shirts, polos, hoodies et softshells personnalisés. DTF, flex ou broderie. Commandez en ligne avec HM Global Agence.",
};

// Catégories NON proposées (HM Global ne les fabrique pas / marge insuffisante).
// Masquées du catalogue, des filtres et des routes (cf. [category]/page.tsx).
const HIDDEN_CATEGORIES = new Set(["polaires", "enfants"]);

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  tshirts:    "cataloguePage.category.tshirts",
  polos:      "cataloguePage.category.polos",
  hoodies:    "cataloguePage.category.hoodies",
  softshells: "cataloguePage.category.softshells",
  casquettes: "cataloguePage.category.casquettes",
  sacs:       "cataloguePage.category.sacs",
  goodies:    "cataloguePage.category.goodies",
};

export default async function CataloguePage() {
  const t = await getT();
  const order = SEASONAL_ORDER[CURRENT_SEASON];

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <BackLink href="/" label={t("cataloguePage.backToHome")} />

        {/* Header */}
        <div className="mb-12">
          <p className="section-tag">{t("cataloguePage.hero.tag")}</p>
          <h1 className="mb-4 text-3xl font-black text-[var(--hm-text)] md:text-5xl">
            {t("cataloguePage.hero.titleLine1")}<br />
            <span className="text-gradient-gold">{t("cataloguePage.hero.titleLine2")}</span>
          </h1>
          <p className="max-w-lg text-sm text-[var(--hm-text-soft)]">
            {t("cataloguePage.hero.subtitle")}
          </p>
        </div>

        {/* Filter links */}
        <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/catalogue"
              className="rounded-full border border-[var(--hm-primary)] px-4 py-2 text-xs font-semibold text-[var(--hm-primary)]"
            >
              {t("cataloguePage.filters.all")}
            </Link>
          {Object.entries(CATEGORY_LABEL_KEYS).map(([id, labelKey]) => (
            <Link
              key={id}
              href={`/catalogue/${id}`}
              className="rounded-full border border-[var(--hm-line)] px-4 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition-colors hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
            >
              {t(labelKey)}
            </Link>
          ))}
        </div>

        {/* Products by season order.
            Exclut les produits `quoteOnly: true` de la grille principale — ces
            produits sont par nature non commandables directement (devis requis)
            et ne doivent pas être mis en avant aux côtés du catalogue achetable.
            Ils restent visibles dans leur page catégorie dédiée /catalogue/[cat]
            où la signalétique "Sur devis" est claire. */}
        {order.filter((catId) => !HIDDEN_CATEGORIES.has(catId)).map((catId) => {
          const products = ALL_PRODUCTS.filter(
            (p) => p.category === catId && !p.quoteOnly,
          );
          if (products.length === 0) return null;

          return (
            <div key={catId} className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-bold text-[var(--hm-text)]">
                  {t(CATEGORY_LABEL_KEYS[catId])}
                </h2>
                <div className="h-[1px] flex-1 bg-[var(--hm-line)]" />
                <Link
                  href={`/catalogue/${catId}`}
                  className="text-xs text-[var(--hm-primary)] hover:underline"
                >
                  {t("cataloguePage.seeAll")}
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
