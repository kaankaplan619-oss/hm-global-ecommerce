"use client";

/**
 * PrintMockupPreview.tsx — Aperçu single-scène avec overlay client.
 *
 * Affiche UNE scène de mockup print (carte, flyer, poster…) et, si le client
 * a uploadé son design (recto ou verso au format PDF/image), plaque ce design
 * sur la `printArea` du mockup via position absolute + transform.
 *
 * Le résultat : le client voit son design RÉEL sur le support imprimé
 * (papier 350g, scène lifestyle, ombre naturelle), pas un design de démo
 * "Pastel" / "Free mockup" générique du fournisseur mockup.
 *
 * Sources de coordonnées (data/printMockupTemplates.ts) :
 *   sceneImage  = "/mockups/print/business-card/business-card-stack-01.webp"
 *   printArea   = { x: 320, y: 280, width: 560, height: 340, rotate: -2 }
 *
 * Les `printArea` sont exprimées dans les pixels de l'image scène d'origine.
 * Comme l'image est rendue responsive (width: 100% du parent), on convertit
 * ces coords absolues en pourcentages relatifs au container — le ratio est
 * stable peu importe la taille d'affichage.
 *
 * V1 : design client = simple <img> overlay. Pour les designs PDF natifs,
 * un Canvas/pdf.js renderer pourra venir en V1.2 (pour l'instant, l'admin
 * fournit l'URL d'un PNG/JPG preview à côté du PDF source).
 *
 * V2 envisagé : ajout de `perspective` (8 floats matrice) pour les mockups
 * avec angle (citylight oblique, brochure plié) — lib MIT `perspective-transform`.
 */

import React, { useEffect, useRef, useState } from "react";

export interface PrintMockupSceneArea {
  /** Pixels dans l'image scène d'origine. Référence : 1200×900 pour cartes,
   *  1400×1050 pour flyers/posters. Voir data/printMockupTemplates.ts. */
  x:      number;
  y:      number;
  width:  number;
  height: number;
  /** Rotation en degrés (- pour anti-horaire). Optionnel, 0 par défaut. */
  rotate?: number;
  /** V2 — 4 coins exacts (px scène, ordre TL/TR/BR/BL). Si présent, le design
   *  est projeté en perspective (matrix3d) et x/y/width/height sont ignorés.
   *  Indispensable quand les bords du support ne sont pas parallèles
   *  (carte tenue en main, citylight oblique…). */
  corners?: { x: number; y: number }[];
}

/** Homographie carré unité → quadrilatère (mapping projectif classique). */
function quadMatrix3d(
  corners: { x: number; y: number }[],
  scale: number,
  w0: number,
  h0: number,
): string {
  const [p0, p1, p2, p3] = corners.map((p) => ({ x: p.x * scale, y: p.y * scale }));
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dy1 = p1.y - p2.y, dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x, sy = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - sy * dx2) / den;
  const h = (sy * dx1 - sx * dy1) / den;
  const a = p1.x - p0.x + g * p1.x, b = p3.x - p0.x + h * p3.x, c = p0.x;
  const d = p1.y - p0.y + g * p1.y, e = p3.y - p0.y + h * p3.y, f = p0.y;
  // x' = (a·u + b·v + c) / (g·u + h·v + 1), u = x/w0, v = y/h0
  // CSS matrix3d est column-major.
  const m = [
    a / w0, d / w0, 0, g / w0,
    b / h0, e / h0, 0, h / h0,
    0, 0, 1, 0,
    c, f, 0, 1,
  ];
  return `matrix3d(${m.map((v) => v.toFixed(6)).join(",")})`;
}

export interface PrintMockupPreviewProps {
  /** Chemin /public du mockup scène (WebP optimisé). */
  sceneImage: string;
  /** Dimensions natives de l'image scène en px — sert au calcul des
   *  pourcentages. Pour nos cartes : 1200×900. */
  sceneWidth:  number;
  sceneHeight: number;
  /** Zone d'impression sur la scène (coords en px image originale). */
  printArea: PrintMockupSceneArea;
  /** URL du design client uploadé (PNG/JPG/preview PDF). Si null, l'overlay
   *  n'est pas rendu et le mockup brut s'affiche tel quel. */
  clientDesignUrl?: string | null;
  /** V1.2 (2026-05-27) — Si true, plaque un RECTANGLE BLANC sur la printArea
   *  AVANT le design client. Sert à masquer le démo "Pastel" du mockup
   *  Mockups Design quand le design client ne remplit pas tout le cadre
   *  (logo centré avec marges, PDF transparent…). Recommandé en mode B2B
   *  Pixartprinting pour ne jamais laisser apparaître de design tiers. */
  whiteCardOverlay?: boolean;
  /** Patch d'occlusion (doigts/objets devant le support) rendu AU-DESSUS du
   *  design client. PNG alpha extrait de la scène, coords px scène. */
  occlusionPatch?: { src: string; x: number; y: number; width: number; height: number } | null;
  /** Texte alt pour l'image scène (accessibilité). */
  alt: string;
  /** Classe Tailwind additionnelle pour le wrapper. */
  className?: string;
}

