-- ─────────────────────────────────────────────────────────────────────────────
-- HM Global Agence — Initial Schema
-- Run via: supabase db push  OR  Supabase dashboard SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users. Created automatically by the handle_new_user trigger.

CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    text        NOT NULL DEFAULT '',
  last_name     text        NOT NULL DEFAULT '',
  phone         text,
  role          text        NOT NULL DEFAULT 'client'      CHECK (role IN ('client', 'admin')),
  type          text        NOT NULL DEFAULT 'particulier' CHECK (type IN ('particulier', 'entreprise')),
  company       text,
  siret         text,
  tva_intracom  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── addresses ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.addresses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          text        NOT NULL CHECK (type IN ('facturation', 'livraison')),
  first_name    text        NOT NULL,
  last_name     text        NOT NULL,
  company       text,
  street        text        NOT NULL,
  complement    text,
  city          text        NOT NULL,
  postal_code   text        NOT NULL,
  country       text        NOT NULL DEFAULT 'FR',
  phone         text,
  is_default    boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── orders ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.orders (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number              text        NOT NULL UNIQUE,
  user_id                   uuid        NOT NULL REFERENCES public.profiles(id),

  -- Status
  status                    text        NOT NULL DEFAULT 'paiement_recu'
    CHECK (status IN (
      'paiement_recu','fichier_a_verifier','en_attente_client',
      'validee','en_traitement','expediee','terminee','annulee'
    )),

  -- Pricing (all amounts in EUR)
  subtotal_ht               numeric(10,2) NOT NULL,
  tva                       numeric(10,2) NOT NULL,
  subtotal_ttc              numeric(10,2) NOT NULL,
  shipping                  numeric(10,2) NOT NULL DEFAULT 0,
  total_ttc                 numeric(10,2) NOT NULL,
  free_shipping             boolean     NOT NULL DEFAULT false,

  -- Payment (Stripe)
  stripe_payment_intent_id  text,
  stripe_payment_status     text        CHECK (stripe_payment_status IN ('succeeded','pending','failed')),
  paid_at                   timestamptz,

  -- Addresses (stored as JSON snapshot at order time)
  shipping_address          jsonb       NOT NULL DEFAULT '{}',
  billing_address           jsonb       NOT NULL DEFAULT '{}',

  -- Shipping
  tracking_number           text,
  shipped_at                timestamptz,
  delivered_at              timestamptz,

  -- Admin fields
  supplier_mode             text        DEFAULT 'fournisseur'
    CHECK (supplier_mode IN ('fournisseur', 'secours_interne')),
  supplier_note             text,
  admin_note                text,
  validated_at              timestamptz,

  -- Invoice (Pennylane)
  invoice_id                text,
  invoice_url               text,
  invoice_generated_at      timestamptz,

  -- Cancellation / refund
  cancelled_at              timestamptz,
  cancellation_reason       text,
  refunded_at               timestamptz,

  -- Timestamps
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id     ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- ─── order_items ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,

  -- Product identity (denormalized for immutability)
  product_id            text        NOT NULL,
  product_reference     text        NOT NULL,
  product_name          text        NOT NULL,
  product_snapshot      jsonb       NOT NULL DEFAULT '{}', -- full product at order time

  -- Configuration
  quantity              integer     NOT NULL CHECK (quantity > 0),
  size                  text        NOT NULL,
  color_id              text        NOT NULL,
  color_label           text        NOT NULL,
  color_hex             text        NOT NULL,
  technique             text        NOT NULL CHECK (technique IN ('dtf', 'flex', 'broderie')),
  placement             text        NOT NULL CHECK (placement IN ('coeur', 'dos', 'coeur-dos')),

  -- Pricing
  unit_price_ht         numeric(10,2) NOT NULL,
  unit_price_ttc        numeric(10,2) NOT NULL,
  total_ht              numeric(10,2) NOT NULL,
  total_ttc             numeric(10,2) NOT NULL,

  -- Logo file
  logo_file_name        text,
  logo_file_url         text,
  logo_file_type        text,
  logo_file_size        integer,
  logo_file_status      text        DEFAULT 'en_attente'
    CHECK (logo_file_status IN ('en_attente', 'valide', 'invalide')),
  logo_uploaded_at      timestamptz,
  logo_rejection_reason text,

  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ─── reviews ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid        NOT NULL REFERENCES public.orders(id),
  user_id           uuid        NOT NULL REFERENCES public.profiles(id),
  user_display_name text        NOT NULL,
  rating            integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment           text,
  status            text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  approved_at       timestamptz,
  UNIQUE (order_id, user_id) -- one review per order
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
