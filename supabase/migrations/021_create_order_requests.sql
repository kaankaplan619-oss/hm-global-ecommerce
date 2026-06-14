-- ─────────────────────────────────────────────────────────────────────────────
-- HM Global Agence — Demandes liées à une commande (facture / remboursement)
--
-- Un client ouvre un « dossier » depuis sa commande : il demande sa facture PDF
-- ou un remboursement. Chaque demande est tracée et traitée côté admin.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_requests (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,

  type          text        NOT NULL
    CHECK (type IN ('facture', 'remboursement')),
  status        text        NOT NULL DEFAULT 'nouveau'
    CHECK (status IN ('nouveau', 'en_cours', 'traite', 'refuse')),

  reason        text,                 -- motif (surtout remboursement)
  contact_email text,                 -- email du demandeur (traçabilité)
  internal_note text,                 -- note interne admin

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  handled_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_order_requests_order_id
  ON public.order_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_order_requests_status
  ON public.order_requests(status);
CREATE INDEX IF NOT EXISTS idx_order_requests_created_at
  ON public.order_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_requests_user_id
  ON public.order_requests(user_id);

-- updated_at auto (réutilise la fonction de 003_triggers.sql)
DROP TRIGGER IF EXISTS order_requests_updated_at ON public.order_requests;
CREATE TRIGGER order_requests_updated_at
  BEFORE UPDATE ON public.order_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;

-- INSERT : un utilisateur authentifié ne peut créer une demande QUE pour SA
-- propre commande (vérification d'ownership dans le WITH CHECK).
DROP POLICY IF EXISTS "order_requests_insert_own" ON public.order_requests;
CREATE POLICY "order_requests_insert_own" ON public.order_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- SELECT : propriétaire de la demande OU admin.
DROP POLICY IF EXISTS "order_requests_select_own_or_admin" ON public.order_requests;
CREATE POLICY "order_requests_select_own_or_admin" ON public.order_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- UPDATE : admin uniquement (traitement du dossier).
DROP POLICY IF EXISTS "order_requests_update_admin" ON public.order_requests;
CREATE POLICY "order_requests_update_admin" ON public.order_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
