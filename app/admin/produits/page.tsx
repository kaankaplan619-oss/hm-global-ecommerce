"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Search, RefreshCw, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Tag, Layers, ImageOff,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import TopTexStockBadge from "@/components/product/TopTexStockBadge";
import { ALL_PRODUCTS } from "@/data/products";
import type { TopTexProduct } from "@/lib/toptex";

// ── Gradient HM Global ────────────────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getProductRef(p: TopTexProduct): string {
  return (p.reference ?? p.sku ?? String(p.id ?? "—")) as string;
}

function getProductName(p: TopTexProduct): string {
  return (p.nom ?? p.name ?? "Produit sans nom") as string;
}

function getColors(p: TopTexProduct): string[] {
  const list = (p.couleurs ?? p.colors ?? []) as Array<{ nom?: string; name?: string; code?: string }>;
  return list.map((c) => c.nom ?? c.name ?? c.code ?? "").filter(Boolean);
}

function getSizes(p: TopTexProduct): string[] {
  const list = (p.tailles ?? p.sizes ?? []) as Array<string | { label?: string; code?: string }>;
  return list.map((s) =>
    typeof s === "string" ? s : (s.label ?? s.code ?? "")
  ).filter(Boolean);
}

function getImages(p: TopTexProduct): string[] {
  const list = (p.images ?? []) as Array<{ url?: string }>;
  return list.map((i) => i.url ?? "").filter(Boolean);
}

function getPrice(p: TopTexProduct): string | null {
  const v = p.prix ?? p.prixFournisseur ?? p.price;
  if (v == null) return null;
  return `${Number(v).toFixed(2)} €`;
}

// ── Component ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

