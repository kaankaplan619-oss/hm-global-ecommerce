-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 009 — Ajout supplier_provider sur orders
--
-- Contexte : la migration 008 appliquée manuellement avait créé printful_shipping_info
-- (JSONB) au lieu de supplier_provider (text). Ce champ est requis par les routes
-- POST /api/printful/orders et le mapper mapDbOrderToOrder.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS supplier_provider text
    CONSTRAINT orders_supplier_provider_check
      CHECK (supplier_provider IS NULL OR supplier_provider IN (
        'printful', 'toptex', 'falkross', 'interne'
      ));
