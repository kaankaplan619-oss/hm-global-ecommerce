"use client";

/**
 * components/product/UniversalMockupViewer.tsx
 *
 * Aperçu mockup universel pour les produits print / merch (cartes, flyers,
 * brochures, stickers, casquettes, bonnets, sacs, tabliers, mugs…).
 *
 * ⚠️ Ne remplace PAS `MockupViewer.tsx` (textile, B3.2-A2, Do-Not-Touch).
 *    Le textile continue d'utiliser MockupViewer ; ce composant cible les
 *    nouveaux produits via `data/mockup-products.ts` + l'API Mockey.ai.
 *
 * Fonctionnalités :
 *   - Accepte n'importe quel `mockupType` (print_flat / print_scene / embroidery / tshirt)
 *   - Génère le mockup via /api/mockups/generate (Mockey.ai server-side)
 *   - Skeleton loader pendant la génération
 *   - Bascule multi-angles (front / back / flat) selon le type de produit
 *   - Bouton "Télécharger le mockup" (JPG)
 *   - Responsive / mobile-first
 */

import { useCallback, useEffect, useState } from "react";
import { Download, ImageOff, Loader2 } from "lucide-react";
import type { MockupProduct, MockupType } from "@/data/mockup-products";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MockupAngle = "front" | "back" | "flat";

export interface UniversalMockupViewerProps {
  product: Pick<MockupProduct, "id" | "name" | "category" | "mockupType" | "printArea">;
  /** URL publique du design/logo à appliquer. Si absent → mockup de repli. */
  designUrl?: string | null;
  /** Override du template Mockey.ai (sinon dérivé de la catégorie + l'angle). */
  templateId?: string;
  /** Override des angles disponibles (sinon dérivés du mockupType). */
  angles?: MockupAngle[];
  badge?: string;
}

interface MockupApiResult {
  url: string;
  isFallback: boolean;
  source: "mockey" | "fallback";
  error?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const ANGLE_LABELS: Record<MockupAngle, string> = {
  front: "Face",
  back: "Dos",
  flat: "À plat",
};

/** Angles par défaut selon le type de mockup. */
function defaultAngles(type: MockupType): MockupAngle[] {
  switch (type) {
    case "print_flat":  return ["flat"];
    case "print_scene": return ["front", "back"];
    case "embroidery":  return ["front"];
    case "tshirt":      return ["front", "back"];
    default:            return ["front"];
  }
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function UniversalMockupViewer({
  product,
  designUrl,
  templateId,
  angles,
  badge,
}: UniversalMockupViewerProps) {
  const availableAngles = angles ?? defaultAngles(product.mockupType);
  const [angle, setAngle] = useState<MockupAngle>(availableAngles[0]);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);
  // Clé de la requête déjà résolue. Le loader est dérivé en comparant cette
  // clé à la clé courante (évite tout setState synchrone dans l'effet).
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);

  const effectiveTemplateId = templateId ?? `${product.category}-${angle}`;
  const requestKey = designUrl ? `${designUrl}::${effectiveTemplateId}` : null;

  // ── Génération du mockup ────────────────────────────────────────────────────
  // L'effet ne s'exécute que lorsqu'un design est présent. Le cas "pas de design"
  // et l'état de chargement sont dérivés au rendu (aucun setState synchrone ici).
  useEffect(() => {
    if (!requestKey) return;

    let cancelled = false;

    fetch("/api/mockups/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ designUrl, templateId: effectiveTemplateId }),
    })
      .then((r) => r.json() as Promise<MockupApiResult>)
      .then((result) => {
        if (cancelled) return;
        setMockupUrl(result.url);
        setErrored(result.isFallback);
      })
      .catch(() => {
        if (cancelled) return;
        setMockupUrl(null);
        setErrored(true);
      })
      .finally(() => {
        if (!cancelled) setResolvedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [designUrl, effectiveTemplateId, requestKey]);

  // ── Téléchargement JPG ──────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!mockupUrl) return;
    const filename = `${product.id}_${angle}_mockup.jpg`;
    try {
      const res = await fetch(mockupUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // CORS ou réseau : repli sur ouverture dans un nouvel onglet.
      window.open(mockupUrl, "_blank", "noopener,noreferrer");
    }
  }, [mockupUrl, product.id, angle]);

  const FALLBACK_URL = "/images/mockups/placeholder.png";
  // Valeurs dérivées : si pas de design, on ignore tout état de fetch.
  // Chargement = une requête est en cours (clé courante ≠ clé résolue).
  const loading = !!requestKey && resolvedKey !== requestKey;
  const showLoading = loading;
  const displayUrl = designUrl ? (mockupUrl ?? FALLBACK_URL) : FALLBACK_URL;
  const showFallbackBadge = !!designUrl && errored && !loading;
  const canDownload = !!designUrl && !!mockupUrl && !loading;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Zone d'aperçu ─────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-[28px] border border-[var(--hm-line)] bg-white shadow-[0_20px_48px_rgba(63,45,88,0.08)]"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Skeleton pendant la génération */}
        {showLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <Loader2 size={28} className="animate-spin text-[var(--hm-primary)]" />
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayUrl}
          alt={`Mockup ${product.name} — ${ANGLE_LABELS[angle]}`}
          className="h-full w-full object-contain"
          onError={() => setErrored(true)}
        />

        {/* Badge */}
        {badge && (
          <div className="pointer-events-none absolute left-4 top-4 z-10">
            <span className="badge badge-gold">{badge}</span>
          </div>
        )}

        {/* Indicateur fallback */}
        {showFallbackBadge && (
          <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
            <ImageOff size={11} />
            Aperçu de repli
          </div>
        )}

        {/* Disclaimer */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--hm-line)] bg-white/90 px-3 py-1 text-[10px] font-semibold text-[var(--hm-text-soft)]">
          Aperçu indicatif · rendu final validé avant production
        </div>
      </div>

      {/* ── Sélecteur d'angle ─────────────────────────────────────────────── */}
      {availableAngles.length > 1 && (
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${availableAngles.length}, minmax(0, 1fr))` }}>
          {availableAngles.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAngle(a)}
              className={`rounded-xl border py-2.5 text-xs font-semibold transition-all
                ${angle === a
                  ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] shadow-[0_4px_12px_rgba(177,63,116,0.12)]"
                  : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                }`}
            >
              {ANGLE_LABELS[a]}
            </button>
          ))}
        </div>
      )}

      {/* ── Téléchargement ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={!canDownload}
        className="flex items-center justify-center gap-2 rounded-xl border border-[var(--hm-line)] bg-white py-2.5 text-xs font-semibold text-[var(--hm-text)] transition-all hover:border-[var(--hm-primary)]/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={13} />
        Télécharger le mockup (JPG)
      </button>
    </div>
  );
}
