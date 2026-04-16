import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, Info } from "lucide-react";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import ProductCard from "@/components/product/ProductCard";
import { getProductBySlug, ALL_PRODUCTS } from "@/data/products";
import { formatPrice } from "@/data/pricing";

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
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  // Related products (same category, excluding current)
  const related = ALL_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const minPrice = Math.min(product.pricing.dtf, product.pricing.flex);

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555555] mb-8">
          <Link href="/" className="hover:text-[#f5f5f5]">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-[#f5f5f5]">Catalogue</Link>
          <span>/</span>
          <Link href={`/catalogue/${product.category}`} className="hover:text-[#f5f5f5] capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#f5f5f5]">{product.shortName}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left — Image gallery */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative aspect-square bg-[#111111] rounded-xl overflow-hidden border border-[#1e1e1e]">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Package size={48} className="text-[#2a2a2a]" />
                  <p className="text-xs text-[#555555]">Photo à venir</p>
                </div>
              )}

              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="badge badge-gold">{product.badge}</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[#111111] rounded-lg overflow-hidden border border-[#1e1e1e] cursor-pointer hover:border-[#c9a96e33] transition-colors"
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} width={120} height={120} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Product info block */}
            <div className="p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-[#555555] uppercase tracking-wider font-semibold mb-1">Référence</p>
                  <p className="text-sm font-mono text-[#f5f5f5]">{product.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555555] uppercase tracking-wider font-semibold mb-1">Composition</p>
                  <p className="text-sm text-[#8a8a8a]">{product.composition}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555555] uppercase tracking-wider font-semibold mb-1">Grammage</p>
                  <p className="text-sm text-[#8a8a8a]">{product.weight}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555555] uppercase tracking-wider font-semibold mb-1">Prix dès</p>
                  <p className="text-sm font-bold text-[#c9a96e]">{formatPrice(minPrice)} TTC</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 pt-4 border-t border-[#1e1e1e]">
                <p className="text-xs text-[#555555] leading-relaxed">{product.description}</p>
              </div>
            </div>

            {/* Info note for softshells */}
            {product.category === "softshells" && (
              <div className="flex items-start gap-3 p-4 bg-[#a78bfa11] border border-[#a78bfa33] rounded-lg">
                <Info size={14} className="text-[#a78bfa] shrink-0 mt-0.5" />
                <p className="text-xs text-[#a78bfa]">
                  La broderie est recommandée pour ce type de vêtement premium. DTF et flex sont disponibles mais à utiliser avec prudence selon le visuel.
                </p>
              </div>
            )}
          </div>

          {/* Right — Configurator */}
          <div>
            <div className="mb-6">
              <p className="text-[10px] font-mono text-[#555555] mb-1">{product.reference}</p>
              <h1 className="text-2xl md:text-3xl font-black text-[#f5f5f5] mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-[#555555] mb-1">{product.composition} · {product.weight}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#c9a96e]">
                  {formatPrice(minPrice)}
                </span>
                <span className="text-sm text-[#555555]">TTC</span>
                <span className="text-xs text-[#555555]">({formatPrice(minPrice / 1.2)} HT)</span>
              </div>
            </div>

            <ProductConfigurator product={product} />
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-bold text-[#f5f5f5]">Produits similaires</h2>
              <div className="h-[1px] flex-1 bg-[#1e1e1e]" />
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
