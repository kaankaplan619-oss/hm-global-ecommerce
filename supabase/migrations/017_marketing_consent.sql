-- 017_marketing_consent.sql — Consentement prospection (#88, RGPD/CNIL)
-- Opt-in actif (case non pré-cochée au checkout/inscription).
-- profiles : consentement du compte + horodatage (preuve CNIL).
-- orders   : consentement capté au checkout (couvre aussi les invités).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_consent    boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_at timestamptz;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.marketing_consent    IS 'Opt-in emails de prospection (RGPD) — jamais pré-coché';
COMMENT ON COLUMN public.profiles.marketing_consent_at IS 'Horodatage du consentement (preuve CNIL)';
COMMENT ON COLUMN public.orders.marketing_consent      IS 'Opt-in prospection capté au checkout (invités inclus)';
