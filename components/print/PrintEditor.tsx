"use client";

/**
 * PrintEditor.tsx — Atelier d'édition de carte/print.
 *
 * Éditeur canvas maison (pas de Fabric.js, comme le Studio textile) :
 *   - Plan de travail au ratio du format, avec fond perdu / zone sécurité.
 *   - Objets : IMAGE, TEXTE, FORMES (rectangle, ellipse, ligne), QR code.
 *     Déplaçables / redimensionnables (poignée coin), sélection, suppression,
 *     duplication, ordre des calques (avant/arrière), annulation (undo).
 *   - Modèles de carte pré-faits (templates).
 *   - Faces recto / verso (jeux d'objets séparés).
 *   - Aperçu 3D rotatif (perspective CSS).
 *   - Export : rend la face courante (ou les 2) en PNG haute résolution
 *     (~300 dpi) → sert de fichier d'impression / BAT / commande Gelato.
 *
 * onValidate(rectoPng, versoPng|null) : appelé quand le client valide.
 */

import { useCallback, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Type, ImagePlus, Trash2, X, Check, Box, RotateCw,
  Square, Circle, Minus, QrCode, LayoutTemplate, Copy,
  ArrowUp, ArrowDown, Undo2, Bold,
} from "lucide-react";

type ObjType = "image" | "text" | "rect" | "ellipse" | "line" | "qr";

export interface EditorObject {
  id:          string;
  type:        ObjType;
  x:           number;  // position normalisée 0..1 (coin haut-gauche, format fini)
  y:           number;
  w:           number;  // largeur normalisée 0..1
  h:           number;  // hauteur normalisée 0..1
  // Image / QR
  url?:        string;
  qrValue?:    string;  // contenu encodé du QR (pour ré-édition)
  // Texte
  text?:       string;
  color?:      string;
  align?:      "left" | "center" | "right";
  fontFamily?: string;
  bold?:       boolean;
  // Formes
  fill?:       string;
  stroke?:     string;
  strokeW?:    number;  // fraction de la largeur carte (0..0.05)
  radius?:     number;  // fraction de la hauteur (coins arrondis rect)
}

const PX_PER_MM = 11.8; // ~300 dpi

const FONTS: { label: string; css: string }[] = [
  { label: "Sans",    css: "Helvetica, Arial, sans-serif" },
  { label: "Serif",   css: "Georgia, 'Times New Roman', serif" },
  { label: "Mono",    css: "'Courier New', monospace" },
  { label: "Display", css: "'Trebuchet MS', 'Segoe UI', sans-serif" },
];

let __uid = 0;
const nextId = () => `o${++__uid}`;

// ─── Modèles de carte (objets normalisés, recto) ────────────────────────────
const TEMPLATES: { label: string; build: () => EditorObject[] }[] = [
  {
    label: "Classique",
    build: () => [
      { id: nextId(), type: "text", x: 0.1, y: 0.22, w: 0.8, h: 0.16, text: "Prénom Nom", color: "#2d2340", align: "center", fontFamily: FONTS[1].css, bold: true },
      { id: nextId(), type: "line", x: 0.32, y: 0.45, w: 0.36, h: 0.02, stroke: "#b13f74", strokeW: 0.006 },
      { id: nextId(), type: "text", x: 0.1, y: 0.5, w: 0.8, h: 0.1, text: "Fonction", color: "#6e6280", align: "center", fontFamily: FONTS[0].css },
      { id: nextId(), type: "text", x: 0.1, y: 0.72, w: 0.8, h: 0.09, text: "contact@exemple.fr · 06 00 00 00 00", color: "#2d2340", align: "center", fontFamily: FONTS[0].css },
    ],
  },
  {
    label: "Bandeau",
    build: () => [
      { id: nextId(), type: "rect", x: 0, y: 0, w: 1, h: 0.28, fill: "#b13f74", stroke: "#b13f74", strokeW: 0, radius: 0 },
      { id: nextId(), type: "text", x: 0.08, y: 0.08, w: 0.84, h: 0.12, text: "Prénom Nom", color: "#ffffff", align: "left", fontFamily: FONTS[3].css, bold: true },
      { id: nextId(), type: "text", x: 0.08, y: 0.42, w: 0.84, h: 0.1, text: "Fonction", color: "#2d2340", align: "left", fontFamily: FONTS[0].css },
      { id: nextId(), type: "text", x: 0.08, y: 0.66, w: 0.84, h: 0.09, text: "contact@exemple.fr", color: "#6e6280", align: "left", fontFamily: FONTS[0].css },
      { id: nextId(), type: "text", x: 0.08, y: 0.78, w: 0.84, h: 0.09, text: "06 00 00 00 00", color: "#6e6280", align: "left", fontFamily: FONTS[0].css },
    ],
  },
  {
    label: "Minimal",
    build: () => [
      { id: nextId(), type: "text", x: 0.1, y: 0.38, w: 0.8, h: 0.2, text: "NOM", color: "#2d2340", align: "center", fontFamily: FONTS[3].css, bold: true },
      { id: nextId(), type: "text", x: 0.1, y: 0.62, w: 0.8, h: 0.08, text: "www.exemple.fr", color: "#b13f74", align: "center", fontFamily: FONTS[2].css },
    ],
  },
];