export default function PrintMockupPreview({
  sceneImage,
  sceneWidth,
  sceneHeight,
  printArea,
  clientDesignUrl,
  whiteCardOverlay = false,
  occlusionPatch = null,
  alt,
  className = "",
}: PrintMockupPreviewProps) {
  // Conversion px image → % container (responsive-safe : ratio stable)
  const leftPct   = (printArea.x      / sceneWidth)  * 100;
  const topPct    = (printArea.y      / sceneHeight) * 100;
  const widthPct  = (printArea.width  / sceneWidth)  * 100;
  const heightPct = (printArea.height / sceneHeight) * 100;
  const rotate    = printArea.rotate ?? 0;

  // Mode perspective (corners) : matrix3d dépend de la taille px réelle du
  // container → on la mesure (ResizeObserver) et on recalcule au resize.
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !printArea.corners) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, [printArea.corners]);

  const QUAD_BASE = 100; // taille px du div source avant projection
  const perspectiveStyle: React.CSSProperties | null =
    printArea.corners && containerW > 0
      ? {
          left: 0,
          top: 0,
          width: QUAD_BASE,
          height: QUAD_BASE,
          transform: quadMatrix3d(printArea.corners, containerW / sceneWidth, QUAD_BASE, QUAD_BASE),
          transformOrigin: "0 0",
        }
      : null;

  const flatStyle: React.CSSProperties = {
    left:            `${leftPct}%`,
    top:             `${topPct}%`,
    width:           `${widthPct}%`,
    height:          `${heightPct}%`,
    transform:       `rotate(${rotate}deg)`,
    transformOrigin: "center center",
  };

  const overlayStyle = perspectiveStyle ?? flatStyle;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl ${className}`}
      // aspect-ratio préserve les proportions de la scène d'origine
      style={{ aspectRatio: `${sceneWidth} / ${sceneHeight}` }}
    >
      {/* Couche 1 — scène de mockup (papier, ombre, perspective réelle) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sceneImage}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />

      {/* V1.2 (2026-05-27) — Couche 1.5 : carte blanche pleine sur la printArea.
         Activée quand whiteCardOverlay=true. Sert à MASQUER COMPLÈTEMENT le
         design de démo "Pastel" du mockup Mockups Design avant que le design
         client soit overlayé. Garantit qu'aucune marque tierce ne reste
         visible, même si le design client a des marges blanches/transparentes.
         Placé EN DESSOUS du design client mais AU-DESSUS de la scène mockup. */}
      {whiteCardOverlay && (
        <div
          className="absolute bg-white"
          style={{ ...overlayStyle, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
          aria-hidden="true"
        />
      )}

      {/* Couche 2 — design client overlay (visible UNIQUEMENT si uploadé).
         Masque le design de démo "Pastel" du mockup d'origine. Position
         absolute + transform-origin center pour gérer la rotation. */}
      {clientDesignUrl && (
        <div
          className="absolute"
          style={{
            ...overlayStyle,
            // Léger box-shadow pour donner l'illusion que le design est
            // imprimé sur le papier (et pas un sticker collé par-dessus).
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={clientDesignUrl}
            alt="Aperçu du design client"
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {/* Couche 2.5 — patch d'occlusion : les doigts/objets repassent DEVANT
         le design client (détourés par chroma-key dans un PNG alpha). */}
      {occlusionPatch && (clientDesignUrl || whiteCardOverlay) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={occlusionPatch.src}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left:   `${(occlusionPatch.x / sceneWidth) * 100}%`,
            top:    `${(occlusionPatch.y / sceneHeight) * 100}%`,
            width:  `${(occlusionPatch.width / sceneWidth) * 100}%`,
            height: `${(occlusionPatch.height / sceneHeight) * 100}%`,
          }}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Couche 3 — mention "Aperçu indicatif" si design client présent.
         Cohérent avec MockupViewer textile (DA HM Global). */}
      {clientDesignUrl && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)] shadow-sm backdrop-blur-sm">
          Aperçu indicatif · BAT validé avant production
        </div>
      )}
    </div>
  );
}
