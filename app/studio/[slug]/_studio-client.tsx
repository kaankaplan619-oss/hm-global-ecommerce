"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ChevronLeft, ChevronRight, Layers3, Phone } from "lucide-react";
import type { Product, Placement, Technique, ProductColor } from "@/types";
import type { StudioObject } from "@/components/studio/StudioCanvas";
import type { StudioCanvasHandle } from "@/components/studio/StudioCanvas";
import StudioToolsPanel from "@/components/studio/StudioToolsPanel";
import StudioSummaryPanel from "@/components/studio/StudioSummaryPanel";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { getHMTextileFrontPath, getHMTextileBackPath } from "@/lib/hm-visual-utils";
import { useCartStore } from "@/store/cart";

// Fabric.js must be dynamic (no SSR)
const StudioCanvas = dynamic(
  () => import("@/components/studio/StudioCanvas"),
  { ssr: false }
);

// Three.js must be dynamic (no SSR)
const TShirt3DViewer = dynamic(
  () => import("@/components/product/TShirt3DViewer"),
  { ssr: false }
);
const Hoodie3DViewer = dynamic(
  () => import("@/components/product/Hoodie3DViewer"),
  { ssr: false }
);
const Sweat3DViewer = dynamic(
  () => import("@/components/product/Sweat3DViewer"),
  { ssr: false }
);

const VIEW_3D_LABELS = ["Face", "Dos", "Manche"];

interface Props {
  product: Product;
}

