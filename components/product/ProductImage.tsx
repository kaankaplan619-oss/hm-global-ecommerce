"use client";

import Image from "next/image";
import { useState } from "react";
import { Package } from "lucide-react";

type ProductImageProps = {
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  iconSize?: number;
  label?: string;
  priority?: boolean;
  sizes?: string;
};

export default function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  iconSize = 42,
  label = "Visuel produit à venir",
  priority = false,
  sizes,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,var(--hm-accent-soft-blue),var(--hm-accent-soft-purple))]">
        <div className="w-16 h-16 rounded-full bg-white/80 border border-white shadow-sm flex items-center justify-center">
          <Package size={iconSize} className="text-[var(--hm-purple)]" />
        </div>
        <p className="text-[11px] font-medium text-[var(--hm-text-soft)] text-center px-4">
          {label}
        </p>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 1200}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
