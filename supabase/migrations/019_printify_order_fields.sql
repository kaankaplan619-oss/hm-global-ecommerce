-- ============================================================================
-- Migration 019 — Champs commande Printify
-- Date : 2026-06-14
-- Auteur : Kaan + Claude
-- ============================================================================
--
-- Contexte : intégration native de l'envoi de commande à Printify (symétrique
-- de Printful/Gelato). La route POST /api/printify/orders écrit
-- `printify_order_id` / `printify_status` et `supplier_provider = 'printify'` —
-- colonnes/valeur INEXISTANTES avant cette migration.
--
-- Additive uniquement — aucune donnée modifiée ni supprimée.
-- Prérequis : migration 016 (supplier_tracking_gelato) appliquée.
-- ============================================================================

BEGIN;

-- ─── 1. Champs Printify (symétriques de printful_order_id / gelato_order_id) ─
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS printify_order_id text,
  ADD COLUMN IF NOT EXISTS printify_status   text;

COMMENT ON COLUMN public.orders.printify_order_id IS
  'ID de commande Printify (POST /api/printify/orders, brouillon non envoyé en '
  'production). Lookup webhook entrant.';
COMMENT ON COLUMN public.orders.printify_status IS
  'Dernier statut Printify reçu (on-hold/in-production/fulfilled/shipped…).';

CREATE INDEX IF NOT EXISTS idx_orders_printify_order_id
  ON public.orders(printify_order_id)
  WHERE printify_order_id IS NOT NULL;

-- ─── 2. supplier_provider : autoriser 'printify' ────────────────────────────
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_supplier_provider_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_supplier_provider_check CHECK (
    supplier_provider IS NULL
    OR supplier_provider IN ('printful', 'toptex', 'falkross', 'interne', 'gelato', 'printify')
  );

COMMIT;

-- ============================================================================
-- Vérification post-migration :
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name='orders'
--     AND column_name IN ('printify_order_id','printify_status');
--   -- Doit retourner les 2 lignes.
-- ============================================================================
