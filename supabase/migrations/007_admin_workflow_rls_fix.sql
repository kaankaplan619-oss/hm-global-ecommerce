-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 007 — Workflow statuses + RLS hardening
--
-- Corrections ciblées suite à l'audit sécurité :
--   1. orders.status : ajoute les 8 nouveaux statuts workflow production
--   2. order_items : scinde la policy update en client (restreinte) + admin
--   3. orders : supprime orders_update_self ; l'annulation client passe par l'API serveur
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Contrainte orders.status ──────────────────────────────────────────────
-- La contrainte inline générée par Postgres se nomme orders_status_check.
-- On la remplace pour inclure les 16 statuts (8 legacy + 8 nouveau workflow).
-- Les commandes existantes avec les anciens statuts ne sont pas affectées.

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (status IN (
    -- Statuts legacy (commandes existantes — rétrocompatibles)
    'paiement_recu',
    'fichier_a_verifier',
    'en_attente_client',
    'validee',
    'en_traitement',
    'expediee',
    'terminee',
    'annulee',
    -- Nouveau workflow production
    'commande_a_valider',
    'bat_a_preparer',
    'attente_validation_client',
    'a_commander_fournisseur',
    'commande_fournisseur_passee',
    'attente_reception_textile',
    'en_production',
    'prete_a_expedier'
  ));

-- ─── 2. RLS order_items — hardening ───────────────────────────────────────────
-- Problème : "order_items_update_logo" autorisait un client à écrire
-- logo_file_status = 'valide' directement via le SDK Supabase.
--
-- Correction : deux policies distinctes.
--   • order_items_update_client : client peut re-uploader un logo (logo_file_status
--     doit rester/devenir 'en_attente' — la route PATCH /api/orders/[id] respecte ça)
--   • order_items_update_admin : admin peut modifier tous les champs d'un item

DROP POLICY IF EXISTS "order_items_update_logo" ON public.order_items;

-- Client : re-upload logo uniquement. WITH CHECK force logo_file_status = 'en_attente'.
CREATE POLICY "order_items_update_client" ON public.order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    logo_file_status = 'en_attente'
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admin : update tous les champs (validation, rejet, BAT ref, etc.)
CREATE POLICY "order_items_update_admin" ON public.order_items
  FOR UPDATE
  USING (public.is_admin());

-- ─── 3. RLS orders — suppression orders_update_self ───────────────────────────
-- Problème : un client pouvait modifier status, admin_note, tracking_number,
-- supplier_mode, etc. sur ses propres commandes via appel SDK direct.
--
-- Correction : on supprime cette policy. L'annulation client passe désormais
-- par /api/orders/[id]/cancel qui utilise le service role côté serveur.
-- Le client garde SELECT sur ses commandes (orders_select inchangée).
-- L'admin garde UPDATE sur toutes les commandes (orders_update_admin inchangée).

DROP POLICY IF EXISTS "orders_update_self" ON public.orders;

-- Vérification finale : les policies qui restent sur orders sont :
--   orders_select       : user_id = auth.uid() OR is_admin()     [SELECT - inchangée]
--   orders_insert       : user_id = auth.uid()                   [INSERT - inchangée]
--   orders_update_admin : is_admin()                             [UPDATE - inchangée]
-- Un client ne peut plus UPDATE orders directement. ✓
