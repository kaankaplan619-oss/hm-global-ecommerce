-- ─────────────────────────────────────────────────────────────────────────────
-- HM Global Agence — Statuts admin des demandes devis
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quote_requests
  DROP CONSTRAINT IF EXISTS quote_requests_status_check;

UPDATE public.quote_requests
SET status = CASE status
  WHEN 'in_review' THEN 'pricing'
  WHEN 'quoted'    THEN 'quote_sent'
  WHEN 'won'       THEN 'validated'
  WHEN 'lost'      THEN 'refused'
  ELSE status
END
WHERE status IN ('in_review', 'quoted', 'won', 'lost');

ALTER TABLE public.quote_requests
  ADD CONSTRAINT quote_requests_status_check
  CHECK (status IN (
    'new',
    'pricing',
    'bat_to_prepare',
    'quote_sent',
    'validated',
    'refused',
    'archived'
  ));
