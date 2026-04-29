"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductColor, Technique, Placement } from "@/types";
import { computeUnitPrice, computeCartTotals } from "@/data/pricing";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddToCartParams {
  product: Product;
  quantity: number;
  size: string;
  color: ProductColor;
  technique: Technique;
  placement: Placement;
  logoFile?: CartItem["logoFile"];
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  // Actions
  addItem: (params: AddToCartParams) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateLogoFile: (itemId: string, file: CartItem["logoFile"]) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  // Computed
  getTotals: () => ReturnType<typeof computeCartTotals>;
  getTotalItems: () => number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Clé stable d'identification d'un logo pour la déduplication panier.
 * Priorité : URL Supabase (unique par upload) > "name|size|type" (fingerprint
 * fichier local). Une absence de logo retourne "".
 *
 * Garanties :
 *   - Même fichier uploadé deux fois → même URL Supabase → même clé → fusion ✅
 *   - Deux fichiers différents (même nom, taille différente) → clés distinctes ✅
 *   - Aucun logo → "" → fusionné uniquement avec d'autres sans-logo ✅
 */
function getLogoKey(logo: CartItem["logoFile"]): string {
  if (!logo) return "";
  if (logo.url) return logo.url;
  return `${logo.name}|${logo.size}|${logo.type}`;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (params) => {
        const { product, quantity, size, color, technique, placement, logoFile } = params;

        // Récupérer le prix de base selon la technique
        const basePrice = product.pricing[technique as keyof typeof product.pricing] as number;
        const unitPrice = computeUnitPrice({ basePrice, technique, placement });
        const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

        // Vérifier si un item identique existe déjà.
        // Deux logos différents (clés distinctes) → nouvelles lignes panier séparées.
        // Sans logo (clé "") → fusionné uniquement avec d'autres articles sans logo.
        const existingIndex = get().items.findIndex(
          (item) =>
            item.productId === product.id &&
            item.size === size &&
            item.color.id === color.id &&
            item.technique === technique &&
            item.placement === placement &&
            getLogoKey(item.logoFile) === getLogoKey(logoFile)
        );

        if (existingIndex >= 0) {
          set((state) => {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            const newQty = existing.quantity + quantity;
            updated[existingIndex] = {
              ...existing,
              quantity: newQty,
              totalPrice: Math.round(existing.unitPrice * newQty * 100) / 100,
            };
            return { items: updated };
          });
        } else {
          const newItem: CartItem = {
            id: crypto.randomUUID(),
            productId: product.id,
            product,
            quantity,
            size,
            color,
            technique,
            placement,
            logoFile,
            unitPrice,
            totalPrice,
          };
          set((state) => ({ items: [...state.items, newItem] }));
        }

        set({ isOpen: true });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  totalPrice: Math.round(item.unitPrice * quantity * 100) / 100,
                }
              : item
          ),
        }));
      },

      updateLogoFile: (itemId, file) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, logoFile: file } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotals: () => {
        const items = get().items;
        return computeCartTotals({
          items: items.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity })),
        });
      },

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: "hm-global-cart",
      // Ne pas persister isOpen
      partialize: (state) => ({ items: state.items }),
    }
  )
);
