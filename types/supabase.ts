// ─────────────────────────────────────────────────────────────────────────────
// Supabase Database Types — HM Global Agence
//
// Regenerate after connecting to your project:
//   npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > types/supabase.ts
// ─────────────────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ─── Row types (direct DB shape) ─────────────────────────────────────────────

export interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: "client" | "admin";
  type: "particulier" | "entreprise";
  company: string | null;
  siret: string | null;
  tva_intracom: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddressRow {
  id: string;
  user_id: string;
  type: "facturation" | "livraison";
  first_name: string;
  last_name: string;
  company: string | null;
  street: string;
  complement: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string;
  status: "paiement_recu" | "fichier_a_verifier" | "en_attente_client" | "validee" | "en_traitement" | "expediee" | "terminee" | "annulee";
  subtotal_ht: number;
  tva: number;
  subtotal_ttc: number;
  shipping: number;
  total_ttc: number;
  free_shipping: boolean;
  stripe_payment_intent_id: string | null;
  stripe_payment_status: "succeeded" | "pending" | "failed" | null;
  paid_at: string | null;
  shipping_address: Json;
  billing_address: Json;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  supplier_mode: "fournisseur" | "secours_interne" | null;
  supplier_note: string | null;
  admin_note: string | null;
  validated_at: string | null;
  invoice_id: string | null;
  invoice_url: string | null;
  invoice_generated_at: string | null;
  pennylane_customer_id: string | null;
  pennylane_invoice_number: string | null;
  pennylane_invoice_status: string | null;
  pennylane_invoice_synced_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_reference: string;
  product_name: string;
  product_snapshot: Json;
  quantity: number;
  size: string;
  color_id: string;
  color_label: string;
  color_hex: string;
  technique: "dtf" | "flex" | "broderie";
  placement: "coeur" | "dos" | "coeur-dos";
  unit_price_ht: number;
  unit_price_ttc: number;
  total_ht: number;
  total_ttc: number;
  logo_file_name: string | null;
  logo_file_url: string | null;
  logo_file_type: string | null;
  logo_file_size: number | null;
  logo_file_status: "en_attente" | "valide" | "invalide" | null;
  logo_uploaded_at: string | null;
  logo_rejection_reason: string | null;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  order_id: string;
  user_id: string;
  user_display_name: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
}

// ─── Database interface (required by @supabase/supabase-js generic) ───────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileRow, "id" | "created_at">>;
        Relationships: [];
      };
      addresses: {
        Row: AddressRow;
        Insert: Omit<AddressRow, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<AddressRow, "id" | "created_at">>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          status?: OrderRow["status"];
        };
        Update: Partial<Omit<OrderRow, "id" | "created_at">>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: Omit<OrderItemRow, "id" | "created_at"> & { id?: string };
        Update: Partial<Omit<OrderItemRow, "id" | "created_at">>;
        Relationships: [];
      };
      reviews: {
        Row: ReviewRow;
        Insert: Omit<ReviewRow, "id" | "created_at"> & {
          id?: string;
          status?: ReviewRow["status"];
        };
        Update: Partial<Omit<ReviewRow, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
