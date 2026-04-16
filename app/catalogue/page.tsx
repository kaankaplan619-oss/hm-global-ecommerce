import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { ALL_PRODUCTS, SEASONAL_ORDER, CURRENT_SEASON } from "@/data/products";

export const metadata: Metadata = {
  title: "Catalogue — Textile personnalisé",
  description:
    "T-shirts, hoodies et softshells personnalisés. DTF, flex ou broderie. Commandez en ligne avec HM Global Agence.",
};

const CATEGORY_LABELS: Record<string, string> = {
  tshirts: "T-shirts",
  hoodies: "Hoodies & Sweats",
  softshells: "Softshells & Vestes",
};

export default function CataloguePage() {
  const order = SEASONAL_ORDER[CURRENT_SEASON];

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <p className="section-tag">Catalogue complet</p>
          <h1 className="text-3xl md:text-5xl font-black text-[#f5f5f5] mb-4">
            Textile personnalisé<br />
            <span className="text-gradient-gold">professionnel</span>
          </h1>
          <p className="text-[#555555] text-sm max-w-lg">
            Sélectionnez votre produit, configurez votre marquage et commandez directement en ligne. Livraison offerte dès 10 pièces.
          </p>
        </div>

        {/* Filter links */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/catalogue"
            className="px-4 py-2 text-xs font-semibold border border-[#c9a96e] text-[#c9a96e] rounded-full"
          >
            Tous les produits
          </Link>
          {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
            <Link
              key={id}
              href={`/catalogue/${id}`}
              className="px-4 py-2 text-xs font-semibold border border-[#2a2a2a] text-[#555555] hover:border-[#c9a96e] hover:text-[#c9a96e] rounded-full transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Products by season order */}
        {order.map((catId) => {
          const products = ALL_PRODUCTS.filter((p) => p.category === catId);
          if (products.length === 0) return null;

          return (
            <div key={catId} className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-bold text-[#f5f5f5]">
                  {CATEGORY_LABELS[catId]}
                </h2>
                <div className="h-[1px] flex-1 bg-[#1e1e1e]" />
                <Link
                  href={`/catalogue/${catId}`}
                  className="text-xs text-[#c9a96e] hover:underline"
                >
                  Voir tout →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
