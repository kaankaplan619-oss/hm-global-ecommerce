"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, Crosshair, Shirt, RotateCcw, FileCheck } from "lucide-react";
import type { Placement, Technique, ProductColor, Product } from "@/types";
import { isColorDark, EFFECT_OPTIONS } from "@/lib/color-utils";
import type { LogoEffect } from "@/lib/color-utils";
import type { LogoPlacementTransform } from "@/lib/bat-utils";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/lib/bat-utils";

// ── Mockup images — identiques à MockupViewer ────────────────────────────────
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

const COLOR_TO_MOCKUP: Record<string, string> = {
  "blanc": "blanc", "blanc-casse": "blanc", "naturel": "blanc", "beige": "blanc",
  "jaune": "blanc", "sable": "blanc", "ecru": "blanc",
  "noir": "noir", "anthracite": "noir", "gris-anthracite": "noir",
  "gris": "gris", "gris-melange": "gris", "gris-acier": "gris", "gris-chine": "gris",
  "marine": "marine", "navy": "marine",
  "rouge": "rouge", "rouge-feu": "rouge", "orange": "rouge", "rose": "rouge",
  "bleu-royal": "bleu", "bleu-ciel": "bleu", "bleu": "bleu", "cobalt": "bleu",
  "turquoise": "bleu", "violet": "bleu",
  "vert-bouteille": "vert", "vert-foret": "vert", "vert": "vert", "kaki": "vert",
  "bordeaux": "bordeaux", "bourgogne": "bordeaux",
};

// ── Zones calibrées — identiques à MockupViewer, NE PAS MODIFIER ─────────────
const ZONES: Record<string, [number, number, number, number]> = {
  coeur: [0.60, 0.25, 0.14, 0.14],
  dos:   [0.26, 0.13, 0.48, 0.29],
};

type View = "front" | "back";

interface Props {
  colorId:                string;
  placement:              Placement;
  logoFile:               File | null;
  logoUrl?:               string | null;
  product:                Product;
  selectedColor:          ProductColor | null;
  size:                   string;
  technique:              Technique;
  quantity:               number;
  onClose:                () => void;
  onShowBAT:              () => void;
  onLogoTransformChange?: (t: LogoPlacementTransform) => void;
}

