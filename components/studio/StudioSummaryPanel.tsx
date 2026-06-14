"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, X, ArrowLeft, ShoppingCart, RotateCcw, Shirt } from "lucide-react";
import { formatPrice, PRICING_CONFIG, getVolumePricedRate } from "@/data/pricing";
import { uploadLogoToSupabase } from "@/lib/uploadLogo";
import { uploadStudioAsset } from "@/lib/uploadStudioAsset";
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

function getStudioSessionId() {
  if (typeof window === "undefined") return "ssr";
  const stored = sessionStorage.getItem("hm_session_id");
  if (stored) return stored;
  const id = crypto.randomUUID();
  sessionStorage.setItem("hm_session_id", id);
  return id;
}

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
  onQuantityChange?: (q: number) => void;
  slug: string;
  exportPNG: () => string;
  exportComposed?: () => Promise<{ front: string; back: string }>;
  /** Fichiers d'impression par face (objets seuls, cadrés zone DTG) — cf StudioCanvasHandle. */
  exportPrintFiles?: () => Promise<{ front: string; back: string }>;
  /** Taille reelle du canvas studio (px) — fournie par StudioCanvasHandle. */
  getContainerSize?: () => number;
  /** Mode édition : id de l'article du panier à remplacer (replaceItem au lieu d'addItem). */
  editItemId?: string | null;
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
  onQuantityChange,
  slug,
  exportPNG,
  exportComposed,
  exportPrintFiles,
  getContainerSize,
  editItemId,
}: Props) {
  const router = useRouter();
  const { addItem, replaceItem } = useCartStore();
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

      // ── Quels objets partent à l'impression ? ───────────────────────────
      // Le fichier envoyé à Printful est déterminé par la face du PLACEMENT
      // choisi — pas par la vue active du canvas.
      const printable = objects.filter(
        (o) => o.type === "logo" || o.type === "design" || o.type === "text"
      );
      const frontObjs = printable.filter((o) => o.face === "front");
      const backObjs  = printable.filter((o) => o.face === "back");

      // Cœur + Dos imprime le MÊME visuel sur les deux faces (limitation V1
      // documentée dans lib/printful-placement.ts) — refuser une face arrière
      // distincte plutôt que de la perdre silencieusement à la production.
      if (placement === "coeur-dos" && backObjs.length > 0) {
        throw new Error(
          "« Cœur + Dos » imprime le même visuel sur les deux faces : créez votre visuel sur la face avant uniquement (la vue dos doit rester vide)."
        );
      }

      const relevant = placement === "dos" && backObjs.length > 0 ? backObjs : frontObjs;
      if (relevant.length === 0) {
        throw new Error("Ajoutez un logo, un texte ou un design avant de valider.");
      }

      // Un SEUL objet image → on envoie le fichier original (qualité maximale)
      // avec sa position exacte. Texte ou composition multi-objets → export
      // d'impression dédié (objets seuls, cadrés sur la zone, sans position).
      const single  = relevant.length === 1 ? relevant[0] : null;
      const logoObj = single && single.type !== "text" ? single : null;
      let printFileComposed = false;

      let logoFileUrl  = "";
      let logoFileName = `studio-export-${timestamp}.png`;
      let logoFileType = "image/png";
      let logoFileSize = 0;
      let storagePath  = `studio-exports/${timestamp}.png`;

      if (logoObj?.file) {
        logoFileName = logoObj.file.name;
        logoFileType = logoObj.file.type || "image/png";
        logoFileSize = logoObj.file.size;
        storagePath  = `studio-exports/${timestamp}-${logoObj.file.name}`;

        const sessionId = getStudioSessionId();
        const { data, error } = await uploadLogoToSupabase(logoObj.file, sessionId);
        if (!data || error) {
          throw new Error(
            "Votre logo n'a pas pu être enregistré. Vérifiez votre connexion puis réessayez.",
          );
        }
        logoFileUrl = data.logoFileUrl;
        storagePath = data.logoPath;

      } else if (logoObj?.src) {
        if (logoObj.src.startsWith("data:")) {
          // QR code généré (data URL) → upload pour obtenir une URL publique.
          logoFileName = `qr-${timestamp}.png`;
          logoFileType = "image/png";
          logoFileSize = Math.round(logoObj.src.length * 0.75);
          storagePath  = `studio-exports/${timestamp}-qr.png`;
          const blob = await (await fetch(logoObj.src)).blob();
          const uploaded = await uploadStudioAsset(
            blob,
            getStudioSessionId(),
            "logo",
            logoFileName,
          );
          logoFileUrl = uploaded.url;
          storagePath = uploaded.path;
        } else {
          // Designs de la bibliothèque : chemin relatif /designs/… → URL
          // absolue, sinon Printful ne peut pas télécharger le fichier.
          logoFileUrl = logoObj.src.startsWith("/") && typeof window !== "undefined"
            ? `${window.location.origin}${logoObj.src}`
            : logoObj.src;
          logoFileName = logoObj.src.split("/").pop() ?? "design.svg";
          logoFileType = "image/svg+xml";
          storagePath  = logoObj.src;
        }

      } else {
        // Texte ou composition multi-objets : export d'impression dédié —
        // objets seuls, fond transparent, cadré sur la zone d'impression.
        // (L'ancien export envoyait la PHOTO du produit comme fichier print :
        // Printful aurait imprimé un t-shirt sur le t-shirt.)
        if (!exportPrintFiles) throw new Error("Export d'impression indisponible — rechargez la page.");
        const prints  = await exportPrintFiles();
        const face: "front" | "back" =
          placement === "dos" && backObjs.length > 0 ? "back" : "front";
        const dataURL = face === "back" ? prints.back : prints.front;
        if (!dataURL) throw new Error("Impossible de générer le fichier d'impression.");

        printFileComposed = true;
        logoFileName = `print-${timestamp}-${face}.png`;
        logoFileType = "image/png";
        logoFileSize = Math.round(dataURL.length * 0.75);
        storagePath  = `studio-exports/${timestamp}-print-${face}.png`;

        const blob = await (await fetch(dataURL)).blob();
        const uploaded = await uploadStudioAsset(
          blob,
          getStudioSessionId(),
          "print",
          logoFileName,
        );
        logoFileUrl = uploaded.url;
        storagePath = uploaded.path;
      }

      // ── Position de l'objet image unique ─────────────────────────────────
      // Fichier d'impression composé : déjà cadré sur la zone → AUCUNE position
      // Printful (elle dédoublerait le placement). Sinon : transform de l'objet
      // image envoyé comme fichier original.
      const firstObj = printFileComposed ? null : logoObj;
      // canvasSize : taille reelle mesuree par StudioCanvas (ResizeObserver),
      // pas une valeur hardcodee. Fallback 544 si le canvas n'est pas encore monte.
      const measuredCanvasSize = getContainerSize?.() || 544;
      // Fix 2026-06-11 : StudioCanvas (éditeur sans Fabric) stocke cx/cy
      // (centre en fractions 0..1), scale et nw/nh (dims naturelles px) —
      // l'ancien mapping lisait left/top/scaleX inexistants → transform
      // persisté à zéro (BAT serveur et placement Printful aveugles).
      // On reconstruit la convention Fabric attendue par lib/bat-renderer.ts
      // et lib/printful-placement.ts : left/top = coin haut-gauche en px du
      // canvas, taille affichée = width×scaleX.
      const fs = firstObj?.fabricState;
      const logoPlacementTransform = fs && typeof fs.cx === "number" && fs.nw
        ? {
            left:   fs.cx * measuredCanvasSize - (fs.nw * fs.scale) / 2,
            top:    fs.cy * measuredCanvasSize - (fs.nh * fs.scale) / 2,
            scaleX: fs.scale,
            scaleY: fs.scale,
            width:  fs.nw,
            height: fs.nh,
            angle:  fs.angle ?? 0,
            canvasSize: measuredCanvasSize,
            source: "fabric-canvas" as const,
          }
        : fs
        ? {
            // Legacy (ancien éditeur Fabric) : champs déjà dans la bonne convention.
            left:   fs.left   ?? 0,
            top:    fs.top    ?? 0,
            scaleX: fs.scaleX ?? 1,
            scaleY: fs.scaleY ?? 1,
            width:  fs.width  ?? 0,
            height: fs.height ?? 0,
            angle:  fs.angle  ?? 0,
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
  const handleConfirm = async () => {
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

      // ── Upload des aperçus BAT composés (face + dos) vers Supabase Storage ──
      // On a deux data URL base64 (du Fabric canvas). On les uploade EN PARALLÈLE
      // dans le bucket customer-logos sous previews/ pour récupérer 2 URLs
      // publiques courtes. C'est ces URLs qui voyagent ensuite dans le cart →
      // checkout → DB → admin, plutôt que les base64 lourds (qui sautaient
      // le localStorage et qu'on perdait au refresh).
      //
      // Session ID stable côté browser (utilisée par uploadLogo aussi). On a la
      // garantie que c'est le même que dans le checkout, donc tous les uploads
      // d'un parcours client tombent sous le même dossier.
      const sessionId = getStudioSessionId();
      const { uploadBothComposedPreviews } = await import("@/lib/uploadComposedPreview");
      const { faceUrl, backUrl } = await uploadBothComposedPreviews(
        preview.composedFront || undefined,
        preview.composedBack  || undefined,
        sessionId,
      );

      // Ajouter au panier directement — pas de passage par la fiche produit.
      // On stocke EN PRIORITÉ les URLs uploadées (légères, persistables). Si
      // Une URL publique est requise pour que le panier survive au refresh et
      // que l'atelier comme le fournisseur puissent télécharger le BAT.
      // Mode édition (clic depuis le panier) : on remplace la ligne existante
      // au lieu d'en créer une nouvelle.
      const payload = {
        product,
        quantity:  modalQty,
        size:      modalSize,
        color:     selectedColor,
        technique,
        placement,
        logoFile,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logoPlacementTransform: (sr.logoPlacementTransform as any) ?? undefined,
        composedPreviewUrl:  faceUrl ?? undefined,
        composedPreviewBack: backUrl ?? undefined,
      };
      if (editItemId) {
        replaceItem(editItemId, payload);
      } else {
        addItem(payload);
      }

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
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col gap-0 overflow-hidden rounded-3xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.35)]">

            {/* ── En-tête ── */}
            <div className="flex items-center justify-between border-b border-[var(--hm-line)] px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--hm-primary)]">
                  Aperçu de votre personnalisation
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--hm-text-soft)]">
                  Vérifiez le rendu avant d&apos;ajouter au panier
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

              {/* Image composée — la colonne occupe 55% de la modale élargie
                  (max-w-4xl). Les packshots WG004 ont été re-croppés offline à
                  ~85% de remplissage (sharp trim + padding 7.5% chaque côté).
                  Fond blanc (bg-white) pour fusionner parfaitement avec le
                  blanc natif du packshot : pas de cadre gris visible, l'aperçu
                  semble flotter directement dans la modale. Hauteur max
                  alignée sur la colonne récap pour que les boutons Face/Dos
                  restent visibles. Le BAT envoyé à l'atelier n'est pas touché
                  (généré à part). */}
              <div className="relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-white p-3 sm:w-[55%] sm:p-4">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt="Aperçu personnalisation"
                    className="h-auto max-h-[480px] w-full object-contain"
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
                      <><Loader2 size={15} className="animate-spin" /> {editItemId ? "Mise à jour…" : "Ajout en cours…"}</>
                    ) : (
                      <><ShoppingCart size={15} /> {editItemId ? "Mettre à jour mon article" : "Confirmer et ajouter au panier"}</>
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

            {/* ── Prix dégressif : achetez plus, payez moins (cliquable) ──── */}
            {activeTiers && activeTiers.length > 1 && (
              <div className="mt-1 border-t border-[var(--hm-line)] pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">
                  Plus vous commandez, moins c&apos;est cher
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {activeTiers.map((tier, tierIdx) => {
                    const tierActive = activeQty >= tier.from && (tier.to === undefined || activeQty <= tier.to);
                    const saving = Math.round((activeTiers[0].unitPrice - tier.unitPrice) * 100) / 100;
                    const isPopular = activeTiers.length >= 3 && tierIdx === 1;
                    return (
                      <button
                        key={tier.from}
                        type="button"
                        onClick={() => onQuantityChange?.(Math.max(1, tier.from))}
                        className={`relative flex flex-col rounded-xl border px-2.5 py-2 text-left transition-all ${
                          tierActive
                            ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]"
                            : "border-[var(--hm-line)] bg-white hover:border-[var(--hm-primary)]/40"
                        }`}
                      >
                        {isPopular && (
                          <span className="absolute -top-2 right-1.5 rounded-full bg-[var(--hm-primary)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                            Le + choisi
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold ${tierActive ? "text-[var(--hm-primary)]" : "text-[var(--hm-text-soft)]"}`}>
                          {tier.to ? `${tier.from}–${tier.to}` : `${tier.from}+`} pcs
                        </span>
                        <span className={`text-sm font-black ${tierActive ? "text-[var(--hm-primary)]" : "text-[var(--hm-text)]"}`}>
                          {formatPrice(tier.unitPrice)}
                        </span>
                        {saving > 0 && (
                          <span className="text-[9px] font-bold text-[#166534]">−{formatPrice(saving)}/pce</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
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
            <><Loader2 size={16} className="animate-spin" /> Génération de l&apos;aperçu…</>
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
