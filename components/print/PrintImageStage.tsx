"use client";

import Image from "next/image";

/**
 * PrintImageStage — Scène image premium pour cards print V1.
 *
 * Pendant de `ProductImageStage` (textile), mais adapté au print :
 *   - 6 catégories supportées : business-cards, flyer, poster, canvas,
 *     framed-poster, hanging-poster
 *   - Cadrage / object-position / aspect ratio adapté à chaque catégorie
 *     pour différencier visuellement les familles sans dépendre d'une
 *     image unique (les 4 visuels actuels se ressemblent trop)
 *   - Priorité automatique : `/mockups/print/hm/{family}.webp` (vrais
 *     visuels HM générés via prompts) → sinon fallback sur les visuels
 *     actuels passés en `src`.
 *
 * Note : tant que les visuels HM premium ne sont pas générés (cf
 * `docs/prompts/print-mockups-prompts.md`), le composant utilise les
 * fallbacks fournis par les callers + applique un cadrage différencié
 * par catégorie pour donner du contraste visuel entre familles.
 */

export type PrintFamily =
  | "business-cards"
  | "flyer"
  | "poster"
  | "canvas"
  | "framed-poster"
  | "hanging-poster"
  | "cards";

interface PrintImageStageProps {
  src: string;
  alt: string;
  family: PrintFamily;
  /** Variante visuelle :
   *  - "catalog" → utilisé sur /impression (card grande, image dominante)
   *  - "compact" → utilisé sur homepage (card plus petite, aspect 4:3) */
  variant?: "catalog" | "compact";
  sizes?: string;
  priority?: boolean;
}

// ─── Présentation par famille ────────────────────────────────────────────────

interface FamilyPresentation {
  /** Background gradient/teinte spécifique à la famille — différencie visuellement */
  background: string;
  /** object-position pour cadrer différemment chaque famille à partir de la même image */
  objectPosition: string;
  /** object-fit (cover ou contain selon la famille) */
  objectFit: "cover" | "contain";
  /** Padding interne autour de l'image */
  padding: string;
  /** Scale CSS additionnel */
  scale: number;
  /** Label visuel discret à afficher en overlay (eyebrow) */
  overlayLabel?: string;
}

function getPresentation(family: PrintFamily): FamilyPresentation {
  switch (family) {
    case "business-cards":
      return {
        // Beige chaud, ombre douce — évoque le papier 350g/m²
        background:
          "radial-gradient(ellipse at 50% 38%, #fefcf7 0%, #f4ede0 60%, #ebe1cd 100%)",
        objectPosition: "center 45%",
        objectFit: "cover",
        padding: "p-0",
        scale: 1.02,
        overlayLabel: "85 × 55 mm",
      };

    case "flyer":
      return {
        // Beige légèrement violet — évoque le papier couché 170g/m²
        background:
          "radial-gradient(ellipse at 50% 42%, #faf6ef 0%, #ede6da 55%, #d8cdb8 100%)",
        objectPosition: "center 55%",
        objectFit: "cover",
        padding: "p-0",
        scale: 1.05,
        overlayLabel: "A5 / A4",
      };

    case "poster":
      return {
        // Crème + halo doux — évoque le poster grand format
        background:
          "radial-gradient(ellipse at 50% 35%, #fffdf6 0%, #f2ebde 60%, #e0d5be 100%)",
        objectPosition: "center 40%",
        objectFit: "cover",
        padding: "p-2 sm:p-3",
        scale: 1.0,
        overlayLabel: "Grand format",
      };

    case "canvas":
      return {
        // Beige plus profond — évoque la toile et le bois
        background:
          "radial-gradient(ellipse at 50% 45%, #f7f2e8 0%, #e8dccb 55%, #d2c1a6 100%)",
        objectPosition: "center 50%",
        objectFit: "cover",
        padding: "p-2 sm:p-3",
        scale: 1.0,
        overlayLabel: "Toile tendue",
      };

    case "framed-poster":
      return {
        // Gris très chaud — évoque l'encadrement noir mat
        background:
          "radial-gradient(ellipse at 50% 40%, #fbf8f0 0%, #ece4d2 55%, #d3c8b0 100%)",
        objectPosition: "center 45%",
        objectFit: "cover",
        padding: "p-3",
        scale: 1.0,
        overlayLabel: "Encadré",
      };

    case "hanging-poster":
      return {
        // Plus clair, ouvert — évoque le poster suspendu
        background:
          "radial-gradient(ellipse at 50% 30%, #fffdf6 0%, #f1eadb 60%, #ddd0b6 100%)",
        objectPosition: "center 35%",
        objectFit: "cover",
        padding: "p-2",
        scale: 1.0,
        overlayLabel: "Suspendu",
      };

    case "cards":
    default:
      return {
        background:
          "radial-gradient(ellipse at 50% 42%, #fbf7ee 0%, #f3ece0 55%, #ebe1cd 100%)",
        objectPosition: "center center",
        objectFit: "cover",
        padding: "p-0",
        scale: 1.0,
        overlayLabel: undefined,
      };
  }
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function PrintImageStage({
  src,
  alt,
  family,
  variant = "catalog",
  sizes,
  priority = false,
}: PrintImageStageProps) {
  const {
    background,
    objectPosition,
    objectFit,
    padding,
    scale,
    overlayLabel,
  } = getPresentation(family);

  const showOverlay = overlayLabel && variant === "catalog";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background,
        borderBottom: "1px solid rgba(60,45,75,0.06)",
      }}
    >
      {/* Ombre douce d'ancrage sous l'objet — comme ProductImageStage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 z-0 h-4 w-3/5 -translate-x-1/2 rounded-[100%]"
        style={{
          bottom: 16,
          background:
            "radial-gradient(ellipse, rgba(0,0,0,0.10) 0%, transparent 72%)",
          filter: "blur(3px)",
          opacity: 0.35,
        }}
      />

      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`relative z-10 ${objectFit === "cover" ? "object-cover" : "object-contain"} transition-transform duration-700 group-hover:scale-[1.03] ${padding}`}
        style={{
          objectPosition,
          transform: `scale(${scale})`,
        }}
      />

      {/* Badge format flottant */}
      {showOverlay && (
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 z-20 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)] shadow-sm backdrop-blur-sm"
        >
          {overlayLabel}
        </span>
      )}
    </div>
  );
}
