"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// ── Zone de marquage (fraction of canvas) calibrated for B&C Exact 190 ───────
// [left, top, width, height] as fraction of canvas size
const ZONES: Record<string, [number, number, number, number]> = {
  coeur: [0.62, 0.26, 0.11, 0.11],  // left chest (wearer's left = viewer's right)
  dos:   [0.24, 0.16, 0.52, 0.40],  // full back
};

type View = "front" | "back";

interface Props {
  colorId:                string;
  placement:              Placement;
  logoFile:               File | null;
  badge?:                 string;
  onLogoPositionChange?:  (t: LogoPlacementTransform) => void;
}

export default function MockupViewer({ colorId, placement, logoFile, badge, onLogoPositionChange }: Props) {
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
    if (placement === "coeur" && view === "front") return ZONES.coeur;
    if (placement === "dos"   && view === "back")  return ZONES.dos;
    if (placement === "coeur-dos") return view === "front" ? ZONES.coeur : ZONES.dos;
    return null;
  }, [placement, view]);

  // ── Auto-switch view when placement changes ───────────────────────────────
  useEffect(() => {
    if (placement === "dos")   setView("back");
    if (placement === "coeur") setView("front");
  }, [placement]);

  // ── Current mockup image src ──────────────────────────────────────────────
  const slug    = COLOR_TO_MOCKUP[colorId] ?? "blanc";
  const mockups = MOCKUP_FILES[slug];
  const src     = mockups[view];

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
          backgroundColor: "#ffffff",
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
        if (zone) {
          const [lf, tf, wf, hf] = zone;
          const rect = new Rect({
            left:            lf * canvasSize,
            top:             tf * canvasSize,
            width:           wf * canvasSize,
            height:          hf * canvasSize,
            fill:            "rgba(123,79,166,0.07)",
            stroke:          "#7B4FA6",
            strokeWidth:     1.5,
            strokeDashArray: [6, 4],
            rx: 6, ry: 6,
            selectable:  false,
            evented:     false,
            hasBorders:  false,
            hasControls: false,
          });
          canvas.add(rect);
        }

        // ── Logo image ───────────────────────────────────────────────────
        if (!logoFile) {
          canvas.requestRenderAll();
          return;
        }

        const objectUrl = URL.createObjectURL(logoFile);
        const logoEl    = new window.Image();
        logoEl.src      = objectUrl;

        logoEl.onload = () => {
          const nw = logoEl.naturalWidth  || 200;
          const nh = logoEl.naturalHeight || 200;

          let logoScale: number;
          let logoLeft:  number;
          let logoTop:   number;

          if (zone) {
            const [lf, tf, wf, hf] = zone;
            logoScale = Math.min(
              (wf * canvasSize * 0.70) / nw,
              (hf * canvasSize * 0.70) / nh,
            );
            logoLeft = (lf + wf / 2) * canvasSize;
            logoTop  = (tf + hf / 2) * canvasSize;
          } else {
            logoScale = Math.min(
              (canvasSize * 0.25) / nw,
              (canvasSize * 0.25) / nh,
            );
            logoLeft = canvasSize / 2;
            logoTop  = canvasSize / 2;
          }

          const logo = new FabricImage(logoEl, {
            scaleX:             logoScale,
            scaleY:             logoScale,
            left:               logoLeft,
            top:                logoTop,
            originX:            "center",
            originY:            "center",
            selectable:         true,
            hasControls:        true,
            hasBorders:         true,
            cornerColor:        "#7B4FA6",
            cornerSize:         10,
            transparentCorners: false,
            lockUniScaling:     true,
          });

          // ── Apply logo effect for dark-textile readability ──────────────
          if (currentEffect === "white-outline") {
            // White glow/halo around the logo shape — no layout shift
            logo.shadow = new Shadow({
              color:   "rgba(255,255,255,0.95)",
              blur:    14,
              offsetX: 0,
              offsetY: 0,
            });
          } else if (currentEffect === "white-bg") {
            // Solid white rectangle behind the logo bounding-box
            // padding (in canvas px) adds breathing room
            logo.set({
              backgroundColor: "white",
              padding:         8,
            });
          }
          // "none" → nothing applied

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

          // Constrain drag inside zone
          if (zone) {
            const [lf, tf, wf, hf] = zone;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            canvas.on("object:moving", (e: any) => {
              if (e.target !== logo) return;
              const obj = e.target;
              const hw  = ((obj.width  ?? 0) * (obj.scaleX ?? 1)) / 2;
              const hh  = ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2;
              const zL  = lf * canvasSize;
              const zR  = (lf + wf) * canvasSize;
              const zT  = tf * canvasSize;
              const zB  = (tf + hf) * canvasSize;
              const zW  = zR - zL;
              const zH  = zB - zT;
              const minX = hw < zW / 2 ? zL + hw : zL + zW / 2;
              const maxX = hw < zW / 2 ? zR - hw : zL + zW / 2;
              const minY = hh < zH / 2 ? zT + hh : zT + zH / 2;
              const maxY = hh < zH / 2 ? zB - hh : zT + zH / 2;
              obj.set({ left: Math.min(maxX, Math.max(minX, obj.left ?? 0)) });
              obj.set({ top:  Math.min(maxY, Math.max(minY, obj.top  ?? 0)) });
            });
          }

          // Emit transform after any interaction ends (move OR scale)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canvas.on("object:modified", (e: any) => {
            if (e.target !== logo) return;
            onLogoPositionChangeRef.current?.(captureTransform(e.target));
          });

          canvas.add(logo);
          canvas.setActiveObject(logo);
          canvas.requestRenderAll();

          // Emit initial placement position
          onLogoPositionChangeRef.current?.(captureTransform(logo));

          URL.revokeObjectURL(objectUrl);
        };

        logoEl.onerror = () => URL.revokeObjectURL(objectUrl);
      };

      shirtEl.onerror = () => canvas.requestRenderAll();
    });
  }, [fabricReady, src, placement, view, logoFile, canvasSize, getZone, logoEffect]);

  const zoneVisible = !!getZone();
  const hint =
    !zoneVisible && logoFile
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
            onClick={() => setView(v)}
            className={`rounded-xl border py-2.5 text-xs font-semibold transition-all
              ${view === v
                ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] shadow-[0_4px_12px_rgba(177,63,116,0.12)]"
                : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
              }`}
          >
            {v === "front" ? "👕 Face" : "🔄 Dos"}
          </button>
        ))}
      </div>

      {/* ── Logo effect selector — visible only when logo is loaded ─────────
          Apparaît automatiquement dès qu'un logo est uploadé.
          Le bouton actif change automatiquement selon la couleur du textile :
          - textile sombre → "Contour blanc" par défaut
          - textile clair  → "Aucun" par défaut
          L'utilisateur peut surcharger manuellement à tout moment.         */}
      {logoFile && (
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
      {logoFile && zoneVisible && (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          Glissez votre logo pour le repositionner · les coins pour le redimensionner
        </p>
      )}
    </div>
  );
}
