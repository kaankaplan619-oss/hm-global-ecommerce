"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { formatPrice, computeUnitPrice, PRICING_CONFIG } from "@/data/pricing";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { StudioObject } from "./StudioCanvas";
import type { Product, Placement, Technique, ProductColor } from "@/types";

const TECHNIQUE_LABELS: Record<Technique, string> = {
  dtf:      "DTF",
  flex:     "Flex",
  broderie: "Broderie",
};

const PLACEMENT_LABELS: Record<Placement, string> = {
  coeur:      "Cœur (poitrine)",
  dos:        "Dos",
  "coeur-dos": "Cœur + Dos",
};

interface Props {
  product: Product;
  objects: StudioObject[];
  onRemoveObject: (id: string) => void;
  selectedColor: ProductColor | null;
  selectedSize: string;
  technique: Technique;
  placement: Placement;
  quantity: number;
  slug: string;
  exportPNG: () => string;
}

export default function StudioSummaryPanel({
  product,
  objects,
  onRemoveObject,
  selectedColor,
  selectedSize,
  technique,
  placement,
  quantity,
  slug,
  exportPNG,
}: Props) {
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePrice = product.pricing[technique] ?? 0;
  const unitPrice = computeUnitPrice({ basePrice, technique, placement });
  const totalTTC  = Math.round(unitPrice * quantity * 100) / 100;
  const freeShip  = quantity >= PRICING_CONFIG.freeShippingThreshold;
  const shipping  = freeShip ? 0 : PRICING_CONFIG.shippingCost;

  const handleValidate = async () => {
    setValidating(true);
    setError(null);

    try {
      // 1. Export PNG
      const dataURL = exportPNG();
      if (!dataURL) throw new Error("Impossible d'exporter le canvas.");

      // 2. Convert to Blob → File
      const res = await fetch(dataURL);
      const blob = await res.blob();
      const timestamp = Date.now();
      const filename = `studio-export-${timestamp}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      // 3. Upload to Supabase Storage
      const supabase = getSupabaseBrowserClient();
      const storagePath = `studio-exports/${timestamp}.png`;
      const { error: uploadError } = await supabase.storage
        .from("customer-logos")
        .upload(storagePath, file, { contentType: "image/png", upsert: false });

      if (uploadError) throw new Error(`Upload échoué : ${uploadError.message}`);

      // 4. Get public URL
      const { data: urlData } = supabase.storage
        .from("customer-logos")
        .getPublicUrl(storagePath);

      const logoFileUrl = urlData?.publicUrl ?? "";

      // 5. Save in sessionStorage
      const studioResult = {
        logoFileUrl,
        logoFileName: filename,
        logoFilePath: storagePath,
        logoFileType: "image/png",
        logoFileSize: file.size,
        batRef:       null,
        logoPlacementTransform: null,
        colorId:   selectedColor?.id ?? "",
        size:      selectedSize,
        technique,
        quantity,
        placement,
      };
      sessionStorage.setItem("hm-studio-result", JSON.stringify(studioResult));

      // 6. Redirect
      const params = new URLSearchParams({
        studio:    "1",
        couleur:   selectedColor?.id ?? "",
        taille:    selectedSize,
        technique,
        quantite:  String(quantity),
      });
      window.location.href = `/produits/${slug}?${params.toString()}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(msg);
      setValidating(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* ── Objects list ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
          Éléments sur le canvas
        </p>
        {objects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--hm-line)] bg-[var(--hm-bg)] px-4 py-6 text-center">
            <p className="text-xs text-[var(--hm-text-muted)]">
              Aucun élément ajouté. Utilisez les outils à gauche.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {objects.map((obj) => (
              <div
                key={obj.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2"
              >
                {/* Miniature 32×32 */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--hm-bg)]">
                  {obj.type === "text" ? (
                    <span
                      className="text-base font-bold leading-none text-[var(--hm-text)]"
                      style={{ fontFamily: obj.fontFamily ?? "Arial", color: obj.color ?? "#000" }}
                    >
                      T
                    </span>
                  ) : obj.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={obj.src} alt={obj.label} className="h-6 w-6 object-contain" />
                  ) : obj.file ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(obj.file)}
                      alt={obj.label}
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-[var(--hm-text-muted)]">?</span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                  <span className="truncate text-xs font-semibold text-[var(--hm-text)]">
                    {obj.label}
                  </span>
                  <span className="text-[10px] text-[var(--hm-text-muted)] capitalize">
                    {obj.type === "logo" ? "Logo" : obj.type === "text" ? "Texte" : "Design"} · {obj.face === "front" ? "Face" : "Dos"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveObject(obj.id)}
                  className="shrink-0 rounded-lg p-1 text-[var(--hm-text-soft)] transition hover:bg-red-50 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Order summary ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
          Récapitulatif commande
        </p>

        <div className="flex flex-col gap-2 text-sm">
          {/* Technique */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--hm-text-soft)]">Technique</span>
            <span className="font-semibold text-[var(--hm-text)]">{TECHNIQUE_LABELS[technique]}</span>
          </div>

          {/* Couleur */}
          {selectedColor && (
            <div className="flex items-center justify-between">
              <span className="text-[var(--hm-text-soft)]">Couleur</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-[var(--hm-line)]"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span className="font-semibold text-[var(--hm-text)]">{selectedColor.label}</span>
              </div>
            </div>
          )}

          {/* Taille */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--hm-text-soft)]">Taille</span>
            <span className="font-semibold text-[var(--hm-text)]">
              {selectedSize || <span className="text-amber-500">Non sélectionnée</span>}
            </span>
          </div>

          {/* Placement */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--hm-text-soft)]">Placement</span>
            <span className="font-semibold text-[var(--hm-text)]">{PLACEMENT_LABELS[placement]}</span>
          </div>

          {/* Quantité */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--hm-text-soft)]">Quantité</span>
            <span className="font-semibold text-[var(--hm-text)]">{quantity} pcs</span>
          </div>

          <div className="my-1 h-px bg-[var(--hm-line)]" />

          {/* Prix unitaire */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--hm-text-soft)]">Prix unitaire TTC</span>
            <span className="font-semibold text-[var(--hm-text)]">{formatPrice(unitPrice)}</span>
          </div>

          {/* Total TTC */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-[var(--hm-text)]">Total TTC</span>
            <span className="text-lg font-black text-[var(--hm-primary)]">{formatPrice(totalTTC)}</span>
          </div>

          {/* Livraison */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--hm-text-soft)]">Livraison</span>
            {freeShip ? (
              <span className="flex items-center gap-1 font-semibold text-green-600">
                <CheckCircle2 size={12} /> Offerte
              </span>
            ) : (
              <span className="font-semibold text-[var(--hm-text)]">{formatPrice(shipping)}</span>
            )}
          </div>

          {!freeShip && (
            <p className="text-[10px] text-[var(--hm-text-muted)]">
              Livraison offerte dès {PRICING_CONFIG.freeShippingThreshold} pièces
            </p>
          )}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <button
        type="button"
        disabled={validating || objects.length === 0}
        onClick={handleValidate}
        className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {validating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Export en cours…
          </>
        ) : (
          <>
            ✅ Valider ma personnalisation
          </>
        )}
      </button>

      {objects.length === 0 && (
        <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
          Ajoutez au moins un élément pour valider.
        </p>
      )}
    </div>
  );
}
