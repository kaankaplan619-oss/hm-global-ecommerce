"use client";

/**
 * PdfPagePreview.tsx
 *
 * Rend une page d'un PDF (URL Supabase) en image dans l'aperçu print.
 * Un <img> ne peut pas afficher un PDF → on utilise pdf.js pour dessiner la
 * page sur un <canvas>. Le client voit ainsi SON visuel réel dans le format,
 * avec les zones de fond perdu / sécurité par-dessus.
 *
 * Worker pdf.js servi depuis /public/pdf.worker.min.mjs (copié à l'install).
 * En cas d'échec (CORS, PDF protégé…), on retombe sur un fallback "PDF chargé".
 */

import { useEffect, useRef, useState } from "react";

export default function PdfPagePreview({
  url,
  page = 1,
  className = "",
}: {
  url: string;
  page?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus("loading");
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const doc = await pdfjs.getDocument({ url }).promise;
        const pageNum = Math.min(Math.max(1, page), doc.numPages);
        const pg = await doc.getPage(pageNum);

        // Rendu net : largeur cible ~700 px.
        const base = pg.getViewport({ scale: 1 });
        const scale = 700 / base.width;
        const viewport = pg.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) { setStatus("error"); return; }
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await pg.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setStatus("ok");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [url, page]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full object-cover"
        style={{ display: status === "ok" ? "block" : "none" }}
      />
      {status === "loading" && (
        <div className="flex h-full w-full items-center justify-center bg-[#f9f8fb]">
          <span className="text-[10px] text-[var(--hm-text-muted)]">Rendu du PDF…</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[#f9f8fb] px-3 text-center">
          <span className="text-[10px] font-semibold text-[var(--hm-text-soft)]">PDF chargé ✓</span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-[var(--hm-primary)] hover:underline">
            Ouvrir le PDF →
          </a>
        </div>
      )}
    </div>
  );
}
