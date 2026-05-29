"use client";

/**
 * PrintMockupViewer.tsx — Switcher multi-scènes pour aperçu print.
 *
 * Affiche une famille de mockups (ex: 3 scènes cartes de visite) avec :
 *   - Une scène principale plein écran (PrintMockupPreview)
 *   - Une barre de miniatures cliquables sous l'image
 *   - Switch entre scenes avec preview du design client overlay
 *   - Bascule recto / verso si le client a uploadé les 2 faces
 *
 * Dépend uniquement de PRINT_MOCKUP_TEMPLATES (data/printMockupTemplates.ts)
 * pour la liste des scènes par famille — pas de hardcode des paths ici.
 *
 * Usage typique côté fiche produit cartes de visite :
 *
 *   <PrintMockupViewer
 *     family="business-cards"
 *     frontDesignUrl={frontFile?.url ?? null}
 *     backDesignUrl={backFile?.url ?? null}
 *   />
 *
 * Tant que le client n'a rien uploadé → mockups bruts (avec branding démo
 * "Pastel" toujours visible). Dès qu'un PDF est uploadé → overlay live
 * masque le design de démo et montre le rendu réel sur le papier.
 */

import React, { useMemo, useState } from "react";
import { Repeat } from "lucide-react";
import PrintMockupPreview from "./PrintMockupPreview";
import {
  getMockupsByFamily,
  type PrintMockupFamily,
  type PrintMockupTemplate,
} from "@/data/printMockupTemplates";

// Dimensions natives par famille (cohérentes avec les WebP exportés)
// Cf script de conversion sharp dans la session 2026-05-27.
const SCENE_DIMENSIONS: Record<PrintMockupFamily, { width: number; height: number }> = {
  "business-cards": { width: 1200, height: 900 },
  flyer:            { width: 1400, height: 1050 },
  poster:           { width: 1400, height: 1050 },
  canvas:           { width: 1400, height: 1050 },
  brochure:         { width: 1400, height: 1050 },
  rollup:           { width: 1200, height: 1875 },
  sticker:          { width: 1400, height: 1050 },
  mug:              { width: 1400, height: 1050 },
};

export interface PrintMockupViewerProps {
  family: PrintMockupFamily;
  /** URL Supabase Storage du design recto uploadé. Null = pas d'overlay. */
  frontDesignUrl?: string | null;
  /** URL Supabase Storage du design verso. Null si le client n'a pas uploadé
   *  de verso, OU si la famille n'a pas de verso (canvas, sticker, mug…). */
  backDesignUrl?: string | null;
  /** V1.2 — Si true, plaque une carte blanche sur la printArea avant le
   *  design client (masque le démo "Pastel" du mockup Mockups Design). */
  whiteCardOverlay?: boolean;
  /** Texte alt de base pour les images scène. */
  alt?: string;
}

export default function PrintMockupViewer({
  family,
  frontDesignUrl,
  backDesignUrl,
  whiteCardOverlay = false,
  alt = "Aperçu mockup",
}: PrintMockupViewerProps) {
  const scenes: PrintMockupTemplate[] = useMemo(
    () => getMockupsByFamily(family),
    [family],
  );

  const [activeIdx,  setActiveIdx]  = useState(0);
  const [showingBack, setShowingBack] = useState(false);

  const dims = SCENE_DIMENSIONS[family];
  const activeScene = scenes[activeIdx];
  // Détermine quel design client overlay selon la face affichée
  const overlayUrl = showingBack ? backDesignUrl : frontDesignUrl;
  const canSwitchFace = Boolean(frontDesignUrl && backDesignUrl);

  // Garde-fou si la famille n'a pas de mockups dispo (V2 ou config manquante)
  if (!activeScene || scenes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] text-xs text-[var(--hm-text-muted)]">
        Aucun aperçu disponible pour cette famille
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Scène principale ──────────────────────────────────────────────── */}
      <PrintMockupPreview
        sceneImage={activeScene.sceneImage}
        sceneWidth={dims.width}
        sceneHeight={dims.height}
        printArea={activeScene.printArea}
        clientDesignUrl={overlayUrl}
        whiteCardOverlay={whiteCardOverlay}
        alt={`${alt} — ${activeScene.recommendedUse}`}
      />

      {/* ── Barre de switch face/dos (si 2 designs) + miniatures ───────────── */}
      <div className="flex items-center gap-2">
        {/* Toggle Face / Dos — visible UNIQUEMENT si client a uploadé les 2.
            Sinon on garde l'écran propre. */}
        {canSwitchFace && (
          <button
            type="button"
            onClick={() => setShowingBack((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
            title="Basculer entre le recto et le verso"
          >
            <Repeat size={11} />
            {showingBack ? "Voir le recto" : "Voir le verso"}
          </button>
        )}

        {/* Miniatures des scènes (si > 1 scène dispo) */}
        {scenes.length > 1 && (
          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                  i === activeIdx
                    ? "border-[var(--hm-primary)] shadow-sm"
                    : "border-[var(--hm-line)] opacity-70 hover:opacity-100"
                }`}
                title={s.recommendedUse}
                aria-label={`Voir scène ${i + 1} : ${s.recommendedUse}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.sceneImage}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Mention info quand pas de design uploadé ──────────────────────── */}
      {!overlayUrl && (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          Déposez votre fichier {family === "business-cards" ? "PDF/PNG" : "PDF"} ci-dessous pour voir votre design en situation.
        </p>
      )}
    </div>
  );
}
