-- ============================================================================
-- Migration 016 — Colonnes suivi colis + Gelato
-- Date : 2026-06-11
-- Auteur : Kaan + Claude (audit Supabase du 2026-06-11)
-- ============================================================================
--
-- Contexte (constaté en base LIVE, lecture seule) :
--   1. Le webhook Printful package_shipped écrit `tracking_url` → colonne
--      INEXISTANTE → l'UPDATE entier échoue : ni statut "expediee", ni
--      tracking ne sont enregistrés à l'expédition.
--   2. La route POST /api/gelato/orders et le webhook Gelato écrivent
--      `gelato_order_id` / `gelato_status` → colonnes INEXISTANTES.
--   3. La contrainte orders_supplier_provider_check n'autorise pas 'gelato'
--      alors que la route Gelato écrit supplier_provider = 'gelato'.
--
-- Additive uniquement — aucune donnée modifiée ni supprimée.
-- Prérequis : migration 014 (bank transfer) appliquée.
-- ============================================================================

BEGIN;

-- ─── 1. Lien de suivi colis (écrit par webhooks Printful ET Gelato) ─────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_url text;

COMMENT ON COLUMN public.orders.tracking_url IS
  'URL de suivi colis fournie par le transporteur/fournisseur (Printful '
  'tracking_url, Gelato trackingUrl, ou saisie admin pour les envois atelier).';

-- ─── 2. Champs Gelato (symétriques de printful_order_id/printful_status) ────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gelato_order_id text,
  ADD COLUMN IF NOT EXISTS gelato_status   text;

COMMENT ON COLUMN public.orders.gelato_order_id IS
  'ID de commande Gelato (POST /api/gelato/orders). Lookup webhook entrant.';
COMMENT ON COLUMN public.orders.gelato_status IS
  'Dernier fulfillmentStatus Gelato reçu (created/printed/shipped/delivered…).';

CREATE INDEX IF NOT EXISTS idx_orders_gelato_order_id
  ON public.orders(gelato_order_id)
  WHERE gelato_order_id IS NOT NULL;

-- ─── 3. supplier_provider : autoriser 'gelato' ──────────────────────────────
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_supplier_provider_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_supplier_provider_check CHECK (
    supplier_provider IS NULL
    OR supplier_provider IN ('printful', 'toptex', 'falkross', 'interne', 'gelato')
  );

COMMIT;

-- ============================================================================
-- Vérification post-migration :
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name='orders'
--     AND column_name IN ('tracking_url','gelato_order_id','gelato_status');
--   -- Doit retourner les 3 lignes.
-- ============================================================================
