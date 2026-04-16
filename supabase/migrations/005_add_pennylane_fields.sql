ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS pennylane_customer_id text,
ADD COLUMN IF NOT EXISTS pennylane_invoice_number text,
ADD COLUMN IF NOT EXISTS pennylane_invoice_status text,
ADD COLUMN IF NOT EXISTS pennylane_invoice_synced_at timestamptz;