export default function PrintEditor({
  widthMm,
  heightMm,
  bleedMm = 3,
  faces = "recto",
  onValidate,
  onClose,
}: {
  widthMm:  number;
  heightMm: number;
  bleedMm?: number;
  faces?:   "recto" | "recto-verso";
  onValidate: (rectoPng: string, versoPng: string | null) => void;
  onClose:  () => void;
}) {
  const [face, setFace] = useState<"front" | "back">("front");
  const [front, setFront] = useState<EditorObject[]>([]);
  const [back, setBack]   = useState<EditorObject[]>([]);
  const [histFront, setHistFront] = useState<EditorObject[][]>([]);
  const [histBack, setHistBack]   = useState<EditorObject[][]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // ─── Aperçu 3D rotatif ──────────────────────────────────────────────────
  const [view3D, setView3D] = useState(false);
  const [png3D, setPng3D] = useState<{ front: string; back: string | null } | null>(null);
  const [angle, setAngle] = useState(0);
  const [dragging3D, setDragging3D] = useState(false);
  const drag3DRef = useRef<{ x: number; a: number } | null>(null);

  const objects = face === "front" ? front : back;
  const setObjects = face === "front" ? setFront : setBack;
  const hist = face === "front" ? histFront : histBack;
  const setHist = face === "front" ? setHistFront : setHistBack;

  const fileRef  = useRef<HTMLInputElement>(null);

  const ratio = widthMm / heightMm;
  const STAGE_W = 520;
  const STAGE_H = Math.round(STAGE_W / ratio);
  const bleedFrac = bleedMm / widthMm;

  // ─── Historique (undo) ──────────────────────────────────────────────────
  const snapshot = useCallback(() => {
    setHist((h) => [...h.slice(-29), objects]);
  }, [objects, setHist]);

  const undo = () => {
    setHist((h) => {
      if (!h.length) return h;
      setObjects(h[h.length - 1]);
      return h.slice(0, -1);
    });
    setSelected(null);
  };

  // ─── Manipulation objets ────────────────────────────────────────────────
  const updateObj = useCallback((id: string, patch: Partial<EditorObject>) => {
    setObjects((arr) => arr.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, [setObjects]);

  const addObj = (o: EditorObject) => {
    snapshot();
    setObjects((a) => [...a, o]);
    setSelected(o.id);
  };

  const removeObj = (id: string) => {
    snapshot();
    setObjects((arr) => arr.filter((o) => o.id !== id));
    setSelected(null);
  };

  const duplicateObj = (id: string) => {
    const o = objects.find((x) => x.id === id);
    if (!o) return;
    const copy: EditorObject = { ...o, id: nextId(), x: Math.min(0.9, o.x + 0.04), y: Math.min(0.9, o.y + 0.04) };
    snapshot();
    setObjects((a) => [...a, copy]);
    setSelected(copy.id);
  };

  // Ordre des calques : avancer / reculer dans le tableau (= z-order au rendu).
  const moveLayer = (id: string, dir: 1 | -1) => {
    snapshot();
    setObjects((arr) => {
      const i = arr.findIndex((o) => o.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return arr;
      const next = [...arr];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const addText = () => addObj({ id: nextId(), type: "text", x: 0.2, y: 0.42, w: 0.6, h: 0.12, text: "Votre texte", color: "#2d2340", align: "center", fontFamily: FONTS[0].css });
  const addRect = () => addObj({ id: nextId(), type: "rect", x: 0.3, y: 0.35, w: 0.4, h: 0.3, fill: "#b13f74", stroke: "#b13f74", strokeW: 0, radius: 0.08 });
  const addEllipse = () => addObj({ id: nextId(), type: "ellipse", x: 0.35, y: 0.32, w: 0.3, h: 0.36, fill: "#e9d5e0", stroke: "#b13f74", strokeW: 0.004 });
  const addLine = () => addObj({ id: nextId(), type: "line", x: 0.25, y: 0.5, w: 0.5, h: 0.02, stroke: "#2d2340", strokeW: 0.006 });

  const addQr = async () => {
    const value = "https://www.exemple.fr";
    try {
      const url = await QRCode.toDataURL(value, { margin: 1, width: 512 });
      const s = 0.28;
      addObj({ id: nextId(), type: "qr", x: 0.66, y: 0.62, w: s, h: s * ratio, url, qrValue: value });
    } catch { /* noop */ }
  };

  const regenQr = useCallback(async (id: string, value: string) => {
    try {
      const url = await QRCode.toDataURL(value || " ", { margin: 1, width: 512 });
      updateObj(id, { qrValue: value, url });
    } catch { /* noop */ }
  }, [updateObj]);

  const applyTemplate = (build: () => EditorObject[]) => {
    snapshot();
    setObjects(build());
    setSelected(null);
    setShowTemplates(false);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const r = img.width / img.height;
        let w = 0.4, h = w / r * ratio;
        if (h > 0.5) { h = 0.5; w = h * r / ratio; }
        addObj({ id: nextId(), type: "image", x: (1 - w) / 2, y: (1 - h) / 2, w, h, url });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ─── Drag / resize (pointer) ────────────────────────────────────────────
  const dragRef = useRef<{ id: string; mode: "move" | "resize"; sx: number; sy: number; ox: EditorObject; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent, o: EditorObject, mode: "move" | "resize") => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { id: o.id, mode, sx: e.clientX, sy: e.clientY, ox: { ...o }, moved: false };
    setSelected(o.id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dxF = (e.clientX - d.sx) / STAGE_W;
    const dyF = (e.clientY - d.sy) / STAGE_H;
    if (!d.moved && (Math.abs(dxF) > 0.002 || Math.abs(dyF) > 0.002)) {
      d.moved = true;
      snapshot(); // capture l'état avant le déplacement (pour l'undo)
    }
    if (d.mode === "move") {
      updateObj(d.id, {
        x: Math.min(1 - d.ox.w, Math.max(-d.ox.w * 0.5, d.ox.x + dxF)),
        y: Math.min(1 - d.ox.h, Math.max(-d.ox.h * 0.5, d.ox.y + dyF)),
      });
    } else {
      updateObj(d.id, {
        w: Math.max(0.04, d.ox.w + dxF),
        h: Math.max(0.02, d.ox.h + dyF),
      });
    }
  };

  const onPointerUp = () => { dragRef.current = null; };

  // ─── Export PNG (face) — respecte l'ordre des calques ───────────────────
  const loadImage = (src: string) => new Promise<HTMLImageElement | null>((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });

  const renderFace = async (objs: EditorObject[]): Promise<string> => {
    const canvas = document.createElement("canvas");
    const W = canvas.width = Math.round(widthMm * PX_PER_MM);
    const H = canvas.height = Math.round(heightMm * PX_PER_MM);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Pré-charge les bitmaps (image + QR).
    const imgMap = new Map<string, HTMLImageElement>();
    await Promise.all(
      objs.filter((o) => (o.type === "image" || o.type === "qr") && o.url).map(async (o) => {
        const im = await loadImage(o.url!);
        if (im) imgMap.set(o.id, im);
      }),
    );

    for (const o of objs) {
      const x = o.x * W, y = o.y * H, w = o.w * W, h = o.h * H;
      if (o.type === "image" || o.type === "qr") {
        const im = imgMap.get(o.id);
        if (im) ctx.drawImage(im, x, y, w, h);
      } else if (o.type === "text") {
        const ph = h;
        ctx.fillStyle = o.color ?? "#2d2340";
        ctx.textBaseline = "middle";
        ctx.font = `${o.bold ? 700 : 500} ${Math.round(ph * 0.62)}px ${o.fontFamily ?? FONTS[0].css}`;
        ctx.textAlign = (o.align ?? "center") as CanvasTextAlign;
        const tx = o.align === "left" ? x : o.align === "right" ? x + w : x + w / 2;
        ctx.fillText(o.text ?? "", tx, y + ph / 2);
      } else if (o.type === "rect") {
        const r = (o.radius ?? 0) * h;
        ctx.beginPath();
        if (r > 0 && "roundRect" in ctx) {
          ctx.roundRect(x, y, w, h, r);
        } else {
          ctx.rect(x, y, w, h);
        }
        if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
        if (o.stroke && (o.strokeW ?? 0) > 0) { ctx.lineWidth = (o.strokeW ?? 0) * W; ctx.strokeStyle = o.stroke; ctx.stroke(); }
      } else if (o.type === "ellipse") {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
        if (o.stroke && (o.strokeW ?? 0) > 0) { ctx.lineWidth = (o.strokeW ?? 0) * W; ctx.strokeStyle = o.stroke; ctx.stroke(); }
      } else if (o.type === "line") {
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.lineWidth = Math.max(1, (o.strokeW ?? 0.006) * W);
        ctx.strokeStyle = o.stroke ?? "#2d2340";
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }
    return canvas.toDataURL("image/png");
  };

  const validate = async () => {
    setExporting(true);
    try {
      const recto = await renderFace(front);
      const verso = faces === "recto-verso" ? await renderFace(back) : null;
      onValidate(recto, verso);
    } finally {
      setExporting(false);
    }
  };

  // ─── Aperçu 3D ───────────────────────────────────────────────────────────
  const open3D = async () => {
    setExporting(true);
    try {
      const f = await renderFace(front);
      const b = faces === "recto-verso" ? await renderFace(back) : null;
      setPng3D({ front: f, back: b });
      setAngle(0);
      setView3D(true);
    } finally {
      setExporting(false);
    }
  };

  const on3DDown = (e: React.PointerEvent) => {
    drag3DRef.current = { x: e.clientX, a: angle };
    setDragging3D(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const on3DMove = (e: React.PointerEvent) => {
    const d = drag3DRef.current;
    if (!d) return;
    setAngle(d.a + (e.clientX - d.x) * 0.6);
  };
  const on3DUp = () => { drag3DRef.current = null; setDragging3D(false); };

  const CARD3D_W = Math.min(380, Math.round(widthMm * 4.2));
  const CARD3D_H = Math.round(CARD3D_W / ratio);
  const norm = ((angle % 360) + 360) % 360;
  const showingFront = norm < 90 || norm > 270;

  const selObj = objects.find((o) => o.id === selected) || null;
  const isShape = selObj && (selObj.type === "rect" || selObj.type === "ellipse" || selObj.type === "line");

  // Style d'un objet sur le plan de travail (DOM).
  const renderObjBody = (o: EditorObject) => {
    if (o.type === "image" || o.type === "qr") {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={o.url} alt="" className="h-full w-full object-contain" draggable={false} />;
    }
    if (o.type === "text") {
      return (
        <div className="flex h-full w-full items-center" style={{ justifyContent: o.align === "left" ? "flex-start" : o.align === "right" ? "flex-end" : "center" }}>
          <span style={{ color: o.color, fontFamily: o.fontFamily, fontSize: o.h * STAGE_H * 0.6, fontWeight: o.bold ? 700 : 500, lineHeight: 1, whiteSpace: "nowrap" }}>{o.text}</span>
        </div>
      );
    }
    if (o.type === "rect") {
      return <div className="h-full w-full" style={{ background: o.fill, border: (o.strokeW ?? 0) > 0 ? `${(o.strokeW ?? 0) * STAGE_W}px solid ${o.stroke}` : undefined, borderRadius: (o.radius ?? 0) * o.h * STAGE_H }} />;
    }
    if (o.type === "ellipse") {
      return <div className="h-full w-full" style={{ background: o.fill, border: (o.strokeW ?? 0) > 0 ? `${(o.strokeW ?? 0) * STAGE_W}px solid ${o.stroke}` : undefined, borderRadius: "50%" }} />;
    }
    // line
    return <div className="flex h-full w-full items-center"><div style={{ width: "100%", height: Math.max(1, (o.strokeW ?? 0.006) * STAGE_W), background: o.stroke, borderRadius: 999 }} /></div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-sm">
      <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col bg-white sm:my-6 sm:h-[calc(100%-3rem)] sm:rounded-2xl sm:shadow-2xl">

        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-[var(--hm-line)] px-5 py-3">
          <p className="text-sm font-bold text-[var(--hm-text)]">Atelier d&apos;édition</p>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[var(--hm-text-muted)] hover:bg-[var(--hm-surface)]"><X size={18} /></button>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--hm-line)] px-5 py-2.5">
          <ToolBtn icon={<ImagePlus size={14} />} label="Image" onClick={() => fileRef.current?.click()} />
          <ToolBtn icon={<Type size={14} />} label="Texte" onClick={addText} />
          <ToolBtn icon={<Square size={14} />} label="Rect." onClick={addRect} />
          <ToolBtn icon={<Circle size={14} />} label="Ellipse" onClick={addEllipse} />
          <ToolBtn icon={<Minus size={14} />} label="Ligne" onClick={addLine} />
          <ToolBtn icon={<QrCode size={14} />} label="QR" onClick={addQr} />

          {/* Modèles */}
          <div className="relative">
            <ToolBtn icon={<LayoutTemplate size={14} />} label="Modèles" onClick={() => setShowTemplates((v) => !v)} />
            {showTemplates && (
              <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-[var(--hm-line)] bg-white p-1 shadow-xl">
                {TEMPLATES.map((t) => (
                  <button key={t.label} type="button" onClick={() => applyTemplate(t.build)} className="block w-full rounded-lg px-3 py-2 text-left text-[12px] font-semibold text-[var(--hm-text)] hover:bg-[var(--hm-accent-soft-rose)]">
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mx-1 h-5 w-px bg-[var(--hm-line)]" />
          <ToolBtn icon={<Undo2 size={14} />} label="Annuler" onClick={undo} disabled={hist.length === 0} />

          {selected && (
            <>
              <ToolBtn icon={<Copy size={14} />} label="Dupliquer" onClick={() => duplicateObj(selected)} />
              <ToolBtn icon={<ArrowUp size={14} />} label="Avant" onClick={() => moveLayer(selected, 1)} />
              <ToolBtn icon={<ArrowDown size={14} />} label="Arrière" onClick={() => moveLayer(selected, -1)} />
              <button type="button" onClick={() => removeObj(selected)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50">
                <Trash2 size={14} /> Suppr.
              </button>
            </>
          )}

          <button type="button" onClick={open3D} disabled={exporting || front.length === 0} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[var(--hm-line)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--hm-text)] hover:border-[var(--hm-primary)] disabled:opacity-50">
            <Box size={14} /> Aperçu 3D
          </button>
          {faces === "recto-verso" && (
            <div className="flex gap-1 rounded-lg bg-[var(--hm-surface)] p-1">
              {(["front", "back"] as const).map((f) => (
                <button key={f} type="button" onClick={() => { setFace(f); setSelected(null); }}
                  className={`rounded-md px-3 py-1 text-[12px] font-bold ${face === f ? "bg-white text-[var(--hm-primary)] shadow-sm" : "text-[var(--hm-text-soft)]"}`}>
                  {f === "front" ? "Recto" : "Verso"}
                </button>
              ))}
            </div>
          )}
          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={onPickImage} />
        </div>

        {/* Plan de travail */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-[var(--hm-surface)] p-6" onPointerDown={() => { setSelected(null); setShowTemplates(false); }}>
          <div
            className="relative bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            style={{ width: STAGE_W, height: STAGE_H }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* Fond perdu + zone sécurité */}
            <div className="pointer-events-none absolute" style={{ inset: -bleedFrac * STAGE_W, border: "1.5px dashed rgba(239,68,68,0.7)" }} />
            <div className="pointer-events-none absolute" style={{ inset: bleedFrac * STAGE_W, border: "1px dashed rgba(34,197,94,0.6)" }} />

            {/* Objets (ordre = z-order) */}
            {objects.map((o) => (
              <div
                key={o.id}
                onPointerDown={(e) => onPointerDown(e, o, "move")}
                className={`absolute cursor-move select-none ${selected === o.id ? "outline outline-2 outline-[var(--hm-primary)]" : ""}`}
                style={{ left: o.x * STAGE_W, top: o.y * STAGE_H, width: o.w * STAGE_W, height: o.h * STAGE_H }}
              >
                {renderObjBody(o)}
                {selected === o.id && (
                  <span
                    onPointerDown={(e) => onPointerDown(e, o, "resize")}
                    className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-full border-2 border-white bg-[var(--hm-primary)]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Panneau propriété */}
        {selObj?.type === "text" && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--hm-line)] px-5 py-2.5">
            <input
              type="text"
              value={selObj.text ?? ""}
              onChange={(e) => updateObj(selObj.id, { text: e.target.value })}
              className="min-w-[140px] flex-1 rounded-lg border border-[var(--hm-line)] px-3 py-1.5 text-sm outline-none focus:border-[var(--hm-primary)]"
              placeholder="Texte"
            />
            <select value={selObj.fontFamily ?? FONTS[0].css} onChange={(e) => updateObj(selObj.id, { fontFamily: e.target.value })} className="rounded-lg border border-[var(--hm-line)] px-2 py-1.5 text-[12px] outline-none focus:border-[var(--hm-primary)]">
              {FONTS.map((f) => <option key={f.label} value={f.css}>{f.label}</option>)}
            </select>
            <button type="button" onClick={() => updateObj(selObj.id, { bold: !selObj.bold })} className={`rounded-md border px-2 py-1.5 ${selObj.bold ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]" : "border-[var(--hm-line)] text-[var(--hm-text-soft)]"}`}><Bold size={13} /></button>
            <input type="color" value={selObj.color ?? "#2d2340"} onChange={(e) => updateObj(selObj.id, { color: e.target.value })} className="h-8 w-9 cursor-pointer rounded border border-[var(--hm-line)]" />
            <div className="flex gap-1 rounded-lg bg-[var(--hm-surface)] p-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button key={a} type="button" onClick={() => updateObj(selObj.id, { align: a })}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${selObj.align === a ? "bg-white text-[var(--hm-primary)] shadow-sm" : "text-[var(--hm-text-soft)]"}`}>
                  {a === "left" ? "⇤" : a === "center" ? "↔" : "⇥"}
                </button>
              ))}
            </div>
          </div>
        )}

        {isShape && selObj && (
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hm-line)] px-5 py-2.5">
            {selObj.type !== "line" && (
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)]">
                Remplissage
                <input type="color" value={selObj.fill ?? "#b13f74"} onChange={(e) => updateObj(selObj.id, { fill: e.target.value })} className="h-7 w-9 cursor-pointer rounded border border-[var(--hm-line)]" />
              </label>
            )}
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)]">
              {selObj.type === "line" ? "Couleur" : "Contour"}
              <input type="color" value={selObj.stroke ?? "#2d2340"} onChange={(e) => updateObj(selObj.id, { stroke: e.target.value })} className="h-7 w-9 cursor-pointer rounded border border-[var(--hm-line)]" />
            </label>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)]">
              Épaisseur
              <input type="range" min={0} max={0.03} step={0.001} value={selObj.strokeW ?? 0} onChange={(e) => updateObj(selObj.id, { strokeW: Number(e.target.value) })} />
            </label>
            {selObj.type === "rect" && (
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)]">
                Arrondi
                <input type="range" min={0} max={0.5} step={0.02} value={selObj.radius ?? 0} onChange={(e) => updateObj(selObj.id, { radius: Number(e.target.value) })} />
              </label>
            )}
          </div>
        )}

        {selObj?.type === "qr" && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--hm-line)] px-5 py-2.5">
            <span className="text-[11px] font-semibold text-[var(--hm-text-soft)]">Contenu du QR</span>
            <input
              type="text"
              value={selObj.qrValue ?? ""}
              onChange={(e) => regenQr(selObj.id, e.target.value)}
              className="min-w-[200px] flex-1 rounded-lg border border-[var(--hm-line)] px-3 py-1.5 text-sm outline-none focus:border-[var(--hm-primary)]"
              placeholder="https://… ou texte"
            />
          </div>
        )}

        {/* Pied — valider */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--hm-line)] px-5 py-3">
          <p className="hidden text-[11px] text-[var(--hm-text-muted)] sm:block">Rouge = fond perdu · vert = zone sécurité (gardez le contenu à l&apos;intérieur).</p>
          <button type="button" onClick={validate} disabled={exporting || (front.length === 0)} className="btn-primary gap-2 disabled:opacity-60">
            <Check size={15} /> {exporting ? "Génération…" : "Valider ma carte"}
          </button>
        </div>

        {/* ── Overlay Aperçu 3D ─────────────────────────────────────────── */}
        {view3D && png3D && (
          <div className="absolute inset-0 z-10 flex flex-col bg-[#1a1622]/95 sm:rounded-2xl">
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-sm font-bold text-white">Aperçu 3D — {showingFront ? "Recto" : "Verso"}</p>
              <button type="button" onClick={() => setView3D(false)} className="rounded-full p-1.5 text-white/70 hover:bg-white/10"><X size={18} /></button>
            </div>

            <div
              className="flex flex-1 select-none items-center justify-center overflow-hidden"
              style={{ perspective: "1400px", cursor: dragging3D ? "grabbing" : "grab" }}
              onPointerDown={on3DDown}
              onPointerMove={on3DMove}
              onPointerUp={on3DUp}
              onPointerLeave={on3DUp}
            >
              <div
                style={{
                  width: CARD3D_W,
                  height: CARD3D_H,
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${angle}deg)`,
                  transition: dragging3D ? "none" : "transform 0.8s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{ backfaceVisibility: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={png3D.front} alt="Recto" className="h-full w-full object-cover" draggable={false} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  {png3D.back ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={png3D.back} alt="Verso" className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    <span className="text-[11px] font-semibold text-[var(--hm-text-muted)]">Verso vierge</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 px-5 py-4">
              <button type="button" onClick={() => setAngle(0)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">Recto</button>
              {faces === "recto-verso" && (
                <button type="button" onClick={() => setAngle(180)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">Verso</button>
              )}
              <button type="button" onClick={() => setAngle((a) => a + 360)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">
                <RotateCw size={13} /> Tour complet
              </button>
              <span className="ml-2 text-[11px] text-white/50">Glissez pour tourner</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bouton de barre d'outils ───────────────────────────────────────────────
function ToolBtn({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hm-line)] px-2.5 py-1.5 text-[12px] font-semibold text-[var(--hm-text)] hover:border-[var(--hm-primary)] disabled:opacity-40">
      {icon} {label}
    </button>
  );
}
