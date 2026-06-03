-- ============================================================================
-- Migration 012 — Extend supplier_mode enum
-- Date : 2026-05-26
-- Auteur : Kaan + Claude (review WG004 stock V1 + admin workflow)
-- ============================================================================
--
-- Contexte :
--   Le champ orders.supplier_mode était limité à 2 valeurs ("fournisseur",
--   "secours_interne") via une CHECK constraint historique (migration 001).
--
--   Le besoin métier a évolué :
--     - "fournisseur" était ambigu (TopTex/Falk&Ross/NewWave = pas d'API,
--       toujours commande manuelle → on personnalise au studio interne)
--     - Pas de distinction entre POD automatisé (Printify, Gelato) et
--       traitement manuel
--     - Stock agence (WG004 V1, 100 pièces) n'avait pas de mode dédié
--
--   On étend donc l'enum à 4 nouveaux modes :
--     1. production_interne → textile commandé manuellement à un fournisseur
--        (Falk&Ross, TopTex, NewWave) puis personnalisé au studio HM
--     2. printify           → POD automatisé via API Printify (Gildan, Bella,
--                              mugs blueprint 441…)
--     3. gelato             → POD automatisé via API Gelato (mugs, posters,
--                              accessoires print-on-demand)
--     4. stock_interne      → produit déjà en stock à l'agence (WG004 V1
--                              100 pcs, etc.) — pas de commande fournisseur
--
--   Les 2 valeurs legacy ("fournisseur", "secours_interne") restent acceptées
--   en lecture pour les commandes pré-2026-05-26. Pour la cohérence des
--   nouvelles commandes, le default DB passe à "production_interne".
--
-- Migration retro-compatible :
--   - Pas de transformation des données existantes (legacy values gardées)
--   - Type TypeScript frontend (types/index.ts) déjà mis à jour avec l'union
--     élargie (production_interne | printify | gelato | stock_interne |
--     fournisseur | secours_interne)
--   - Rollback possible : DROP constraint puis ADD avec liste réduite
--
-- ============================================================================

BEGIN;

-- Drop l'ancienne CHECK constraint (créée dans 001_initial_schema)
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_supplier_mode_check;

-- Ajoute la nouvelle CHECK constraint élargie (4 nouveaux + 2 legacy)
ALTER TABLE orders
  ADD CONSTRAINT orders_supplier_mode_check
  CHECK (supplier_mode IN (
    -- Modes principaux V1+
    'production_interne',
    'printify',
    'gelato',
    'stock_interne',
    -- Legacy supportés en lecture pour vieilles commandes (à remapper en V1.1)
    'fournisseur',
    'secours_interne'
  ));

-- Update du default DB pour les nouvelles commandes
ALTER TABLE orders
  ALTER COLUMN supplier_mode SET DEFAULT 'production_interne';

COMMIT;

-- ============================================================================
-- Pour vérifier après application :
--
--   SELECT supplier_mode, COUNT(*) FROM orders GROUP BY supplier_mode;
--   -- Doit montrer toutes les valeurs existantes (legacy + nouveau)
--
--   -- Test acceptance des 4 nouveaux modes :
--   INSERT INTO orders (... supplier_mode ...) VALUES (... 'printify' ...);
--   INSERT INTO orders (... supplier_mode ...) VALUES (... 'production_interne' ...);
--   -- Doit réussir sans CHECK violation.
-- ============================================================================
