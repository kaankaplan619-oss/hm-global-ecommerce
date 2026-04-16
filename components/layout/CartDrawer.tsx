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
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0f0f0f] border-l border-[#1e1e1e] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-[#c9a96e]" />
            <h2 className="font-semibold text-[#f5f5f5]">Mon panier</h2>
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
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <Package size={28} className="text-[#2a2a2a]" />
              </div>
              <p className="text-[#555555] text-sm">Votre panier est vide</p>
              <Link href="/catalogue" onClick={closeCart} className="btn-primary text-xs">
                Découvrir le catalogue
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]"
                >
                  {/* Product image placeholder */}
                  <div className="w-16 h-16 bg-[#222222] rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Package size={20} className="text-[#2a2a2a]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f5f5f5] truncate">
                      {item.product.shortName}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[10px] text-[#555555]">
                        {TECHNIQUE_LABELS[item.technique]}
                      </span>
                      <span className="text-[10px] text-[#555555]">·</span>
                      <span className="text-[10px] text-[#555555]">
                        {PLACEMENT_LABELS[item.placement]}
                      </span>
                      <span className="text-[10px] text-[#555555]">·</span>
                      <span className="text-[10px] text-[#555555]">{item.size}</span>
                      <span className="text-[10px] text-[#555555]">·</span>
                      <span className="text-[10px] text-[#555555]">{item.color.label}</span>
                    </div>
                    {item.logoFile && (
                      <p className="text-[10px] text-[#c9a96e] mt-1 truncate">
                        📎 {item.logoFile.name}
                      </p>
                    )}

                    {/* Qty + price row */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-[#222222] flex items-center justify-center text-[#8a8a8a] hover:text-[#f5f5f5] transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-medium text-[#f5f5f5] w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-[#222222] flex items-center justify-center text-[#8a8a8a] hover:text-[#f5f5f5] transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#f5f5f5]">
                          {formatPrice(item.totalPrice)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#555555] hover:text-[#f87171] transition-colors"
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
          <div className="border-t border-[#1e1e1e] px-6 py-5">
            {/* Free shipping banner */}
            {totals.freeShipping ? (
              <div className="flex items-center gap-2 mb-4 p-3 bg-[#4ade8011] border border-[#4ade8033] rounded-lg">
                <span className="text-[#4ade80] text-xs font-semibold">✓ Livraison offerte</span>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg">
                <p className="text-xs text-[#555555]">
                  Livraison offerte dès <strong className="text-[#c9a96e]">10 pièces</strong>
                </p>
                <div className="mt-2 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c9a96e] rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (totals.totalItems / 10) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-[#555555] mt-1">
                  {totals.totalItems}/10 pièces
                </p>
              </div>
            )}

            {/* Totals */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-sm text-[#8a8a8a]">
                <span>Sous-total HT</span>
                <span>{formatPrice(totals.subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#8a8a8a]">
                <span>TVA (20%)</span>
                <span>{formatPrice(totals.tva)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#8a8a8a]">
                <span>Livraison</span>
                <span className={totals.freeShipping ? "text-[#4ade80]" : ""}>
                  {totals.freeShipping ? "Offerte" : formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="divider-gold my-2" />
              <div className="flex justify-between font-bold text-[#f5f5f5]">
                <span>Total TTC</span>
                <span className="text-[#c9a96e] text-lg">{formatPrice(totals.totalTTC)}</span>
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
