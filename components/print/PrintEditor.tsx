"use client";

/**
 * PrintEditor.tsx — Atelier d'édition de carte/print (Phase 1).
 *
 * Éditeur canvas maison (pas de Fabric.js, comme le Studio textile) :
 *   - Plan de travail au ratio du format, avec fond perdu / zone sécurité.
 *   - Objets : IMAGE (logo/visuel importé) et TEXTE, déplaçables et
 *     redimensionnables (poignée coin), sélection, suppression.
 *   - Faces recto / verso (jeux d'objets séparés).
 *   - Export : rend la face courante (ou les 2) en PNG haute résolution
 *     (~300 dpi) → sert de fichier d'impression / BAT / commande Gelato.
 *
 * Phases suivantes (à venir) : formes, QR code, modèles, vue 3D rotative,
 * bibliothèque d'éléments, polices.
 *
 * onValidate(rectoPng, versoPng|null) : appelé quand le client valide.
 */

import { useCallback, useRef, useState } from "react";
import { Type, ImagePlus, Trash2, X, Check, Box, RotateCw } from "lucide-react";

export interface EditorObject {
  id:       string;
  type:     "image" | "text";
  x:        number;  // position normalisée 0..1 (coin haut-gauche dans le format fini)
  y:        number;
  w:        number;  // largeur normalisée 0..1
  h:        number;  // hauteur normalisée 0..1
  url?:     string;  // image
  text?:    string;  // texte
  color?:   string;  // texte
  align?:   "left" | "center" | "right";
}

const PX_PER_MM = 11.8; // ~300 dpi

