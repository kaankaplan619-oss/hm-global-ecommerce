"use client";

/**
 * Card3DViewer.tsx — Aperçu 3D rotatif d'une carte (recto/verso).
 *
 * Reçoit deux images affichables (PNG/JPG : aperçus recto/verso) et les
 * présente sur une carte 3D (perspective CSS) que l'on fait tourner à la
 * souris ou au doigt. Boutons Recto / Verso / Tour complet.
 *
 * Utilisé dans l'étape BAT (fichiers uploadés) et réutilisable ailleurs.
 */

import { useRef, useState } from "react";
import { X, RotateCw } from "lucide-react";

export default function Card3DViewer({
  rectoUrl,
  versoUrl,
  widthMm,
  heightMm,
  onClose,
}: {
  rectoUrl: string;
  versoUrl: string | null;
  widthMm: number;
  heightMm: number;
  onClose: () => void;
}) {
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; a: number } | null>(null);

  const ratio = widthMm / heightMm;
  const W = Math.min(380, Math.round(widthMm * 4.2));
  const H = Math.round(W / ratio);
  const norm = ((angle % 360) + 360) % 360;
  const showingFront = norm < 90 || norm > 270;

  const down = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, a: angle };
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setAngle(d.a + (e.clientX - d.x) * 0.6);
  };
  const up = () => { dragRef.current = null; setDragging(false); };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1622]/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 py-3">
        <p className="text-sm font-bold text-white">Aperçu 3D — {showingFront ? "Recto" : "Verso"}</p>
        <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white/70 hover:bg-white/10"><X size={18} /></button>
      </div>

      <div
        className="flex flex-1 select-none items-center justify-center overflow-hidden"
        style={{ perspective: "1400px", cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      >
        <div
          style={{
            width: W,
            height: H,
            transformStyle: "preserve-3d",
            transform: `rotateY(${angle}deg)`,
            transition: dragging ? "none" : "transform 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{ backfaceVisibility: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rectoUrl} alt="Recto" className="h-full w-full object-cover" draggable={false} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            {versoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={versoUrl} alt="Verso" className="h-full w-full object-cover" draggable={false} />
            ) : (
              <span className="text-[11px] font-semibold text-[var(--hm-text-muted)]">Verso vierge</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 px-5 py-4">
        <button type="button" onClick={() => setAngle(0)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">Recto</button>
        {versoUrl && (
          <button type="button" onClick={() => setAngle(180)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">Verso</button>
        )}
        <button type="button" onClick={() => setAngle((a) => a + 360)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">
          <RotateCw size={13} /> Tour complet
        </button>
        <span className="ml-2 text-[11px] text-white/50">Glissez pour tourner</span>
      </div>
    </div>
  );
}
