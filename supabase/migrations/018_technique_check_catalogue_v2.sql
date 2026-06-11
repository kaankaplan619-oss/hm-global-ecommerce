-- 018 — Contrainte technique alignée sur le catalogue 2026 (bug E2E 2026-06-12)
--
-- Découvert pendant le test de paiement E2E : la contrainte historique
-- n'acceptait que dtf/flex/broderie. Depuis, le catalogue vend aussi :
--   - dtflex              (technique DTFlex, textiles)
--   - broderie_illimitee  (Broderie ∞)
--   - print               (cartes de visite & produits impression)
-- Conséquence : l'INSERT des order_items échouait silencieusement (code 23514)
-- pour toute commande contenant un de ces articles → commande créée avec
-- 0 article (ex. HM-2026-7993, 351,30 €, panier mixte print+dtf).
--
-- NOTE : create-payment-intent loggue l'erreur mais renvoie 200 — un garde-fou
-- applicatif (échec bloquant si items non insérés) est recommandé en plus.

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_technique_check;

ALTER TABLE order_items ADD CONSTRAINT order_items_technique_check
  CHECK (technique = ANY (ARRAY[
    'dtf'::text,
    'dtflex'::text,
    'flex'::text,
    'broderie'::text,
    'broderie_illimitee'::text,
    'print'::text
  ]));
