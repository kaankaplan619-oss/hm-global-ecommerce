-- ─────────────────────────────────────────────────────────────────────────────
-- HM Global Agence — Add email column to profiles
--
-- Email is denormalized from auth.users so the mapper can build order.user.email
-- without a second query to auth.users (which requires service role + extra RTT).
-- Source of truth stays auth.users. Email changes require contacting support
-- (already documented in /mon-compte/parametres).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- Backfill existing rows from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- Update the handle_new_user trigger to also write email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    role,
    type,
    company,
    siret,
    tva_intracom
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'client',
    COALESCE(NEW.raw_user_meta_data->>'type', 'particulier'),
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'siret',
    NEW.raw_user_meta_data->>'tva_intracom'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;