export default function StudioClient({ product }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Mode édition (clic sur un article du panier) ──────────────────────────
  // ?edit=<cartItemId> : l'article existant sert de valeurs initiales et le
  // CTA du panneau récap devient « Mettre à jour » (replaceItem au lieu
  // d'addItem). Lecture one-shot au montage — le store peut changer ensuite.
  const editItemId = searchParams.get("edit");
  const editItem = useMemo(() => {
    if (!editItemId) return null;
    const item = useCartStore.getState().items.find((i) => i.id === editItemId);
    return item && item.productId === product.id ? item : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editItemId, product.id]);

  // ── Read query params ─────────────────────────────────────────────────────
  const initColorId   = editItem?.color.id ?? searchParams.get("couleur") ?? product.colors.find((c) => c.available)?.id ?? "";
  const initSize      = editItem?.size ?? searchParams.get("taille") ?? "";
  const initTechnique = editItem?.technique ?? (searchParams.get("technique") as Technique) ?? product.techniques[0];
  const initQuantity  = editItem?.quantity ?? (parseInt(searchParams.get("quantite") ?? "1") || 1);
  const initPlacement = editItem?.placement ?? (searchParams.get("placement") as Placement) ?? product.placements[0];

  const defaultColor = useMemo(
    () => product.colors.find((c) => c.id === initColorId && c.available)
          ?? product.colors.find((c) => c.available)
          ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.id]
  );

  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(defaultColor);
  const [selectedSize,  setSelectedSize]  = useState(initSize);
  const [technique,     setTechnique]     = useState<Technique>(initTechnique);
  const [placement,     setPlacement]     = useState<Placement>(initPlacement);
  const [quantity,      setQuantity]      = useState(initQuantity);

  // ── 3D Viewer state (Printful products only) ─────────────────────────────
  const isPrintful   = product.supplierName === "printful";
  const [view3DIndex, setView3DIndex] = useState(0);

  // ── Objects on each face (persistent state separate from canvas) ──────────
  // Mode édition : le logo de l'article du panier est re-posé sur le canvas
  // (URL Supabase déjà uploadée). Position par défaut de la zone — le client
  // peut le déplacer puis « Mettre à jour ».
  const [objects, setObjects] = useState<StudioObject[]>(() => {
    if (!editItem?.logoFile?.url) return [];
    return [{
      id: crypto.randomUUID(),
      type: "logo" as const,
      src: editItem.logoFile.url,
      label: editItem.logoFile.name || "Votre logo",
      face: editItem.placement === "dos" ? ("back" as const) : ("front" as const),
    }];
  });

  // Face active — synchronisée depuis StudioCanvas via onViewChange
  // (le canvas peut changer de vue indépendamment du placement)
  const [activeFace, setActiveFace] = useState<"front" | "back">(
    initPlacement === "dos" ? "back" : "front"
  );

  // ── Canvas ref for exportPNG ──────────────────────────────────────────────
  const canvasRef = useRef<StudioCanvasHandle>(null);

  // Packshot face — vraies photos par coloris pour les produits Printful
  const packshot = useMemo(() => {
    if (product.supplierName === "printful") {
      return product.hmMockupImages?.[selectedColor?.id ?? ""] ?? null;
    }
    // Assets HM propres (webp haute qualité) en priorité, sinon packshot TopTex/fallback
    return (
      getHMTextileFrontPath(product.id, selectedColor?.id) ??
      getProductCatalogImage(product, selectedColor?.id ?? "")
    );
  }, [product, selectedColor]);

  // Packshot dos — assets HM propres en priorité, sinon hmMockupImagesBack produit.
  // Note (2026-05-26) : la branche non-printful initiale n'utilisait QUE
  // getHMTextileBackPath, ce qui faisait que les produits Falk&Ross/TopTex avec un
  // hmMockupImagesBack défini dans data/products.ts (ex. WG004 stock agence avec
  // /mockups/falkross-cropped/wg004/noir-back.jpg) voyaient leur champ ignoré,
  // et le Studio tombait sur le fallback MOCKUP_FILES.noir.back = t-shirt
  // générique → bug visuel. Maintenant les 2 branches lisent les 2 sources.
  const packshotBack = useMemo(() => {
    return (
      getHMTextileBackPath(product.id, selectedColor?.id) ??
      product.hmMockupImagesBack?.[selectedColor?.id ?? ""] ??
      null
    );
  }, [product, selectedColor]);

  const handleAddObject = useCallback((obj: StudioObject) => {
    setObjects((prev) => {
      // Logo : remplace le logo existant sur la même face plutôt que d'empiler
      if (obj.type === "logo") {
        return [...prev.filter((o) => !(o.type === "logo" && o.face === obj.face)), obj];
      }
      return [...prev, obj];
    });
  }, []);

  const handleObjectsChange = useCallback((updated: StudioObject[]) => {
    setObjects(updated);
  }, []);

  const handleRemoveObject = useCallback((id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const exportPNG = useCallback(() => {
    return canvasRef.current?.exportPNG() ?? "";
  }, []);

  const exportComposed = useCallback(async () => {
    const result = await canvasRef.current?.exportComposed();
    return result ?? { front: "", back: "" };
  }, []);

  const getContainerSize = useCallback(() => {
    return canvasRef.current?.getContainerSize() ?? 0;
  }, []);


  return (
    /* pt-[var(--site-header-offset)] : le header global du site est `fixed`
       (z-50) — sans ce padding, la barre Studio (et son bouton « Retour »)
       passait DESSOUS et restait invisible (bug signalé par Kaan 2026-06-10 :
       « obligé de cliquer sur le logo HM Global pour revenir en arrière »). */
    <div className="bg-[var(--hm-bg)] pt-[var(--site-header-offset)]">
      {/* ── Top bar (non sticky : visible sous le header global) ───────────── */}
      <header className="border-b border-[var(--hm-line)] bg-white/95">
        <div className="container flex h-14 items-center gap-3">
          {/* Retour */}
          <Link
            href={`/produits/${product.slug}`}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
          >
            <ArrowLeft size={13} />
            Retour
          </Link>

          {/* Titre */}
          <h1 className="flex-1 truncate text-sm font-bold text-[var(--hm-text)]">
            Studio · <span className="text-[var(--hm-primary)]">{product.shortName}</span>
          </h1>

          {/* Quick badges (desktop) */}
          <div className="hidden items-center gap-2 text-[11px] text-[var(--hm-text-soft)] lg:flex">
            {selectedColor && (
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border border-[var(--hm-line)]" style={{ backgroundColor: selectedColor.hex }} />
                <span>{selectedColor.label}</span>
              </div>
            )}
            {selectedSize && <span className="rounded-lg border border-[var(--hm-line)] px-2 py-0.5 font-semibold">{selectedSize}</span>}
            <span className="rounded-lg border border-[var(--hm-line)] px-2 py-0.5">{technique.toUpperCase()}</span>
            <span className="font-medium">{quantity} pcs</span>
          </div>

          {/* Besoin d'aide ? — visible sur desktop + mobile */}
          <a
            href="tel:+33676161188"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
          >
            <Phone size={13} className="text-[var(--hm-primary)]" />
            <span className="hidden sm:inline">Besoin d&apos;aide ?</span>
            <span className="sm:hidden">Aide</span>
          </a>
        </div>
      </header>

      {/* ── Main layout: 3 columns on desktop ───────────────────────────────── */}
      <div className="container py-5">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr_268px] lg:items-start">

          {/* ── Col 1: Tools panel ──────────────────────────────────────────── */}
          <aside className="order-2 lg:order-1">
            <div className="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-2xl border border-[var(--hm-line)] bg-white p-4">
              <StudioToolsPanel
                face={activeFace}
                onAddObject={handleAddObject}
                hasLogo={objects.some((o) => o.type === "logo" && o.face === activeFace)}
              />
            </div>
          </aside>

          {/* ── Col 2: Canvas ───────────────────────────────────────────────── */}
          <main className="order-1 lg:order-2">
            <StudioCanvas
              ref={canvasRef}
              colorId={selectedColor?.id ?? ""}
              placement={placement}
              productCategory={product.category}
              productId={product.id}
              placements={product.placements}
              packshot={packshot || undefined}
              packshotBack={packshotBack || undefined}
              objects={objects}
              onObjectsChange={handleObjectsChange}
              onViewChange={setActiveFace}
            />

            {/* Config rapide mobile — sous le canvas */}
            <div className="mt-4 flex flex-col gap-3 lg:hidden">
              {/* Couleur + Taille */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Couleur</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.colors.filter((c) => c.available).map((c) => (
                        <button key={c.id} type="button" onClick={() => setSelectedColor(c)}
                          className={`h-7 w-7 rounded-full border-2 transition ${selectedColor?.id === c.id ? "border-[var(--hm-primary)] scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c.hex }} title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Taille</p>
                    <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}
                      className="w-full rounded-xl border border-[var(--hm-line)] bg-white px-2 py-1.5 text-xs text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none">
                      <option value="">Choisir...</option>
                      {product.sizes.filter((s) => s.available).map((s) => (
                        <option key={s.label} value={s.label}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* ── Col 3: Config + Summary ──────────────────────────────────────── */}
          <aside className="order-3 flex flex-col gap-3 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-0.5">

            {/* ── Aperçu 3D (t-shirts Printful uniquement — shirt.glb) ────── */}
            {isPrintful && product.category === "tshirts" && (
              <div className="hidden rounded-2xl border border-[var(--hm-line)] bg-white overflow-hidden lg:block">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[var(--hm-line)]">
                  <div className="flex items-center gap-1.5">
                    <Layers3 size={13} className="text-[var(--hm-primary)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                      Aperçu 3D
                    </span>
                  </div>
                  {/* Navigation vue */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setView3DIndex((i) => (i - 1 + 3) % 3)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <span className="min-w-[42px] text-center text-[10px] font-semibold text-[var(--hm-text-soft)]">
                      {VIEW_3D_LABELS[view3DIndex]}
                    </span>
                    <button
                      type="button"
                      onClick={() => setView3DIndex((i) => (i + 1) % 3)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Viewer 3D — t-shirts uniquement (shirt.glb) */}
                <TShirt3DViewer
                  color={selectedColor?.hex ?? "#111111"}
                  viewIndex={view3DIndex}
                  className="h-[180px] w-full"
                />

                {/* Dots */}
                <div className="flex items-center justify-center gap-1.5 pb-2.5">
                  {VIEW_3D_LABELS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setView3DIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === view3DIndex
                          ? "w-4 bg-[var(--hm-primary)]"
                          : "w-1.5 bg-[var(--hm-line)]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Couleur + Taille (desktop) ───────────────────────────────── */}
            <div className="hidden rounded-2xl border border-[var(--hm-line)] bg-white p-4 lg:block">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Couleur</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.filter((c) => c.available).map((c) => (
                  <button key={c.id} type="button" onClick={() => setSelectedColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition ${selectedColor?.id === c.id ? "border-[var(--hm-primary)] scale-110 shadow" : "border-[var(--hm-line)]"}`}
                    style={{ backgroundColor: c.hex }} title={c.label}
                  />
                ))}
              </div>
              {selectedColor && <p className="mt-2 text-xs font-semibold text-[var(--hm-text)]">{selectedColor.label}</p>}

              <div className="my-3 h-px bg-[var(--hm-line)]" />

              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Taille</p>
              <div className="grid grid-cols-4 gap-1">
                {product.sizes.filter((s) => s.available).map((s) => (
                  <button key={s.label} type="button" disabled={s.soldOut}
                    onClick={() => setSelectedSize(s.label)}
                    className={`rounded-xl border py-1.5 text-xs font-semibold transition ${
                      selectedSize === s.label
                        ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                        : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Technique + Placement + Quantité (desktop) ──────────────── */}
            <div className="hidden rounded-2xl border border-[var(--hm-line)] bg-white p-4 lg:block">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Technique</p>
              <div className="flex gap-1.5">
                {product.techniques.map((t) => (
                  <button key={t} type="button" onClick={() => setTechnique(t)}
                    className={`flex-1 rounded-xl border py-1.5 text-xs font-semibold transition ${
                      technique === t
                        ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                        : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                    }`}
                  >
                    {t === "dtf" ? "DTF" : t === "dtflex" ? "DTFlex" : t === "flex" ? "Flex" : t === "broderie_illimitee" ? "Broderie ∞" : "Broderie"}
                  </button>
                ))}
              </div>

              <div className="my-3 h-px bg-[var(--hm-line)]" />

              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Placement</p>
              <div className="flex flex-col gap-1">
                {product.placements.map((p) => (
                  <button key={p} type="button" onClick={() => setPlacement(p)}
                    className={`rounded-xl border py-1.5 text-xs font-semibold transition ${
                      placement === p
                        ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                        : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                    }`}
                  >
                    {p === "coeur" ? "Cœur (poitrine)" : p === "dos" ? "Dos" : "Cœur + Dos"}
                  </button>
                ))}
              </div>

              <div className="my-3 h-px bg-[var(--hm-line)]" />

              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">Quantité</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--hm-line)] bg-white text-sm font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]">
                  −
                </button>
                <span className="flex-1 text-center text-sm font-bold text-[var(--hm-text)]">{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--hm-line)] bg-white text-sm font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]">
                  +
                </button>
              </div>
            </div>

            {/* ── Récapitulatif ────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4 shadow-sm">
              <StudioSummaryPanel
                product={product}
                objects={objects}
                onRemoveObject={handleRemoveObject}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                technique={technique}
                placement={placement}
                quantity={quantity}
                slug={product.slug}
                exportPNG={exportPNG}
                exportComposed={exportComposed}
                getContainerSize={getContainerSize}
                editItemId={editItem ? editItemId : null}
              />
            </div>

            {/* Commander sans personnalisation */}
            <button type="button" onClick={() => router.push(`/produits/${product.slug}`)}
              className="w-full rounded-xl border border-[var(--hm-line)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)]/40 hover:text-[var(--hm-text)]">
              Commander sans personnalisation
            </button>

            {/* ── Besoin d'aide ? ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-rose)]">
                  <Phone size={16} className="text-[var(--hm-primary)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--hm-text)]">Besoin d&apos;aide ?</p>
                  <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">
                    Notre équipe peut vous accompagner dans la création de votre personnalisation.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                <a href="tel:+33676161188"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] px-3 py-2 text-xs font-bold text-[var(--hm-primary)] transition hover:bg-[var(--hm-primary)] hover:text-white">
                  <Phone size={12} />
                  06 76 16 11 88
                </a>
                <Link href="/contact"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)]/40 hover:text-[var(--hm-text)]">
                  Envoyer un message
                </Link>
              </div>
              <p className="mt-2.5 text-center text-[10px] text-[var(--hm-text-muted)]">Lun – Ven · 9h – 18h</p>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
