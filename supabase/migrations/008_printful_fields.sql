-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 008 — Printful POD integration fields
--
-- Additive only: aucun DROP, aucune breaking change.
-- Les commandes existantes auront ces champs à NULL (comportement normal).
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. orders — 3 nouveaux champs ───────────────────────────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS printful_order_id  integer,
  ADD COLUMN IF NOT EXISTS printful_status    text,
  ADD COLUMN IF NOT EXISTS supplier_provider  text
    CONSTRAINT orders_supplier_provider_check
      CHECK (supplier_provider IS NULL OR supplier_provider IN (
        'printful', 'toptex', 'falkross', 'interne'
      ));

-- Index pour lookup rapide par ID Printful (webhook + admin)
CREATE INDEX IF NOT EXISTS idx_orders_printful_order_id
  ON public.orders(printful_order_id)
  WHERE printful_order_id IS NOT NULL;

-- ─── 2. order_items — 1 nouveau champ ────────────────────────────────────────

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS printful_variant_id integer;

-- ─── Vérification finale ──────────────────────────────────────────────────────
-- orders  : printful_order_id (integer), printful_status (text), supplier_provider (text w/ CHECK)
-- order_items: printful_variant_id (integer)
-- Aucune policy RLS modifiée.
