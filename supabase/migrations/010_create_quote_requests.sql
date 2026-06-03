-- ─────────────────────────────────────────────────────────────────────────────
-- HM Global Agence — Demandes de devis rapide
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quote_requests (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  status            text        NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_review', 'quoted', 'won', 'lost', 'archived')),

  company_name      text        NOT NULL,
  email             text        NOT NULL,
  phone             text,
  need_type         text        NOT NULL,
  quantity_range    text        NOT NULL,
  desired_product   text,
  desired_technique text        NOT NULL,
  message           text,

  file_name         text,
  file_url          text,
  file_path         text,
  file_type         text,
  file_size         integer,

  source            text        NOT NULL DEFAULT 'devis_rapide',
  page_path         text,
  user_agent        text,
  internal_note     text,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status
  ON public.quote_requests(status);

CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at
  ON public.quote_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quote_requests_email
  ON public.quote_requests(email);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quote_requests_insert_public" ON public.quote_requests;
CREATE POLICY "quote_requests_insert_public" ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "quote_requests_select_admin" ON public.quote_requests;
CREATE POLICY "quote_requests_select_admin" ON public.quote_requests
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "quote_requests_update_admin" ON public.quote_requests;
CREATE POLICY "quote_requests_update_admin" ON public.quote_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