export default function AdminProduitsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [products, setProducts]   = useState<TopTexProduct[]>([]);
  const [filtered, setFiltered]   = useState<TopTexProduct[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);

  // Recherche par SKU unique
  const [skuQuery, setSkuQuery]   = useState("");
  const [skuResult, setSkuResult] = useState<TopTexProduct | null>(null);
  const [skuLoading, setSkuLoading] = useState(false);
  const [skuError, setSkuError]   = useState("");

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/connexion");
    }
  }, [isAuthenticated, user, router]);

  // ── Load catalogue ──────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/toptex/products?page=1&limit=200");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur API");
      setProducts(data.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Filter / search ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) { setFiltered(products); setPage(1); return; }
    const q = search.toLowerCase();
    setFiltered(
      products.filter((p) =>
        getProductName(p).toLowerCase().includes(q) ||
        getProductRef(p).toLowerCase().includes(q)
      )
    );
    setPage(1);
  }, [search, products]);

  // ── SKU search ──────────────────────────────────────────────────────────────
  const handleSkuSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuQuery.trim()) return;
    setSkuLoading(true);
    setSkuError("");
    setSkuResult(null);
    try {
      const res  = await fetch(`/api/toptex/products/search?q=${encodeURIComponent(skuQuery.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Produit non trouvé");
      setSkuResult(data.product);
    } catch (err) {
      setSkuError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSkuLoading(false);
    }
  };

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20">
      <div className="container max-w-7xl">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#6e6280]">
          <Link href="/admin" className="flex items-center gap-1 hover:text-[#7B4FA6] transition-colors">
            <ChevronLeft size={12} />
            Admin
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3f2d58]">Catalogue TopTex</span>
        </nav>

        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_8px_24px_rgba(63,45,88,0.06)]">
          <div className="h-2 w-full" style={{ background: HM_GRADIENT }} />
          <div className="flex items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, #edf9fc, #f3eefb)" }}
              >
                <Package size={20} style={{ color: "#7B4FA6" }} />
              </div>
              <div>
                <h1 className="text-lg font-black text-[#3f2d58]">Catalogue TopTex</h1>
                <p className="text-sm text-[#6e6280]">
                  {loading ? "Chargement…" : `${products.length} produit${products.length > 1 ? "s" : ""} dans le catalogue`}
                </p>
              </div>
            </div>
            <button
              onClick={loadProducts}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-[#e6e8ee] bg-[#f8f9fb] px-4 py-2 text-xs font-semibold text-[#6e6280] transition-colors hover:bg-white disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#b91c1c]" />
            <div>
              <p className="text-sm font-semibold text-[#b91c1c]">Impossible de contacter l&rsquo;API TopTex</p>
              <p className="mt-0.5 font-mono text-[11px] text-[#b91c1c]/80">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

          {/* ── Colonne principale — catalogue ─────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Barre de recherche */}
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a09bb0]" />
              <input
                type="text"
                placeholder="Filtrer par nom ou référence…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[#e6e8ee] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3f2d58] placeholder:text-[#a09bb0] focus:border-[#7B4FA6] focus:outline-none"
              />
            </div>

            {/* État chargement */}
            {loading && (
              <div className="flex items-center justify-center gap-3 py-20 text-[#6e6280]">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Connexion à TopTex…</span>
              </div>
            )}

            {/* Liste produits */}
            {!loading && !error && (
              <>
                {paginated.length === 0 ? (
                  <div className="rounded-2xl border border-[#e6e8ee] bg-white p-12 text-center">
                    <Package size={28} className="mx-auto mb-3 text-[#a09bb0]" />
                    <p className="text-sm font-semibold text-[#3f2d58]">Aucun produit trouvé</p>
                    <p className="mt-1 text-xs text-[#6e6280]">Modifiez votre recherche ou actualisez le catalogue.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {paginated.map((product, i) => {
                      const ref    = getProductRef(product);
                      const name   = getProductName(product);
                      const colors = getColors(product);
                      const sizes  = getSizes(product);
                      const images = getImages(product);
                      const price  = getPrice(product);

                      return (
                        <div
                          key={`${ref}-${i}`}
                          className="flex gap-4 rounded-2xl border border-[#e6e8ee] bg-white p-4 shadow-[0_2px_8px_rgba(63,45,88,0.03)]"
                        >
                          {/* Miniature */}
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e6e8ee] bg-[#f8f9fb]">
                            {images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={images[0]}
                                alt={name}
                                className="h-full w-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <ImageOff size={18} className="text-[#a09bb0]" />
                            )}
                          </div>

                          {/* Infos */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="font-mono text-[10px] text-[#a09bb0]">{ref}</p>
                                <p className="text-sm font-bold text-[#3f2d58] leading-tight">{name}</p>
                              </div>
                              {price && (
                                <span className="shrink-0 rounded-full bg-[#edf9fc] px-2.5 py-0.5 text-[11px] font-bold text-[#5BC4D8]">
                                  {price}
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#6e6280]">
                              {colors.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-[#7B4FA6]" />
                                  {colors.length} couleur{colors.length > 1 ? "s" : ""}
                                  {colors.length <= 4 && ` (${colors.join(", ")})`}
                                </span>
                              )}
                              {sizes.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Layers size={10} />
                                  {sizes.join(" · ")}
                                </span>
                              )}
                              {typeof product.stock === "number" && (
                                <span className={`flex items-center gap-1 font-semibold ${product.stock > 0 ? "text-[#166534]" : "text-[#b91c1c]"}`}>
                                  <Tag size={10} />
                                  Stock : {product.stock}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between rounded-xl border border-[#e6e8ee] bg-white px-4 py-3">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#6e6280] transition-colors hover:bg-[#f8f9fb] disabled:opacity-40"
                    >
                      <ChevronLeft size={12} />
                      Précédent
                    </button>
                    <span className="text-xs text-[#6e6280]">
                      Page <span className="font-bold text-[#3f2d58]">{page}</span> / {totalPages}
                      <span className="ml-2 text-[#a09bb0]">({filtered.length} résultats)</span>
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#6e6280] transition-colors hover:bg-[#f8f9fb] disabled:opacity-40"
                    >
                      Suivant
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Colonne droite — recherche SKU ─────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-[#e6e8ee] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <h2 className="mb-4 text-sm font-bold text-[#3f2d58]">Recherche par SKU / Référence</h2>
              <form onSubmit={handleSkuSearch} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="ex. BC002, JH001…"
                  value={skuQuery}
                  onChange={(e) => setSkuQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#e6e8ee] bg-[#f8f9fb] px-3 py-2 text-sm text-[#3f2d58] placeholder:text-[#a09bb0] focus:border-[#7B4FA6] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={skuLoading || !skuQuery.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#7B4FA6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6a3f95] disabled:opacity-50"
                >
                  {skuLoading
                    ? <><Loader2 size={13} className="animate-spin" />Recherche…</>
                    : <><Search size={13} />Rechercher</>}
                </button>
              </form>

              {skuError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-3">
                  <AlertCircle size={13} className="shrink-0 text-[#b91c1c]" />
                  <p className="text-[11px] text-[#b91c1c]">{skuError}</p>
                </div>
              )}

              {skuResult && (
                <div className="mt-3 rounded-xl border border-[#7B4FA644] bg-[#f3eefb] p-3">
                  <p className="font-mono text-[10px] text-[#a09bb0]">{getProductRef(skuResult)}</p>
                  <p className="mt-0.5 text-sm font-bold text-[#3f2d58]">{getProductName(skuResult)}</p>

                  {getImages(skuResult)[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImages(skuResult)[0]}
                      alt={getProductName(skuResult)}
                      className="mt-2 h-24 w-full rounded-lg object-contain bg-white"
                    />
                  )}

                  <div className="mt-2 flex flex-col gap-1 text-[11px] text-[#6e6280]">
                    {getColors(skuResult).length > 0 && (
                      <p><span className="font-semibold">Couleurs :</span> {getColors(skuResult).join(", ")}</p>
                    )}
                    {getSizes(skuResult).length > 0 && (
                      <p><span className="font-semibold">Tailles :</span> {getSizes(skuResult).join(" · ")}</p>
                    )}
                    {getPrice(skuResult) && (
                      <p><span className="font-semibold">Prix :</span> {getPrice(skuResult)}</p>
                    )}
                    {typeof skuResult.stock === "number" && (
                      <p><span className="font-semibold">Stock :</span> {skuResult.stock}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="rounded-2xl border border-[#e6e8ee] bg-white p-4">
              <p className="text-[11px] leading-6 text-[#6e6280]">
                <span className="font-semibold text-[#3f2d58]">API TopTex v3</span>
                {" — "}Les données sont rafraîchies toutes les 5 minutes (cache Next.js).
                La clé API n&rsquo;est jamais exposée au navigateur.
              </p>
            </div>

            {/* ── Stock catalogue HM Global ─────────────────────────────────── */}
            <div className="rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <div className="flex items-center gap-3 border-b border-[#e6e8ee] px-5 py-4">
                <BarChart2 size={15} style={{ color: "#7B4FA6" }} />
                <h2 className="text-sm font-bold text-[#3f2d58]">Stock catalogue HM Global</h2>
              </div>
              <div className="flex flex-col divide-y divide-[#f0f0f5]">
                {ALL_PRODUCTS.filter((p) => p.toptexRef).map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-[#3f2d58] leading-tight">
                        {product.shortName}
                      </p>
                      <p className="font-mono text-[9px] text-[#a09bb0]">{product.toptexRef}</p>
                    </div>
                    <div className="shrink-0">
                      <TopTexStockBadge toptexRef={product.toptexRef!} showPrice />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
