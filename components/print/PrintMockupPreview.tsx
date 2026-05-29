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

import React from "react";

export interface PrintMockupSceneArea {
  /** Pixels dans l'image scène d'origine. Référence : 1200×900 pour cartes,
   *  1400×1050 pour flyers/posters. Voir data/printMockupTemplates.ts. */
  x:      number;
  y:      number;
  width:  number;
  height: number;
  /** Rotation en degrés (- pour anti-horaire). Optionnel, 0 par défaut. */
  rotate?: number;
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
  alt,
  className = "",
}: PrintMockupPreviewProps) {
  // Conversion px image → % container (responsive-safe : ratio stable)
  const leftPct   = (printArea.x      / sceneWidth)  * 100;
  const topPct    = (printArea.y      / sceneHeight) * 100;
  const widthPct  = (printArea.width  / sceneWidth)  * 100;
  const heightPct = (printArea.height / sceneHeight) * 100;
  const rotate    = printArea.rotate ?? 0;

  return (
    <div
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
          style={{
            left:            `${leftPct}%`,
            top:             `${topPct}%`,
            width:           `${widthPct}%`,
            height:          `${heightPct}%`,
            transform:       `rotate(${rotate}deg)`,
            transformOrigin: "center center",
            boxShadow:       "0 2px 8px rgba(0,0,0,0.08)",
          }}
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
            left:            `${leftPct}%`,
            top:             `${topPct}%`,
            width:           `${widthPct}%`,
            height:          `${heightPct}%`,
            transform:       `rotate(${rotate}deg)`,
            transformOrigin: "center center",
            // Léger box-shadow pour donner l'illusion que le design est
            // imprimé sur le papier (et pas un sticker collé par-dessus).
            boxShadow:       "0 2px 8px rgba(0,0,0,0.08)",
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
