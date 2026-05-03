// ─── Product Types ─────────────────────────────────────────────────────────────

export type ProductCategory = "tshirts" | "hoodies" | "softshells";

export type Technique = "dtf" | "flex" | "broderie";

export type Placement = "coeur" | "dos" | "coeur-dos";

export type ProductGender = "unisex" | "homme" | "femme";

export type ProductTier = "appel" | "standard" | "premium";

export interface ProductSize {
  label: string; // "S" | "M" | "L" | "XL" | "XXL" | "3XL"
  available: boolean;
  soldOut?: boolean;
}

export interface ProductColor {
  id: string;
  label: string;
  hex: string;
  available: boolean;
}

export interface TechniqueOption {
  id: Technique;
  label: string;
  description: string;
  available: boolean;
}

export interface PlacementOption {
  id: Placement;
  label: string;
  description: string;
}

export interface ProductPricing {
  dtf: number;
  flex: number;
  broderie: number;
  // Placement surcharges for broderie
  placements: {
    coeur: number;
    dos: number;
    "coeur-dos": number;
  };
  broDeriePlacementSurcharge: {
    coeur: number;
    dos: number;
    "coeur-dos": number;
  };
}

export interface Product {
  id: string;
  slug: string;
  reference: string; // B&C TU01T
  name: string;
  shortName: string;
  category: ProductCategory;
  gender: ProductGender;
  tier: ProductTier;
  description: string;
  composition: string;
  weight: string; // "145 g/m²"
  images: string[]; // paths /images/products/...
  previewImages?: Record<string, string>; // colorId -> chest close-up for logo preview
  colors: ProductColor[];
  sizes: ProductSize[];
  techniques: Technique[];
  placements: Placement[];
  pricing: ProductPricing;
  featured: boolean;
  seasonal?: ("printemps" | "ete" | "automne" | "hiver")[];
  badge?: string; // "Bestseller" | "Nouveau" | "Premium"
  // Internal
  supplierRef?: string;
  supplierName?: "falk-ross" | "toptex";
}

// ─── Cart Types ─────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string; // uuid
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  color: ProductColor;
  technique: Technique;
  placement: Placement;
  logoFile?: CartFile;
  unitPrice: number;
  totalPrice: number;
}

export interface CartFile {
  name: string;
  size: number;
  type: string;
  url?: string; // after upload
  uploadedAt?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotalHT: number;
  tva: number; // montant TVA
  subtotalTTC: number;
  shipping: number;
  totalTTC: number;
  freeShipping: boolean; // >= 10 pièces
}

// ─── User Types ──────────────────────────────────────────────────────────────────

export type UserType = "particulier" | "entreprise";

export type UserRole = "client" | "admin";

export interface Address {
  id: string;
  type: "facturation" | "livraison";
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  complement?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  type: UserType;
  // Entreprise only
  company?: string;
  siret?: string;
  tvaIntracom?: string;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

// ─── Order Types ─────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "paiement_recu"
  | "fichier_a_verifier"
  | "en_attente_client"
  | "validee"
  | "en_traitement"
  | "expediee"
  | "terminee"
  | "annulee";

export type SupplierMode = "fournisseur" | "secours_interne";

export interface OrderFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  status: "en_attente" | "valide" | "invalide";
  uploadedAt: string;
  rejectionReason?: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  size: string;
  color: ProductColor;
  technique: Technique;
  placement: Placement;
  logoFile?: OrderFile;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalHT: number;
  totalTTC: number;
}

export interface Order {
  id: string;
  orderNumber: string; // HM-2024-001
  userId: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  // Pricing
  subtotalHT: number;
  tva: number;
  subtotalTTC: number;
  shipping: number;
  totalTTC: number;
  freeShipping: boolean;
  // Payment
  stripePaymentIntentId?: string;
  stripePaymentStatus?: "succeeded" | "pending" | "failed";
  paidAt?: string;
  // Shipping
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  // Admin
  supplierMode?: SupplierMode;
  supplierNote?: string;
  adminNote?: string;
  validatedAt?: string;
  // Invoice
  invoiceId?: string; // Pennylane ID
  invoiceUrl?: string;
  pennylaneCustomerId?: string;
  invoiceNumber?: string;
  invoiceStatus?: string;
  invoiceGeneratedAt?: string;
  invoiceSyncedAt?: string;
  // Dates
  createdAt: string;
  updatedAt: string;
  // Cancellation
  cancelledAt?: string;
  cancellationReason?: string;
  refundedAt?: string;
  canCancelUntil?: string; // 30 min after creation
}

// ─── Review Types ─────────────────────────────────────────────────────────────────

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string; // First name + last initial
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  status: ReviewStatus;
  createdAt: string;
  approvedAt?: string;
}

// ─── Email Types ─────────────────────────────────────────────────────────────────

export type EmailTemplate =
  | "confirmation_paiement"
  | "commande_recue"
  | "fichier_non_conforme"
  | "commande_annulee"
  | "commande_validee"
  | "facture_envoyee"
  | "commande_expediee"
  | "demande_avis";

// ─── Admin Types ─────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  ordersToValidate: number;
  filesToCheck: number;
  totalRevenueHT: number;
  totalRevenueTTC: number;
  averageOrderValue: number;
}

// ─── Pricing Config Types ─────────────────────────────────────────────────────────

export interface PricingConfig {
  tvaRate: number; // 0.20
  freeShippingThreshold: number; // 10 pièces
  shippingCost: number; // base
  bulkThreshold: number; // 10
  bulkLabel: string; // "Livraison offerte dès 10 pièces"
}
