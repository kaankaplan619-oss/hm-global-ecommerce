"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Plus, Minus, Trash2, Package, ZoomIn, Sparkles, ArrowRight, Pencil } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice, PRICING_CONFIG } from "@/data/pricing";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/data/techniques";
import CartUpsell from "@/components/cart/CartUpsell";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { isSimpleFlowProduct } from "@/data/products";
import { useT } from "@/components/i18n/I18nProvider";
import type { Placement, Product, ProductColor, Technique } from "@/types";

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  const t = useT();
  // Fermeture clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#f7f6f4] shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--hm-line)] bg-white px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--hm-text)]">
            {t("cart.lightbox.title")} · {label}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--hm-line)] text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
          >
            <X size={14} />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${t("cart.preview.alt")} ${label}`}
          className="max-h-[65vh] w-full object-contain"
        />
        <p className="py-2 text-center text-[10px] text-[var(--hm-text-muted)]">
          {t("cart.lightbox.closeHint")}
        </p>
      </div>
    </div>
  );
}

// ── CartDrawer ─────────────────────────────────────────────────────────────────
export default function CartDrawer() {
  const t = useT();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    addItem,
    getTotals,
    lastAddedItemId,
    lastAddedAt,
    lastAddedName,
  } = useCartStore();
  const totals = getTotals();
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const [dismissedCelebrationAt, setDismissedCelebrationAt] = useState<number | null>(null);

  const piecesToFreeShipping = Math.max(0, PRICING_CONFIG.freeShippingThreshold - totals.totalItems);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightbox) closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart, lightbox]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const showCelebration = Boolean(isOpen && lastAddedAt && lastAddedAt !== dismissedCelebrationAt);

  useEffect(() => {
    if (!showCelebration || !lastAddedAt) return;
    const timer = window.setTimeout(() => setDismissedCelebrationAt(lastAddedAt), 2400);
    return () => window.clearTimeout(timer);
  }, [showCelebration, lastAddedAt]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[rgba(63,45,88,0.18)] backdrop-blur-[3px]"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--hm-line)] bg-[linear-gradient(180deg,#fbfcfe_0%,#ffffff_100%)] shadow-[0_24px_80px_rgba(63,45,88,0.14)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--hm-line)] px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-[var(--hm-primary)]" />
            <h2 className="font-semibold text-[var(--hm-text)]">{t("cart.title")}</h2>
            {items.length > 0 && (
              <span className="badge badge-gold">{totals.totalItems} {totals.totalItems > 1 ? t("cart.itemsPlural") : t("cart.itemsSingular")}</span>
            )}
          </div>
          <button onClick={closeCart} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        {showCelebration && lastAddedName && (
          <div className="border-b border-[var(--hm-line)] bg-[linear-gradient(135deg,rgba(177,63,116,0.1),rgba(110,193,223,0.12))] px-5 py-4">
            <div className="hm-cart-banner rounded-[1.35rem] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_18px_45px_rgba(63,45,88,0.08)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)]">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--hm-text)]">
                    {lastAddedName} {t("cart.celebration.added")}
                  </p>
                  <p className="mt-1 text-xs text-[var(--hm-text-soft)]">
                    {piecesToFreeShipping > 0
                      ? `${t("cart.celebration.remainingPrefix")} ${piecesToFreeShipping} ${piecesToFreeShipping > 1 ? t("cart.piecesPlural") : t("cart.piecesSingular")} ${t("cart.celebration.remainingSuffix")}`
                      : t("cart.celebration.unlocked")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--hm-surface)]">
                <Package size={28} className="text-[var(--hm-text-muted)]" />
              </div>
              <p className="text-sm text-[var(--hm-text-soft)]">{t("cart.empty.title")}</p>
              <Link href="/catalogue" onClick={closeCart} className="btn-primary text-xs">
                {t("cart.empty.cta")}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                // Print : recto seul (plus simple). Textile : face + dos.
                const previewImages = (item.printConfig
                  ? [{ src: item.printConfig.frontPreviewUrl ?? undefined, label: t("cart.face.front") }]
                  : [
                      { src: item.composedPreviewUrl,  label: t("cart.face.front") },
                      { src: item.composedPreviewBack, label: t("cart.face.back")  },
                    ]
                ).filter((v) => !!v.src) as { src: string; label: string }[];

                return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-2xl border bg-[var(--hm-surface)] transition-all ${
                      showCelebration && item.id === lastAddedItemId
                        ? "hm-cart-added border-[var(--hm-primary)]/35 shadow-[0_24px_50px_rgba(177,63,116,0.12)]"
                        : "border-[var(--hm-line)]"
                    }`}
                  >
                    {/* ── Aperçu personnalisation ── */}
                    {previewImages.length > 0 && (
                      <div className="border-b border-[var(--hm-line)] bg-[#fafaf9] px-4 py-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--hm-primary)]/30 bg-[var(--hm-accent-soft-rose)] px-2 py-0.5 text-[9px] font-bold text-[var(--hm-primary)]">
                            ✨ {t("cart.customized")}
                          </span>
                          <span className="text-[9px] text-[var(--hm-text-muted)]">{t("cart.clickToZoom")}</span>
                        </div>

                        <div className="flex gap-3">
                          {previewImages.map(({ src, label }) => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setLightbox({ src, label })}
                              className="group flex flex-col items-center gap-1"
                            >
                              <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-[var(--hm-line)] bg-[#f0efed] transition group-hover:border-[var(--hm-primary)] group-hover:shadow-md">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt={`${t("cart.preview.alt")} ${label}`}
                                  className="h-full w-full object-contain transition group-hover:scale-105"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                                  <ZoomIn size={18} className="text-white opacity-0 drop-shadow transition group-hover:opacity-100" />
                                </div>
                              </div>
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)] transition group-hover:text-[var(--hm-primary)]">
                                {label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Infos produit ── */}
                    {/* Lien d'édition (demande Kaan 2026-06-12 : « quand on
                        s'appuie dessus, il faut pouvoir personnaliser ») :
                        - produit studio → /studio/[slug]?edit=<itemId> (l'atelier
                          se pré-remplit et « Mettre à jour » remplace la ligne)
                        - goodies flow simple → fiche produit
                        - print → pas de lien (lot configuré, à recommander) */}
                    {(() => {
                      const editHref = item.printConfig
                        ? null
                        : isSimpleFlowProduct(item.product)
                        ? `/produits/${item.product.slug}`
                        : `/studio/${item.product.slug}?edit=${item.id}`;
                      return (
                    <div className="flex gap-3 p-4">
                      {/* Miniature produit — priorité :
                         1. composedPreviewUrl (BAT face composé : packshot + logo)
                            → c'est exactement ce que le client a validé dans le
                            Studio, donc le plus rassurant pour lui dans le récap
                         2. getProductCatalogImage → packshot HM cropé propre
                         3. item.product.images[0] → fallback légacy
                         4. <Package> icon → ultime fallback */}
                      {(() => {
                        const thumb = (() => {
                          const thumbSrc =
                            item.composedPreviewUrl
                            || item.printConfig?.frontPreviewUrl
                            || getProductCatalogImage(item.product, item.color.id)
                            || item.product.images?.[0];
                          return thumbSrc ? (
                            <Image
                              src={thumbSrc}
                              alt={item.product.name}
                              width={56}
                              height={56}
                              className="object-contain w-full h-full"
                              // composedPreview est sur Supabase Storage (URL stable),
                              // pas besoin de unoptimized. Si fallback sur images[0]
                              // qui peut être un CDN externe non listé dans next.config,
                              // next/image lance une erreur — on switch en unoptimized.
                              unoptimized={!thumbSrc.startsWith("/")}
                            />
                          ) : (
                            <Package size={18} className="text-[var(--hm-text-muted)]" />
                          );
                        })();
                        const boxClass = "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--hm-line)] bg-white";
                        return editHref ? (
                          <Link href={editHref} onClick={closeCart} className={`${boxClass} transition hover:border-[var(--hm-primary)]`} title={t("cart.editCustomization")}>
                            {thumb}
                          </Link>
                        ) : (
                          <div className={boxClass}>{thumb}</div>
                        );
                      })()}

                      {/* Détails */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--hm-text)]">
                          {editHref ? (
                            <Link href={editHref} onClick={closeCart} className="transition hover:text-[var(--hm-primary)] hover:underline">
                              {item.product.shortName}
                            </Link>
                          ) : (
                            item.product.shortName
                          )}
                          {item.printConfig && (
                            <span className="ml-1.5 rounded-full bg-[var(--hm-accent-soft-rose)] px-2 py-0.5 text-[9px] font-bold text-[var(--hm-primary)]">
                              {t("cart.printBadge")}
                            </span>
                          )}
                        </p>

                        {item.printConfig ? (
                          /* ── Print : détails lot ── */
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-semibold text-[var(--hm-text)]">
                              {item.printConfig.quantity} {t("cart.print.unitsSuffix")}
                            </span>
                            <span className="text-[10px] text-[var(--hm-text-muted)]">·</span>
                            <span className="text-[10px] text-[var(--hm-text-soft)]">
                              {item.printConfig.finish === "mat"
                                ? t("cart.print.finishMat")
                                : item.printConfig.finish === "brillant"
                                ? t("cart.print.finishGlossy")
                                : t("cart.print.finishPremium")}
                            </span>
                            <span className="text-[10px] text-[var(--hm-text-muted)]">·</span>
                            <span className="text-[10px] text-[var(--hm-text-soft)]">
                              {item.printConfig.faces === "recto" ? t("cart.print.singleSided") : t("cart.print.doubleSided")}
                            </span>
                            {item.printConfig.corners === "rounded" && (
                              <>
                                <span className="text-[10px] text-[var(--hm-text-muted)]">·</span>
                                <span className="text-[10px] text-[var(--hm-text-soft)]">{t("cart.print.roundedCorners")}</span>
                              </>
                            )}
                          </div>
                        ) : (
                          /* ── Textile : technique · placement · taille · couleur ── */
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-[var(--hm-text-soft)]">{TECHNIQUE_LABELS[item.technique]}</span>
                            <span className="text-[10px] text-[var(--hm-text-muted)]">·</span>
                            <span className="text-[10px] text-[var(--hm-text-soft)]">{PLACEMENT_LABELS[item.placement]}</span>
                            <span className="text-[10px] text-[var(--hm-text-muted)]">·</span>
                            <span className="text-[10px] font-bold text-[var(--hm-text)]">{item.size}</span>
                            <span className="text-[10px] text-[var(--hm-text-muted)]">·</span>
                            <span className="flex items-center gap-1 text-[10px] text-[var(--hm-text-soft)]">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.color.hex }}
                              />
                              {item.color.label}
                            </span>
                          </div>
                        )}

                        {/* Logo textile uniquement */}
                        {!item.printConfig && item.logoFile && (
                          <p className="mt-1 truncate text-[10px] text-[var(--hm-primary)]">
                            📎 {item.logoFile.name}
                          </p>
                        )}

                        {/* Qty + price */}
                        <div className="mt-3 flex items-center justify-between">
                          {item.printConfig ? (
                            /* ── Print : "1 lot" — boutons +/- désactivés pour éviter ×prix ── */
                            <span className="rounded-lg border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-1 text-[11px] font-semibold text-[var(--hm-text-muted)]">
                              {t("cart.oneBatch")}
                            </span>
                          ) : (
                            /* ── Textile : boutons +/- normaux ── */
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-text)]"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-[var(--hm-text)]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-text)]"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-[var(--hm-text)]">
                              {formatPrice(item.totalPrice)}
                            </span>
                            {editHref && (
                              <Link
                                href={editHref}
                                onClick={closeCart}
                                className="text-[var(--hm-text-muted)] transition hover:text-[var(--hm-primary)]"
                                aria-label={t("cart.editCustomization")}
                                title={t("cart.editCustomization")}
                              >
                                <Pencil size={14} />
                              </Link>
                            )}
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-[var(--hm-text-muted)] transition hover:text-red-500"
                              aria-label={t("cart.remove")}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                      );
                    })()}
                  </div>
                );
              })}

              {/* Upsell « UberEats » (#89) : goodies forte marge + logo du
                  panier réutilisé en 1 clic — remplace les suggestions
                  featured-textiles (2026-06-12, GO Kaan). */}
              <CartUpsell items={items} onAdd={addItem} />
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--hm-line)] bg-white px-6 py-5">
            {/* Livraison offerte */}
            {totals.freeShipping ? (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#4ade8033] bg-[#4ade8011] p-3">
                <span className="text-[#4ade80] text-xs font-semibold">✓ {t("cart.freeShipping")}</span>
              </div>
            ) : (
              <div className="mb-4 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-3">
                <p className="text-xs text-[var(--hm-text-soft)]">
                  {t("cart.freeShippingFromPrefix")} <strong className="text-[var(--hm-primary)]">{t("cart.tenPieces")}</strong>
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[var(--hm-primary)] transition-all"
                    style={{ width: `${Math.min(100, (totals.totalItems / 10) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-[var(--hm-text-muted)]">
                  {totals.totalItems}/10 {t("cart.piecesPlural")}
                </p>
              </div>
            )}

            {/* Totaux */}
            <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                <span>{t("cart.subtotalHT")}</span>
                <span>{formatPrice(totals.subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                <span>{t("cart.vat")}</span>
                <span>{formatPrice(totals.tva)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                <span>{t("cart.delivery")}</span>
                <span className={totals.freeShipping ? "text-[#4ade80]" : ""}>
                  {totals.freeShipping ? t("cart.deliveryFree") : formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="divider-gold my-1" />
              <div className="flex justify-between font-bold text-[var(--hm-text)]">
                <span>{t("cart.totalTTC")}</span>
                <span className="text-lg text-[var(--hm-primary)]">{formatPrice(totals.totalTTC)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center"
            >
              {t("cart.checkout")}
            </Link>
            <button
              onClick={closeCart}
              className="btn-ghost w-full text-center mt-2 text-xs"
            >
              {t("cart.continueShopping")}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox (au-dessus du drawer) */}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
