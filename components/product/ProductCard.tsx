import Link from "next/link";
import { Camera, Layers3 } from "lucide-react";
import { formatPrice } from "@/data/pricing";
import type { Product } from "@/types";
import ProductImage from "@/components/product/ProductImage";

interface ProductCardProps {
  product: Product;
}

const CATEGORY_LABEL: Record<string, string> = {
  tshirts:    "T-shirt",
  hoodies:    "Hoodie / Sweat",
  softshells: "Softshell",
  polos:      "Polo",
  polaires:   "Polaire / Doudoune",
  casquettes: "Casquette",
  sacs:       "Sac & Tote",
  enfants:    "Enfant",
};

export default function ProductCard({ product }: ProductCardProps) {
  // Filtre les techniques à 0 (= non disponibles) avant de prendre le min
  const prices = [
    product.pricing.dtf,
    product.pricing.flex,
    product.pricing.broderie,
  ].filter((p) => p > 0);
  const basePrice = prices.length > 0 ? Math.min(...prices) : 0;

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group card card-hover block overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-50">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          label="Visuel produit à venir"
        />

        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="badge badge-gold">{product.badge}</span>
          </div>
        )}

        {product.colors.every((c) => !c.available) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="badge badge-neutral text-base">Rupture de stock</span>
          </div>
        )}

        <div className="absolute top-3 right-3 rounded-full bg-white/90 border border-[var(--hm-line)] px-2.5 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)] flex items-center gap-1.5">
          <Camera size={12} className="text-[var(--hm-rose)]" />
          {product.images.length} vue{product.images.length > 1 ? "s" : ""}
        </div>

        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {product.colors.slice(0, 5).map((color) => (
            <div
              key={color.id}
              className="w-4 h-4 rounded-full border border-black/20"
              style={{ backgroundColor: color.hex }}
              title={color.label}
            />
          ))}
          {product.colors.length > 5 && (
            <div className="w-5 h-5 rounded-full bg-white/90 border border-[var(--hm-line)] flex items-center justify-center">
              <span className="text-[8px] text-[var(--hm-text-soft)]">+{product.colors.length - 5}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-[10px] text-[var(--hm-text-soft)] font-mono">{product.reference}</p>
          <span className="text-[10px] text-[var(--hm-text-soft)] inline-flex items-center gap-1">
            <Layers3 size={11} />
            {CATEGORY_LABEL[product.category] ?? product.category}
          </span>
        </div>

        <h3 className="text-sm font-bold text-[var(--hm-text)] mb-2 group-hover:text-[var(--hm-rose)] transition-colors">
          {product.shortName}
        </h3>

        <p className="text-[11px] text-[var(--hm-text-soft)] leading-relaxed mb-3">
          {product.description.slice(0, 90)}...
        </p>

        <div className="flex gap-1.5 flex-wrap mb-3">
          {product.techniques.map((tech) => (
            <span key={tech} className="text-[9px] px-2 py-0.5 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded-full text-[var(--hm-text-soft)] uppercase font-semibold tracking-wider">
              {tech === "broderie" ? "Broderie" : tech.toUpperCase()}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[var(--hm-text-soft)]">Dès </span>
            <span className="text-base font-black text-[var(--hm-rose)]">
              {formatPrice(basePrice)}
            </span>
            <span className="text-[10px] text-[var(--hm-text-soft)]"> TTC</span>
          </div>
          <span className="text-[10px] text-[var(--hm-text-soft)]">
            {formatPrice(basePrice / 1.2)} HT
          </span>
        </div>
      </div>
    </Link>
  );
}
