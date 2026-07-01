-- ─────────────────────────────────────────────────────────────────────────────
-- HM Global Agence — Avis clients internes
--
-- Un client laisse un avis (note + commentaire) sur une commande LIVRÉE.
-- Modération : status 'pending' → 'approved' / 'rejected'. Seuls les avis
-- 'approved' sont visibles publiquement. Un seul avis par commande.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  rating      smallint    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text        NOT NULL DEFAULT '',
  user_name   text,                 -- prénom / nom d'affichage (renseigné à la modération)
  company     text,                 -- société (facultatif, affichage)
  status      text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_status_created
  ON public.reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id
  ON public.reviews(user_id);

-- updated_at auto (réutilise la fonction de 003_triggers.sql)
DROP TRIGGER IF EXISTS reviews_updated_at ON public.reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- SELECT public : uniquement les avis approuvés (affichage sur le site).
DROP POLICY IF EXISTS "reviews_public_read_approved" ON public.reviews;
CREATE POLICY "reviews_public_read_approved" ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- SELECT : propriétaire (voir son propre avis, même non approuvé) OU admin.
DROP POLICY IF EXISTS "reviews_select_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_select_own_or_admin" ON public.reviews
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- INSERT : un utilisateur authentifié ne peut créer un avis QUE pour SA propre
-- commande LIVRÉE (ownership + statut vérifiés dans le WITH CHECK).
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.user_id = auth.uid()
        AND o.status = 'terminee'
    )
  );

-- UPDATE : admin uniquement (modération).
DROP POLICY IF EXISTS "reviews_update_admin" ON public.reviews;
CREATE POLICY "reviews_update_admin" ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
