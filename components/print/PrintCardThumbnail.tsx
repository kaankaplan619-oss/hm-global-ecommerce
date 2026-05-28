"use client";

/**
 * PrintCardThumbnail.tsx — Vignette mockup CSS pur pour catalogue print.
 *
 * Remplace les mockups Mockups Design "Pastel / Free flyer mockup /
 * Citylight" qui montraient des designs de démo dans la grille catalogue
 * /impression (un look "site de mockups gratuits" pas premium B2B).
 *
 * Cette vignette ne charge AUCUNE image source. Tout est généré en CSS :
 *   - Carte/flyer/poster blanc papier 350g
 *   - Box-shadow réaliste pour la profondeur
 *   - Transform perspective pour l'angle 3D
 *   - Petit accent rose HM Global discret (line + dot)
 *   - Fond gradient subtil (gris très clair → blanc)
 *
 * Avantages vs mockups Mockups Design :
 *   ✅ Pas de "Pastel", "Free flyer mockup", "mockups-design.com" visibles
 *   ✅ Pas de risque de licence (rien de Mockups Design dans le DOM)
 *   ✅ Look premium B2B cohérent avec la DA HM Global
 *   ✅ Léger (~1 KB vs ~30-250 KB par WebP) — pas d'image network call
 *   ✅ Responsive natif, parfait sur mobile/iPad
 *
 * Note : les fiches produit individuelles (/impression/cartes-de-visite,
 * etc.) gardent les vrais mockups Mockups Design car ils servent au moteur
 * preview overlay (le design client client masque le démo "Pastel"). C'est
 * uniquement la GRILLE catalogue qui bascule sur ce composant CSS.
 */

import React from "react";

export type PrintThumbnailFamily =
  | "business-cards"
  | "flyer"
  | "poster"
  | "canvas"
  | "cards";

interface PrintCardThumbnailProps {
  family: PrintThumbnailFamily;
  /** Format affiché en badge (ex: "85×55 mm", "A4", "30×40 cm"). */
  formatLabel?: string;
  /** Classe Tailwind additionnelle pour le wrapper. */
  className?: string;
}

// ── Dimensions/aspect par famille ────────────────────────────────────────────
// Aspect ratio du papier affiché. Choisi pour ressembler au vrai support.
const FAMILY_CONFIG: Record<PrintThumbnailFamily, {
  /** Aspect ratio (width / height) du paper affiché */
  paperAspect: number;
  /** Direction du papier */
  orientation: "landscape" | "portrait";
  /** Rotation 3D en degrés pour donner l'angle perspective */
  rotateY: number;
  rotateX: number;
  /** Échelle relative dans le wrapper (entre 0.5 et 0.9) */
  scale: number;
}> = {
  // Carte de visite 85×55 mm horizontal → ratio 1.55
  "business-cards": { paperAspect: 1.55, orientation: "landscape", rotateY: -8,  rotateX: 12, scale: 0.7 },
  // Flyer A4 portrait → ratio 0.707 (1/sqrt(2))
  flyer:            { paperAspect: 0.71, orientation: "portrait",  rotateY: -10, rotateX: 8,  scale: 0.55 },
  // Poster 30×40 portrait → ratio 0.75
  poster:           { paperAspect: 0.75, orientation: "portrait",  rotateY: -8,  rotateX: 6,  scale: 0.6 },
  // Canvas carré → 1.0
  canvas:           { paperAspect: 1.0,  orientation: "landscape", rotateY: -6,  rotateX: 4,  scale: 0.65 },
  // Carte invitation A6 portrait → 0.71
  cards:            { paperAspect: 0.71, orientation: "portrait",  rotateY: -10, rotateX: 8,  scale: 0.55 },
};

export default function PrintCardThumbnail({
  family,
  formatLabel,
  className = "",
}: PrintCardThumbnailProps) {
  const cfg = FAMILY_CONFIG[family];

  // Style du papier — calculé inline pour garder les transformations
  // CSS responsive (les valeurs sont en pourcentages du wrapper).
  const paperStyle: React.CSSProperties = {
    aspectRatio:    String(cfg.paperAspect),
    width:          cfg.orientation === "landscape" ? "70%" : "auto",
    height:         cfg.orientation === "portrait"  ? "70%" : "auto",
    transform:      `perspective(800px) rotateX(${cfg.rotateX}deg) rotateY(${cfg.rotateY}deg) scale(${cfg.scale})`,
    transformOrigin: "center center",
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background gradient subtil — fond catalogue premium */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, #ffffff 0%, #f7f6f4 55%, #ebe9e5 100%)",
        }}
      />

      {/* Léger halo signature HM coin sup-droit (très discret) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 88% 12%, rgba(177,63,116,0.04) 0%, transparent 45%)",
        }}
      />

      {/* Container papier centré */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={paperStyle}
          className="relative rounded-[3px] bg-white"
        >
          {/* Ombre portée réaliste sous le papier — 2 couches pour profondeur */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[3px]"
            style={{
              boxShadow:
                "0 16px 32px rgba(63,45,88,0.18), " +
                "0 6px 14px rgba(63,45,88,0.10), " +
                "0 2px 4px rgba(63,45,88,0.06)",
            }}
          />
          {/* Surface du papier — ring subtil pour démarquer le bord */}
          <div className="absolute inset-0 rounded-[3px] ring-1 ring-black/[0.04]" />

          {/* Accent décoratif HM — discret, juste pour casser le côté trop "vide".
             Une fine ligne en haut + un point rose subtil signature HM Global.
             Pas de gros texte ni logo qui pourrait "passer" pour le rendu final. */}
          {family === "business-cards" || family === "flyer" || family === "cards" ? (
            <div className="absolute left-[14%] right-[14%] top-[18%] flex flex-col gap-[3px]">
              <span className="block h-[1.5px] w-[40%] rounded-full bg-[var(--hm-primary)]/35" />
              <span className="block h-[1px] w-[30%] rounded-full bg-[var(--hm-text-muted)]/30" />
              <span className="block h-[1px] w-[25%] rounded-full bg-[var(--hm-text-muted)]/30" />
            </div>
          ) : (
            // Pour poster + canvas : un seul accent rose central plus discret
            <div className="absolute left-[40%] right-[40%] top-[44%]">
              <span className="block h-[2px] w-full rounded-full bg-[var(--hm-primary)]/30" />
            </div>
          )}
        </div>
      </div>

      {/* Badge format (top-right) */}
      {formatLabel && (
        <span
          className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)] shadow-sm backdrop-blur-sm"
        >
          {formatLabel}
        </span>
      )}
    </div>
  );
}
