"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Plus, Minus, Trash2, Package } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/data/pricing";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/data/techniques";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotals } = useCartStore();
  const totals = getTotals();

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
            <h2 className="font-semibold text-[var(--hm-text)]">Mon panier</h2>
            {items.length > 0 && (
              <span className="badge badge-gold">{totals.totalItems} article{totals.totalItems > 1 ? "s" : ""}</span>
            )}
          </div>
          <button onClick={closeCart} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--hm-surface)]">
                <Package size={28} className="text-[var(--hm-text-muted)]" />
              </div>
              <p className="text-sm text-[var(--hm-text-soft)]">Votre panier est vide</p>
              <Link href="/catalogue" onClick={closeCart} className="btn-primary text-xs">
                Découvrir le catalogue
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-[1.25rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4"
                >
                  {/* Product image placeholder */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--hm-line)] bg-white">
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

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--hm-text)]">
                      {item.product.shortName}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="text-[10px] text-[var(--hm-text-soft)]">
                        {TECHNIQUE_LABELS[item.technique]}
                      </span>
                      <span className="text-[10px] text-[var(--hm-text-soft)]">·</span>
                      <span className="text-[10px] text-[var(--hm-text-soft)]">
                        {PLACEMENT_LABELS[item.placement]}
                      </span>
                      <span className="text-[10px] text-[var(--hm-text-soft)]">·</span>
                      <span className="text-[10px] text-[var(--hm-text-soft)]">{item.size}</span>
                      <span className="text-[10px] text-[var(--hm-text-soft)]">·</span>
                      <span className="text-[10px] text-[var(--hm-text-soft)]">{item.color.label}</span>
                    </div>
                    {item.logoFile && (
                      <p className="mt-1 truncate text-[10px] text-[var(--hm-primary)]">
                        📎 {item.logoFile.name}
                      </p>
                    )}

                    {/* Qty + price row */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition-colors hover:border-[var(--hm-primary)]/35 hover:text-[var(--hm-text)]"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-[var(--hm-text)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] transition-colors hover:border-[var(--hm-primary)]/35 hover:text-[var(--hm-text)]"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[var(--hm-text)]">
                          {formatPrice(item.totalPrice)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[var(--hm-text-muted)] transition-colors hover:text-[#f87171]"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer totals */}
        {items.length > 0 && (
          <div className="border-t border-[var(--hm-line)] bg-white px-6 py-5">
            {/* Free shipping banner */}
            {totals.freeShipping ? (
              <div className="mb-4 flex items-center gap-2 rounded-[1rem] border border-[#4ade8033] bg-[#4ade8011] p-3">
                <span className="text-[#4ade80] text-xs font-semibold">✓ Livraison offerte</span>
              </div>
            ) : (
              <div className="mb-4 rounded-[1rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-3">
                <p className="text-xs text-[var(--hm-text-soft)]">
                  Livraison offerte dès <strong className="text-[var(--hm-primary)]">10 pièces</strong>
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[var(--hm-primary)] transition-all"
                    style={{
                      width: `${Math.min(100, (totals.totalItems / 10) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-[var(--hm-text-muted)]">
                  {totals.totalItems}/10 pièces
                </p>
              </div>
            )}

            {/* Totals */}
            <div className="mb-4 flex flex-col gap-2 rounded-[1rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
              <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                <span>Sous-total HT</span>
                <span>{formatPrice(totals.subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                <span>TVA (20%)</span>
                <span>{formatPrice(totals.tva)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--hm-text-soft)]">
                <span>Livraison</span>
                <span className={totals.freeShipping ? "text-[#4ade80]" : ""}>
                  {totals.freeShipping ? "Offerte" : formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="divider-gold my-2" />
              <div className="flex justify-between font-bold text-[var(--hm-text)]">
                <span>Total TTC</span>
                <span className="text-lg text-[var(--hm-primary)]">{formatPrice(totals.totalTTC)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center"
            >
              Passer la commande
            </Link>
            <button
              onClick={closeCart}
              className="btn-ghost w-full text-center mt-2 text-xs"
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  );
}
