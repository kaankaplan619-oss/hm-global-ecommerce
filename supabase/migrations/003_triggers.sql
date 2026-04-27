-- ─────────────────────────────────────────────────────────────────────────────
-- HM Global Agence — Functions & Triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── updated_at auto-update ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Auto-create profile on Supabase Auth signup ─────────────────────────────
-- Reads custom data from raw_user_meta_data (passed via signUp options.data)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
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
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    'client',
    COALESCE(NEW.raw_user_meta_data->>'type', 'particulier'),
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'siret',
    NEW.raw_user_meta_data->>'tva_intracom'
  )
  ON CONFLICT (id) DO NOTHING; -- idempotent in case of retries
  RETURN NEW;
END;
$$;

-- Trigger fires after Supabase creates the auth user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Supabase Storage: customer-logos bucket ────────────────────────────────
-- Run this AFTER creating the bucket in the Supabase dashboard (or via CLI):
--   supabase storage buckets create customer-logos --public=true

-- Storage policies are set via the dashboard or supabase storage CLI.
-- Recommended policy for bucket "customer-logos":
--
-- ALLOW INSERT for authenticated users to path: orders/{order_id}/{user_id}/**
-- ALLOW SELECT for authenticated users to their own files
-- ALLOW SELECT for service role to all files (admin downloads)
--
-- This is configured in the Supabase dashboard under Storage > logos > Policies.

-- ─── Make admin account ───────────────────────────────────────────────────────
-- After the admin user signs up via /inscription, run this in the SQL editor:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'contact@hmglobalagence.fr');
--
-- Do NOT hardcode admin credentials in this file.
