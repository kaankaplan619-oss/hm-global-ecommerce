"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Package, Minus, Plus, Trash2, ArrowRight, Upload, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/data/pricing";
import { TECHNIQUE_LABELS, PLACEMENT_LABELS } from "@/data/techniques";

export default function PanierPage() {
  const { items, removeItem, updateQuantity, getTotals, clearCart } = useCartStore();
  const totals = getTotals();

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--hm-surface)] border border-[var(--hm-line)] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-[var(--hm-text-muted)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--hm-text)] mb-3">Votre panier est vide</h1>
          <p className="text-sm text-[var(--hm-text-soft)] mb-8">
            Découvrez notre catalogue de textile personnalisé.
          </p>
          <Link href="/catalogue" className="btn-primary">
            Voir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-[var(--hm-text)] mb-2">Mon panier</h1>
          <p className="text-sm text-[var(--hm-text-soft)]">
            {totals.totalItems} article{totals.totalItems > 1 ? "s" : ""} sélectionné{totals.totalItems > 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white border border-[var(--hm-line)] rounded-xl shadow-[var(--hm-shadow-xs)]"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 bg-[var(--hm-surface)] rounded-lg shrink-0 overflow-hidden flex items-center justify-center border border-[var(--hm-line)]">
                    {item.product.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Package size={24} className="text-[var(--hm-text-muted)]" />
                    )}
                  </div>

                  {/* Details */}
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
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded text-[var(--hm-text-soft)]">
                        {TECHNIQUE_LABELS[item.technique]}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded text-[var(--hm-text-soft)]">
                        {PLACEMENT_LABELS[item.placement]}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded text-[var(--hm-text-soft)]">
                        Taille {item.size}
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
                    {item.logoFile ? (
                      <p className="text-[10px] text-[var(--hm-primary)] mt-2 flex items-center gap-1 font-medium">
                        <Upload size={10} /> {item.logoFile.name}
                      </p>
                    ) : (
                      <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700">
                        <AlertTriangle size={11} className="shrink-0" />
                        Aucun fichier logo — vous pourrez en ajouter un depuis votre compte
                      </div>
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
                          × {formatPrice(item.unitPrice)}/pce
                        </span>
                      </div>
                      <span className="text-base font-black text-[var(--hm-text)]">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-xs text-[var(--hm-text-muted)] hover:text-red-500 transition-colors self-start"
            >
              Vider le panier
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-white border border-[var(--hm-line)] rounded-xl shadow-[var(--hm-shadow-sm)]">
              <h2 className="text-sm font-bold text-[var(--hm-text)] mb-5">Récapitulatif</h2>

              {/* Totals */}
              <div className="flex flex-col gap-3 mb-5">
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
                  <span className={totals.freeShipping ? "text-[#4ade80] font-semibold" : ""}>
                    {totals.freeShipping ? "Offerte ✓" : formatPrice(totals.shipping)}
                  </span>
                </div>
              </div>

              {/* Free shipping progress */}
              {!totals.freeShipping && (
                <div className="mb-5 p-3 bg-[var(--hm-surface)] rounded-lg">
                  <p className="text-xs text-[var(--hm-text-soft)] mb-2">
                    Livraison offerte dès <strong className="text-[var(--hm-primary)]">10 pièces</strong>
                  </p>
                  <div className="h-1.5 bg-[var(--hm-line)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--hm-primary)] rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totals.totalItems / 10) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--hm-text-muted)] mt-1.5">
                    {totals.totalItems}/10 articles ({10 - totals.totalItems} restant{totals.totalItems < 9 ? "s" : ""})
                  </p>
                </div>
              )}

              <div className="divider-brand mb-5" />

              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-[var(--hm-text)]">Total TTC</span>
                <span className="text-2xl font-black text-[var(--hm-primary)]">
                  {formatPrice(totals.totalTTC)}
                </span>
              </div>

              <Link href="/checkout" className="btn-primary w-full text-center gap-2">
                Passer la commande
                <ArrowRight size={14} />
              </Link>

              <Link href="/catalogue" className="btn-ghost w-full text-center mt-2 text-xs">
                Continuer mes achats
              </Link>

              {/* Trust */}
              <div className="mt-5 pt-4 border-t border-[var(--hm-line)] flex flex-col gap-2">
                {["🔒 Paiement sécurisé Stripe", "📦 Suivi de commande inclus", "↩ Annulation 30 minutes"].map((t) => (
                  <p key={t} className="text-[10px] text-[var(--hm-text-muted)]">{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
