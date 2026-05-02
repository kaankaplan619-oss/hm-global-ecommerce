"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { RotateCcw, Shirt } from "lucide-react";
import type { Placement } from "@/types";

// ── Zones calibrées par catégorie (same as MockupViewer) ──────────────────────
const ZONES_BY_CATEGORY: Record<
  string,
  { coeur: [number, number, number, number]; dos: [number, number, number, number] }
> = {
  tshirts:    { coeur: [0.38, 0.28, 0.18, 0.18], dos: [0.25, 0.20, 0.50, 0.45] },
  hoodies:    { coeur: [0.40, 0.32, 0.16, 0.16], dos: [0.25, 0.22, 0.50, 0.42] },
  softshells: { coeur: [0.42, 0.30, 0.15, 0.15], dos: [0.26, 0.22, 0.48, 0.40] },
};

const ZONES_STATIC = {
  coeur: [0.60, 0.25, 0.14, 0.14] as [number, number, number, number],
  dos:   [0.26, 0.13, 0.48, 0.29] as [number, number, number, number],
};

export interface StudioObject {
  id: string;
  type: "logo" | "text" | "design";
  /** URL blob or remote for logo/design */
  src?: string;
  /** File for logo upload */
  file?: File;
  /** Text content */
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  /** Label for display */
  label: string;
  /** Which face this object belongs to */
  face: "front" | "back";
  /** Fabric internal position/scale (updated on move/scale) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fabricState?: any;
}

type View = "front" | "back";

export interface StudioCanvasHandle {
  exportPNG: () => string;
}

interface Props {
  colorId: string;
  placement: Placement;
  productCategory?: string;
  packshot?: string | null;
  objects: StudioObject[];
  onObjectsChange: (objects: StudioObject[]) => void;
}

const StudioCanvas = forwardRef<StudioCanvasHandle, Props>(function StudioCanvas(
  { colorId, placement, productCategory, packshot, objects, onObjectsChange },
  ref
) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef     = useRef<any>(null);
  const canvasSizeRef = useRef(0);

  const [view,         setView]         = useState<View>("front");
  const [canvasSize,   setCanvasSize]   = useState(0);
  const [fabricReady,  setFabricReady]  = useState(false);
  // Selected fabric object info (for toolbar)
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [toolbarPos,   setToolbarPos]   = useState<{ x: number; y: number } | null>(null);

  // Stable refs for callbacks
  const onObjectsChangeRef = useRef(onObjectsChange);
  useEffect(() => { onObjectsChangeRef.current = onObjectsChange; });

  // ── Expose exportPNG via ref ──────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      if (!fabricRef.current) return "";
      return fabricRef.current.toDataURL({ format: "png", multiplier: 2 }) as string;
    },
  }));

  // ── Zone helper ──────────────────────────────────────────────────────────
  const getZone = useCallback((): [number, number, number, number] | null => {
    const zones = packshot
      ? (ZONES_BY_CATEGORY[productCategory ?? ""] ?? ZONES_BY_CATEGORY.tshirts)
      : ZONES_STATIC;
    if (placement === "coeur" && view === "front") return zones.coeur;
    if (placement === "dos"   && view === "back")  return zones.dos;
    if (placement === "coeur-dos") return view === "front" ? zones.coeur : zones.dos;
    return null;
  }, [placement, view, packshot, productCategory]);

  // ── Packshot sources ─────────────────────────────────────────────────────
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

  const slug = COLOR_TO_MOCKUP[colorId] ?? null;
  const mockups = slug ? MOCKUP_FILES[slug] : null;
  const src = view === "front"
    ? (packshot ?? mockups?.front ?? "/mockups/tshirt/blanc-front.jpg")
    : (productCategory === "tshirts"
        ? (mockups?.back ?? packshot ?? "/mockups/tshirt/blanc-back.png")
        : (packshot ?? "/mockups/tshirt/blanc-back.png"));

  // ── Auto-switch view when placement changes ───────────────────────────────
  useEffect(() => {
    if (placement === "dos")   setView("back");
    if (placement === "coeur") setView("front");
  }, [placement]);

  // ── Init Fabric.js canvas (mount only) ───────────────────────────────────
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

  // ── Rebuild canvas on deps change ─────────────────────────────────────────
  useEffect(() => {
    if (!fabricReady || !fabricRef.current || canvasSize === 0) return;
    const canvas = fabricRef.current;
    const zone   = getZone();

    // Detach all events
    canvas.off("object:moving");
    canvas.off("object:modified");
    canvas.off("object:scaling");
    canvas.off("selection:created");
    canvas.off("selection:cleared");
    canvas.clear();
    setSelectedId(null);
    setToolbarPos(null);

    // Filter objects for current face
    const faceObjects = objects.filter((o) => o.face === view);

    import("fabric").then(({ FabricImage, Rect, IText, Shadow }) => {
      // ── Shirt image ───────────────────────────────────────────────────────
      const shirtEl = new window.Image();
      shirtEl.crossOrigin = "anonymous";
      shirtEl.src = src;

      shirtEl.onload = async () => {
        const scale = canvasSize / Math.max(shirtEl.naturalWidth || canvasSize, shirtEl.naturalHeight || canvasSize);
        const shirt = new FabricImage(shirtEl, {
          selectable: false, evented: false, hasBorders: false, hasControls: false,
          scaleX: scale, scaleY: scale, left: 0, top: 0, originX: "left", originY: "top",
        });
        canvas.add(shirt);

        // ── Zone rectangle ────────────────────────────────────────────────
        if (zone) {
          const [lf, tf, wf, hf] = zone;
          const rect = new Rect({
            left: lf * canvasSize, top: tf * canvasSize,
            width: wf * canvasSize, height: hf * canvasSize,
            fill: "rgba(177,63,116,0.04)", stroke: "rgba(177,63,116,0.35)",
            strokeWidth: 1, strokeDashArray: [4, 5], rx: 6, ry: 6,
            selectable: false, evented: false, hasBorders: false, hasControls: false,
          });
          canvas.add(rect);
        }

        // ── Add each studio object ────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fabricObjectMap = new Map<string, any>();

        for (const obj of faceObjects) {
          if (obj.type === "text" && obj.text) {
            // ── IText ──────────────────────────────────────────────────────
            let textLeft = canvasSize / 2;
            let textTop  = canvasSize / 2;
            if (zone) {
              const [lf, tf, wf, hf] = zone;
              textLeft = (lf + wf / 2) * canvasSize;
              textTop  = (tf + hf / 2) * canvasSize;
            }
            const textObj = new IText(obj.text, {
              left: obj.fabricState?.left ?? textLeft,
              top:  obj.fabricState?.top  ?? textTop,
              originX: "center",
              originY: "center",
              fontFamily: obj.fontFamily ?? "Arial",
              fontSize:   (obj.fontSize ?? 24) * (canvasSize / 480),
              fill: obj.color ?? "#000000",
              selectable: true,
              hasControls: false,
              hasBorders: false,
              cornerStyle: "circle",
              cornerColor: "#b13f74",
              borderColor: "rgba(177,63,116,0.6)",
              cornerSize: 8,
              padding: 5,
              transparentCorners: false,
              lockRotation: true,
            });
            textObj.shadow = new Shadow({ color: "rgba(0,0,0,0.10)", blur: 5, offsetX: 0, offsetY: 2 });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (textObj as any).__studioId = obj.id;
            canvas.add(textObj);
            canvas.discardActiveObject();
          } else if ((obj.type === "logo" || obj.type === "design") && (obj.src || obj.file)) {
            // ── FabricImage ───────────────────────────────────────────────
            const imgSrc = obj.file ? URL.createObjectURL(obj.file) : (obj.src ?? "");
            const isBlob = !!obj.file;

            await new Promise<void>((resolve) => {
              const imgEl = new window.Image();
              imgEl.crossOrigin = "anonymous";
              imgEl.src = imgSrc;

              imgEl.onload = () => {
                const nw = imgEl.naturalWidth  || 100;
                const nh = imgEl.naturalHeight || 100;
                let imgScale: number;
                let imgLeft:  number;
                let imgTop:   number;

                if (zone) {
                  const [lf, tf, wf, hf] = zone;
                  imgScale = Math.min((wf * canvasSize * 0.80) / nw, (hf * canvasSize * 0.80) / nh);
                  imgLeft  = (lf + wf / 2) * canvasSize - (imgScale * nw / 2);
                  imgTop   = (tf + hf / 2) * canvasSize - (imgScale * nh / 2);
                } else {
                  imgScale = Math.min((canvasSize * 0.25) / nw, (canvasSize * 0.25) / nh);
                  imgLeft  = canvasSize / 2 - (imgScale * nw / 2);
                  imgTop   = canvasSize / 2 - (imgScale * nh / 2);
                }

                const fabricImg = new FabricImage(imgEl, {
                  scaleX: obj.fabricState?.scaleX ?? imgScale,
                  scaleY: obj.fabricState?.scaleY ?? imgScale,
                  left:   obj.fabricState?.left   ?? imgLeft,
                  top:    obj.fabricState?.top    ?? imgTop,
                  originX: "left", originY: "top",
                  selectable: true,
                  hasControls: false, hasBorders: false,
                  cornerStyle: "circle",
                  cornerColor: "#b13f74",
                  borderColor: "rgba(177,63,116,0.6)",
                  cornerSize: 8, padding: 5,
                  transparentCorners: false,
                  lockUniScaling: true, lockRotation: true,
                });
                fabricImg.shadow = new Shadow({ color: "rgba(0,0,0,0.10)", blur: 5, offsetX: 0, offsetY: 2 });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (fabricImg as any).__studioId = obj.id;
                canvas.add(fabricImg);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fabricObjectMap.set(obj.id, fabricImg as any);
                canvas.discardActiveObject();
                if (isBlob) URL.revokeObjectURL(imgSrc);
                resolve();
              };
              imgEl.onerror = () => { if (isBlob) URL.revokeObjectURL(imgSrc); resolve(); };
            });
          }
        }

        // ── Zone drag constraint ──────────────────────────────────────────
        if (zone) {
          const [lf, tf, wf, hf] = zone;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canvas.on("object:moving", (e: any) => {
            const obj2 = e.target;
            if (!obj2) return;
            const w2 = (obj2.width  ?? 0) * (obj2.scaleX ?? 1);
            const h2 = (obj2.height ?? 0) * (obj2.scaleY ?? 1);
            const zL = lf * canvasSize;
            const zR = (lf + wf) * canvasSize - w2;
            const zT = tf * canvasSize;
            const zB = (tf + hf) * canvasSize - h2;
            obj2.set({
              left: Math.min(Math.max(zL, obj2.left ?? 0), Math.max(zL, zR)),
              top:  Math.min(Math.max(zT, obj2.top  ?? 0), Math.max(zT, zB)),
            });
          });
        }

        // ── Toolbar update on object:modified ────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.on("object:modified", (e: any) => {
          const target = e.target;
          if (!target) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const studioId = (target as any).__studioId as string | undefined;
          if (!studioId) return;
          const updated = objects.map((o) => {
            if (o.id !== studioId) return o;
            return {
              ...o,
              fabricState: {
                left: target.left, top: target.top,
                scaleX: target.scaleX, scaleY: target.scaleY,
              },
            };
          });
          onObjectsChangeRef.current(updated);
          updateToolbar(target);
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.on("object:scaling", (e: any) => {
          if (e.target) updateToolbar(e.target);
        });

        // ── Selection events ──────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.on("selection:created", (e: any) => {
          const target = e.selected?.[0];
          if (!target) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const studioId = (target as any).__studioId as string | undefined;
          target.set({ hasControls: true, hasBorders: true });
          canvas.requestRenderAll();
          setSelectedId(studioId ?? null);
          updateToolbar(target);
        });

        canvas.on("selection:cleared", () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canvas.getObjects().forEach((o: any) => {
            o.set({ hasControls: false, hasBorders: false });
          });
          canvas.requestRenderAll();
          setSelectedId(null);
          setToolbarPos(null);
        });

        canvas.requestRenderAll();
      };

      shirtEl.onerror = () => canvas.requestRenderAll();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricReady, src, canvasSize, view, placement, getZone, objects]);

  // ── Toolbar position helper ───────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateToolbar = (fabricObj: any) => {
    if (!containerRef.current || !fabricRef.current) return;
    const canvas = fabricRef.current;
    const zoom = canvas.getZoom?.() ?? 1;
    const vpt  = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0];
    const br   = fabricObj.getBoundingRect?.(true);
    if (!br) return;
    const x = br.left * zoom + vpt[4];
    const y = br.top  * zoom + vpt[5];
    setToolbarPos({ x, y });
  };

  // ── Toolbar actions ───────────────────────────────────────────────────────
  const handleCenter = () => {
    if (!fabricRef.current || !selectedId) return;
    const canvas = fabricRef.current;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = canvas.getActiveObject() as any;
    if (!target) return;
    const zone = getZone();
    if (zone) {
      const [lf, tf, wf, hf] = zone;
      const w = (target.width ?? 0) * (target.scaleX ?? 1);
      const h = (target.height ?? 0) * (target.scaleY ?? 1);
      target.set({
        left: (lf + wf / 2) * canvasSize - w / 2,
        top:  (tf + hf / 2) * canvasSize - h / 2,
      });
    } else {
      const w = (target.width ?? 0) * (target.scaleX ?? 1);
      const h = (target.height ?? 0) * (target.scaleY ?? 1);
      target.set({ left: canvasSize / 2 - w / 2, top: canvasSize / 2 - h / 2 });
    }
    target.setCoords?.();
    canvas.requestRenderAll();
    updateToolbar(target);
    const updated = objects.map((o) => {
      if (o.id !== selectedId) return o;
      return { ...o, fabricState: { left: target.left, top: target.top, scaleX: target.scaleX, scaleY: target.scaleY } };
    });
    onObjectsChangeRef.current(updated);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const updated = objects.filter((o) => o.id !== selectedId);
    onObjectsChangeRef.current(updated);
    setSelectedId(null);
    setToolbarPos(null);
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const orig = objects.find((o) => o.id === selectedId);
    if (!orig) return;
    const newObj: StudioObject = {
      ...orig,
      id: `${orig.id}-copy-${Date.now()}`,
      label: `${orig.label} (copie)`,
      fabricState: orig.fabricState
        ? { ...orig.fabricState, left: (orig.fabricState.left ?? 0) + 20, top: (orig.fabricState.top ?? 0) + 20 }
        : undefined,
    };
    onObjectsChangeRef.current([...objects, newObj]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Canvas wrapper ──────────────────────────────────────────────────── */}
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
          style={{ display: fabricReady ? "block" : "none", touchAction: "none", borderRadius: "28px" }}
          className="block"
        />

        {/* Floating toolbar above selected object */}
        {selectedId && toolbarPos && (
          <div
            className="pointer-events-auto absolute z-20 flex items-center gap-1 rounded-xl border border-[var(--hm-line)] bg-white px-2 py-1.5 shadow-[0_4px_16px_rgba(63,45,88,0.16)]"
            style={{
              left: Math.max(4, toolbarPos.x),
              top:  Math.max(4, toolbarPos.y - 44),
            }}
          >
            <button
              type="button"
              onClick={handleCenter}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)] transition hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-primary)]"
              title="Centrer dans la zone"
            >
              ↩ Centrer
            </button>
            <div className="h-4 w-px bg-[var(--hm-line)]" />
            <button
              type="button"
              onClick={handleDuplicate}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)] transition hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-primary)]"
              title="Dupliquer"
            >
              ⧉ Dupliquer
            </button>
            <div className="h-4 w-px bg-[var(--hm-line)]" />
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-red-500 transition hover:bg-red-50"
              title="Supprimer"
            >
              🗑 Supprimer
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
          Aperçu indicatif · rendu final validé avant lancement
        </div>
      </div>

      {/* ── Face / Dos toggle ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        {(["front", "back"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all
              ${view === v
                ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] shadow-[0_4px_12px_rgba(177,63,116,0.12)]"
                : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
              }`}
          >
            {v === "front" ? <><Shirt size={13} aria-hidden="true" /> Face</> : <><RotateCcw size={13} aria-hidden="true" /> Dos</>}
          </button>
        ))}
      </div>

      {/* ── Drag hint ───────────────────────────────────────────────────────── */}
      {objects.filter((o) => o.face === view).length > 0 && (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          Cliquez un élément pour le sélectionner · glissez pour repositionner · coins pour redimensionner
        </p>
      )}
    </div>
  );
});

export default StudioCanvas;
