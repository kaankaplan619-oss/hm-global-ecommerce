-- ─────────────────────────────────────────────────────────────────────────────
-- HM Global Agence — Row Level Security Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Helper: check if current user is admin ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─── profiles ────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- A user can read their own profile; admin can read all
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

-- A user can update their own profile (not role — that stays server-controlled)
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Insert is done by the trigger (SECURITY DEFINER), no direct INSERT policy needed for users
-- Admins can insert if needed
CREATE POLICY "profiles_insert_service" ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin() OR id = auth.uid());

-- ─── addresses ───────────────────────────────────────────────────────────────

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "addresses_select" ON public.addresses
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "addresses_insert" ON public.addresses
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "addresses_update" ON public.addresses
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "addresses_delete" ON public.addresses
  FOR DELETE
  USING (user_id = auth.uid());

-- ─── orders ──────────────────────────────────────────────────────────────────

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers see their own orders; admin sees all
CREATE POLICY "orders_select" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- Orders are inserted by the service role (payment intent creation)
-- We allow client inserts only when user_id matches their session
CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only admin can update order status, tracking, etc.
-- Exception: customer can cancel (status → annulee) within 30-min window — handled server-side
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE
  USING (public.is_admin());

-- Customers can update their own order (cancel) — only status field, enforced in API
CREATE POLICY "orders_update_self" ON public.orders
  FOR UPDATE
  USING (user_id = auth.uid());

-- ─── order_items ─────────────────────────────────────────────────────────────

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Items visible if parent order is visible
CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Logo update (re-upload) — by the order owner
CREATE POLICY "order_items_update_logo" ON public.order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ─── reviews ─────────────────────────────────────────────────────────────────

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can see approved reviews; owner can see their own; admin sees all
CREATE POLICY "reviews_select" ON public.reviews
  FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid() OR public.is_admin());

-- Authenticated user can submit a review (one per order enforced by UNIQUE constraint)
CREATE POLICY "reviews_insert" ON public.reviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only admin can approve/reject
CREATE POLICY "reviews_update_admin" ON public.reviews
  FOR UPDATE
  USING (public.is_admin());
