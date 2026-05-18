"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, X, ArrowLeft, ShoppingCart, RotateCcw, Shirt } from "lucide-react";
import { formatPrice, PRICING_CONFIG, getVolumePricedRate } from "@/data/pricing";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCartStore } from "@/store/cart";
import type { StudioObject } from "./StudioCanvas";
import type { Product, Placement, Technique, ProductColor, CartFile } from "@/types";

const TECHNIQUE_LABELS: Record<Technique, string> = {
  dtf:                "DTF",
  dtflex:             "DTFlex",
  flex:               "Flex",
  broderie:           "Broderie",
  broderie_illimitee: "Broderie · Illimitée",
  print:              "Impression",
};

const PLACEMENT_LABELS: Record<Placement, string> = {
  coeur:      "Cœur (poitrine)",
  dos:        "Dos",
  "coeur-dos": "Cœur + Dos",
};

// ── State de prévisualisation avant confirmation ──────────────────────────────
interface PreviewState {
  composedFront: string;
  composedBack:  string;
  studioResult:  Record<string, unknown>;
  redirectUrl:   string;
}

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
  exportComposed?: () => Promise<{ front: string; back: string }>;
  /** Taille reelle du canvas studio (px) — fournie par StudioCanvasHandle. */
  getContainerSize?: () => number;
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
  exportComposed,
  getContainerSize,
}: Props) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [validating,   setValidating]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  // Étape de confirmation — null = pas encore lancée
  const [preview,      setPreview]      = useState<PreviewState | null>(null);
  const [previewFace,  setPreviewFace]  = useState<0 | 1>(0); // 0=face, 1=dos
  const [confirming,   setConfirming]   = useState(false);
  // Sélecteurs éditables dans la modale (initialisés depuis les props, modifiables en place)
  const [modalSize,    setModalSize]    = useState(selectedSize);
  const [modalQty,     setModalQty]     = useState(quantity);

  // Dans la modale, on utilise modalQty (éditable) pour le calcul du total
  const activeQty = preview ? modalQty : quantity;
  // Prix de base : utilise les paliers volume par technique si disponibles
  const activeTiers = product.volumePricingByTechnique?.[technique] ?? product.volumePricing ?? null;
  const basePrice = activeTiers
    ? getVolumePricedRate(activeTiers, activeQty)
    : (product.pricing[technique as Exclude<typeof technique, "print">] ?? 0);
  const isBroderieFamily = technique === "broderie" || technique === "broderie_illimitee";
  const placementSurcharge = isBroderieFamily
    ? (product.pricing.broDeriePlacementSurcharge?.[placement] ?? 0)
    : (product.pricing.placements?.[placement] ?? 0);
  const unitPrice = Math.round((basePrice + placementSurcharge) * 100) / 100;
  const totalTTC  = Math.round(unitPrice * activeQty * 100) / 100;
  const freeShip  = activeQty >= PRICING_CONFIG.freeShippingThreshold;
  const shipping  = freeShip ? 0 : PRICING_CONFIG.shippingCost;

  // ── Étape 1 : exporter + afficher aperçu ─────────────────────────────────
  const handleValidate = async () => {
    setValidating(true);
    setError(null);

    try {
      const timestamp = Date.now();

      // ── Logo URL ────────────────────────────────────────────────────────
      const logoObj = objects.find(o => o.type === "logo") ?? objects.find(o => o.type === "design");

      let logoFileUrl  = "";
      let logoFileName = `studio-export-${timestamp}.png`;
      let logoFileType = "image/png";
      let logoFileSize = 0;
      let storagePath  = `studio-exports/${timestamp}.png`;

      if (logoObj?.file) {
        logoFileUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Impossible de lire le fichier logo."));
          reader.readAsDataURL(logoObj.file!);
        });
        logoFileName = logoObj.file.name;
        logoFileType = logoObj.file.type || "image/png";
        logoFileSize = logoObj.file.size;
        storagePath  = `studio-exports/${timestamp}-${logoObj.file.name}`;

        void (async () => {
          try {
            const supabase = getSupabaseBrowserClient();
            await supabase.storage
              .from("customer-logos")
              .upload(storagePath, logoObj.file!, { contentType: logoFileType, upsert: true });
          } catch { /* silent */ }
        })();

      } else if (logoObj?.src) {
        logoFileUrl  = logoObj.src;
        logoFileName = logoObj.src.split("/").pop() ?? "design.svg";
        logoFileType = "image/svg+xml";
        storagePath  = logoObj.src;

      } else {
        const dataURL = exportPNG();
        if (!dataURL) throw new Error("Impossible d'exporter le canvas.");
        logoFileUrl  = dataURL;
        logoFileSize = Math.round(dataURL.length * 0.75);

        void (async () => {
          try {
            const res  = await fetch(dataURL);
            const blob = await res.blob();
            const file = new File([blob], logoFileName, { type: "image/png" });
            const supabase = getSupabaseBrowserClient();
            await supabase.storage
              .from("customer-logos")
              .upload(storagePath, file, { contentType: "image/png", upsert: true });
          } catch { /* silent */ }
        })();
      }

      // ── Position du premier objet ────────────────────────────────────────
      const firstObj = objects.find(o => o.type === "logo") ?? objects[0];
      // canvasSize : taille reelle mesuree par StudioCanvas (ResizeObserver),
      // pas une valeur hardcodee. Fallback 544 si le canvas n'est pas encore monte.
      const measuredCanvasSize = getContainerSize?.() || 544;
      const logoPlacementTransform = firstObj?.fabricState
        ? {
            left:   firstObj.fabricState.left   ?? 0,
            top:    firstObj.fabricState.top    ?? 0,
            scaleX: firstObj.fabricState.scaleX ?? 1,
            scaleY: firstObj.fabricState.scaleY ?? 1,
            width:  firstObj.fabricState.width  ?? 0,
            height: firstObj.fabricState.height ?? 0,
            angle:  firstObj.fabricState.angle  ?? 0,
            canvasSize: measuredCanvasSize,
            source: "fabric-canvas" as const,
          }
        : null;

      // ── Export des deux faces ────────────────────────────────────────────
      let composedFront = "";
      let composedBack  = "";
      try {
        if (exportComposed) {
          const { front, back } = await exportComposed();
          composedFront = front;
          composedBack  = back;
        } else {
          const fullPNG = exportPNG();
          if (fullPNG) composedFront = fullPNG;
        }
      } catch { /* non bloquant */ }

      // ── Préparer le résultat à stocker (pas encore sauvé) ────────────────
      const studioResult = {
        logoFileUrl,
        logoFileName,
        logoFilePath: storagePath,
        logoFileType,
        logoFileSize,
        batRef:       null,
        logoPlacementTransform,
        colorId:   selectedColor?.id ?? "",
        size:      selectedSize,
        technique,
        quantity,
        placement,
        composedFront,
        composedBack,
      };

      const params = new URLSearchParams({
        studio:   "1",
        couleur:  selectedColor?.id ?? "",
        taille:   selectedSize,
        technique,
        quantite: String(quantity),
      });
      const redirectUrl = `/produits/${slug}?${params.toString()}`;

      // ── Afficher l'aperçu — l'utilisateur confirme avant de partir ───────
      setModalSize(selectedSize);
      setModalQty(quantity);
      setPreviewFace(0);
      setPreview({ composedFront, composedBack, studioResult, redirectUrl });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(msg);
    } finally {
      setValidating(false);
    }
  };

  // ── Étape 2 : confirmation → ajouter directement au panier ──────────────
  const handleConfirm = () => {
    if (!preview || !modalSize || !selectedColor) return;
    setConfirming(true);
    try {
      const sr = preview.studioResult;

      // Construire le CartFile depuis les infos du logo exporté
      const logoFile: CartFile | undefined =
        sr.logoFileUrl && sr.logoFileName
          ? {
              name: sr.logoFileName as string,
              size: (sr.logoFileSize as number) ?? 0,
              type: (sr.logoFileType as string) ?? "image/png",
              url:  sr.logoFileUrl as string,
              path: (sr.logoFilePath as string) ?? "",
            }
          : undefined;

      // Ajouter au panier directement — pas de passage par la fiche produit
      addItem({
        product,
        quantity:  modalQty,
        size:      modalSize,
        color:     selectedColor,
        technique,
        placement,
        logoFile,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logoPlacementTransform: (sr.logoPlacementTransform as any) ?? undefined,
        composedPreviewUrl:  preview.composedFront  || undefined,
        composedPreviewBack: preview.composedBack   || undefined,
      });

      // Navigation client-side → store Zustand conservé en mémoire avec les images
      router.push("/panier");
    } catch {
      setConfirming(false);
      setError("Erreur lors de l'ajout au panier. Réessayez.");
    }
  };

  // ── Images disponibles pour la prévisualisation ───────────────────────────
  const previewImages = preview
    ? [preview.composedFront, preview.composedBack].filter(Boolean)
    : [];
  const previewSrc = previewImages[previewFace] ?? previewImages[0] ?? "";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          MODALE DE CONFIRMATION — portée sur document.body via createPortal
          pour échapper au stacking context de la sidebar overflow-y-auto.
          ════════════════════════════════════════════════════════════════════ */}
      {preview && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.35)]">

            {/* ── En-tête ── */}
            <div className="flex items-center justify-between border-b border-[var(--hm-line)] px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--hm-primary)]">
                  Aperçu de votre personnalisation
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--hm-text-soft)]">
                  Vérifiez le rendu avant d'ajouter au panier
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--hm-line)] text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Corps — image + récap ── */}
            <div className="flex flex-col gap-0 sm:flex-row">

              {/* Image composée */}
              <div className="relative flex flex-col items-center justify-center gap-3 bg-[#f7f6f4] p-6 sm:w-[55%]">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt="Aperçu personnalisation"
                    className="h-auto max-h-72 w-full object-contain"
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center rounded-2xl bg-[var(--hm-bg)] text-[var(--hm-text-muted)] text-xs">
                    Aperçu non disponible
                  </div>
                )}

                {/* Switcher face / dos */}
                {previewImages.length > 1 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewFace(0)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold transition ${
                        previewFace === 0
                          ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                          : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
                      }`}
                    >
                      <Shirt size={11} /> Face
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFace(1)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold transition ${
                        previewFace === 1
                          ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                          : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
                      }`}
                    >
                      <RotateCcw size={11} /> Dos
                    </button>
                  </div>
                )}

                {previewImages.length === 1 && (
                  <p className="text-[10px] text-[var(--hm-text-muted)]">
                    {preview.composedFront ? "Vue face" : "Vue dos"}
                  </p>
                )}
              </div>

              {/* Récapitulatif + actions */}
              <div className="flex flex-1 flex-col justify-between gap-4 p-6">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--hm-text-soft)]">
                    Récapitulatif
                  </p>

                  <div className="flex flex-col gap-2 text-sm">
                    {/* Produit */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--hm-text-soft)]">Produit</span>
                      <span className="text-right font-semibold text-[var(--hm-text)] leading-snug">{product.shortName}</span>
                    </div>

                    {/* Technique */}
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--hm-text-soft)]">Technique</span>
                      <span className="font-semibold text-[var(--hm-text)]">{TECHNIQUE_LABELS[technique]}</span>
                    </div>

                    {/* Couleur */}
                    {selectedColor && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--hm-text-soft)]">Couleur</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-[var(--hm-line)]"
                            style={{ backgroundColor: selectedColor.hex }}
                          />
                          <span className="font-semibold text-[var(--hm-text)]">{selectedColor.label}</span>
                        </div>
                      </div>
                    )}

                    {/* Taille — sélecteur interactif */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--hm-text-soft)]">Taille</span>
                        {!modalSize && <span className="text-[10px] text-amber-500 font-semibold">Obligatoire !</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.filter((s) => s.available).map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            disabled={s.soldOut}
                            onClick={() => setModalSize(s.label)}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                              modalSize === s.label
                                ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                                : "border-[var(--hm-line)] bg-[var(--hm-bg)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]"
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Placement */}
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--hm-text-soft)]">Placement</span>
                      <span className="font-semibold text-[var(--hm-text)]">{PLACEMENT_LABELS[placement]}</span>
                    </div>

                    {/* Quantité — sélecteur +/- interactif */}
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--hm-text-soft)]">Quantité</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-sm font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]"
                        >
                          −
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-bold text-[var(--hm-text)]">
                          {modalQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setModalQty((q) => q + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-sm font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]"
                        >
                          +
                        </button>
                        <span className="text-xs text-[var(--hm-text-muted)]">pcs</span>
                      </div>
                    </div>

                    <div className="my-1 h-px bg-[var(--hm-line)]" />

                    {/* Total */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--hm-text)]">Total TTC</span>
                      <span className="text-xl font-black text-[var(--hm-primary)]">{formatPrice(totalTTC)}</span>
                    </div>

                    {/* Livraison */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--hm-text-soft)]">Livraison</span>
                      {freeShip ? (
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          <CheckCircle2 size={11} /> Offerte
                        </span>
                      ) : (
                        <span className="font-semibold text-[var(--hm-text)]">{formatPrice(shipping)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    disabled={confirming || !modalSize}
                    onClick={handleConfirm}
                    className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    title={!modalSize ? "Veuillez sélectionner une taille" : undefined}
                  >
                    {confirming ? (
                      <><Loader2 size={15} className="animate-spin" /> Ajout en cours…</>
                    ) : (
                      <><ShoppingCart size={15} /> Confirmer et ajouter au panier</>
                    )}
                  </button>
                  {!modalSize && (
                    <p className="text-center text-[10px] text-amber-600 font-semibold">
                      ⚠ Sélectionnez une taille avant de confirmer
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--hm-line)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)]/40 hover:text-[var(--hm-text)]"
                  >
                    <ArrowLeft size={13} /> Modifier ma personnalisation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PANNEAU LATÉRAL NORMAL
          ════════════════════════════════════════════════════════════════════ */}
      <div className="flex h-full flex-col gap-4">

        {/* ── Objects list ─────────────────────────────────────────────────── */}
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

        {/* ── Order summary ────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
            Récapitulatif commande
          </p>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--hm-text-soft)]">Technique</span>
              <span className="font-semibold text-[var(--hm-text)]">{TECHNIQUE_LABELS[technique]}</span>
            </div>

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

            <div className="flex items-center justify-between">
              <span className="text-[var(--hm-text-soft)]">Taille</span>
              <span className="font-semibold text-[var(--hm-text)]">
                {selectedSize || <span className="text-amber-500">Non sélectionnée</span>}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--hm-text-soft)]">Placement</span>
              <span className="font-semibold text-[var(--hm-text)]">{PLACEMENT_LABELS[placement]}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--hm-text-soft)]">Quantité</span>
              <span className="font-semibold text-[var(--hm-text)]">{quantity} pcs</span>
            </div>

            <div className="my-1 h-px bg-[var(--hm-line)]" />

            <div className="flex items-center justify-between">
              <span className="text-[var(--hm-text-soft)]">Prix unitaire TTC</span>
              <span className="font-semibold text-[var(--hm-text)]">{formatPrice(unitPrice)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--hm-text)]">Total TTC</span>
              <span className="text-lg font-black text-[var(--hm-primary)]">{formatPrice(totalTTC)}</span>
            </div>

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

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <button
          type="button"
          disabled={validating || objects.length === 0}
          onClick={handleValidate}
          className="btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {validating ? (
            <><Loader2 size={16} className="animate-spin" /> Génération de l'aperçu…</>
          ) : (
            <>👁 Prévisualiser ma personnalisation</>
          )}
        </button>

        {objects.length === 0 && (
          <p className="text-center text-[10px] text-[var(--hm-text-muted)]">
            Ajoutez au moins un élément pour prévisualiser.
          </p>
        )}
      </div>
    </>
  );
}
