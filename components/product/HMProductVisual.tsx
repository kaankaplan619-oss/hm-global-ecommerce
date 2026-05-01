"use client";

/**
 * HMProductVisual — Wrapper visuel premium HM Global (B2).
 *
 * Deux modes :
 *
 * "hm" (fond sombre premium) :
 *   - Background : dégradé charcoal profond (#0c0e14 → #1a1f2c)
 *   - Lumière latérale douce : radial rose HM à 15% gauche
 *   - Ombre réaliste en bas (gradient to top)
 *   - Badge "HM Global" en coin supérieur droit
 *   - Produit centré, object-contain, padding réduit
 *
 * "supplier" (fond clair) :
 *   - Background : blanc cassé (#f7f6f4)
 *   - Shadow subtile
 *   - Badge "Photo fournisseur" discret
 *   - Traitement identique à l'ancien bg-gray-50 mais avec meilleure finition
 *
 * Le composant supporte fill (carte catalogue) et dimensions fixes (fiche produit).
 */

import Image from "next/image";
import { useState } from "react";
import { Package } from "lucide-react";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  src: string | null | undefined;
  alt: string;
  /** "hm" → fond sombre premium | "supplier" → fond clair fournisseur */
  mode: "hm" | "supplier";
  /** fill=true : Next/Image remplit le parent (carte catalogue) */
  fill?: boolean;
  /** Largeur fixe (si fill=false) */
  width?: number;
  /** Hauteur fixe (si fill=false) */
  height?: number;
  /** Responsive hint pour le navigateur (fill uniquement) */
  sizes?: string;
  /** LCP : charger en priorité (premier produit visible) */
  priority?: boolean;
  /** Classe CSS appliquée au wrapper */
  className?: string;
  /**
   * Afficher le badge de mode (HM Global / Photo fournisseur).
   * Désactivé par défaut sur les cartes catalogue pour ne pas surcharger.
   */
  showBadge?: boolean;
  /**
   * Classe appliquée à l'élément <img> / Image.
   * Par défaut : "object-contain transition-transform duration-500"
   */
  imageClassName?: string;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export default function HMProductVisual({
  src,
  alt,
  mode,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className = "",
  showBadge = false,
  imageClassName,
}: Props) {
  const [hasError, setHasError] = useState(false);
  const isEmpty = !src || hasError;

  const defaultImgClass =
    mode === "hm"
      ? "object-contain p-4 transition-transform duration-500 relative z-10"
      : "object-contain p-4 transition-transform duration-500";

  const imgClass = imageClassName ?? defaultImgClass;

  // fill=true → le wrapper doit remplir le parent positionné (absolute inset-0)
  // fill=false → wrapper normal en flux (relative, se dimensionne sur son contenu)
  const wrapperPositionClass = fill ? "absolute inset-0" : "relative";

  // ── Mode HM Global — fond sombre premium ────────────────────────────────────
  if (mode === "hm") {
    return (
      <div
        className={`${wrapperPositionClass} overflow-hidden ${className}`}
        style={{
          background:
            "linear-gradient(145deg, #0c0e14 0%, #131720 45%, #1a1f2c 100%)",
        }}
      >
        {/* Lumière latérale douce — rose HM de marque */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at 18% 50%, rgba(177,63,116,0.08) 0%, transparent 58%)",
          }}
        />

        {/* Lueur supérieure subtile */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-1/2"
          style={{
            background:
              "radial-gradient(ellipse at 65% 0%, rgba(255,255,255,0.035) 0%, transparent 60%)",
          }}
        />

        {/* Ombre réaliste en bas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/4"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.08) 60%, transparent 100%)",
          }}
        />

        {/* Image produit */}
        {isEmpty ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <Package size={36} className="text-white/15" />
            <span className="text-[10px] font-medium tracking-wide text-white/25">
              Visuel à venir
            </span>
          </div>
        ) : fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className={imgClass}
            onError={() => setHasError(true)}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width ?? 600}
            height={height ?? 600}
            sizes={sizes}
            priority={priority}
            className={imgClass}
            onError={() => setHasError(true)}
          />
        )}

        {/* Badge HM Global */}
        {showBadge && !isEmpty && (
          <div className="absolute right-3 top-3 z-30">
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest"
              style={{
                borderColor: "rgba(177,63,116,0.35)",
                background:  "rgba(177,63,116,0.12)",
                color:       "#e8a0bf",
              }}
            >
              HM Global
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── Mode Supplier — fond clair fournisseur ────────────────────────────────────
  return (
    <div
      className={`${wrapperPositionClass} overflow-hidden ${className}`}
      style={{ background: "#f7f6f4" }}
    >
      {isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Package size={36} className="text-gray-300" />
          <span className="text-[10px] font-medium tracking-wide text-gray-400">
            Visuel à venir
          </span>
        </div>
      ) : fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={imgClass}
          onError={() => setHasError(true)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 600}
          height={height ?? 600}
          sizes={sizes}
          priority={priority}
          className={imgClass}
          onError={() => setHasError(true)}
        />
      )}

      {/* Badge fournisseur discret */}
      {showBadge && !isEmpty && (
        <div className="absolute bottom-2 right-2 z-10">
          <span className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-2 py-0.5 text-[8px] font-medium tracking-wide text-gray-400">
            Photo fournisseur
          </span>
        </div>
      )}
    </div>
  );
}
