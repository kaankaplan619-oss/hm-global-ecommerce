"use client";

/**
 * BATPreviewCard — aperçu statique produit + logo pour le BAT imprimable.
 *
 * Reprend les mêmes positions CSS que LightMockupPreview mais sans
 * sélecteur d'effet ni interaction. Conçu pour être rendu dans BATModal.
 */

import type { Placement, ProductCategory } from "@/types";
import type { LogoEffect } from "@/lib/color-utils";

// ── Positions coeur calibrées (identiques à LightMockupPreview) ───────────────
const COEUR_BY_CATEGORY: Partial<Record<ProductCategory, React.CSSProperties>> = {
  tshirts:    { position: "absolute", top: "26%", left: "43%", width: "17%" },
  hoodies:    { position: "absolute", top: "30%", left: "43%", width: "18%" },
  softshells: { position: "absolute", top: "32%", left: "42%", width: "17%" },
  polos:      { position: "absolute", top: "34%", left: "42%", width: "16%" },
};

const COEUR_DEFAULT: React.CSSProperties = {
  position: "absolute",
  top:   "30%",
  left:  "43%",
  width: "18%",
};

const DOS_STYLE: React.CSSProperties = {
  position:  "absolute",
  top:       "22%",
  left:      "50%",
  transform: "translateX(-50%)",
  width:     "28%",
};

const WHITE_OUTLINE_FILTER =
  "drop-shadow(0 0 3px rgba(255,255,255,0.95)) " +
  "drop-shadow(0 0 5px rgba(255,255,255,0.85)) " +
  "drop-shadow(0 0 8px rgba(255,255,255,0.7))";

const NORMAL_FILTER =
  "drop-shadow(0 1px 2px rgba(0,0,0,0.14)) " +
  "drop-shadow(0 0px 1px rgba(0,0,0,0.06))";

// ── Zone overlay (pointillés) ─────────────────────────────────────────────────
function ZoneOverlay() {
  return (
    <div
      className="absolute inset-0 rounded"
      style={{
        border:        "1.5px dashed rgba(177,63,116,0.38)",
        background:    "rgba(177,63,116,0.04)",
        pointerEvents: "none",
      }}
    />
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  imageUrl:    string;
  logoUrl:     string | null;
  placement:   Placement;
  category?:   ProductCategory;
  logoEffect:  LogoEffect;
  productName: string;
  /** Taille d'affichage — "normal" pour le modal, "compact" pour impression serrée */
  size?: "normal" | "compact";
}

export default function BATPreviewCard({
  imageUrl,
  logoUrl,
  placement,
  category,
  logoEffect,
  productName,
  size = "normal",
}: Props) {
  const showCoeur = placement === "coeur" || placement === "coeur-dos";
  const showDos   = placement === "dos"   || placement === "coeur-dos";

  const coeurStyle: React.CSSProperties =
    (category && COEUR_BY_CATEGORY[category]) ?? COEUR_DEFAULT;

  const logoImgStyle: React.CSSProperties =
    logoEffect === "white-outline"
      ? { filter: WHITE_OUTLINE_FILTER }
      : logoEffect === "white-bg"
        ? { backgroundColor: "white", borderRadius: "4px", padding: "6px", boxSizing: "border-box" }
        : { filter: NORMAL_FILTER };

  const containerClass =
    size === "compact"
      ? "relative overflow-hidden rounded-xl border border-[var(--hm-line)] bg-white"
      : "relative overflow-hidden rounded-[20px] border border-[var(--hm-line)] bg-white shadow-[0_8px_24px_rgba(63,45,88,0.08)]";

  return (
    <div className={containerClass}>
      {/* Photo produit */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={productName}
        className="block w-full object-contain"
      />

      {/* Zone cœur */}
      {showCoeur && (
        <div style={coeurStyle}>
          <ZoneOverlay />
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo — zone cœur"
              className="relative z-10 block w-full object-contain"
              style={logoImgStyle}
            />
          )}
        </div>
      )}

      {/* Zone dos */}
      {showDos && (
        <div style={DOS_STYLE}>
          <ZoneOverlay />
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo — zone dos"
              className="relative z-10 block w-full object-contain"
              style={logoImgStyle}
            />
          )}
        </div>
      )}

      {/* Bandeau disclaimer (masqué à l'impression via .no-print) */}
      <div className="no-print pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-0.5 text-[9px] font-semibold text-[var(--hm-text-muted)]">
        Position indicative
      </div>
    </div>
  );
}
