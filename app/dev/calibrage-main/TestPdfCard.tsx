"use client";

/** Test DEV — pipeline complet production : PDF réel (carte Miguel Gonçalves)
 *  → renderPdfPageToPng (pdf.js, comme l'upload client) → CardSituationPreview
 *  (projection perspective sur la main). */

import { useEffect, useState } from "react";
import CardSituationPreview from "@/components/print/CardSituationPreview";
import { renderPdfPageToPng } from "@/lib/pdf-preview";

export default function TestPdfCard() {
  const [front, setFront] = useState<string | null>(null);
  const [status, setStatus] = useState("Conversion du PDF…");

  useEffect(() => {
    renderPdfPageToPng("/dev-comparatif/carte-miguel.pdf", 1, 1200).then((png) => {
      if (png) { setFront(png); setStatus("OK"); }
      else setStatus("ÉCHEC conversion PDF");
    });
  }, []);

  return (
    <div>
      <p className="mb-3 text-xs font-semibold text-[var(--hm-text-soft)]">
        Pipeline PDF réel : {status}
      </p>
      {front && <CardSituationPreview frontUrl={front} backUrl={null} />}
    </div>
  );
}
