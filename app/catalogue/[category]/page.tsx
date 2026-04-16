import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { PRODUCTS_BY_CATEGORY } from "@/data/products";

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  tshirts: {
    label: "T-shirts personnalisés",
    description:
      "T-shirts personnalisés en DTF, flex ou broderie. Modèles homme, femme, unisex. Qualité B&C Select, livraison rapide.",
  },
  hoodies: {
    label: "Hoodies & Sweats personnalisés",
    description:
      "Hoodies et sweatshirts personnalisés. Intérieur molletonné doux, qualité professionnelle. À partir de 42,90 €.",
  },
  softshells: {
    label: "Softshells & Vestes personnalisées",
    description:
      "Vestes softshell imperméables personnalisées. Broderie premium recommandée. Gamme B&C 3 couches.",
  },
};

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) return {};
  return {
    title: meta.label,
    description: meta.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(PRODUCTS_BY_CATEGORY).map((category) => ({ category }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const products = PRODUCTS_BY_CATEGORY[category as keyof typeof PRODUCTS_BY_CATEGORY];
  const meta = CATEGORY_META[category];

  if (!products || !meta) notFound();

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555555] mb-8">
          <Link href="/" className="hover:text-[#f5f5f5]">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-[#f5f5f5]">Catalogue</Link>
          <span>/</span>
          <span className="text-[#f5f5f5]">{meta.label}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-3">
            {meta.label}
          </h1>
          <p className="text-sm text-[#555555] max-w-lg">{meta.description}</p>
        </div>

        {/* Category nav */}
        <div className="flex flex-wrap gap-3 mb-10">
          {Object.entries(CATEGORY_META).map(([id, m]) => (
            <Link
              key={id}
              href={`/catalogue/${id}`}
              className={`px-4 py-2 text-xs font-semibold border rounded-full transition-colors
                ${id === category
                  ? "border-[#c9a96e] text-[#c9a96e]"
                  : "border-[#2a2a2a] text-[#555555] hover:border-[#c9a96e] hover:text-[#c9a96e]"
                }`}
            >
              {m.label.split(" ")[0]}
            </Link>
          ))}
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
