import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Home, LayoutGrid, Shirt, Tag } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductFeaturesSection from "@/components/product/ProductFeaturesSection";
import { getProductBySlug, ALL_PRODUCTS } from "@/data/products";
import { getT } from "@/lib/i18n/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export async function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const t = await getT();
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  // Related products (same category, excluding current)
  const related = ALL_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  // ── Données par catégorie ─────────────────────────────────────────────────
  const USE_CASES: Record<string, string[]> = {
    tshirts:    [t("productPage.useCases.tshirts.0"), t("productPage.useCases.tshirts.1"), t("productPage.useCases.tshirts.2")],
    hoodies:    [t("productPage.useCases.hoodies.0"), t("productPage.useCases.hoodies.1"), t("productPage.useCases.hoodies.2")],
    softshells: [t("productPage.useCases.softshells.0"), t("productPage.useCases.softshells.1"), t("productPage.useCases.softshells.2")],
    polos:      [t("productPage.useCases.polos.0"), t("productPage.useCases.polos.1"), t("productPage.useCases.polos.2")],
    polaires:   [t("productPage.useCases.polaires.0"), t("productPage.useCases.polaires.1"), t("productPage.useCases.polaires.2")],
    casquettes: [t("productPage.useCases.casquettes.0"), t("productPage.useCases.casquettes.1"), t("productPage.useCases.casquettes.2")],
    sacs:       [t("productPage.useCases.sacs.0"), t("productPage.useCases.sacs.1"), t("productPage.useCases.sacs.2")],
    goodies:    [t("productPage.useCases.goodies.0"), t("productPage.useCases.goodies.1"), t("productPage.useCases.goodies.2")],
    enfants:    [t("productPage.useCases.enfants.0"), t("productPage.useCases.enfants.1"), t("productPage.useCases.enfants.2")],
  };

  const STRENGTHS: Record<string, string[]> = {
    tshirts:    [t("productPage.strengths.tshirts.0"), t("productPage.strengths.tshirts.1"), t("productPage.strengths.tshirts.2")],
    hoodies:    [t("productPage.strengths.hoodies.0"), t("productPage.strengths.hoodies.1"), t("productPage.strengths.hoodies.2")],
    softshells: [t("productPage.strengths.softshells.0"), t("productPage.strengths.softshells.1"), t("productPage.strengths.softshells.2")],
    polos:      [t("productPage.strengths.polos.0"), t("productPage.strengths.polos.1"), t("productPage.strengths.polos.2")],
    polaires:   [t("productPage.strengths.polaires.0"), t("productPage.strengths.polaires.1"), t("productPage.strengths.polaires.2")],
    casquettes: [t("productPage.strengths.casquettes.0"), t("productPage.strengths.casquettes.1"), t("productPage.strengths.casquettes.2")],
    sacs:       [t("productPage.strengths.sacs.0"), t("productPage.strengths.sacs.1"), t("productPage.strengths.sacs.2")],
    // Fallback générique — chaque goodie doit définir product.strengths dans data/products.ts.
    goodies:    [t("productPage.strengths.goodies.0"), t("productPage.strengths.goodies.1"), t("productPage.strengths.goodies.2")],
    enfants:    [t("productPage.strengths.enfants.0"), t("productPage.strengths.enfants.1"), t("productPage.strengths.enfants.2")],
  };

  // Goodies : objets hétérogènes (mugs, stickers, dessous de verre…) → données
  // par produit (ideaPour / strengths de data/products.ts), jamais le texte catégorie.
  const useCases  =
    product.category === "goodies" && product.ideaPour
      ? product.ideaPour
      : USE_CASES[product.category] ?? USE_CASES.tshirts;
  const strengths = product.strengths ?? STRENGTHS[product.category] ?? STRENGTHS.tshirts;

  // Recommandation dynamique selon les techniques réellement disponibles
  const techs = product.techniques;
  const recommendation: string = (() => {
    // Goodies (mugs, objets) — wording non-textile
    if (product.category === "goodies") {
      return t("productPage.recommendation.goodies");
    }
    if (techs.length === 1 && techs[0] === "broderie") {
      return t("productPage.recommendation.broderieOnly");
    }
    if (techs.length === 1 && techs[0] === "dtf") {
      return t("productPage.recommendation.dtfOnly");
    }
    if (!techs.includes("dtf")) {
      return t("productPage.recommendation.noDtf");
    }
    if (product.category === "softshells") {
      return t("productPage.recommendation.softshells");
    }
    if (product.category === "hoodies" || product.category === "enfants") {
      return t("productPage.recommendation.hoodiesEnfants");
    }
    return t("productPage.recommendation.default");
  })();

  return (
    <div className="pt-24 pb-20 md:pt-28">
      <div className="container">
        {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
        <nav aria-label={t("productPage.breadcrumb.aria")} className="mb-10 flex flex-wrap items-center gap-1.5">
          {/* Accueil */}
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <Home size={11} className="transition group-hover:text-[var(--hm-rose)]" />
            {t("productPage.breadcrumb.home")}
          </Link>

          {/* Separator */}
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>

          {/* Catalogue */}
          <Link
            href="/catalogue"
            className="group flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <LayoutGrid size={11} className="transition group-hover:text-[var(--hm-rose)]" />
            {t("productPage.breadcrumb.catalogue")}
          </Link>

          {/* Separator */}
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>

          {/* Catégorie */}
          <Link
            href={`/catalogue/${product.category}`}
            className="group flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <Shirt size={11} className="transition group-hover:text-[var(--hm-rose)]" />
            {({
              tshirts:    t("productPage.category.tshirts"),
              hoodies:    t("productPage.category.hoodies"),
              softshells: t("productPage.category.softshells"),
              polos:      t("productPage.category.polos"),
              polaires:   t("productPage.category.polaires"),
              casquettes: t("productPage.category.casquettes"),
              sacs:       t("productPage.category.sacs"),
              goodies:    t("productPage.category.goodies"),
              enfants:    t("productPage.category.enfants"),
            } as Record<string, string>)[product.category] ?? product.category}
          </Link>

          {/* Separator */}
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>

          {/* Produit courant — non cliquable */}
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] px-3 py-1.5 text-[11px] font-bold text-[var(--hm-primary)]">
            <Tag size={11} />
            {product.shortName}
          </span>
        </nav>

        <Suspense>
          <ProductDetailClient product={product} />
        </Suspense>

        <div className="mb-10 border-t border-[var(--hm-line)] pt-10 md:pt-12" />

        <ProductFeaturesSection product={product} />

        <div className="grid gap-6 mb-16 lg:grid-cols-3">
          <section className="card p-6">
            <h2 className="text-lg font-black text-[var(--hm-text)] mb-4">
              {t("productPage.idealFor")}
            </h2>
            <div className="space-y-3">
              {useCases.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-[var(--hm-rose)] mt-0.5 shrink-0" />
                  <p className="text-sm text-[var(--hm-text-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-black text-[var(--hm-text)] mb-4">
              {t("productPage.whyThisModel")}
            </h2>
            <div className="space-y-3">
              {strengths.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-[var(--hm-purple)] mt-0.5 shrink-0" />
                  <p className="text-sm text-[var(--hm-text-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6 bg-[var(--hm-accent-soft-blue)]">
            <h2 className="text-lg font-black text-[var(--hm-text)] mb-4">
              {t("productPage.hmAdvice")}
            </h2>
            <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed">
              {recommendation}
            </p>
          </section>
        </div>

        {related.length > 0 && (
          <div className="border-t border-[var(--hm-line)] pt-8 md:pt-10">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-bold text-[var(--hm-text)]">{t("productPage.relatedProducts")}</h2>
              <div className="h-[1px] flex-1 bg-[var(--hm-line)]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
