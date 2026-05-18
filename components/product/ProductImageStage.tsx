"use client";

import Image from "next/image";

/**
 * ProductImageStage — Scène image premium pour cards textile V1.
 *
 * Utilisé par ProductCard catalogue et BestSellers homepage pour garantir
 * un rendu visuel strictement identique entre les deux surfaces.
 *
 * Structure visuelle (mai 2026 — refonte "blanc plein edge-to-edge") :
 *
 *   ┌─────────────────────────────────────────┐
 *   │                                         │  ← fond blanc plein qui
 *   │           ╔═══════════════╗             │     remplit toute la zone
 *   │           ║   Produit JPG ║             │     image de la card
 *   │           ╚═══════════════╝             │
 *   │                                         │
 *   │       ombre douce d'ancrage             │
 *   │                                         │
 *   └─────────────────────────────────────────┘
 *
 * Pourquoi cette structure :
 *   - Les mockups Printify ont un fond blanc baked-in : impossible de le retirer.
 *   - On l'assume complètement : tout le fond de la scène image EST blanc.
 *   - Le produit (sur fond blanc dans le JPG) fusionne parfaitement avec la
 *     scène, sans "marche" de blanc visible nulle part.
 *   - La séparation visuelle avec le reste de la card (swatches, titre, prix)
 *     est assurée par une border-bottom subtile.
 *   - Pour BestSellers : variant="best-sellers" applique un padding interne
 *     suffisant pour ne pas que le visuel touche les bords absolus où vivent
 *     les badges catégorie.
 *
 * Mission "100% Printify V1" : ce composant ne sait pas reconstruire d'URL —
 * il reçoit `src` déjà résolue par les callers (qui passent par v1-image.ts).
 * Aucune logique 3D / TopTex / Printful ici.
 */

interface ProductImageStageProps {
  src: string;
  alt: string;
  /** Famille pour appliquer le scale/padding adapté */
  category: string;
  /** Variante visuelle :
   *  - "catalog" → padding interne standard (cards catalogue)
   *  - "best-sellers" → padding interne renforcé en top pour les badges absolute */
  variant?: "catalog" | "best-sellers";
  /** Tailles responsives passées à <Image fill /> */
  sizes?: string;
  /** Priority loading (LCP) */
  priority?: boolean;
}

// ─── Sizing par famille ──────────────────────────────────────────────────────
//
// `padding` : espace interne entre les bords de la scène image et le produit.
//             Plus grand pour "best-sellers" en top, pour laisser respirer les
//             badges absolute (catégorie + "Best-seller") placés à top-4.
// `scale`   : zoom CSS appliqué à l'image (sur JPG déjà cropped à ~95%).

function getSizing(category: string, variant: "catalog" | "best-sellers") {
  // T-shirts : Gildan 5000, Bella 3001, Comfort Colors 1717
  if (category === "tshirts") {
    return {
      padding:
        variant === "best-sellers"
          ? "pt-14 px-4 pb-4 sm:pt-16 sm:px-5 sm:pb-5"
          : "p-4 sm:p-6",
      scale: variant === "catalog" ? 1.0 : 0.96,
    };
  }
  // Hoodies / sweats : Gildan 18000 (crewneck), Gildan 18500 (hoodie)
  if (category === "hoodies") {
    return {
      padding:
        variant === "best-sellers"
          ? "pt-14 px-3 pb-3 sm:pt-16 sm:px-4 sm:pb-4"
          : "p-3 sm:p-5",
      scale: variant === "catalog" ? 1.02 : 0.98,
    };
  }
  // Goodies / autres
  return {
    padding: variant === "best-sellers" ? "pt-14 px-4 pb-4" : "p-4",
    scale: 1,
  };
}

export default function ProductImageStage({
  src,
  alt,
  category,
  variant = "catalog",
  sizes,
  priority = false,
}: ProductImageStageProps) {
  const { padding, scale } = getSizing(category, variant);

  return (
    // ─── Scène image : blanc plein edge-to-edge ─────────────────────────────
    <div
      className="relative h-full w-full overflow-hidden bg-white"
      style={{
        // Border-bottom discrète qui sépare visuellement la zone image de la
        // bande swatches / titre / prix située sous la card.
        borderBottom: "1px solid rgba(60,45,75,0.06)",
      }}
    >
      {/* Ombre douce d'ancrage sous le produit */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 z-0 h-4 w-3/5 -translate-x-1/2 rounded-[100%]"
        style={{
          bottom: 18,
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.10) 0%, transparent 72%)",
          filter: "blur(3px)",
          opacity: 0.40,
        }}
      />

      {/* Image produit — fusionne parfaitement avec le fond blanc de la scène */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`relative z-10 object-contain object-center transition-transform duration-700 ${padding}`}
        style={{
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}
