"use client";

/**
 * BusinessCardVisualizer.tsx
 *
 * Visualiseur recto/verso pour cartes de visite 85×55 mm.
 * Composant CSS pur — aucune dépendance Fabric.js, aucun canvas.
 * Ne pas modifier MockupViewer.tsx.
 *
 * Zones affichées :
 *   - Zone fond perdu  (bleed)    : +3 mm de chaque côté → 91×61 mm
 *   - Zone format fini (cut line) : 85×55 mm — contour continu
 *   - Zone de sécurité (safe)     : -3 mm intérieur → 79×49 mm
 *
 * Ratio : aspect-ratio = 85/55 (paysage) ou 55/85 (portrait).
 */

import { useState } from "react";
import type { PrintOrientation } from "@/data/print-products";
import PdfPagePreview from "@/components/print/PdfPagePreview";

// ─── Helper : détection PDF depuis l'URL ──────────────────────────────────────
// L'URL Supabase contient l'extension d'origine : .../timestamp-front-monlogo.pdf
// <img> ne peut pas rendre les PDF dans Chrome/Firefox → fallback nécessaire.
function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  // Cherche .pdf avant un éventuel ?token=... ou &... de query string
  return /\.pdf($|\?|&)/.test(lower) || lower.endsWith(".pdf");
}

interface Props {
  orientation:    PrintOrientation;
  frontFileUrl:   string | null;
  backFileUrl:    string | null;
  /** Si true, affiche le toggle face/dos */
  showToggle?:    boolean;
  /** Taille d'affichage en px — width de la carte (hauteur déduite du ratio) */
  displayWidth?:  number;
  className?:     string;
}

export default function BusinessCardVisualizer({
  orientation,
  frontFileUrl,
  backFileUrl,
  showToggle    = true,
  displayWidth  = 340,
  className     = "",
}: Props) {
  const [face, setFace] = useState<"front" | "back">("front");

  const isLandscape = orientation === "landscape";

  // Ratio physique de la carte (85×55 mm)
  // Paysage : width/height = 85/55 ≈ 1.545
  // Portrait : width/height = 55/85 ≈ 0.647
  const ratio = isLandscape ? 85 / 55 : 55 / 85;
  const displayHeight = Math.round(displayWidth / ratio);

  // Bleed = 3 mm → en pixels, 3/85 de la largeur (paysage) ou 3/55 (portrait)
  const bleedPx = isLandscape
    ? Math.round(displayWidth * (3 / 85))
    : Math.round(displayWidth * (3 / 55));

  // Safe zone = 3 mm intérieur
  const safePx = bleedPx;

  // Fichier + page à afficher pour la face courante.
  // Verso : fichier verso dédié si fourni, sinon page 2 d'un PDF recto-verso unique.
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
      {/* ── Carte avec zones ──────────────────────────────────────────────── */}
      <div className="relative" style={{ width: displayWidth + bleedPx * 2, height: displayHeight + bleedPx * 2 }}>

        {/* Zone fond perdu — tirets rouges */}
        <div
          className="absolute inset-0 rounded-sm"
          style={{
            border: "1.5px dashed rgba(239,68,68,0.7)",
            pointerEvents: "none",
          }}
        />

        {/* Légende fond perdu */}
        <span
          className="absolute text-[8px] font-semibold text-red-400 leading-none"
          style={{ top: 2, left: bleedPx }}
        >
          Fond perdu
        </span>

        {/* Zone format fini — contour continu */}
        <div
          className="absolute overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          style={{
            top:    bleedPx,
            left:   bleedPx,
            width:  displayWidth,
            height: displayHeight,
          }}
        >
          {/* Fichier client */}
          {currentFile ? (
            isPdfUrl(currentFile) ? (
              /* ── PDF : rendu réel de la page via pdf.js (le client voit son visuel) ── */
              <PdfPagePreview url={currentFile} page={currentPage} />
            ) : (
              /* ── Image PNG / JPG : rendu direct ── */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentFile}
                alt={face === "front" ? "Recto" : "Verso"}
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#f9f8fb]">
              <div className="h-px w-1/3 bg-[rgba(177,63,116,0.2)]" />
              <p className="text-center text-[10px] leading-relaxed text-[var(--hm-text-muted)]">
                {face === "front"
                  ? "Déposez votre fichier recto"
                  : "Déposez votre fichier verso"}
              </p>
              <div className="h-px w-1/3 bg-[rgba(177,63,116,0.2)]" />
            </div>
          )}

          {/* Zone de sécurité — tirets verts intérieurs */}
          <div
            className="absolute rounded-sm pointer-events-none"
            style={{
              top:    safePx,
              left:   safePx,
              right:  safePx,
              bottom: safePx,
              border: "1px dashed rgba(34,197,94,0.6)",
            }}
          />
        </div>

        {/* Légende format fini */}
        <span
          className="absolute text-[8px] font-semibold text-[var(--hm-text-muted)] leading-none"
          style={{ bottom: bleedPx - 12, left: bleedPx }}
        >
          85×55 mm
        </span>

        {/* Légende zone de sécurité */}
        <span
          className="absolute text-[8px] text-green-500 font-semibold leading-none"
          style={{ bottom: bleedPx + safePx + 2, right: bleedPx + safePx }}
        >
          Zone sécurité
        </span>
      </div>

      {/* ── Légende zones ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 text-[9px] font-semibold text-[var(--hm-text-muted)]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 border border-dashed border-red-400" />
          Fond perdu (+3 mm)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 border border-[var(--hm-text-muted)]" />
          Format fini
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 border border-dashed border-green-400" />
          Zone sécurité
        </span>
      </div>

      {/* ── Toggle face/dos ───────────────────────────────────────────────── */}
      {showToggle && backFileUrl && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFace("front")}
            className={`rounded-xl border px-4 py-1.5 text-[11px] font-bold transition ${
              face === "front"
                ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
            }`}
          >
            Recto
          </button>
          <button
            type="button"
            onClick={() => setFace("back")}
            className={`rounded-xl border px-4 py-1.5 text-[11px] font-bold transition ${
              face === "back"
                ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
            }`}
          >
            Verso
          </button>
        </div>
      )}
    </div>
  );
}
