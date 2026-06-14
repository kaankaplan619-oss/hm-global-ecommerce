import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BackLink from "@/components/ui/BackLink";
import PrintConfigurator from "@/components/print/PrintConfigurator";
import { getT } from "@/lib/i18n/server";
import {
  getPrintProduct,
  isDirectOrder,
  ALL_PRINT_PRODUCTS,
} from "@/data/print-catalogue";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ALL_PRINT_PRODUCTS
    .filter((p) => !isDirectOrder(p.id))
    .map((p) => ({ slug: p.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const t = await getT();
  const found = getPrintProduct(slug);
  if (!found) return { title: t("printDetail.metaFallbackTitle") };
  return {
    title: `${found.product.name} — ${t("printDetail.metaTitleSuffix")}`,
    description: found.product.description,
  };
}

export default async function PrintProductPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const t = await getT();
  const found = getPrintProduct(slug);
  if (!found) notFound();
  // Les cartes natives 85×55 ont leur configurateur dédié (prix + commande).
  if (isDirectOrder(slug)) redirect("/impression/cartes-de-visite");

  const { product, spec } = found;

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <BackLink href="/impression" label={t("printDetail.backToPrint")} />

        <div className="mb-10">
          <p className="section-tag">{t("printDetail.customization")} · {product.sizeLabel}</p>
          <h1 className="mb-3 text-3xl font-black text-[var(--hm-text)] md:text-4xl">
            {product.name}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            {product.description}
          </p>
        </div>

        <PrintConfigurator product={product} spec={spec} />
      </div>
    </div>
  );
}
