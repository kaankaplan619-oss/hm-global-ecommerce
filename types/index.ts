// ─── Product Types ─────────────────────────────────────────────────────────────

/**
 * Famille visuelle mockup HM Global (B2).
 * Détermine le backdrop premium et les assets mockup par défaut.
 */
export type ProductFamilyVisual =
  | "tshirt"
  | "hoodie"
  | "polo"
  | "softshell"
  | "veste"
  | "casquette"
  | "sac";

export type ProductCategory =
  | "tshirts"
  | "hoodies"
  | "softshells"
  | "polos"
  | "polaires"
  | "casquettes"
  | "sacs"
  | "enfants";

export type Technique = "dtf" | "flex" | "broderie";

export type Placement = "coeur" | "dos" | "coeur-dos";

export type LogoEffect = "none" | "white-outline" | "white-bg";

export interface LogoPlacementTransform {
  left:       number;
  top:        number;
  scaleX:     number;
  scaleY:     number;
  width:      number;
  height:     number;
  angle:      number;
  canvasSize: number;
  source:     "fabric-canvas";
}

export type ProductGender = "unisex" | "homme" | "femme" | "enfant";

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
  colors: ProductColor[];
  sizes: ProductSize[];
  techniques: Technique[];
  placements: Placement[];
  pricing: ProductPricing;
  featured: boolean;
  seasonal?: ("printemps" | "ete" | "automne" | "hiver")[];
  badge?: string; // "Bestseller" | "Nouveau" | "Premium"
  // Technique recommendation (shown as tooltip/conseil on product page)
  techniqueRecommandee?: Technique;
  conseil?: string; // conseil HM Global displayed on product page
  ideaPour?: string[]; // ["Restauration", "BTP", ...]
  // Toptex supplier data
  toptexRef?: string;        // e.g. "IB320"
  toptexUrl?: string;        // fiche Toptex URL
  prixAchatHT?: number;      // prix d'achat Toptex HT
  // Internal
  supplierRef?: string;
  supplierName?: "falk-ross" | "toptex";
  /**
   * Contrôle la visibilité dans le catalogue public.
   * false  → masqué (photos insuffisantes, produit non validé)
   * true   → visible
   * absent → visible par défaut (rétrocompatibilité)
   *
   * Règle : un produit ne s'affiche que si le client peut voir
   * clairement la zone de marquage (cœur / dos) sur la photo principale.
   */
  visible?: boolean;

  // ── Direction visuelle HM Global (B2) ──────────────────────────────────────
  /** Image hero HM Global dédiée par produit (chemin /public/ ou URL externe). */
  hmHeroImage?: string;
  /** Mockups HM Global par coloris — colorId → chemin /public/mockups/. */
  hmMockupImages?: Record<string, string>;
  /**
   * Famille visuelle mockup — détermine le backdrop premium et les assets
   * mockup par défaut quand hmMockupImages n'est pas renseigné.
   * Inféré automatiquement depuis `category` si absent.
   */
  familyVisualType?: ProductFamilyVisual;
  /**
   * Images fournisseur (TopTex / Falk&Ross) — galerie secondaire dans la
   * fiche produit. Ne remplace PAS `images` (rétrocompatibilité).
   * Utilisé pour distinguer clairement les visuels HM des photos fournisseur.
   */
  supplierImages?: string[];
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
  logoEffect?: LogoEffect;
  logoPlacementTransform?: LogoPlacementTransform;
  batRef?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CartFile {
  name: string;
  size: number;
  type: string;
  url?: string;       // Supabase public URL — set after upload
  path?: string;      // Supabase storage path — set after upload
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
  // ─ Statuts legacy (DB existante — rétrocompatibles) ──────────────────────────
  | "paiement_recu"
  | "fichier_a_verifier"
  | "en_attente_client"
  | "validee"
  | "en_traitement"
  | "expediee"
  | "terminee"
  | "annulee"
  // ─ Nouveaux statuts workflow production ──────────────────────────────────────
  | "commande_a_valider"
  | "bat_a_preparer"
  | "attente_validation_client"
  | "a_commander_fournisseur"
  | "commande_fournisseur_passee"
  | "attente_reception_textile"
  | "en_production"
  | "prete_a_expedier";

export type SupplierMode = "fournisseur" | "secours_interne";

// ─── Supplier Types ───────────────────────────────────────────────────────────

export type SupplierName = "toptex" | "falkross" | "newwave" | "pixartprint" | "interne" | "autre";

export interface SupplierInfo {
  supplier: SupplierName;
  supplierLabel: string;
  supplierReference: string;
  supplierUrl?: string;
  estimatedPurchasePrice?: number;
  estimatedDelayDays?: number;
  stockStatus: "unknown" | "available" | "low" | "unavailable";
}

export interface OrderFile {
  id: string;
  name: string;
  url: string;
  path?: string;
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
  logoEffect?: LogoEffect;
  batRef?: string;
  logoPlacementTransform?: LogoPlacementTransform;
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
