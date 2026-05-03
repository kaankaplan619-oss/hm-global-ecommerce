"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Shirt, RotateCcw } from "lucide-react";
import type { Placement } from "@/types";
import { isColorDark, EFFECT_OPTIONS } from "@/lib/color-utils";
import type { LogoEffect } from "@/lib/color-utils";
import type { LogoPlacementTransform } from "@/lib/bat-utils";

// ── Mockup image paths ────────────────────────────────────────────────────────
const MOCKUP_FILES: Record<string, { front: string; back: string }> = {
  blanc:    { front: "/mockups/tshirt/blanc-front.jpg",    back: "/mockups/tshirt/blanc-back.png"    },
  noir:     { front: "/mockups/tshirt/noir-front.jpg",     back: "/mockups/tshirt/noir-back.png"     },
  gris:     { front: "/mockups/tshirt/gris-front.jpg",     back: "/mockups/tshirt/gris-back.png"     },
  marine:   { front: "/mockups/tshirt/marine-front.jpg",   back: "/mockups/tshirt/marine-back.png"   },
  rouge:    { front: "/mockups/tshirt/rouge-front.jpg",    back: "/mockups/tshirt/rouge-back.png"    },
  bleu:     { front: "/mockups/tshirt/bleu-front.jpg",     back: "/mockups/tshirt/bleu-back.png"     },
  vert:     { front: "/mockups/tshirt/vert-front.jpg",     back: "/mockups/tshirt/vert-back.png"     },
  bordeaux: { front: "/mockups/tshirt/bordeaux-front.png", back: "/mockups/tshirt/bordeaux-back.png" },
};

// ── Product color ID → mockup slug ───────────────────────────────────────────
const COLOR_TO_MOCKUP: Record<string, string> = {
  "blanc": "blanc", "blanc-casse": "blanc", "naturel": "blanc", "beige": "blanc",
  "jaune": "blanc", "sable": "blanc", "ecru": "blanc",
  "noir": "noir", "anthracite": "noir", "gris-anthracite": "noir",
  "gris": "gris", "gris-melange": "gris", "gris-acier": "gris", "gris-chine": "gris",
  "marine": "marine", "navy": "marine",
  "rouge": "rouge", "rouge-feu": "rouge", "orange": "rouge",
  "rose": "rouge",
  "bleu-royal": "bleu", "bleu-ciel": "bleu", "bleu": "bleu", "cobalt": "bleu",
  "turquoise": "bleu", "violet": "bleu",
  "vert-bouteille": "vert", "vert-foret": "vert", "vert": "vert", "kaki": "vert",
  "bordeaux": "bordeaux", "bourgogne": "bordeaux",
};

// ── Zones calibrées par catégorie (packshots TopTex) ─────────────────────────
// [left, top, width, height] as fraction of canvas
const ZONES_BY_CATEGORY: Record<string, { coeur: [number,number,number,number]; dos: [number,number,number,number] }> = {
  tshirts:    { coeur: [0.38, 0.28, 0.18, 0.18], dos: [0.25, 0.20, 0.50, 0.45] },
  hoodies:    { coeur: [0.40, 0.32, 0.16, 0.16], dos: [0.25, 0.22, 0.50, 0.42] },
  softshells: { coeur: [0.42, 0.30, 0.15, 0.15], dos: [0.26, 0.22, 0.48, 0.40] },
};
// Fallback pour les mockups statiques B&C Exact 190 (B3.2-A2 validé)
const ZONES_STATIC = {
  coeur: [0.60, 0.25, 0.14, 0.14] as [number,number,number,number],
  dos:   [0.26, 0.13, 0.48, 0.29] as [number,number,number,number],
};

type View = "front" | "back";

