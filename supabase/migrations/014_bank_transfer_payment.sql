-- ============================================================================
-- Migration 014 — Bank transfer payment method
-- Date : 2026-05-27
-- Auteur : Kaan + Claude (V1 manuel — pas d'intégration banque)
-- ============================================================================
--
-- Contexte :
--   Ajout d'un second mode de paiement "virement bancaire" en alternative à
--   Stripe CB/Link. En V1 c'est manuel : on n'écoute pas la banque, on attend
--   que le client fasse le virement et on marque la commande comme payée
--   depuis l'admin (bouton "Marquer payé par virement").
--
--   Stripe reste inchangé pour les commandes CB. Le statut DB legacy
--   `paiement_recu` est réutilisé une fois le virement reçu et marqué admin.
--
-- Champs ajoutés à orders :
--   payment_method   text NOT NULL DEFAULT 'stripe'  ('stripe' | 'bank_transfer')
--
-- Statut ajouté :
--   awaiting_bank_transfer — commande créée, en attente de réception du virement
--   bank_transfer_received — virement reçu (marqué par admin) — alias verbeux
--                            de paiement_recu pour ce flux ; on garde
--                            paiement_recu pour la rétrocompat workflow admin
--
-- Note : les colonnes stripe_payment_intent_id et stripe_payment_status
-- restent NULLABLE et le seront pour toute commande payée par virement.
-- ============================================================================

BEGIN;

-- ─── 1. Ajout colonne payment_method ────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'stripe'
    CHECK (payment_method IN ('stripe', 'bank_transfer'));

COMMENT ON COLUMN public.orders.payment_method IS
  'Méthode de paiement choisie au checkout. '
  '"stripe" = CB/Link/Apple Pay/Google Pay (flux Stripe PaymentIntent). '
  '"bank_transfer" = virement bancaire (V1 manuel, sans réconciliation auto).';

-- ─── 2. Extension contrainte status ────────────────────────────────────────
-- Ajout du statut awaiting_bank_transfer au CHECK existant.
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check CHECK (status IN (
    -- Statuts legacy (rétrocompatibles)
    'paiement_recu',
    'fichier_a_verifier',
    'en_attente_client',
    'validee',
    'en_traitement',
    'expediee',
    'terminee',
    'annulee',
    -- Workflow production
    'commande_a_valider',
    'bat_a_preparer',
    'attente_validation_client',
    'a_commander_fournisseur',
    'commande_fournisseur_passee',
    'attente_reception_textile',
    'en_production',
    'prete_a_expedier',
    -- Virement bancaire (migration 014)
    'awaiting_bank_transfer'
  ));

-- ─── 3. Index utile filtre admin ────────────────────────────────────────────
-- Les commandes en attente de virement seront filtrées régulièrement par
-- l'admin pour relancer / marquer payé. Index composite léger.
CREATE INDEX IF NOT EXISTS idx_orders_payment_method
  ON public.orders(payment_method)
  WHERE payment_method = 'bank_transfer';

COMMIT;

-- ============================================================================
-- Vérification post-migration :
--
--   \d+ orders
--   -- Doit montrer payment_method text NOT NULL DEFAULT 'stripe'.
--
--   SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conrelid = 'public.orders'::regclass
--     AND conname LIKE '%status%';
--   -- Doit inclure awaiting_bank_transfer dans la liste.
-- ============================================================================
