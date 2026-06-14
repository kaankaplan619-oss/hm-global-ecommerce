import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import ProductCard from "@/components/product/ProductCard";
import { PRODUCTS_BY_CATEGORY } from "@/data/products";
import { getT } from "@/lib/i18n/server";

// Identifiants de catégorie connus. Les libellés / descriptions visibles sont
// résolus via t("catalogueCategory.meta.<id>.*") pour rester traduisibles.
const CATEGORY_IDS = [
  "tshirts",
  "polos",
  "hoodies",
  "softshells",
  "casquettes",
  "sacs",
  "goodies",
] as const;

type CategoryId = (typeof CATEGORY_IDS)[number];

function isKnownCategory(id: string): id is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(id);
}

// Ordre du sous-menu de navigation catégorie : essentiels → outdoor → accessoires.
// Les catégories Polaires & Doudounes et Vêtements enfants ne sont pas proposées
// (non fabriquées / marge insuffisante) → retirées du menu et des routes.
const PUBLIC_CATEGORY_IDS = [
  "tshirts",
  "polos",
  "hoodies",
  "softshells",
  "casquettes",
  "sacs",
  "goodies",
] as const;

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isKnownCategory(category)) return {};
  const t = await getT();
  return {
    title: t(`catalogueCategory.meta.${category}.label`),
    description: t(`catalogueCategory.meta.${category}.description`),
  };
}

export async function generateStaticParams() {
  // Ne génère que les catégories proposées (exclut polaires / enfants).
  return Object.keys(PRODUCTS_BY_CATEGORY)
    .filter((category) => isKnownCategory(category))
    .map((category) => ({ category }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const products = PRODUCTS_BY_CATEGORY[category as keyof typeof PRODUCTS_BY_CATEGORY];

  if (!products || !isKnownCategory(category)) notFound();

  const t = await getT();
  const label = t(`catalogueCategory.meta.${category}.label`);
  const description = t(`catalogueCategory.meta.${category}.description`);

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        {/* Breadcrumb */}
        <BackLink href="/catalogue" label={t("catalogueCategory.backLink")} />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--hm-text)] mb-3">
            {label}
          </h1>
          <p className="text-sm text-[var(--hm-text-soft)] max-w-lg">{description}</p>
        </div>

        {/* Category nav */}
        <div className="flex flex-wrap gap-3 mb-10">
          {PUBLIC_CATEGORY_IDS.map((id) => {
            return (
              <Link
                key={id}
                href={`/catalogue/${id}`}
                className={`px-4 py-2 text-xs font-semibold border rounded-full transition-colors
                  ${id === category
                    ? "border-[var(--hm-primary)] text-[var(--hm-primary)]"
                    : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                  }`}
              >
                {t(`catalogueCategory.meta.${id}.short`)}
              </Link>
            );
          })}
        </div>

        {/* Products — état vide propre si aucune fiche visible (ex: goodies V1) */}
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--hm-line)] px-6 py-16 text-center"
            style={{ background: "linear-gradient(180deg, #f8f6f2 0%, #f1eee8 100%)" }}
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--hm-primary)]">
              {t("catalogueCategory.empty.badge")}
            </p>
            <h2 className="mb-3 text-xl font-semibold text-[var(--hm-text)] sm:text-2xl">
              {category === "goodies"
                ? t("catalogueCategory.empty.goodies.title")
                : t("catalogueCategory.empty.default.title").replace("{label}", label)}
            </h2>
            <p className="mb-6 max-w-md text-sm leading-6 text-[var(--hm-text-soft)]">
              {category === "goodies"
                ? t("catalogueCategory.empty.goodies.body")
                : t("catalogueCategory.empty.default.body")}
            </p>
            <Link
              href={`/contact?sujet=devis&support=${category}`}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-[12px]"
            >
              {t("catalogueCategory.empty.cta")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
