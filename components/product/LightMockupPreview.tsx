"use client";

/**
 * LightMockupPreview — aperçu CSS overlay pour produits sans MockupViewer Fabric.
 *
 * Affiche le logo uploadé (et, en mode atelier goodies, un texte à graver) en
 * surimpression sur la photo produit, dans la zone de marquage. Conçu pour
 * hoodies, softshells, polos, polaires… ET les goodies (mug) via `zoneOverride`
 * + `enableText`. Aucune dépendance externe — pur CSS + React (ne touche pas au
 * MockupViewer Fabric calibré du textile).
 */

import { useEffect, useState } from "react";
import type { Placement, ProductCategory } from "@/types";
import { isColorDark, EFFECT_OPTIONS } from "@/lib/color-utils";
import type { LogoEffect } from "@/lib/color-utils";
import { getZoneRect } from "@/lib/textile-zones";

// Rectangle [left, top, width, height] → CSS top/left/width/height en %.
function zoneStyle(
  category: ProductCategory | undefined,
  placement: "coeur" | "dos",
  override?: [number, number, number, number] | null,
): React.CSSProperties {
  const [l, t, w, h] = override && placement === "coeur" ? override : getZoneRect(category, placement);
  return { position: "absolute", left: `${l * 100}%`, top: `${t * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` };
}

const WHITE_OUTLINE_FILTER =
  "drop-shadow(0 0 3px rgba(255,255,255,0.95)) drop-shadow(0 0 5px rgba(255,255,255,0.85)) drop-shadow(0 0 8px rgba(255,255,255,0.7))";
const NORMAL_FILTER = "drop-shadow(0 1px 2px rgba(0,0,0,0.14)) drop-shadow(0 0px 1px rgba(0,0,0,0.06))";

// Couleurs de texte proposées en mode atelier (mug foncé → blanc/doré par défaut).
const TEXT_COLORS = [
  { value: "#ffffff", label: "Blanc" },
  { value: "#e8c14a", label: "Doré" },
  { value: "#111111", label: "Noir" },
];

interface Props {
  imageUrl:    string;
  logoFile:    File | null;
  placement:   Placement;
  colorId:     string;
  productName: string;
  category?:   ProductCategory;
  onLogoEffectChange?: (effect: LogoEffect) => void;
  /** Zone de marquage explicite (goodies : le logo se pose sur l'objet, pas "poitrine"). */
  zoneOverride?: [number, number, number, number] | null;
  /** Mode atelier : affiche un champ « texte à graver » + rend le composant même sans logo. */
  enableText?:  boolean;
  /** Remonte le texte saisi vers le parent (pour le panier / BAT). */
  onTextChange?: (text: string) => void;
}

export default function LightMockupPreview({
  imageUrl,
  logoFile,
  placement,
  colorId,
  productName,
  category,
  onLogoEffectChange,
  zoneOverride,
  enableText = false,
  onTextChange,
}: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoEffect, setLogoEffect] = useState<LogoEffect>(() => (isColorDark(colorId) ? "white-outline" : "none"));
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState(() => (isColorDark(colorId) ? "#ffffff" : "#111111"));

  useEffect(() => {
    const next = isColorDark(colorId) ? "white-outline" : "none";
    setLogoEffect(next);
    onLogoEffectChange?.(next);
    setTextColor(isColorDark(colorId) ? "#ffffff" : "#111111");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorId]);

  useEffect(() => {
    if (!logoFile) { setLogoUrl(null); return; }
    const url = URL.createObjectURL(logoFile);
    setLogoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  // En mode atelier (goodies), on rend même sans logo (pour saisir un texte).
  if (!imageUrl) return null;
  if (!logoFile && !enableText) return null;

  const showCoeur = placement === "coeur" || placement === "coeur-dos";
  const showDos   = placement === "dos"   || placement === "coeur-dos";
  const coeurStyle = zoneStyle(category, "coeur", zoneOverride);
  const dosStyle   = zoneStyle(category, "dos");

  const logoImgStyle: React.CSSProperties =
    logoEffect === "white-outline"
      ? { filter: WHITE_OUTLINE_FILTER }
      : logoEffect === "white-bg"
        ? { backgroundColor: "white", borderRadius: "4px", padding: "6px", boxSizing: "border-box" }
        : { filter: NORMAL_FILTER };

  const hasContent = !!logoUrl || !!text;

  // Contenu d'une zone (logo empilé sur le texte), centré.
  const ZoneContent = () => (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-[4%] p-[6%]">
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="Votre logo" className="max-h-full w-full object-contain" style={{ ...logoImgStyle, maxHeight: text ? "62%" : "100%" }} />
      )}
      {text && (
        <span
          className="block max-w-full text-center font-bold leading-tight"
          style={{
            color: textColor,
            fontFamily: "var(--font-bricolage), sans-serif",
            fontSize: "clamp(10px, 7cqw, 30px)",
            textShadow: textColor === "#ffffff" ? "0 1px 3px rgba(0,0,0,0.35)" : "none",
            overflowWrap: "anywhere",
          }}
        >
          {text}
        </span>
      )}
      {enableText && !hasContent && (
        <span className="text-center text-[10px] font-semibold text-[var(--hm-primary)]/70" style={{ fontSize: "clamp(8px, 3.5cqw, 12px)" }}>
          Glissez un logo<br />ou tapez un texte
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-[28px] border border-[var(--hm-line)] bg-white shadow-[0_20px_48px_rgba(63,45,88,0.08)]"
        style={{ containerType: "inline-size" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={productName} className="block w-full object-contain" />

        {showCoeur && (
          <div style={coeurStyle}>
            <div className="absolute inset-0 rounded" style={{ border: "1.5px dashed rgba(177,63,116,0.38)", background: "rgba(177,63,116,0.04)", pointerEvents: "none" }} />
            <ZoneContent />
          </div>
        )}

        {showDos && (
          <div style={dosStyle}>
            <div className="absolute inset-0 rounded" style={{ border: "1.5px dashed rgba(177,63,116,0.38)", background: "rgba(177,63,116,0.04)", pointerEvents: "none" }} />
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Votre logo — zone dos" className="relative z-10 block w-full object-contain" style={logoImgStyle} />
            )}
          </div>
        )}

        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
          Aperçu indicatif · BAT confirmé avant production
        </div>
      </div>

      {/* ── Atelier goodies : texte à graver ─────────────────────────────── */}
      {enableText && (
        <div className="flex flex-col gap-2 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-3">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
            Texte à graver (optionnel)
          </label>
          <input
            type="text"
            value={text}
            maxLength={40}
            onChange={(e) => { setText(e.target.value); onTextChange?.(e.target.value); }}
            placeholder="Ex. Votre slogan, prénom, date…"
            className="w-full rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2.5 text-sm text-[var(--hm-text)] outline-none transition focus:border-[var(--hm-primary)]"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Couleur</span>
            {TEXT_COLORS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-label={label}
                onClick={() => setTextColor(value)}
                className={`h-6 w-6 rounded-full border-2 transition ${textColor === value ? "border-[var(--hm-primary)] scale-110" : "border-[var(--hm-line)]"}`}
                style={{ background: value }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Lisibilité du logo (uniquement si un logo est présent) ────────── */}
      {logoUrl && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Lisibilité du logo</p>
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
      )}
    </div>
  );
}
