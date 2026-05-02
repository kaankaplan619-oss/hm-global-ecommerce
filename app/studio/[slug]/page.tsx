import { notFound } from "next/navigation";
import { getProductBySlug } from "@/data/products";
import StudioClient from "./_studio-client";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `Studio · ${product.name}`,
    description: `Personnalisez votre ${product.shortName} avec vos logos, textes et designs.`,
  };
}

export default async function StudioPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return <StudioClient product={product} />;
}