export default function BatPreviewStudio({
  colorId, placement, logoFile, logoUrl,
  product, selectedColor, size, technique, quantity,
  onClose, onShowBAT, onLogoTransformChange,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef     = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logoObjRef    = useRef<any>(null);
  const canvasSizeRef = useRef(0);

  const onLogoTransformChangeRef = useRef(onLogoTransformChange);
  useEffect(() => { onLogoTransformChangeRef.current = onLogoTransformChange; });

  const [view,        setView]        = useState<View>(placement === "dos" ? "back" : "front");
  const [canvasSize,  setCanvasSize]  = useState(0);
  const [fabricReady, setFabricReady] = useState(false);
  const [logoEffect,  setLogoEffect]  = useState<LogoEffect>(() =>
    isColorDark(colorId) ? "white-outline" : "none"
  );

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const getZone = useCallback((): [number, number, number, number] | null => {
    if (placement === "coeur" && view === "front") return ZONES.coeur;
    if (placement === "dos"   && view === "back")  return ZONES.dos;
    if (placement === "coeur-dos") return view === "front" ? ZONES.coeur : ZONES.dos;
    return null;
  }, [placement, view]);

  const slug = COLOR_TO_MOCKUP[colorId] ?? "blanc";
  const src  = MOCKUP_FILES[slug]?.[view] ?? MOCKUP_FILES.blanc[view];

  // ── Init canvas (mount only) ───────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let canvas: any;

    const initCanvas = (w: number) => {
      import("fabric").then(({ Canvas }) => {
        if (!canvasRef.current) return;
        canvas = new Canvas(canvasRef.current, {
          width: w, height: w,
          selection: false,
          renderOnAddRemove: false,
          allowTouchScrolling: false,
        });
        fabricRef.current    = canvas;
        canvasSizeRef.current = w;
        setCanvasSize(w);
        setFabricReady(true);
      });
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
        const w = Math.floor(containerRef.current!.getBoundingClientRect().width);
        initCanvas(w > 0 ? w : 480);
      }
    });

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      try { canvas?.dispose(); } catch { /* already disposed */ }
      fabricRef.current    = null;
      logoObjRef.current   = null;
      setFabricReady(false);
      setCanvasSize(0);
      canvasSizeRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Rebuild canvas ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fabricReady || !fabricRef.current || canvasSize === 0) return;

    const canvas        = fabricRef.current;
    const zone          = getZone();
    const currentEffect = logoEffect;

    canvas.off("object:moving");
    canvas.off("object:modified");
    canvas.off("selection:created");
    canvas.off("selection:cleared");
    canvas.clear();
    logoObjRef.current = null;

    import("fabric").then(({ FabricImage, Rect, Shadow }) => {
      const shirtEl = new window.Image();
      shirtEl.crossOrigin = "anonymous";
      shirtEl.src = src;

      shirtEl.onload = () => {
        const scale = canvasSize / Math.max(shirtEl.naturalWidth || canvasSize, shirtEl.naturalHeight || canvasSize);
        const shirt = new FabricImage(shirtEl, {
          selectable: false, evented: false, hasBorders: false, hasControls: false,
          scaleX: scale, scaleY: scale, left: 0, top: 0, originX: "left", originY: "top",
        });
        canvas.add(shirt);

        // Zone rect — plus visible que dans MockupViewer (studio = édition)
        if (zone) {
          const [lf, tf, wf, hf] = zone;
          canvas.add(new Rect({
            left: lf * canvasSize, top: tf * canvasSize,
            width: wf * canvasSize, height: hf * canvasSize,
            fill: "rgba(177,63,116,0.06)",
            stroke: "rgba(177,63,116,0.55)",
            strokeWidth: 1.5, strokeDashArray: [4, 5],
            rx: 6, ry: 6,
            selectable: false, evented: false, hasBorders: false, hasControls: false,
          }));
        }

        const isBlob  = !!logoFile;
        const logoSrc = logoFile ? URL.createObjectURL(logoFile) : (logoUrl ?? null);
        if (!logoSrc) { canvas.requestRenderAll(); return; }

        const logoEl = new window.Image();
        logoEl.crossOrigin = "anonymous";
        logoEl.src = logoSrc;

        logoEl.onload = () => {
          const nw = logoEl.naturalWidth  || 200;
          const nh = logoEl.naturalHeight || 200;

          let logoScale: number, logoLeft: number, logoTop: number;
          if (zone) {
            const [lf, tf, wf, hf] = zone;
            logoScale = Math.min((wf * canvasSize * 0.80) / nw, (hf * canvasSize * 0.80) / nh);
            logoLeft  = (lf + wf / 2) * canvasSize - (logoScale * nw / 2);
            logoTop   = (tf + hf / 2) * canvasSize - (logoScale * nh / 2);
          } else {
            logoScale = Math.min((canvasSize * 0.25) / nw, (canvasSize * 0.25) / nh);
            logoLeft  = canvasSize / 2 - (logoScale * nw / 2);
            logoTop   = canvasSize / 2 - (logoScale * nh / 2);
          }

          const logo = new FabricImage(logoEl, {
            scaleX: logoScale, scaleY: logoScale,
            left: logoLeft, top: logoTop,
            originX: "left", originY: "top",
            selectable: true,
            hasControls: false, hasBorders: false,
            cornerStyle: "circle", cornerColor: "#b13f74",
            borderColor: "rgba(177,63,116,0.6)",
            cornerSize: 10, padding: 6,
            transparentCorners: false,
            lockUniScaling: true, lockRotation: true,
          });

          if (currentEffect === "white-outline") {
            logo.shadow = new Shadow({ color: "rgba(255,255,255,0.95)", blur: 14, offsetX: 0, offsetY: 0 });
          } else if (currentEffect === "white-bg") {
            logo.shadow = new Shadow({ color: "rgba(255,255,255,1)", blur: 26, offsetX: 0, offsetY: 0 });
          } else {
            logo.shadow = new Shadow({ color: "rgba(0,0,0,0.10)", blur: 5, offsetX: 0, offsetY: 2 });
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const captureTransform = (obj: any): LogoPlacementTransform => ({
            left: obj.left ?? 0, top: obj.top ?? 0,
            scaleX: obj.scaleX ?? 1, scaleY: obj.scaleY ?? 1,
            width: obj.width ?? 0, height: obj.height ?? 0,
            angle: obj.angle ?? 0, canvasSize,
            source: "fabric-canvas",
          });

          // Constrain drag inside zone
          if (zone) {
            const [lf, tf, wf, hf] = zone;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            canvas.on("object:moving", (e: any) => {
              if (e.target !== logo) return;
              const obj   = e.target;
              const logoW = (obj.width ?? nw) * (obj.scaleX ?? logoScale);
              const logoH = (obj.height ?? nh) * (obj.scaleY ?? logoScale);
              const zL = lf * canvasSize, zR = (lf + wf) * canvasSize - logoW;
              const zT = tf * canvasSize, zB = (tf + hf) * canvasSize - logoH;
              obj.set({
                left: Math.min(Math.max(zL, obj.left ?? 0), Math.max(zL, zR)),
                top:  Math.min(Math.max(zT, obj.top  ?? 0), Math.max(zT, zB)),
              });
            });
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canvas.on("object:modified", (e: any) => {
            if (e.target !== logo) return;
            // Re-clamp after scale
            if (zone) {
              const [lf, tf, wf, hf] = zone;
              const obj   = e.target;
              const logoW = (obj.width ?? nw) * (obj.scaleX ?? 1);
              const logoH = (obj.height ?? nh) * (obj.scaleY ?? 1);
              const zL = lf * canvasSize, zR = (lf + wf) * canvasSize - logoW;
              const zT = tf * canvasSize, zB = (tf + hf) * canvasSize - logoH;
              obj.set({
                left: Math.min(Math.max(zL, obj.left ?? 0), Math.max(zL, zR)),
                top:  Math.min(Math.max(zT, obj.top  ?? 0), Math.max(zT, zB)),
              });
              obj.setCoords();
            }
            onLogoTransformChangeRef.current?.(captureTransform(e.target));
          });

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
          logoObjRef.current = logo;
          canvas.discardActiveObject();
          canvas.requestRenderAll();

          onLogoTransformChangeRef.current?.(captureTransform(logo));
          if (isBlob) URL.revokeObjectURL(logoSrc);
        };

        logoEl.onerror = () => { if (isBlob) URL.revokeObjectURL(logoSrc); };
      };

      shirtEl.onerror = () => canvas.requestRenderAll();
    });
  }, [fabricReady, src, placement, view, logoFile, logoUrl, canvasSize, getZone, logoEffect]);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const handleZoom = useCallback((factor: number) => {
    const logo   = logoObjRef.current;
    const canvas = fabricRef.current;
    const zone   = getZone();
    if (!logo || !canvas) return;

    const newScaleX = (logo.scaleX ?? 1) * factor;
    const lw = logo.width ?? 1;
    const lh = logo.height ?? 1;

    if (zone) {
      const [, , wf, hf] = zone;
      const cs  = canvasSizeRef.current;
      const min = Math.min((wf * cs * 0.20) / lw, (hf * cs * 0.20) / lh);
      const max = Math.min((wf * cs * 1.30) / lw, (hf * cs * 1.30) / lh);
      if (newScaleX < min || newScaleX > max) return;
    }

    const newScaleY = (logo.scaleY ?? 1) * factor;
    logo.set({ scaleX: newScaleX, scaleY: newScaleY });

    // Re-clamp position after scale
    if (zone) {
      const [lf, tf, wf, hf] = zone;
      const cs   = canvasSizeRef.current;
      const logoW = lw * newScaleX;
      const logoH = lh * newScaleY;
      const zL = lf * cs, zR = (lf + wf) * cs - logoW;
      const zT = tf * cs, zB = (tf + hf) * cs - logoH;
      logo.set({
        left: Math.min(Math.max(zL, logo.left ?? 0), Math.max(zL, zR)),
        top:  Math.min(Math.max(zT, logo.top  ?? 0), Math.max(zT, zB)),
      });
    }

    logo.setCoords();
    canvas.requestRenderAll();
    onLogoTransformChangeRef.current?.({
      left: logo.left ?? 0, top: logo.top ?? 0,
      scaleX: newScaleX, scaleY: newScaleY,
      width: lw, height: lh,
      angle: logo.angle ?? 0,
      canvasSize: canvasSizeRef.current,
      source: "fabric-canvas",
    });
  }, [getZone]);

  // ── Recenter ──────────────────────────────────────────────────────────────
  const handleRecenter = useCallback(() => {
    const logo   = logoObjRef.current;
    const canvas = fabricRef.current;
    const zone   = getZone();
    if (!logo || !canvas || !zone) return;

    const [lf, tf, wf, hf] = zone;
    const cs    = canvasSizeRef.current;
    const logoW = (logo.width  ?? 0) * (logo.scaleX ?? 1);
    const logoH = (logo.height ?? 0) * (logo.scaleY ?? 1);

    logo.set({
      left: (lf + wf / 2) * cs - logoW / 2,
      top:  (tf + hf / 2) * cs - logoH / 2,
    });
    logo.setCoords();
    canvas.requestRenderAll();
    onLogoTransformChangeRef.current?.({
      left: logo.left ?? 0, top: logo.top ?? 0,
      scaleX: logo.scaleX ?? 1, scaleY: logo.scaleY ?? 1,
      width: logo.width ?? 0, height: logo.height ?? 0,
      angle: logo.angle ?? 0,
      canvasSize: cs,
      source: "fabric-canvas",
    });
  }, [getZone]);

  if (!mounted) return null;

  const logoFileName   = logoFile?.name ?? (logoUrl ? "Logo enregistré" : "—");
  const techniqueLabel = TECHNIQUE_LABELS[technique] ?? technique;
  const placementLabel = PLACEMENT_LABELS[placement] ?? placement;
  const showViewToggle = placement === "coeur-dos";

  const INFO_ROWS = [
    { label: "Produit",   value: product.name },
    { label: "Couleur",   value: selectedColor?.label ?? "—" },
    { label: "Taille",    value: size || "Non sélectionnée" },
    { label: "Quantité",  value: String(quantity) },
    { label: "Technique", value: techniqueLabel },
    { label: "Placement", value: placementLabel },
  ];

  const content = (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0a10]">

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#b13f74]/20">
            <FileCheck size={15} className="text-[#b13f74]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              BAT Preview Studio
            </p>
            <h2 className="text-sm font-black text-white">{product.name}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le studio"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/50 transition-colors hover:border-white/25 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">

        {/* Canvas zone */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-6">

          {/* View toggle (Face / Dos) */}
          {(showViewToggle || placement === "coeur" || placement === "dos") && (
            <div className="absolute left-4 top-4 z-10 flex gap-1.5 sm:left-6 sm:top-6">
              {(["front", "back"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all
                    ${view === v
                      ? "bg-[#b13f74] text-white shadow-[0_4px_12px_rgba(177,63,116,0.35)]"
                      : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                    }`}
                >
                  {v === "front" ? <><Shirt size={11} /> Face</> : <><RotateCcw size={11} /> Dos</>}
                </button>
              ))}
            </div>
          )}

          {/* Canvas */}
          <div
            ref={containerRef}
            className="relative w-full max-w-[min(100%,560px)] overflow-hidden rounded-[24px] shadow-[0_32px_80px_rgba(0,0,0,0.55)]"
            style={{ aspectRatio: "1 / 1" }}
          >
            {!fabricReady && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[24px] bg-[#1a1225]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#b13f74] border-t-transparent" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              style={{
                display: fabricReady ? "block" : "none",
                touchAction: "none",
                borderRadius: "24px",
              }}
              className="block w-full"
            />
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] font-semibold text-white/55 backdrop-blur-sm">
              Prévisualisation indicative · validée par HM Global avant production
            </div>
          </div>

          {/* Zoom / recenter controls */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
            {[
              { icon: ZoomOut, factor: 0.87, title: "Réduire le logo" },
              { icon: Crosshair, factor: 0 as const, title: "Recentrer le logo" },
              { icon: ZoomIn,  factor: 1.15, title: "Agrandir le logo" },
            ].map(({ icon: Icon, factor, title }) => (
              <button
                key={title}
                type="button"
                onClick={() => factor === 0 ? handleRecenter() : handleZoom(factor)}
                title={title}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/70 transition-all hover:border-[#b13f74]/60 hover:bg-[#b13f74]/20 hover:text-white"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="flex shrink-0 flex-col justify-between overflow-y-auto border-t border-white/10 p-5 lg:w-72 lg:border-l lg:border-t-0 xl:w-80">
          <div className="space-y-4">

            {/* Configuration */}
            <div>
              <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-[#b13f74]">
                Configuration
              </p>
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                {INFO_ROWS.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-[10px] uppercase tracking-wide text-white/40">{label}</span>
                    <span className="text-right text-[11px] font-semibold text-white/80">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logo */}
            <div>
              <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-[#b13f74]">
                Logo
              </p>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="break-all font-mono text-[11px] text-white/70">{logoFileName}</p>
              </div>
            </div>

            {/* Lisibilité */}
            <div>
              <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-[#b13f74]">
                Lisibilité
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {EFFECT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLogoEffect(value)}
                    className={`rounded-xl border py-2 text-[10px] font-semibold transition-all
                      ${logoEffect === value
                        ? "border-[#b13f74] bg-[#b13f74]/20 text-[#b13f74]"
                        : "border-white/10 bg-white/5 text-white/50 hover:border-[#b13f74]/40 hover:text-white/70"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hints */}
            <p className="text-[10px] leading-relaxed text-white/30">
              Cliquez sur le logo pour afficher les poignées · Glissez pour repositionner · Coins pour redimensionner
            </p>

            {/* Disclaimer */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <p className="text-[10px] leading-relaxed text-amber-200/80">
                Prévisualisation indicative avant validation par HM Global. La position exacte est confirmée sur le BAT officiel.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 shrink-0 space-y-2">
            <button
              type="button"
              onClick={onShowBAT}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b13f74] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(177,63,116,0.35)] transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <FileCheck size={15} />
              Voir le BAT complet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/60 transition-all hover:border-white/20 hover:text-white"
            >
              ← Retour au configurateur
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return createPortal(content, document.body);
}
