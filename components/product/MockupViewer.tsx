"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Placement } from "@/types";

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
  "blanc": "blanc", "blanc-casse": "blanc", "naturel": "blanc",
  "noir": "noir",
  "gris": "gris", "gris-melange": "gris", "gris-acier": "gris",
  "marine": "marine",
  "rouge": "rouge",
  "bleu-royal": "bleu", "bleu-ciel": "bleu",
  "vert-bouteille": "vert", "vert-foret": "vert",
  "bordeaux": "bordeaux",
};

// ── Zone de marquage (fraction of canvas) calibrated for B&C Exact 190 ───────
// [left, top, width, height] as fraction of canvas size
const ZONES: Record<string, [number, number, number, number]> = {
  coeur: [0.35, 0.21, 0.17, 0.18],  // left chest
  dos:   [0.24, 0.16, 0.52, 0.40],  // full back
};

/** Returns true if a mockup image exists for this product color ID. */
export function hasMockup(colorId: string): boolean {
  return colorId in COLOR_TO_MOCKUP;
}

type View = "front" | "back";

interface Props {
  colorId: string;
  placement: Placement;
  logoFile: File | null;
  badge?: string;
}

export default function MockupViewer({ colorId, placement, logoFile, badge }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef  = useRef<any>(null);
  const [view, setView]       = useState<View>("front");
  const [canvasSize, setCanvasSize] = useState(0);
  const [fabricReady, setFabricReady] = useState(false);

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

  // ── Step 1: measure container and init Fabric.js canvas (mount only) ──────
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const w = Math.floor(containerRef.current.getBoundingClientRect().width) || 480;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let canvas: any;

    import("fabric").then(({ Canvas }) => {
      if (!canvasRef.current) return;
      canvas = new Canvas(canvasRef.current, {
        width: w,
        height: w,
        selection: false,
        backgroundColor: "#ffffff",
        renderOnAddRemove: false,
      });
      fabricRef.current = canvas;
      setCanvasSize(w);
      setFabricReady(true);
    });

    return () => {
      try { canvas?.dispose(); } catch { /* already disposed */ }
      fabricRef.current = null;
      setFabricReady(false);
      setCanvasSize(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally mount-only

  // ── Steps 2-4: rebuild canvas whenever anything changes ──────────────────
  useEffect(() => {
    if (!fabricReady || !fabricRef.current || canvasSize === 0) return;

    const canvas = fabricRef.current;
    const zone   = getZone();

    // Off all previous moving constraints
    canvas.off("object:moving");
    canvas.clear();

    // ── 2. Shirt image ──────────────────────────────────────────────────────
    import("fabric").then(({ FabricImage, Rect }) => {
      const shirtEl = new window.Image();
      shirtEl.src   = src;

      shirtEl.onload = () => {
        // Scale to fill canvas
        const scale = canvasSize / Math.max(shirtEl.naturalWidth, shirtEl.naturalHeight);
        const shirt = new FabricImage(shirtEl, {
          selectable: false,
          evented:    false,
          hasBorders: false,
          hasControls: false,
          scaleX: scale,
          scaleY: scale,
          left: 0,
          top:  0,
          originX: "left",
          originY: "top",
        });
        canvas.add(shirt);

        // ── 3. Zone de marquage rect ──────────────────────────────────────
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
            rx:              6,
            ry:              6,
            selectable:  false,
            evented:     false,
            hasBorders:  false,
            hasControls: false,
          });
          canvas.add(rect);
        }

        // ── 4. Logo image ─────────────────────────────────────────────────
        if (!logoFile) {
          canvas.renderAll();
          return;
        }

        const objectUrl = URL.createObjectURL(logoFile);
        const logoEl    = new window.Image();
        logoEl.src      = objectUrl;

        logoEl.onload = () => {
          let logoLeft = canvasSize / 2;
          let logoTop  = canvasSize / 2;
          let logoScale: number;

          if (zone) {
            const [lf, tf, wf, hf] = zone;
            // Scale to 55% of zone, centered inside zone
            logoScale = Math.min(
              (wf * canvasSize * 0.55) / logoEl.naturalWidth,
              (hf * canvasSize * 0.55) / logoEl.naturalHeight,
            );
            logoLeft = (lf + wf / 2) * canvasSize;
            logoTop  = (tf + hf / 2) * canvasSize;
          } else {
            // No zone for this view — place in canvas center at 25% size
            logoScale = Math.min(
              (canvasSize * 0.25) / logoEl.naturalWidth,
              (canvasSize * 0.25) / logoEl.naturalHeight,
            );
          }

          const logo = new FabricImage(logoEl, {
            scaleX:     logoScale,
            scaleY:     logoScale,
            left:       logoLeft,
            top:        logoTop,
            originX:    "center",
            originY:    "center",
            selectable: true,
            hasControls: true,
            hasBorders:  true,
            cornerColor: "#7B4FA6",
            cornerSize:  8,
            transparentCorners: false,
            lockUniScaling: true,
          });

          // Constrain logo to stay inside zone
          if (zone) {
            const [lf, tf, wf, hf] = zone;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            canvas.on("object:moving", (e: any) => {
              if (e.target !== logo) return;
              const obj = e.target;
              const hw  = ((obj.width ?? 0) * (obj.scaleX ?? 1)) / 2;
              const hh  = ((obj.height ?? 0) * (obj.scaleY ?? 1)) / 2;
              const minX = lf * canvasSize + hw;
              const maxX = (lf + wf) * canvasSize - hw;
              const minY = tf * canvasSize + hh;
              const maxY = (tf + hf) * canvasSize - hh;
              if ((obj.left ?? 0) < minX) obj.set({ left: Math.max(minX, maxX) < minX ? minX : minX });
              if ((obj.left ?? 0) > maxX) obj.set({ left: maxX });
              if ((obj.left ?? 0) < minX) obj.set({ left: minX });
              if ((obj.top  ?? 0) < minY) obj.set({ top: minY });
              if ((obj.top  ?? 0) > maxY) obj.set({ top: maxY });
            });
          }

          canvas.add(logo);
          canvas.setActiveObject(logo);
          canvas.renderAll();
          URL.revokeObjectURL(objectUrl);
        };

        logoEl.onerror = () => URL.revokeObjectURL(objectUrl);
      };

      shirtEl.onerror = () => canvas.renderAll();
    });
  }, [fabricReady, src, placement, view, logoFile, canvasSize, getZone]);

  // Hint message when the zone is not visible in current view
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
        className="relative overflow-hidden rounded-[28px] border border-[var(--hm-line)] bg-white shadow-[0_20px_48px_rgba(63,45,88,0.08)]"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Loading skeleton until fabric is ready */}
        {!fabricReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--hm-primary)] border-t-transparent" />
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{ display: fabricReady ? "block" : "none" }}
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

      {/* ── Drag hint when logo is loaded ─────────────────────────────────── */}
      {logoFile && zoneVisible && (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          Glissez votre logo pour le repositionner · les coins pour le redimensionner
        </p>
      )}
    </div>
  );
}
