"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductColor, Technique, Placement, PrintConfig } from "@/types";
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
  logoEffect?: CartItem["logoEffect"];
  logoPlacementTransform?: CartItem["logoPlacementTransform"];
  batRef?: CartItem["batRef"];
  /** Image composée face (studio export) — stockée en mémoire seulement, non persistée */
  composedPreviewUrl?: string;
  /** Image composée dos (studio export) — stockée en mémoire seulement, non persistée */
  composedPreviewBack?: string;
  /**
   * Config impression print — présente uniquement pour les articles print.
   * Si fournie, le prix est lu depuis printConfig.lotPriceTTC (prix du lot TTC).
   * quantity dans le cart = 1 (1 lot). printConfig.quantity = nb d'exemplaires.
   * Non persistée en localStorage.
   */
  printConfig?: PrintConfig;
  /**
   * Override du prix unitaire TTC — utilisé pour les items print.
   * Bypasse le calcul computeUnitPrice() basé sur product.pricing.
   * Textile : ne pas renseigner (calcul normal depuis product.pricing).
   */
  overrideUnitPrice?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAddedItemId: string | null;
  lastAddedAt: number | null;
  lastAddedName: string | null;
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
      lastAddedItemId: null,
      lastAddedAt: null,
      lastAddedName: null,

      addItem: (params) => {
        const { product, quantity, size, color, technique, placement, logoFile, logoEffect, logoPlacementTransform, batRef, composedPreviewUrl, composedPreviewBack, printConfig, overrideUnitPrice } = params;

        // ── Prix unitaire ────────────────────────────────────────────────────
        // Print : le prix est celui du lot entier (overrideUnitPrice = lotPriceTTC).
        //         quantity dans le cart = 1 (1 lot). printConfig.quantity = exemplaires.
        // Textile : calcul normal depuis product.pricing + surcharge placement.
        let unitPrice: number;
        let effectiveQuantity: number;

        if (printConfig) {
          // Prix du lot = prix total de la commande print — ne pas multiplier par quantity.
          unitPrice       = overrideUnitPrice ?? printConfig.lotPriceTTC;
          effectiveQuantity = 1; // 1 lot
        } else {
          const basePrice = product.pricing[technique as keyof typeof product.pricing] as number;
          unitPrice       = computeUnitPrice({ basePrice, technique: technique as "dtf" | "dtflex" | "flex" | "broderie" | "broderie_illimitee", placement: placement as "coeur" | "dos" | "coeur-dos" });
          effectiveQuantity = quantity;
        }

        const totalPrice = Math.round(unitPrice * effectiveQuantity * 100) / 100;

        // ── Déduplication ────────────────────────────────────────────────────
        // Print : chaque ajout = nouvelle ligne (un lot est toujours distinct).
        // Textile : fusion si même produit/taille/couleur/technique/placement/logo.
        const existingIndex = printConfig ? -1 : get().items.findIndex(
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
            const newQty = existing.quantity + effectiveQuantity;
            updated[existingIndex] = {
              ...existing,
              quantity: newQty,
              totalPrice: Math.round(existing.unitPrice * newQty * 100) / 100,
            };
            return {
              items: updated,
              lastAddedItemId: existing.id,
              lastAddedAt: Date.now(),
              lastAddedName: existing.product.shortName,
            };
          });
        } else {
          const newItemId = crypto.randomUUID();
          const newItem: CartItem = {
            id: newItemId,
            productId: product.id,
            product,
            quantity: effectiveQuantity,
            size,
            color,
            technique,
            placement,
            logoFile,
            logoEffect,
            logoPlacementTransform,
            batRef,
            unitPrice,
            totalPrice,
            composedPreviewUrl,
            composedPreviewBack,
            printConfig,
          };
          set((state) => ({
            items: [...state.items, newItem],
            lastAddedItemId: newItemId,
            lastAddedAt: Date.now(),
            lastAddedName: product.shortName,
          }));
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
      // Persiste isOpen=false (toujours), printConfig nettoyé (sans base64),
      // composedPreviewUrl/Back conservés UNIQUEMENT si ce sont des URLs Supabase
      // (https://). Les data URL base64 sont jetés (trop lourdes pour
      // localStorage qui a une limite ~5 MB par origine).
      partialize: (state) => ({
        items: state.items.map((item) => {
          // Conserve les previews uniquement si ce sont des URLs Supabase
          // Storage (uploadComposedPreviewToSupabase les transforme en URL avant
          // l'ajout au panier). Si l'upload a échoué et qu'on a encore du base64,
          // on les jette pour éviter de saturer le localStorage.
          const keepIfSupabaseUrl = (s?: string) =>
            s && !s.startsWith("data:") ? s : undefined;
          const { composedPreviewUrl, composedPreviewBack, printConfig, ...rest } = item;
          const safeComposedFace = keepIfSupabaseUrl(composedPreviewUrl);
          const safeComposedBack = keepIfSupabaseUrl(composedPreviewBack);

          const safePrintConfig = printConfig
            ? {
                ...printConfig,
                // Retirer les previews base64 (data:image/...) — trop lourdes pour localStorage.
                // Les URLs Supabase (https://...) sont conservées.
                frontPreviewUrl: printConfig.frontPreviewUrl?.startsWith("data:")
                  ? null
                  : printConfig.frontPreviewUrl,
                backPreviewUrl: printConfig.backPreviewUrl?.startsWith("data:")
                  ? null
                  : printConfig.backPreviewUrl,
              }
            : undefined;

          return {
            ...rest,
            composedPreviewUrl:  safeComposedFace,
            composedPreviewBack: safeComposedBack,
            printConfig: safePrintConfig,
          };
        }),
      }),
      // Empêche la réhydratation automatique pendant le rendu React (SSR/CSR).
      // Sans cette option, Zustand lit localStorage pendant le render → mismatch
      // HTML server/client → React Hydration Error #418.
      // La réhydratation manuelle est déclenchée dans Header via useEffect.
      skipHydration: true,
    }
  )
);
