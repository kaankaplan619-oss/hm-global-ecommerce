"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Package, Minus, Plus, Trash2, ArrowRight, Upload, X, ZoomIn } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/data/pricing";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/data/techniques";
import { useT } from "@/components/i18n/I18nProvider";

// ── Lightbox simple ────────────────────────────────────────────────────────────
function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  const t = useT();
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full rounded-3xl overflow-hidden bg-[#f7f6f4] shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--hm-line)] bg-white">
          <span className="text-xs font-bold text-[var(--hm-text)] uppercase tracking-wider">
            {t("cartPage.lightbox.preview")} · {label}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--hm-line)] text-[var(--hm-text-soft)] transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
          >
            <X size={14} />
          </button>
        </div>
        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${t("cartPage.lightbox.preview")} ${label}`}
          className="w-full h-auto object-contain max-h-[70vh]"
        />
        <p className="py-2 text-center text-[10px] text-[var(--hm-text-muted)]">
          {t("cartPage.lightbox.clickOutside")}
        </p>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function PanierPage() {
  const t = useT();
  const { items, removeItem, updateQuantity, getTotals, clearCart } = useCartStore();
  const totals = getTotals();

  // Lightbox state
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--hm-surface)] border border-[var(--hm-line)] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-[var(--hm-text-muted)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--hm-text)] mb-3">{t("cartPage.empty.title")}</h1>
          <p className="text-sm text-[var(--hm-text-soft)] mb-8">
            {t("cartPage.empty.subtitle")}
          </p>
          <Link href="/catalogue" className="btn-primary">
            {t("cartPage.empty.cta")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}

      <div className="pt-24 pb-20">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--hm-text)] mb-2">{t("cartPage.title")}</h1>
            <p className="text-sm text-[var(--hm-text-soft)]">
              {totals.totalItems}{" "}
              {totals.totalItems > 1 ? t("cartPage.itemsSelected.plural") : t("cartPage.itemsSelected.singular")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {items.map((item) => {
                // Print : on n'affiche que le RECTO (aperçu carte) — plus simple.
                // Textile : aperçu composé face + dos (BAT Studio).
                const previewImages = (item.printConfig
                  ? [{ src: item.printConfig.frontPreviewUrl ?? undefined, key: "Recto", label: t("cartPage.preview.recto") }]
                  : [
                      { src: item.composedPreviewUrl,  key: "Face", label: t("cartPage.preview.face") },
                      { src: item.composedPreviewBack, key: "Dos",  label: t("cartPage.preview.dos")  },
                    ]
                ).filter((v) => !!v.src) as { src: string; key: string; label: string }[];

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-[var(--hm-line)] rounded-2xl shadow-[var(--hm-shadow-xs)] overflow-hidden"
                  >
                    {/* ── Bloc aperçu personnalisation ── */}
                    {previewImages.length > 0 && (
                      <div className="border-b border-[var(--hm-line)] bg-[#fafaf9] px-5 py-4">
                        <div className="mb-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--hm-primary)]/30 bg-[var(--hm-accent-soft-rose)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--hm-primary)]">
                            ✨ {t("cartPage.customization.badge")}
                          </span>
                          <span className="text-[10px] text-[var(--hm-text-muted)]">
                            {t("cartPage.customization.clickToZoom")}
                          </span>
                        </div>

                        <div className="flex gap-4">
                          {previewImages.map(({ src, key, label }) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setLightbox({ src, label })}
                              className="group flex flex-col items-center gap-1.5"
                            >
                              {/* Miniature cliquable */}
                              <div className="relative h-36 w-36 overflow-hidden rounded-xl border border-[var(--hm-line)] bg-[#f0efed] transition group-hover:border-[var(--hm-primary)] group-hover:shadow-md">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt={`${t("cartPage.lightbox.preview")} ${label}`}
                                  className="h-full w-full object-contain transition group-hover:scale-105"
                                />
                                {/* Overlay loupe */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                                  <ZoomIn
                                    size={22}
                                    className="text-white opacity-0 drop-shadow transition group-hover:opacity-100"
                                  />
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--hm-text-soft)] group-hover:text-[var(--hm-primary)] transition">
                                {label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Infos produit ── */}
                    <div className="flex gap-4 p-5">
                      {/* Miniature produit */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--hm-line)] bg-[var(--hm-surface)] flex items-center justify-center">
                        {item.product.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package size={20} className="text-[var(--hm-text-muted)]" />
                        )}
                      </div>

                      {/* Détails */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] font-mono text-[var(--hm-text-muted)]">{item.product.reference}</p>
                            <h3 className="text-sm font-bold text-[var(--hm-text)] mt-0.5">{item.product.shortName}</h3>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[var(--hm-text-muted)] hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Config badges */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] px-2 py-0.5 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded text-[var(--hm-text-soft)]">
                            {TECHNIQUE_LABELS[item.technique]}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded text-[var(--hm-text-soft)]">
                            {PLACEMENT_LABELS[item.placement]}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded font-bold text-[var(--hm-text)]">
                            {t("cartPage.size")} {item.size}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded text-[var(--hm-text-soft)] flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: item.color.hex }}
                            />
                            {item.color.label}
                          </span>
                        </div>

                        {/* Logo file */}
                        {item.logoFile && (
                          <p className="text-[10px] text-[var(--hm-primary)] mt-1.5 flex items-center gap-1 font-medium">
                            <Upload size={10} /> {item.logoFile.name}
                          </p>
                        )}

                        {/* Qty + price */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded border border-[var(--hm-line)] flex items-center justify-center text-[var(--hm-text-muted)] hover:text-[var(--hm-text)] hover:border-[var(--hm-primary)] transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-sm font-bold text-[var(--hm-text)] w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded border border-[var(--hm-line)] flex items-center justify-center text-[var(--hm-text-muted)] hover:text-[var(--hm-text)] hover:border-[var(--hm-primary)] transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                            <span className="text-[10px] text-[var(--hm-text-soft)]">
                              × {formatPrice(item.unitPrice)}{t("cartPage.perUnitSuffix")}
                            </span>
                          </div>
                          <span className="text-base font-black text-[var(--hm-text)]">
                            {formatPrice(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={clearCart}
                className="text-xs text-[var(--hm-text-muted)] hover:text-red-500 transition-colors self-start"
              >
                {t("cartPage.clearCart")}
              </button>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 bg-white border border-[var(--hm-line)] rounded-xl shadow-[var(--hm-shadow-sm)]">
                <h2 className="text-sm font-bold text-[var(--hm-text)] mb-5">{t("cartPage.summary.title")}</h2>

                {/* Totals */}
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                    <span>{t("cartPage.summary.subtotalHT")}</span>
                    <span>{formatPrice(totals.subtotalHT)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                    <span>{t("cartPage.summary.vat")}</span>
                    <span>{formatPrice(totals.tva)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                    <span>{t("cartPage.summary.delivery")}</span>
                    <span className={totals.freeShipping ? "text-[#4ade80] font-semibold" : ""}>
                      {totals.freeShipping ? t("cartPage.summary.free") : formatPrice(totals.shipping)}
                    </span>
                  </div>
                </div>

                {/* Free shipping progress */}
                {!totals.freeShipping && (
                  <div className="mb-5 p-3 bg-[var(--hm-surface)] rounded-lg">
                    <p className="text-xs text-[var(--hm-text-soft)] mb-2">
                      {t("cartPage.freeShipping.before")}{" "}
                      <strong className="text-[var(--hm-primary)]">{t("cartPage.freeShipping.threshold")}</strong>
                    </p>
                    <div className="h-1.5 bg-[var(--hm-line)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--hm-primary)] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (totals.totalItems / 10) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--hm-text-muted)] mt-1.5">
                      {totals.totalItems}/10 {t("cartPage.freeShipping.items")} ({10 - totals.totalItems}{" "}
                      {totals.totalItems < 9 ? t("cartPage.freeShipping.remaining.plural") : t("cartPage.freeShipping.remaining.singular")})
                    </p>
                  </div>
                )}

                <div className="divider-brand mb-5" />

                <div className="flex justify-between items-center mb-5">
                  <span className="font-bold text-[var(--hm-text)]">{t("cartPage.summary.totalTTC")}</span>
                  <span className="text-2xl font-black text-[var(--hm-primary)]">
                    {formatPrice(totals.totalTTC)}
                  </span>
                </div>

                <Link href="/checkout" className="btn-primary w-full text-center gap-2">
                  {t("cartPage.checkout")}
                  <ArrowRight size={14} />
                </Link>

                <Link href="/catalogue" className="btn-ghost w-full text-center mt-2 text-xs">
                  {t("cartPage.continueShopping")}
                </Link>

                {/* Trust */}
                <div className="mt-5 pt-4 border-t border-[var(--hm-line)] flex flex-col gap-2">
                  {[
                    `🔒 ${t("cartPage.trust.payment")}`,
                    `📦 ${t("cartPage.trust.tracking")}`,
                    `↩ ${t("cartPage.trust.cancellation")}`,
                  ].map((line) => (
                    <p key={line} className="text-[10px] text-[var(--hm-text-muted)]">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
