import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductBySlug } from "@/data/products";
import { getT } from "@/lib/i18n/server";
import StudioClient from "./_studio-client";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const t = await getT();
  return {
    title: `Studio · ${product.name}`,
    description: `${t("studioPage.descPrefix")} ${product.shortName} ${t("studioPage.descSuffix")}`,
  };
}

export default async function StudioPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <Suspense>
      <StudioClient product={product} />
    </Suspense>
  );
}
