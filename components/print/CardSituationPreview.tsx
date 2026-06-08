"use client";

/**
 * CardSituationPreview.tsx — Aperçu « en situation » d'UNE carte de visite.
 *
 * Scène 100 % maison (CSS) : aucune image stock, donc aucun problème de droits
 * d'auteur / watermark. Une seule carte (le visuel du client) posée sur une
 * surface neutre élégante, légèrement inclinée, avec une ombre réaliste et un
 * reflet doux. Couleurs cohérentes avec la marque HM Global.
 *
 * Remplace l'ancien mockup tiers (Mockups Design / "Pastel") qui affichait
 * plusieurs cartes roses + un filigrane.
 */

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function CardSituationPreview({
  frontUrl,
  backUrl,
  rounded = false,
}: {
  frontUrl: string | null;
  backUrl: string | null;
  rounded?: boolean;
}) {
  const [face, setFace] = useState<"front" | "back">("front");
  const url = face === "front" ? frontUrl : backUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Scène */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          aspectRatio: "16 / 10",
          // Surface neutre douce + légère teinte de marque, deux tons en
          // diagonale (effet « coin de bureau »).
          background:
            "linear-gradient(135deg, #f6f3ef 0%, #f6f3ef 46%, #ece6ef 46%, #e7dfee 100%)",
        }}
      >
        {/* Halo de lumière douce */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 30% 18%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 55%)" }}
        />

        {/* Carte unique */}
        <div className="absolute inset-0 flex items-center justify-center p-[7%]">
          <div
            className="relative"
            style={{
              width: "70%",
              aspectRatio: "85 / 55",
              transform: "rotate(-6deg)",
              borderRadius: rounded ? "min(4%, 14px)" : 6,
              overflow: "hidden",
              background: "#ffffff",
              boxShadow:
                "0 26px 50px -12px rgba(45,35,64,0.45), 0 8px 18px -8px rgba(45,35,64,0.30)",
            }}
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={face === "front" ? "Recto en situation" : "Verso en situation"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#f9f8fb] text-[11px] text-[var(--hm-text-muted)]">
                Votre carte
              </div>
            )}
            {/* Reflet de surface (léger lustre) */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(115deg, rgba(255,255,255,0) 60%, rgba(255,255,255,0.20) 72%, rgba(255,255,255,0) 82%)" }}
            />
          </div>
        </div>

        {/* Mention */}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)] backdrop-blur">
          Aperçu indicatif · BAT validé avant production
        </span>
      </div>

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