export interface MockupViewerProps {
  colorId:                string;
  placement:              Placement;
  logoFile:               File | null;
  /** URL persistante du logo (Supabase). Utilisée quand logoFile est null. */
  logoUrl?:               string | null;
  badge?:                 string;
  onLogoPositionChange?:  (t: LogoPlacementTransform) => void;
  /** Notifie le parent quand l'utilisateur change de vue (Face/Dos) afin de
   *  maintenir placement et vue cohérents dans les deux sens. */
  onPlacementChange?:     (p: Placement) => void;
  /** Packshot TopTex ou mockup HM pour le coloris courant. */
  packshot?:              string | null;
  productCategory?:       string;
}

// Alias interne
type Props = MockupViewerProps;

export default function MockupViewer({ colorId, placement, logoFile, logoUrl, badge, onLogoPositionChange, onPlacementChange, packshot, productCategory }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef     = useRef<any>(null);
  const canvasSizeRef = useRef(0);

  // Keep a stable ref to the latest callback so it never needs to be a dep
  // of the heavy canvas-rebuild effect.
  const onLogoPositionChangeRef = useRef(onLogoPositionChange);
  useEffect(() => {
    onLogoPositionChangeRef.current = onLogoPositionChange;
  });

  const [view,        setView]        = useState<View>("front");
  const [canvasSize,  setCanvasSize]  = useState(0);
  const [fabricReady, setFabricReady] = useState(false);

  // ── Logo effect — smart default based on textile darkness ────────────────
  const [logoEffect, setLogoEffect] = useState<LogoEffect>(() =>
    isColorDark(colorId) ? "white-outline" : "none"
  );

  // Reset to smart default when color changes
  useEffect(() => {
    setLogoEffect(isColorDark(colorId) ? "white-outline" : "none");
  }, [colorId]);

  // ── Active zone for current view/placement ────────────────────────────────
  const getZone = useCallback((): [number, number, number, number] | null => {
    const zones = packshot
      ? (ZONES_BY_CATEGORY[productCategory ?? ""] ?? ZONES_BY_CATEGORY.tshirts)
      : ZONES_STATIC;
    if (placement === "coeur" && view === "front") return zones.coeur;
    if (placement === "dos"   && view === "back")  return zones.dos;
    if (placement === "coeur-dos") return view === "front" ? zones.coeur : zones.dos;
    return null;
  }, [placement, view, packshot, productCategory]);

  // ── Auto-switch view when placement changes ───────────────────────────────
  useEffect(() => {
    if (placement === "dos")   setView("back");
    if (placement === "coeur") setView("front");
  }, [placement]);

  // ── Current mockup image src ──────────────────────────────────────────────
  const slug    = COLOR_TO_MOCKUP[colorId] ?? null;
  const mockups = slug ? MOCKUP_FILES[slug] : null;
  const src = view === "front"
    ? (packshot ?? mockups?.front ?? "/mockups/tshirt/blanc-front.jpg")
    : (productCategory === "tshirts"
        ? (mockups?.back ?? packshot ?? "/mockups/tshirt/blanc-back.png")
        : (packshot ?? "/mockups/tshirt/blanc-back.png"));

  // ── Init Fabric.js canvas (mount only, with ResizeObserver) ──────────────
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let canvas: any;

    const initCanvas = (w: number) => {
      import("fabric").then(({ Canvas }) => {
        if (!canvasRef.current) return;
        canvas = new Canvas(canvasRef.current, {
          width: w,
          height: w,
          selection: false,
          // Pas de fond blanc Fabric.js — le fond CSS du wrapper prend le relais.
          // Évite les blocs blancs parasites sur les PNG dos avec transparence.
          renderOnAddRemove: false,
          allowTouchScrolling: false,
        });
        fabricRef.current = canvas;
        canvasSizeRef.current = w;
        setCanvasSize(w);
        setFabricReady(true);
      });
    };

    const measure = () => {
      const w = Math.floor(containerRef.current!.getBoundingClientRect().width);
      return w > 0 ? w : 480;
    };

    let initialized = false;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (!w) return;
      if (!initialized) {
        initialized = true;
        initCanvas(w);
      } else if (fabricRef.current && Math.abs(w - canvasSizeRef.current) > 4) {
        fabricRef.current.setDimensions({ width: w, height: w });
        canvasSizeRef.current = w;
        setCanvasSize(w);
        fabricRef.current.requestRenderAll();
      }
    });

    ro.observe(containerRef.current);

    const raf = requestAnimationFrame(() => {
      if (!initialized) {
        initialized = true;
        initCanvas(measure());
      }
    });

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      try { canvas?.dispose(); } catch { /* already disposed */ }
      fabricRef.current = null;
      setFabricReady(false);
      setCanvasSize(0);
      canvasSizeRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only

  // ── Rebuild canvas whenever anything changes ──────────────────────────────
  useEffect(() => {
    if (!fabricReady || !fabricRef.current || canvasSize === 0) return;

    const canvas = fabricRef.current;
    const zone   = getZone();

    canvas.off("object:moving");
    canvas.off("object:modified");
    canvas.off("selection:created");
    canvas.off("selection:cleared");
    canvas.clear();

    // Capture logoEffect in closure so it stays stable for this render cycle
    const currentEffect = logoEffect;

    import("fabric").then(({ FabricImage, Rect, Shadow }) => {
      // ── Shirt image ───────────────────────────────────────────────────────
      const shirtEl = new window.Image();
      shirtEl.crossOrigin = "anonymous";
      shirtEl.src = src;

      shirtEl.onload = () => {
        const scale = canvasSize / Math.max(shirtEl.naturalWidth || canvasSize, shirtEl.naturalHeight || canvasSize);
        const shirt = new FabricImage(shirtEl, {
          selectable:  false,
          evented:     false,
          hasBorders:  false,
          hasControls: false,
          scaleX: scale,
          scaleY: scale,
          left: 0,
          top:  0,
          originX: "left",
          originY: "top",
        });
        canvas.add(shirt);

        // ── Zone de marquage ─────────────────────────────────────────────
        // Zone très discrète : guide visuel léger, jamais dominant
        if (zone) {
          const [lf, tf, wf, hf] = zone;
          const rect = new Rect({
            left:            lf * canvasSize,
            top:             tf * canvasSize,
            width:           wf * canvasSize,
            height:          hf * canvasSize,
            fill:            "rgba(177,63,116,0.04)",   // quasi transparent (was 0.07)
            stroke:          "rgba(177,63,116,0.35)",   // trait atténué (was full #b13f74)
            strokeWidth:     1,                          // plus fin (was 1.5)
            strokeDashArray: [4, 5],
            rx: 6, ry: 6,
            selectable:  false,
            evented:     false,
            hasBorders:  false,
            hasControls: false,
          });
          canvas.add(rect);
        }

        // ── Logo image ───────────────────────────────────────────────────
        // Priorité : logoFile (blob local) → logoUrl (Supabase) → rien
        const isBlob  = !!logoFile;
        const logoSrc = logoFile ? URL.createObjectURL(logoFile) : (logoUrl ?? null);

        if (!logoSrc) {
          canvas.requestRenderAll();
          return;
        }

        const logoEl    = new window.Image();
        logoEl.crossOrigin = "anonymous";
        logoEl.src      = logoSrc;

        logoEl.onload = () => {
          const nw = logoEl.naturalWidth  || 200;
          const nh = logoEl.naturalHeight || 200;

          let logoScale: number;
          let logoLeft:  number;
          let logoTop:   number;

          if (zone) {
            const [lf, tf, wf, hf] = zone;
            logoScale = Math.min(
              (wf * canvasSize * 0.80) / nw,  // 80% de la zone (was 70%) — logo plus présent
              (hf * canvasSize * 0.80) / nh,
            );
            // Positionnement top-left explicite (plus fiable que originX="center")
            // Centrage = milieu de zone - moitié de la taille du logo rendu
            logoLeft = (lf + wf / 2) * canvasSize - (logoScale * nw / 2);
            logoTop  = (tf + hf / 2) * canvasSize - (logoScale * nh / 2);
          } else {
            logoScale = Math.min(
              (canvasSize * 0.25) / nw,
              (canvasSize * 0.25) / nh,
            );
            logoLeft = canvasSize / 2 - (logoScale * nw / 2);
            logoTop  = canvasSize / 2 - (logoScale * nh / 2);
          }

          const logo = new FabricImage(logoEl, {
            scaleX:             logoScale,
            scaleY:             logoScale,
            left:               logoLeft,
            top:                logoTop,
            originX:            "left",   // position top-left explicite (plus fiable)
            originY:            "top",
            selectable:         true,
            // Contrôles masqués par défaut — apparaissent uniquement au clic
            // (évite l'apparence "éditeur" au chargement)
            hasControls:        false,
            hasBorders:         false,
            // Style des contrôles quand ils apparaissent
            cornerStyle:        "circle",
            cornerColor:        "#b13f74",
            borderColor:        "rgba(177,63,116,0.6)",
            cornerSize:         8,
            padding:            5,
            transparentCorners: false,
            lockUniScaling:     true,
            lockRotation:       true,
          });

          // ── Apply logo effect for dark-textile readability ──────────────
          if (currentEffect === "white-outline") {
            // Halo blanc léger autour du logo — pas de rectangle parasite
            logo.shadow = new Shadow({
              color:   "rgba(255,255,255,0.95)",
              blur:    14,
              offsetX: 0,
              offsetY: 0,
            });
          } else if (currentEffect === "white-bg") {
            // Halo blanc fort (remplace le rectangle blanc pur qui était trop visible)
            logo.shadow = new Shadow({
              color:   "rgba(255,255,255,1)",
              blur:    26,
              offsetX: 0,
              offsetY: 0,
            });
          } else {
            // "none" — ombre textile subtile pour intégration naturelle
            // Donne l'impression que le logo est imprimé sur le tissu
            logo.shadow = new Shadow({
              color:   "rgba(0,0,0,0.10)",
              blur:    5,
              offsetX: 0,
              offsetY: 2,
            });
          }

          // Helper: build a LogoPlacementTransform from the current logo state
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const captureTransform = (obj: any): LogoPlacementTransform => ({
            left:       obj.left       ?? 0,
            top:        obj.top        ?? 0,
            scaleX:     obj.scaleX     ?? 1,
            scaleY:     obj.scaleY     ?? 1,
            width:      obj.width      ?? 0,
            height:     obj.height     ?? 0,
            angle:      obj.angle      ?? 0,
            canvasSize,
            source:     "fabric-canvas",
          });

          // Constrain drag inside zone (origine top-left)
          // Le coin supérieur gauche du logo reste dans la zone.
          if (zone) {
            const [lf, tf, wf, hf] = zone;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            canvas.on("object:moving", (e: any) => {
              if (e.target !== logo) return;
              const obj    = e.target;
              const logoW  = (obj.width  ?? nw)  * (obj.scaleX ?? logoScale);
              const logoH  = (obj.height ?? nh)  * (obj.scaleY ?? logoScale);
              const zL     = lf * canvasSize;
              const zR     = (lf + wf) * canvasSize - logoW;
              const zT     = tf * canvasSize;
              const zB     = (tf + hf) * canvasSize - logoH;
              obj.set({
                left: Math.min(Math.max(zL, obj.left ?? 0), zR),
                top:  Math.min(Math.max(zT, obj.top  ?? 0), zB),
              });
            });
          }

          // Emit transform after any interaction ends (move OR scale)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canvas.on("object:modified", (e: any) => {
            if (e.target !== logo) return;
            onLogoPositionChangeRef.current?.(captureTransform(e.target));
          });

          // ── Gestion de la sélection — contrôles cachés par défaut ────────
          // Le logo démarre sans handles : apparence aperçu propre.
          // Au clic sur le logo → handles apparaissent pour redimensionner/déplacer.
          // Au clic ailleurs  → handles disparaissent → retour mode aperçu.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canvas.on("selection:created", (e: any) => {
            if (e.selected?.includes(logo)) {
              logo.set({ hasControls: true, hasBorders: true });
              canvas.requestRenderAll();
            }
          });
          canvas.on("selection:cleared", () => {
            logo.set({ hasControls: false, hasBorders: false });
            canvas.requestRenderAll();
          });

          canvas.add(logo);
          logo.setCoords();
          canvas.discardActiveObject();
          canvas.requestRenderAll();

          // Emit initial placement position
          onLogoPositionChangeRef.current?.(captureTransform(logo));

          if (isBlob) URL.revokeObjectURL(logoSrc);
        };

        logoEl.onerror = () => { if (isBlob) URL.revokeObjectURL(logoSrc); };
      };

      shirtEl.onerror = () => canvas.requestRenderAll();
    });
  }, [fabricReady, src, placement, view, logoFile, logoUrl, canvasSize, getZone, logoEffect]);

  const zoneVisible = !!getZone();
  const hint =
    !zoneVisible && (logoFile || logoUrl)
      ? placement === "dos"
        ? "Passez en vue Dos pour voir la zone"
        : "Passez en vue Face pour voir la zone"
      : null;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Canvas wrapper ─────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative rounded-[28px] border border-[var(--hm-line)] bg-white shadow-[0_20px_48px_rgba(63,45,88,0.08)]"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Loading skeleton */}
        {!fabricReady && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--hm-primary)] border-t-transparent" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{
            display:      fabricReady ? "block" : "none",
            touchAction:  "none",
            borderRadius: "28px",
          }}
          className="block"
        />

        {/* Badge */}
        {badge && (
          <div className="pointer-events-none absolute left-4 top-4 z-10">
            <span className="badge badge-gold">{badge}</span>
          </div>
        )}

        {/* Zone-not-visible hint */}
        {hint && (
          <div className="pointer-events-none absolute right-4 top-4 z-10 max-w-[55%] rounded-xl border border-[var(--hm-line)] bg-white/90 px-3 py-2 text-right text-[10px] font-semibold text-[var(--hm-text-soft)]">
            {hint}
          </div>
        )}

        {/* Disclaimer */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
          Aperçu indicatif · rendu final validé avant lancement
        </div>
      </div>

      {/* ── Face / Dos toggle ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        {(["front", "back"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setView(v);
              // Synchronise le placement parent (coeur-dos préservé — les deux côtés sont actifs)
              if (placement !== "coeur-dos") {
                if (v === "back")  onPlacementChange?.("dos");
                if (v === "front") onPlacementChange?.("coeur");
              }
            }}
            className={`rounded-xl border py-2.5 text-xs font-semibold transition-all
              ${view === v
                ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] shadow-[0_4px_12px_rgba(177,63,116,0.12)]"
                : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
              }`}
          >
            {v === "front"
              ? <><Shirt size={13} aria-hidden="true" /> Face</>
              : <><RotateCcw size={13} aria-hidden="true" /> Dos</>
            }
          </button>
        ))}
      </div>

      {/* ── Logo effect selector — visible only when logo is loaded ─────────
          Apparaît automatiquement dès qu'un logo est uploadé.
          Le bouton actif change automatiquement selon la couleur du textile :
          - textile sombre → "Contour blanc" par défaut
          - textile clair  → "Aucun" par défaut
          L'utilisateur peut surcharger manuellement à tout moment.         */}
      {(logoFile || logoUrl) && (
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
      )}

      {/* ── Drag hint when logo is loaded ─────────────────────────────────── */}
      {(logoFile || logoUrl) && zoneVisible && (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          Glissez votre logo pour le repositionner · les coins pour le redimensionner
        </p>
      )}
    </div>
  );
}
