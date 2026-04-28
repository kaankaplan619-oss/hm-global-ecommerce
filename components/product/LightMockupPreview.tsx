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

// ── Positions de la zone coeur par catégorie produit ─────────────────────────
// Calibrées sur les packshots TopTex (portrait, fond neutre).
// coeur = poitrine gauche du porteur → droite du viewer (left ≈ 42-43%)
// dos   = haut du dos centré (identique pour toutes les catégories)
const COEUR_BY_CATEGORY: Partial<Record<ProductCategory, React.CSSProperties>> = {
  hoodies:    { position: "absolute", top: "30%", left: "43%", width: "18%" },
  softshells: { position: "absolute", top: "32%", left: "42%", width: "17%" },
  polos:      { position: "absolute", top: "34%", left: "42%", width: "16%" },
  // polaires, casquettes, sacs → fallback générique ci-dessous
};

const COEUR_DEFAULT: React.CSSProperties = {
  position: "absolute",
  top:   "30%",
  left:  "43%",
  width: "18%",
};

const DOS_STYLE: React.CSSProperties = {
  position: "absolute",
  top:  "22%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "28%",
};

// ── CSS filter pour "Contour blanc" ──────────────────────────────────────────
// drop-shadow suit les pixels opaques du PNG → bien meilleur qu'un box-shadow
// pour les logos avec fond transparent.
const WHITE_OUTLINE_FILTER =
  "drop-shadow(0 0 3px rgba(255,255,255,0.95)) " +
  "drop-shadow(0 0 5px rgba(255,255,255,0.85)) " +
  "drop-shadow(0 0 8px rgba(255,255,255,0.7))";

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
}

export default function LightMockupPreview({
  imageUrl,
  logoFile,
  placement,
  colorId,
  productName,
  category,
}: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoEffect, setLogoEffect] = useState<LogoEffect>(() =>
    isColorDark(colorId) ? "white-outline" : "none"
  );

  // Auto-reset de l'effet par défaut quand la couleur change
  useEffect(() => {
    setLogoEffect(isColorDark(colorId) ? "white-outline" : "none");
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

  // Position coeur calibrée selon la catégorie produit
  const coeurStyle: React.CSSProperties =
    (category && COEUR_BY_CATEGORY[category]) ?? COEUR_DEFAULT;

  // Style appliqué à l'<img> du logo selon l'effet choisi
  const logoImgStyle: React.CSSProperties =
    logoEffect === "white-outline"
      ? { filter: WHITE_OUTLINE_FILTER }
      : logoEffect === "white-bg"
        ? { backgroundColor: "white", borderRadius: "4px", padding: "6px", boxSizing: "border-box" }
        : {};

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
                border:     "1.5px dashed rgba(123,79,166,0.65)",
                background: "rgba(123,79,166,0.04)",
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
          <div style={DOS_STYLE}>
            <div
              className="absolute inset-0 rounded"
              style={{
                border:     "1.5px dashed rgba(123,79,166,0.65)",
                background: "rgba(123,79,166,0.04)",
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
              onClick={() => setLogoEffect(value)}
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
