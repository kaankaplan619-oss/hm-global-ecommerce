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
  | "goodies"
  | "enfants";

export type Technique = "dtf" | "dtflex" | "flex" | "broderie" | "broderie_illimitee" | "print";

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
  dtflex: number;
  flex: number;
  broderie: number;
  /** Broderie Couleur illimitée (Printful +3.90€) — optionnel, uniquement sur certains produits */
  broderie_illimitee?: number;
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

export interface VolumePricingTier {
  from: number;
  to?: number;
  unitPrice: number; // TTC
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
  supplierName?: "falk-ross" | "toptex" | "printful" | "spreadshirt";
  /** Quantité minimale de commande (ex : 10 pour Spreadshirt). */
  minOrderQty?: number;
  /** Tarification dégressive par palier de quantité. Écrase pricing.dtf/flex/broderie si présent. */
  volumePricing?: VolumePricingTier[];
  /** Tarification dégressive par technique — prioritaire sur volumePricing si la clé existe. */
  volumePricingByTechnique?: Partial<Record<Technique, VolumePricingTier[]>>;
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
  /** Mockups HM Global par coloris — colorId → chemin /public/mockups/ (vue face). */
  hmMockupImages?: Record<string, string>;
  /** Mockups HM Global dos par coloris — colorId → chemin /public/mockups/ (vue dos). */
  hmMockupImagesBack?: Record<string, string>;
  /**
   * Galerie d'images HM Global par coloris — colorId → [front, back, detail, ...].
   * Utilisée pour le carousel produit (fiche produit Printful).
   */
  hmMockupGallery?: Record<string, string[]>;
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

  // ── Bascule "devis-only" (commande automatique désactivée) ────────────────
  /**
   * Quand true, la fiche produit reste visible mais le bouton "Ajouter au
   * panier" est remplacé par un CTA "Demander un devis". Aucune logique
   * panier / Stripe / checkout n'est appelée pour ce produit.
   *
   * Cas d'usage :
   *   - Produits broderie qui n'ont pas de viabilité unitaire (ex. Polo
   *     Gildan 64800 — broderie uniquement, intéressant en volume).
   *   - Produits fournisseur en cours d'audit / migration.
   */
  quoteOnly?: boolean;
  /** Sujet à pré-renseigner dans le formulaire contact si quoteOnly = true. */
  quoteOnlySubject?: string;
  /** Texte d'explication court affiché à la place du configurateur. */
  quoteOnlyMessage?: string;
}

// ─── Print Types ─────────────────────────────────────────────────────────────────

/**
 * Config complète d'une commande d'impression print.
 * Stockée dans product_snapshot.printConfig dans order_items.
 * Séparée des données textile — ne jamais afficher ces champs avec des labels textile.
 *
 * Tarification print :
 *   Le prix du lot correspond à l'ensemble de la commande, PAS à un prix × copies.
 *   lotPriceTTC = prix total (ex : 34,90 € pour 250 cartes).
 *   quantity = nombre d'exemplaires imprimés (ex : 250).
 *   Dans order_items : quantity=1, unit_price_ttc=lotPriceTTC, total_ttc=lotPriceTTC.
 */
export interface PrintConfig {
  productType:      "business_card";
  supplier:         "gelato";            // prêt pour envoi Gelato — pas activé en V1
  format:           "85x55mm";
  orientation:      "landscape" | "portrait";
  faces:            "recto" | "recto-verso";
  finish:           "mat" | "brillant" | "premium";
  corners:          "standard" | "rounded";
  /** Nombre d'exemplaires imprimés — ex : 250. Ne pas multiplier par lotPriceTTC. */
  quantity:         250 | 500 | 1000 | 2500;
  /** Prix du lot TTC — total de la commande pour ce lot. */
  lotPriceTTC:      number;
  /** URL Supabase Storage du fichier recto (PDF ou PNG haute résolution). */
  frontFileUrl:     string | null;
  /** URL Supabase Storage du fichier verso — null si recto seul. */
  backFileUrl:      string | null;
  /** Aperçu PNG recto généré pour affichage admin. */
  frontPreviewUrl:  string | null;
  /** Aperçu PNG verso généré pour affichage admin. */
  backPreviewUrl:   string | null;
  batStatus:        "a_verifier" | "valide" | "invalide";
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
  /** Aperçu composé face (shirt+logo) exporté depuis le Studio — non persisté en localStorage */
  composedPreviewUrl?: string;
  /** Aperçu composé dos (shirt+logo) exporté depuis le Studio — non persisté en localStorage */
  composedPreviewBack?: string;
  /**
   * Config impression print — présente uniquement pour les articles print (cartes de visite, etc.).
   * Absente pour tous les articles textile. Vérifier sa présence avant tout affichage print.
   * Non persistée en localStorage (peut contenir des URLs larges).
   */
  printConfig?: PrintConfig;
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

export type SupplierName = "toptex" | "falkross" | "newwave" | "pixartprint" | "interne" | "autre" | "printful";

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
  // Printful POD
  printfulVariantId?: number;
  /**
   * Config impression print — présente uniquement pour les commandes print.
   * Lue depuis product_snapshot.printConfig dans order_items.
   * Afficher "Fichier recto / verso" côté admin, jamais "Logo".
   */
  printConfig?: PrintConfig;
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
  // Printful POD
  printfulOrderId?: string;
  printfulStatus?: string;
  supplierProvider?: string;
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
