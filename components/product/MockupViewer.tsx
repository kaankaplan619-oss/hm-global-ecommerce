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
  colorId: string;
  placement: Placement;
  logoFile: File | null;
  badge?: string;
}

export default function MockupViewer({ colorId, placement, logoFile, badge }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef    = useRef<any>(null);
  const canvasSizeRef = useRef(0);
  const [view, setView]         = useState<View>("front");
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
          allowTouchScrolling: false,  // required for touch drag in Fabric v7
        });
        fabricRef.current = canvas;
        canvasSizeRef.current = w;
        setCanvasSize(w);
        setFabricReady(true);
      });
    };

    // Measure after layout is settled
    const measure = () => {
      const w = Math.floor(containerRef.current!.getBoundingClientRect().width);
      return w > 0 ? w : 480;
    };

    // ResizeObserver: reinit if container resizes (orientation change, etc.)
    let initialized = false;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (!w) return;
      if (!initialized) {
        initialized = true;
        initCanvas(w);
      } else if (fabricRef.current && Math.abs(w - canvasSizeRef.current) > 4) {
        // Resize existing canvas without full reinit
        fabricRef.current.setWidth(w);
        fabricRef.current.setHeight(w);
        canvasSizeRef.current = w;
        setCanvasSize(w);
        fabricRef.current.requestRenderAll();
      }
    });

    ro.observe(containerRef.current);

    // Fallback: init after one rAF if ResizeObserver doesn't fire quickly
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
    canvas.clear();

    import("fabric").then(({ FabricImage, Rect }) => {
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
          // Handle SVG with no intrinsic size
          const nw = logoEl.naturalWidth  || 200;
          const nh = logoEl.naturalHeight || 200;

          let logoScale: number;
          let logoLeft: number;
          let logoTop:  number;

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
            scaleX:  logoScale,
            scaleY:  logoScale,
            left:    logoLeft,
            top:     logoTop,
            originX: "center",
            originY: "center",
            selectable:         true,
            hasControls:        true,
            hasBorders:         true,
            cornerColor:        "#7B4FA6",
            cornerSize:         10,
            transparentCorners: false,
            lockUniScaling:     true,
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
              const zL = lf * canvasSize;
              const zR = (lf + wf) * canvasSize;
              const zT = tf * canvasSize;
              const zB = (tf + hf) * canvasSize;
              const zW = zR - zL;
              const zH = zB - zT;
              const minX = hw < zW / 2 ? zL + hw : zL + zW / 2;
              const maxX = hw < zW / 2 ? zR - hw : zL + zW / 2;
              const minY = hh < zH / 2 ? zT + hh : zT + zH / 2;
              const maxY = hh < zH / 2 ? zB - hh : zT + zH / 2;
              obj.set({ left: Math.min(maxX, Math.max(minX, obj.left ?? 0)) });
              obj.set({ top:  Math.min(maxY, Math.max(minY, obj.top  ?? 0)) });
            });
          }

          canvas.add(logo);
          canvas.setActiveObject(logo);
          canvas.requestRenderAll();   // use requestRenderAll for Fabric.js v7
          URL.revokeObjectURL(objectUrl);
        };

        logoEl.onerror = () => URL.revokeObjectURL(objectUrl);
      };

      shirtEl.onerror = () => canvas.requestRenderAll();
    });
  }, [fabricReady, src, placement, view, logoFile, canvasSize, getZone]);

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
      {/*
        No overflow-hidden here — it clips Fabric.js upper-canvas pointer events.
        Border-radius is applied via a decorative ring overlay instead.
      */}
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

        {/*
          touch-action: none → lets Fabric.js handle touch drag without
          browser intercepting the gesture as a scroll.
          The canvas itself clips content at its natural square boundary.
        */}
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

      {/* ── Drag hint when logo is loaded ─────────────────────────────────── */}
      {logoFile && zoneVisible && (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          Glissez votre logo pour le repositionner · les coins pour le redimensionner
        </p>
      )}
    </div>
  );
}
