import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { formatPrice } from "@/data/pricing";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const basePrice = Math.min(product.pricing.dtf, product.pricing.flex);

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group card card-hover block overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package size={40} className="text-[#2a2a2a]" />
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="badge badge-gold">{product.badge}</span>
          </div>
        )}

        {/* Sold out overlay */}
        {product.colors.every((c) => !c.available) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="badge badge-neutral text-base">Rupture de stock</span>
          </div>
        )}

        {/* Color dots */}
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
            <div className="w-4 h-4 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <span className="text-[8px] text-[#8a8a8a]">+{product.colors.length - 5}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Reference */}
        <p className="text-[10px] text-[#555555] font-mono mb-1">{product.reference}</p>

        {/* Name */}
        <h3 className="text-sm font-bold text-[#f5f5f5] mb-2 group-hover:text-[#c9a96e] transition-colors">
          {product.shortName}
        </h3>

        {/* Techniques */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {product.techniques.map((tech) => (
            <span key={tech} className="text-[9px] px-2 py-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#555555] uppercase font-semibold tracking-wider">
              {tech === "broderie" ? "Broderie" : tech.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#555555]">Dès </span>
            <span className="text-base font-black text-[#c9a96e]">
              {formatPrice(basePrice)}
            </span>
            <span className="text-[10px] text-[#555555]"> TTC</span>
          </div>
          <span className="text-[10px] text-[#555555]">
            {formatPrice(basePrice / 1.2)} HT
          </span>
        </div>
      </div>
    </Link>
  );
}
