"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import type { Product, Placement, Technique, ProductColor } from "@/types";
import type { StudioObject } from "@/components/studio/StudioCanvas";
import type { StudioCanvasHandle } from "@/components/studio/StudioCanvas";
import StudioToolsPanel from "@/components/studio/StudioToolsPanel";
import StudioSummaryPanel from "@/components/studio/StudioSummaryPanel";
import { getProductCatalogImage } from "@/lib/product-image-utils";

// Fabric.js must be dynamic (no SSR)
const StudioCanvas = dynamic(
  () => import("@/components/studio/StudioCanvas"),
  { ssr: false }
);

interface Props {
  product: Product;
}

export default function StudioClient({ product }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Read query params ─────────────────────────────────────────────────────
  const initColorId   = searchParams.get("couleur")   ?? product.colors.find((c) => c.available)?.id ?? "";
  const initSize      = searchParams.get("taille")    ?? "";
  const initTechnique = (searchParams.get("technique") as Technique) ?? product.techniques[0];
  const initQuantity  = parseInt(searchParams.get("quantite") ?? "1") || 1;
  const initPlacement = (searchParams.get("placement") as Placement) ?? product.placements[0];

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

  // ── Objects on each face (persistent state separate from canvas) ──────────
  const [objects, setObjects] = useState<StudioObject[]>([]);

  // Derive face from view state (tracked in StudioCanvas via placement)
  const [currentFace, setCurrentFace] = useState<"front" | "back">("front");

  // Sync face from placement
  const activeFace: "front" | "back" = placement === "dos" ? "back" : "front";

  // ── Canvas ref for exportPNG ──────────────────────────────────────────────
  const canvasRef = useRef<StudioCanvasHandle>(null);

  const packshot = useMemo(
    () => getProductCatalogImage(product, selectedColor?.id ?? ""),
    [product, selectedColor]
  );

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

  // Suppress linting about unused setCurrentFace
  void setCurrentFace;

  return (
    <div className="min-h-screen bg-[var(--hm-bg)]">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--hm-line)] bg-white/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center gap-4">
          <Link
            href={`/produits/${product.slug}`}
            className="flex items-center gap-2 rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
          >
            <ArrowLeft size={14} />
            Retour
          </Link>

          <div className="flex flex-1 items-center gap-2">
            <h1 className="truncate text-sm font-bold text-[var(--hm-text)]">
              Studio · {product.shortName}
            </h1>
          </div>

          {/* Quick config summary */}
          <div className="hidden items-center gap-3 text-xs text-[var(--hm-text-soft)] md:flex">
            {selectedColor && (
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-[var(--hm-line)]"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span>{selectedColor.label}</span>
              </div>
            )}
            {selectedSize && <span className="rounded border border-[var(--hm-line)] px-2 py-0.5 font-semibold">{selectedSize}</span>}
            <span className="rounded border border-[var(--hm-line)] px-2 py-0.5">{technique.toUpperCase()}</span>
            <span>{quantity} pcs</span>
          </div>
        </div>
      </header>

      {/* ── Main layout: 3 columns on desktop, stacked on mobile ────────────── */}
      <div className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">

          {/* ── Col 1: Tools panel ──────────────────────────────────────────── */}
          <aside className="order-2 lg:order-1">
            <div className="sticky top-24 rounded-2xl border border-[var(--hm-line)] bg-white p-4">
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
              packshot={packshot || undefined}
              objects={objects}
              onObjectsChange={handleObjectsChange}
            />

            {/* Quick config bar below canvas on mobile */}
            <div className="mt-4 grid grid-cols-2 gap-3 lg:hidden">
              {/* Color */}
              <div className="rounded-xl border border-[var(--hm-line)] bg-white p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Couleur</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.colors.filter((c) => c.available).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition ${selectedColor?.id === c.id ? "border-[var(--hm-primary)] scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Taille */}
              <div className="rounded-xl border border-[var(--hm-line)] bg-white p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Taille</p>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full rounded-lg border border-[var(--hm-line)] bg-white px-2 py-1.5 text-xs text-[var(--hm-text)] focus:border-[var(--hm-primary)] focus:outline-none"
                >
                  <option value="">Choisir...</option>
                  {product.sizes.filter((s) => s.available).map((s) => (
                    <option key={s.label} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </main>

          {/* ── Col 3: Summary panel ────────────────────────────────────────── */}
          <aside className="order-3">
            {/* Config options (desktop) */}
            <div className="mb-4 hidden flex-col gap-3 lg:flex">
              {/* Color */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Couleur</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.filter((c) => c.available).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`h-8 w-8 rounded-full border-2 transition ${selectedColor?.id === c.id ? "border-[var(--hm-primary)] scale-110 shadow-md" : "border-[var(--hm-line)]"}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <p className="mt-2 text-xs font-semibold text-[var(--hm-text)]">{selectedColor.label}</p>
                )}
              </div>

              {/* Taille */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Taille</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {product.sizes.filter((s) => s.available).map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      disabled={s.soldOut}
                      onClick={() => setSelectedSize(s.label)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition ${
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

              {/* Technique */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Technique</p>
                <div className="flex flex-col gap-1.5">
                  {product.techniques.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTechnique(t)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition ${
                        technique === t
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                          : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      {t === "dtf" ? "DTF" : t === "flex" ? "Flex" : "Broderie"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Placement</p>
                <div className="flex flex-col gap-1.5">
                  {product.placements.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlacement(p)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition ${
                        placement === p
                          ? "border-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]"
                          : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)]/40"
                      }`}
                    >
                      {p === "coeur" ? "Cœur (poitrine)" : p === "dos" ? "Dos" : "Cœur + Dos"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantité */}
              <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)]">Quantité</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--hm-line)] bg-white text-sm font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-[var(--hm-text)]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--hm-line)] bg-white text-sm font-bold text-[var(--hm-text)] transition hover:border-[var(--hm-primary)]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-4">
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
              />
            </div>

            {/* Secondary: back to product without personalization */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => router.push(`/produits/${product.slug}`)}
                className="w-full rounded-xl border border-[var(--hm-line)] bg-white px-4 py-3 text-xs font-semibold text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)]/40 hover:text-[var(--hm-text)]"
              >
                Commander sans personnalisation
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