let __uid = 0;
const nextId = () => `o${++__uid}`;

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
  const [selected, setSelected] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // ─── Aperçu 3D rotatif ──────────────────────────────────────────────────
  const [view3D, setView3D] = useState(false);
  const [png3D, setPng3D] = useState<{ front: string; back: string | null } | null>(null);
  const [angle, setAngle] = useState(0);          // rotation Y en degrés
  const [dragging3D, setDragging3D] = useState(false);
  const drag3DRef = useRef<{ x: number; a: number } | null>(null);

  const objects = face === "front" ? front : back;
  const setObjects = face === "front" ? setFront : setBack;

  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const ratio = widthMm / heightMm;
  const STAGE_W = 520;
  const STAGE_H = Math.round(STAGE_W / ratio);
  const bleedFrac = bleedMm / widthMm;

  // ─── Manipulation objets ────────────────────────────────────────────────
  const updateObj = useCallback((id: string, patch: Partial<EditorObject>) => {
    setObjects((arr) => arr.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, [setObjects]);

  const removeObj = (id: string) => {
    setObjects((arr) => arr.filter((o) => o.id !== id));
    setSelected(null);
  };

  const addText = () => {
    const o: EditorObject = { id: nextId(), type: "text", x: 0.2, y: 0.42, w: 0.6, h: 0.12, text: "Votre texte", color: "#2d2340", align: "center" };
    setObjects((a) => [...a, o]);
    setSelected(o.id);
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
        const o: EditorObject = { id: nextId(), type: "image", x: (1 - w) / 2, y: (1 - h) / 2, w, h, url };
        setObjects((a) => [...a, o]);
        setSelected(o.id);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // ─── Drag / resize (pointer) ────────────────────────────────────────────
  const dragRef = useRef<{ id: string; mode: "move" | "resize"; sx: number; sy: number; ox: EditorObject } | null>(null);

  const onPointerDown = (e: React.PointerEvent, o: EditorObject, mode: "move" | "resize") => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { id: o.id, mode, sx: e.clientX, sy: e.clientY, ox: { ...o } };
    setSelected(o.id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dxF = (e.clientX - d.sx) / STAGE_W;
    const dyF = (e.clientY - d.sy) / STAGE_H;
    if (d.mode === "move") {
      updateObj(d.id, {
        x: Math.min(1 - d.ox.w, Math.max(-d.ox.w * 0.5, d.ox.x + dxF)),
        y: Math.min(1 - d.ox.h, Math.max(-d.ox.h * 0.5, d.ox.y + dyF)),
      });
    } else {
      updateObj(d.id, {
        w: Math.max(0.05, d.ox.w + dxF),
        h: Math.max(0.04, d.ox.h + dyF),
      });
    }
  };

  const onPointerUp = () => { dragRef.current = null; };

  // ─── Export PNG (face) ──────────────────────────────────────────────────
  const renderFace = (objs: EditorObject[]): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(widthMm * PX_PER_MM);
      canvas.height = Math.round(heightMm * PX_PER_MM);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawTexts = () => {
        objs.filter((o) => o.type === "text").forEach((o) => {
          const px = o.x * canvas.width, py = o.y * canvas.height;
          const ph = o.h * canvas.height;
          ctx.fillStyle = o.color ?? "#2d2340";
          ctx.textBaseline = "middle";
          ctx.font = `600 ${Math.round(ph * 0.62)}px Helvetica, Arial, sans-serif`;
          ctx.textAlign = (o.align ?? "center") as CanvasTextAlign;
          const tx = o.align === "left" ? px : o.align === "right" ? px + o.w * canvas.width : px + (o.w * canvas.width) / 2;
          ctx.fillText(o.text ?? "", tx, py + ph / 2);
        });
        resolve(canvas.toDataURL("image/png"));
      };

      const imgs = objs.filter((o) => o.type === "image");
      let pending = imgs.length;
      if (!pending) return drawTexts();
      imgs.forEach((o) => {
        const im = new Image();
        im.onload = () => {
          ctx.drawImage(im, o.x * canvas.width, o.y * canvas.height, o.w * canvas.width, o.h * canvas.height);
          if (--pending === 0) drawTexts();
        };
        im.onerror = () => { if (--pending === 0) drawTexts(); };
        im.src = o.url!;
      });
    });
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

  // ─── Aperçu 3D : génère les PNG puis ouvre l'overlay ────────────────────
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

  // Dimensions de la carte 3D (largeur fixe, hauteur selon ratio).
  const CARD3D_W = Math.min(380, Math.round(widthMm * 4.2));
  const CARD3D_H = Math.round(CARD3D_W / ratio);
  // Face actuellement vue (pour l'étiquette) — recto si |angle mod 360| < 90.
  const norm = ((angle % 360) + 360) % 360;
  const showingFront = norm < 90 || norm > 270;

  const selObj = objects.find((o) => o.id === selected) || null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col bg-white sm:my-6 sm:h-[calc(100%-3rem)] sm:rounded-2xl sm:shadow-2xl">

        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-[var(--hm-line)] px-5 py-3">
          <p className="text-sm font-bold text-[var(--hm-text)]">Atelier d&apos;édition</p>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[var(--hm-text-muted)] hover:bg-[var(--hm-surface)]"><X size={18} /></button>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--hm-line)] px-5 py-2.5">
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hm-line)] px-3 py-1.5 text-[12px] font-semibold text-[var(--hm-text)] hover:border-[var(--hm-primary)]">
            <ImagePlus size={14} /> Importer une image
          </button>
          <button type="button" onClick={addText} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hm-line)] px-3 py-1.5 text-[12px] font-semibold text-[var(--hm-text)] hover:border-[var(--hm-primary)]">
            <Type size={14} /> Ajouter du texte
          </button>
          {selected && (
            <button type="button" onClick={() => removeObj(selected)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50">
              <Trash2 size={14} /> Supprimer
            </button>
          )}
          <button type="button" onClick={open3D} disabled={exporting || front.length === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--hm-line)] px-3 py-1.5 text-[12px] font-semibold text-[var(--hm-text)] hover:border-[var(--hm-primary)] disabled:opacity-50">
            <Box size={14} /> Aperçu 3D
          </button>
          {faces === "recto-verso" && (
            <div className="ml-auto flex gap-1 rounded-lg bg-[var(--hm-surface)] p-1">
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
        <div className="flex flex-1 items-center justify-center overflow-auto bg-[var(--hm-surface)] p-6" onPointerDown={() => setSelected(null)}>
          <div
            ref={stageRef}
            className="relative bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            style={{ width: STAGE_W, height: STAGE_H }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {/* Fond perdu + zone sécurité */}
            <div className="pointer-events-none absolute" style={{ inset: -bleedFrac * STAGE_W, border: "1.5px dashed rgba(239,68,68,0.7)" }} />
            <div className="pointer-events-none absolute" style={{ inset: bleedFrac * STAGE_W, border: "1px dashed rgba(34,197,94,0.6)" }} />

            {/* Objets */}
            {objects.map((o) => (
              <div
                key={o.id}
                onPointerDown={(e) => onPointerDown(e, o, "move")}
                className={`absolute cursor-move select-none ${selected === o.id ? "outline outline-2 outline-[var(--hm-primary)]" : ""}`}
                style={{ left: o.x * STAGE_W, top: o.y * STAGE_H, width: o.w * STAGE_W, height: o.h * STAGE_H }}
              >
                {o.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.url} alt="" className="h-full w-full object-contain" draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center" style={{ justifyContent: o.align === "left" ? "flex-start" : o.align === "right" ? "flex-end" : "center" }}>
                    <span style={{ color: o.color, fontSize: o.h * STAGE_H * 0.6, fontWeight: 600, lineHeight: 1, whiteSpace: "nowrap" }}>{o.text}</span>
                  </div>
                )}
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

        {/* Panneau propriété texte */}
        {selObj?.type === "text" && (
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hm-line)] px-5 py-2.5">
            <input
              type="text"
              value={selObj.text ?? ""}
              onChange={(e) => updateObj(selObj.id, { text: e.target.value })}
              className="min-w-[160px] flex-1 rounded-lg border border-[var(--hm-line)] px-3 py-1.5 text-sm outline-none focus:border-[var(--hm-primary)]"
              placeholder="Texte"
            />
            <input type="color" value={selObj.color ?? "#2d2340"} onChange={(e) => updateObj(selObj.id, { color: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-[var(--hm-line)]" />
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

        {/* Pied — valider */}
        <div className="flex items-center justify-between gap-3 border-t border-[var(--hm-line)] px-5 py-3">
          <p className="text-[11px] text-[var(--hm-text-muted)]">Glissez le rouge = fond perdu · vert = zone sécurité (gardez le texte à l&apos;intérieur).</p>
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

            {/* Scène 3D */}
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
                {/* Recto */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={png3D.front} alt="Recto" className="h-full w-full object-cover" draggable={false} />
                </div>
                {/* Verso (retourné de 180°) */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {png3D.back ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={png3D.back} alt="Verso" className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    <span className="text-[11px] font-semibold text-[var(--hm-text-muted)]">Verso vierge</span>
                  )}
                </div>
              </div>
            </div>

            {/* Contrôles */}
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
