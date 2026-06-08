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
  /** Un verso existe (fichier verso séparé OU page 2 d'un PDF recto-verso). */
  hasBack?:       boolean;
  /** Force une face (recto/verso) et masque le toggle — pour afficher
   *  recto ET verso côte à côte. */
  forceFace?:     "front" | "back";
  /** Taille d'affichage en px — width de la carte (hauteur déduite du ratio) */
  displayWidth?:  number;
  /** Coins arrondis (option "coins arrondis") → affiche le rayon dans l'aperçu. */
  rounded?:       boolean;
  /** Finition → reflet visuel (mat = aucun, brillant = lustré, premium = satiné). */
  finish?:        "mat" | "brillant" | "premium";
  className?:     string;
}

export default function BusinessCardVisualizer({
  orientation,
  frontFileUrl,
  backFileUrl,
  showToggle    = true,
  hasBack       = false,
  forceFace,
  displayWidth  = 340,
  rounded       = false,
  finish        = "mat",
  className     = "",
}: Props) {
  const [internalFace, setFace] = useState<"front" | "back">("front");
  const face = forceFace ?? internalFace;

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
            border: "1.5px dashed rgba(239,68,68,0.55)",
            pointerEvents: "none",
          }}
        />

        {/* Zone format fini — contour continu. Coins arrondis si l'option
           "coins arrondis" est choisie (rayon ~2,5 mm à l'échelle). */}
        <div
          className="absolute overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          style={{
            top:          bleedPx,
            left:         bleedPx,
            width:        displayWidth,
            height:       displayHeight,
            borderRadius: rounded ? Math.round(displayWidth * (2.5 / 85)) : 2,
          }}
        >
          {/* Fichier client — object-contain : la carte entière reste visible
             (pas de rognage des bords / du texte). */}
          {currentFile ? (
            isPdfUrl(currentFile) ? (
              /* ── PDF : rendu réel de la page via pdf.js (le client voit son visuel) ── */
              <PdfPagePreview url={currentFile} page={currentPage} fit="contain" />
            ) : (
              /* ── Image PNG / JPG : rendu direct ── */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentFile}
                alt={face === "front" ? "Recto" : "Verso"}
                className="h-full w-full object-contain"
              />
            )
          ) : face === "front" ? (
            /* ── État vide : carte d'exemple (au lieu d'un placeholder vide) ── */
            <div className="relative flex h-full w-full flex-col justify-between bg-white px-[8%] py-[9%]">
              <span className="absolute right-1.5 top-1.5 rounded bg-[var(--hm-surface)] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[var(--hm-text-muted)]">Exemple</span>
              <div>
                <p className="text-[11px] font-bold leading-tight text-[var(--hm-text)]">Prénom Nom</p>
                <p className="text-[8px] font-semibold text-[var(--hm-primary)]">Fonction · Société</p>
              </div>
              <div className="h-px w-1/2 bg-[var(--hm-line)]" />
              <div className="text-[8px] leading-relaxed text-[var(--hm-text-soft)]">
                <p>contact@exemple.fr</p>
                <p>06 12 34 56 78</p>
                <p>www.exemple.fr</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-white">
              <span className="rounded bg-[var(--hm-surface)] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-[var(--hm-text-muted)]">Exemple verso</span>
              <p className="text-[10px] font-bold text-[var(--hm-text)]">Votre logo</p>
              <p className="text-[8px] text-[var(--hm-text-soft)]">Slogan / accroche</p>
            </div>
          )}

          {/* Reflet de finition : brillant = lustré net, premium = satiné doux.
             Mat = aucun reflet. Donne un aperçu visuel de la finition choisie. */}
          {finish === "brillant" && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(115deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 62%)" }}
            />
          )}
          {finish === "premium" && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(125deg, rgba(255,255,255,0) 44%, rgba(255,255,255,0.22) 52%, rgba(255,255,255,0) 60%)" }}
            />
          )}

          {/* Zone de sécurité — tirets verts intérieurs */}
          <div
            className="absolute rounded-sm pointer-events-none"
            style={{
              top:    safePx,
              left:   safePx,
              right:  safePx,
              bottom: safePx,
              border: "1px dashed rgba(34,197,94,0.5)",
            }}
          />
        </div>
      </div>

      {/* Étiquette finition (visible sous l'aperçu) */}
      {finish !== "mat" && (
        <span className="text-[10px] font-semibold text-[var(--hm-text-soft)]">
          Finition {finish === "brillant" ? "brillante (lustrée)" : "premium (satinée)"}
        </span>
      )}

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
      {showToggle && hasBack && !forceFace && (
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
