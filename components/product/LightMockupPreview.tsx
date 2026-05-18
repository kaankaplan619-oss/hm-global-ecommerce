"use client";

/**
 * LightMockupPreview — aperçu CSS overlay pour produits sans MockupViewer Fabric.
 *
 * Affiche le logo uploadé en surimpression sur la photo produit, dans la zone
 * de marquage approximative (coeur / dos). Conçu pour hoodies, softshells, polos,
 * polaires, etc. Aucune dépendance externe — pur CSS + React.
 *
 * Ce composant est volontairement simple et facile à remplacer par un vrai
 * MockupViewer Fabric si des mockups photographiques hoodie sont créés.
 */

import { useEffect, useState } from "react";
import type { Placement, ProductCategory } from "@/types";
import { isColorDark, EFFECT_OPTIONS } from "@/lib/color-utils";
import type { LogoEffect } from "@/lib/color-utils";
import { getZoneRect } from "@/lib/textile-zones";

// ── Position des zones — dérivées du rectangle source de vérité ──────────────
// Les positions cœur / dos viennent de @/lib/textile-zones (packshots TopTex).
// Format : rectangle [left, top, width, height] → CSS top/left/width/height en %.
function zoneStyle(category: ProductCategory | undefined, placement: "coeur" | "dos"): React.CSSProperties {
  // ProductCategory inclut "polos", "polaires", "casquettes", "sacs", "enfants", "goodies"
  // qui ne sont pas dans ZONES_BY_CATEGORY → fallback automatique sur tshirts via getZoneRect.
  const [l, t, w, h] = getZoneRect(category, placement);
  return {
    position: "absolute",
    left:   `${l * 100}%`,
    top:    `${t * 100}%`,
    width:  `${w * 100}%`,
    height: `${h * 100}%`,
  };
}

// ── CSS filters logo ─────────────────────────────────────────────────────────
// "Contour blanc" : drop-shadow suit les pixels opaques → idéal pour PNG transparents.
const WHITE_OUTLINE_FILTER =
  "drop-shadow(0 0 3px rgba(255,255,255,0.95)) " +
  "drop-shadow(0 0 5px rgba(255,255,255,0.85)) " +
  "drop-shadow(0 0 8px rgba(255,255,255,0.7))";

// "Normal" : ombre portée discrète pour ancrer le logo sur le textile
// (simule un dépôt d'encre / broderie avec légère profondeur).
const NORMAL_FILTER =
  "drop-shadow(0 1px 2px rgba(0,0,0,0.14)) " +
  "drop-shadow(0 0px 1px rgba(0,0,0,0.06))";

interface Props {
  /** URL de l'image produit à utiliser comme fond (packshot couleur actuelle). */
  imageUrl:    string;
  /** Fichier logo uploadé par l'utilisateur. */
  logoFile:    File | null;
  /** Emplacement de marquage sélectionné dans le configurateur. */
  placement:   Placement;
  /** ID de couleur produit pour la détection clair/sombre. */
  colorId:     string;
  /** Nom du produit (alt text). */
  productName: string;
  /** Catégorie produit — détermine la position calibrée de la zone coeur. */
  category?:   ProductCategory;
  /** Callback optionnel — remonte l'effet logo vers le parent (ex. ProductDetailClient pour le BAT). */
  onLogoEffectChange?: (effect: LogoEffect) => void;
}

export default function LightMockupPreview({
  imageUrl,
  logoFile,
  placement,
  colorId,
  productName,
  category,
  onLogoEffectChange,
}: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoEffect, setLogoEffect] = useState<LogoEffect>(() =>
    isColorDark(colorId) ? "white-outline" : "none"
  );

  // Auto-reset de l'effet par défaut quand la couleur change
  useEffect(() => {
    const next = isColorDark(colorId) ? "white-outline" : "none";
    setLogoEffect(next);
    onLogoEffectChange?.(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorId]);

  // Création / révocation de l'URL blob du logo
  useEffect(() => {
    if (!logoFile) { setLogoUrl(null); return; }
    const url = URL.createObjectURL(logoFile);
    setLogoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  // Ne rien rendre si pas de logo ou image manquante
  if (!logoFile || !logoUrl || !imageUrl) return null;

  // Zones à afficher selon le placement
  const showCoeur = placement === "coeur" || placement === "coeur-dos";
  const showDos   = placement === "dos"   || placement === "coeur-dos";

  // Position coeur calibrée — dérivée du rectangle source de vérité (textile-zones)
  const coeurStyle: React.CSSProperties = zoneStyle(category, "coeur");
  const dosStyle:   React.CSSProperties = zoneStyle(category, "dos");

  // Style appliqué à l'<img> du logo selon l'effet choisi
  const logoImgStyle: React.CSSProperties =
    logoEffect === "white-outline"
      ? { filter: WHITE_OUTLINE_FILTER }
      : logoEffect === "white-bg"
        ? { backgroundColor: "white", borderRadius: "4px", padding: "6px", boxSizing: "border-box" }
        : { filter: NORMAL_FILTER };

  return (
    <div className="flex flex-col gap-3">

      {/* ── Image produit + overlay logo ────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[28px] border border-[var(--hm-line)] bg-white shadow-[0_20px_48px_rgba(63,45,88,0.08)]"
      >
        {/* Photo produit (packshot couleur actuelle) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={productName}
          className="block w-full object-contain"
        />

        {/* ── Zone cœur (poitrine gauche porteur) ───────────────────────── */}
        {showCoeur && (
          <div style={coeurStyle}>
            {/* Délimiteur de zone (pointillés) */}
            <div
              className="absolute inset-0 rounded"
              style={{
                border:     "1.5px dashed rgba(177,63,116,0.38)",
                background: "rgba(177,63,116,0.04)",
                pointerEvents: "none",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Votre logo — zone cœur"
              className="relative z-10 block w-full object-contain"
              style={logoImgStyle}
            />
          </div>
        )}

        {/* ── Zone dos (haut du dos centré) ─────────────────────────────── */}
        {showDos && (
          <div style={dosStyle}>
            <div
              className="absolute inset-0 rounded"
              style={{
                border:     "1.5px dashed rgba(177,63,116,0.38)",
                background: "rgba(177,63,116,0.04)",
                pointerEvents: "none",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Votre logo — zone dos"
              className="relative z-10 block w-full object-contain"
              style={logoImgStyle}
            />
          </div>
        )}

        {/* ── Bandeau disclaimer ────────────────────────────────────────── */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
          Position indicative · BAT confirmé avant production
        </div>
      </div>

      {/* ── Sélecteur d'effet lisibilité ─────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
          Lisibilité du logo
        </p>
        <div className="grid grid-cols-3 gap-2">
          {EFFECT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => { setLogoEffect(value); onLogoEffectChange?.(value); }}
              className={`rounded-xl border py-2.5 text-xs font-semibold transition-all
                ${logoEffect === value
                  ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] shadow-[0_4px_12px_rgba(177,63,116,0.12)]"
                  : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
