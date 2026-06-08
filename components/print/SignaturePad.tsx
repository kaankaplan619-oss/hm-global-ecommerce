"use client";

/**
 * SignaturePad.tsx — Zone de signature manuscrite (souris ou doigt).
 *
 * Le client signe son Bon à Tirer directement à l'écran (pointer events →
 * compatible souris ET tactile mobile). onChange(dataUrl|null) renvoie l'image
 * PNG de la signature (ou null si effacée / vide).
 */

import { useEffect, useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";

export default function SignaturePad({
  onChange,
  height = 150,
}: {
  onChange: (dataUrl: string | null) => void;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const dirty = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  // Initialise la résolution interne du canvas (densité écran) une fois monté.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(3, Math.max(1, Math.round((typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1)));
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2d2340";
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!dirty.current) { dirty.current = true; setHasInk(true); }
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (dirty.current) {
      const url = canvasRef.current?.toDataURL("image/png") ?? null;
      onChange(url);
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ height, touchAction: "none" }}
          className="w-full cursor-crosshair rounded-xl border border-[var(--hm-line)] bg-white"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-[12px] text-[var(--hm-text-muted)]">
            <PenLine size={14} /> Signez ici (souris ou doigt)
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] hover:text-red-500"
      >
        <Eraser size={12} /> Effacer la signature
      </button>
    </div>
  );
}
