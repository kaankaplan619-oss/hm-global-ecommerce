"use client";

/**
 * CardSituationPreview.tsx — Aperçu « en situation » d'UNE carte de visite.
 *
 * V2 (2026-06-10, validé Kaan) : scène photo réelle « carte tenue en main »
 * (mockup Mockups Design, licence commerciale sans attribution). Le design
 * client est projeté en perspective (matrix3d) sur la carte via
 * PrintMockupPreview, et les doigts repassent devant grâce au patch
 * d'occlusion chroma-key. Effet Pixartprinting, 100 % maison, zéro service
 * tiers.
 */

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import PrintMockupPreview from "./PrintMockupPreview";
import { PRINT_MOCKUP_TEMPLATES } from "@/data/printMockupTemplates";

const HAND_SCENE = PRINT_MOCKUP_TEMPLATES.find(
  (t) => t.id === "business-card-hand-01",
)!;

export default function CardSituationPreview({
  frontUrl,
  backUrl,
}: {
  frontUrl: string | null;
  backUrl: string | null;
  /** Conservé pour compat appelant — les coins arrondis ne se distinguent
   *  pas à cette échelle sur la scène photo. */
  rounded?: boolean;
}) {
  const [face, setFace] = useState<"front" | "back">("front");
  const url = face === "front" ? frontUrl : backUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <PrintMockupPreview
        sceneImage={HAND_SCENE.sceneImage}
        sceneWidth={HAND_SCENE.sceneWidth!}
        sceneHeight={HAND_SCENE.sceneHeight!}
        printArea={HAND_SCENE.printArea}
        clientDesignUrl={url}
        whiteCardOverlay
        occlusionPatch={HAND_SCENE.occlusionPatch}
        alt={face === "front" ? "Votre carte tenue en main — recto" : "Votre carte tenue en main — verso"}
        className="w-full"
      />

      {/* Toggle recto / verso */}
      {backUrl && (
        <button
          type="button"
          onClick={() => setFace((f) => (f === "front" ? "back" : "front"))}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--hm-line)] bg-white px-4 py-2 text-[12px] font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]"
        >
          <RefreshCw size={13} /> {face === "front" ? "Voir le verso" : "Voir le recto"}
        </button>
      )}
    </div>
  );
}
