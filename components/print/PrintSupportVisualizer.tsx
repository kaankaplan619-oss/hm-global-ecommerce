"use client";

/**
 * PrintSupportVisualizer.tsx
 *
 * Visualiseur générique d'un support print (flyer, affiche, toile, invitation…).
 * Généralise BusinessCardVisualizer à n'importe quel format (widthMm × heightMm).
 * Composant CSS pur — aucune dépendance Fabric.js, aucun canvas.
 *
 * Zones :
 *   - Fond perdu (bleed)   : +bleedMm de chaque côté
 *   - Format fini (cut)    : widthMm × heightMm
 *   - Zone sécurité (safe) : -bleedMm intérieur
 *
 * Le visuel client (PNG/JPG) se plaque dans la zone format fini ; un PDF
 * affiche un fallback "PDF chargé ✓" (un <img> ne rend pas les PDF).
 */

import { useState } from "react";
import type { PrintOrientation } from "@/data/print-products";
import PdfPagePreview from "@/components/print/PdfPagePreview";

function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return /\.pdf($|\?|&)/.test(lower) || lower.endsWith(".pdf");
}

interface Props {
  /** Côté long et court du format FINI (mm), tels que définis au catalogue. */
  widthMm:       number;
  heightMm:      number;
  /** Libellé affiché sous le support (ex. "A4 · 21 × 29,7 cm"). */
  sizeLabel:     string;
  orientation:   PrintOrientation;
  frontFileUrl:  string | null;
  backFileUrl:   string | null;
  /** Fond perdu en mm (défaut 3). */
  bleedMm?:      number;
  /** Affiche le toggle recto/verso. */
  showToggle?:   boolean;
  /** Largeur d'affichage du format fini, en px. */
  displayWidth?: number;
  className?:    string;
}

export default function PrintSupportVisualizer({
  widthMm,
  heightMm,
  sizeLabel,
  orientation,
  frontFileUrl,
  backFileUrl,
  bleedMm      = 3,
  showToggle   = true,
  displayWidth = 300,
  className    = "",
}: Props) {
  const [face, setFace] = useState<"front" | "back">("front");

  // Dimensions du format en fonction de l'orientation choisie.
  const isLandscape = orientation === "landscape";
  const longSide  = Math.max(widthMm, heightMm);
  const shortSide = Math.min(widthMm, heightMm);
  const wMm = isLandscape ? longSide : shortSide;
  const hMm = isLandscape ? shortSide : longSide;

  const ratio = wMm / hMm;
  const displayHeight = Math.round(displayWidth / ratio);

  // Fond perdu en px, proportionnel à la largeur affichée.
  const bleedPx = Math.max(6, Math.round(displayWidth * (bleedMm / wMm)));
  const safePx  = bleedPx;

  // Face courante : fichier verso dédié si fourni, sinon page 2 d'un PDF unique.
  let currentFile: string | null;
  let currentPage = 1;
  if (face === "front") {
    currentFile = frontFileUrl;
  } else if (backFileUrl) {
    currentFile = backFileUrl;
  } else if (frontFileUrl && isPdfUrl(frontFileUrl)) {
    currentFile = frontFileUrl;
    currentPage = 2;
  } else {
    currentFile = null;
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative" style={{ width: displayWidth + bleedPx * 2, height: displayHeight + bleedPx * 2 }}>

        {/* Fond perdu */}
        <div
          className="absolute inset-0 rounded-sm"
          style={{ border: "1.5px dashed rgba(239,68,68,0.7)", pointerEvents: "none" }}
        />
        <span className="absolute text-[8px] font-semibold text-red-400 leading-none" style={{ top: 2, left: bleedPx }}>
          Fond perdu
        </span>

        {/* Format fini */}
        <div
          className="absolute overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          style={{ top: bleedPx, left: bleedPx, width: displayWidth, height: displayHeight }}
        >
          {currentFile ? (
            isPdfUrl(currentFile) ? (
              <PdfPagePreview url={currentFile} page={currentPage} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentFile} alt={face === "front" ? "Recto" : "Verso"} className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#f9f8fb]">
              <div className="h-px w-1/3 bg-[rgba(177,63,116,0.2)]" />
              <p className="px-2 text-center text-[10px] leading-relaxed text-[var(--hm-text-muted)]">
                {face === "front" ? "Déposez votre visuel" : "Déposez le verso"}
              </p>
              <div className="h-px w-1/3 bg-[rgba(177,63,116,0.2)]" />
            </div>
          )}

          {/* Zone sécurité */}
          <div
            className="absolute rounded-sm pointer-events-none"
            style={{ top: safePx, left: safePx, right: safePx, bottom: safePx, border: "1px dashed rgba(34,197,94,0.6)" }}
          />
        </div>

        {/* Légende format fini */}
        <span className="absolute text-[8px] font-semibold text-[var(--hm-text-muted)] leading-none" style={{ bottom: bleedPx - 12, left: bleedPx }}>
          {sizeLabel}
        </span>
        <span className="absolute text-[8px] text-green-500 font-semibold leading-none" style={{ bottom: bleedPx + safePx + 2, right: bleedPx + safePx }}>
          Zone sécurité
        </span>
      </div>

      {/* Légende zones */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-semibold text-[var(--hm-text-muted)]">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 border border-dashed border-red-400" /> Fond perdu</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 border border-[var(--hm-text-muted)]" /> Format fini</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 border border-dashed border-green-400" /> Sécurité</span>
      </div>

      {/* Toggle recto/verso */}
      {showToggle && backFileUrl && (
        <div className="flex gap-2">
          <button type="button" onClick={() => setFace("front")} className={`rounded-xl border px-4 py-1.5 text-[11px] font-bold transition ${face === "front" ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white" : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"}`}>Recto</button>
          <button type="button" onClick={() => setFace("back")} className={`rounded-xl border px-4 py-1.5 text-[11px] font-bold transition ${face === "back" ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white" : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"}`}>Verso</button>
        </div>
      )}
    </div>
  );
}
