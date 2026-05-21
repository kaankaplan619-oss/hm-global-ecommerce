/**
 * lib/admin/orderHelpers.ts
 *
 * Helpers partagés par les vues admin "Commandes à traiter" et "Commandes (liste détaillée)".
 *
 * Important : ces helpers travaillent sur la forme brute renvoyée par
 * `GET /api/orders/admin` (RawOrder / RawItem). Ils sont volontairement
 * tolérants aux champs manquants pour rester rétro-compatibles avec les
 * commandes existantes (avant migration `production_method` / `is_test_order`).
 *
 * Aucune dépendance DB ici — uniquement de la logique de dérivation pure.
 */

import type { OrderStatus } from "@/types";

// ─── Production methods (3 circuits HM Global) ────────────────────────────────

export type ProductionMethod =
  | "STANDARD_FOURNISSEUR"
  | "EXPRESS_INTERNE_HM"
  | "SUR_DEVIS";

export interface ProductionMethodMeta {
  value: ProductionMethod;
  label: string;
  shortLabel: string;
  icon: "factory" | "zap" | "file-question";
  /** Classes Tailwind pour badge (compatibles design tokens HM). */
  className: string;
}

export const PRODUCTION_METHOD_META: Record<ProductionMethod, ProductionMethodMeta> = {
  STANDARD_FOURNISSEUR: {
    value: "STANDARD_FOURNISSEUR",
    label: "Standard fournisseur",
    shortLabel: "Std. fournisseur",
    icon: "factory",
    className:
      "bg-[var(--hm-surface)] text-[var(--hm-text-soft)] border border-[var(--hm-line)]",
  },
  EXPRESS_INTERNE_HM: {
    value: "EXPRESS_INTERNE_HM",
    label: "Express interne HM",
    shortLabel: "⚡ Express HM",
    icon: "zap",
    className:
      "bg-[var(--hm-accent-soft-rose)] text-[var(--hm-primary)] border border-[var(--hm-primary)]/30 font-semibold",
  },
  SUR_DEVIS: {
    value: "SUR_DEVIS",
    label: "Sur devis",
    shortLabel: "Sur devis",
    icon: "file-question",
    className: "bg-amber-50 text-amber-700 border border-amber-200 font-semibold",
  },
};

// ─── BAT status (dérivé du statut commande + bat_ref) ─────────────────────────

export type BatStatusKey =
  | "non_requis"
  | "a_preparer"
  | "envoye"
  | "valide"
  | "non_applicable";

export interface BatStatusMeta {
  key: BatStatusKey;
  label: string;
  className: string;
}

export const BAT_STATUS_META: Record<BatStatusKey, BatStatusMeta> = {
  non_requis:    { key: "non_requis",    label: "BAT non requis",   className: "bg-[var(--hm-surface)] text-[var(--hm-text-soft)]" },
  a_preparer:    { key: "a_preparer",    label: "BAT à préparer",   className: "bg-amber-50 text-amber-700 font-semibold" },
  envoye:        { key: "envoye",        label: "BAT envoyé",       className: "bg-blue-50 text-blue-700 font-semibold" },
  valide:        { key: "valide",        label: "BAT validé",       className: "bg-green-50 text-green-700 font-semibold" },
  non_applicable:{ key: "non_applicable",label: "—",                className: "bg-[var(--hm-surface)] text-[var(--hm-text-soft)]" },
};

// ─── Filtres simplifiés vue "À traiter" ───────────────────────────────────────

export type SimpleFilterKey =
  | "all"
  | "paid"
  | "bat_to_prepare"
  | "bat_sent"
  | "bat_validated"
  | "production"
  | "delivered";

export const SIMPLE_FILTER_LABELS: Record<SimpleFilterKey, string> = {
  all:            "Toutes",
  paid:           "Payées",
  bat_to_prepare: "BAT à préparer",
  bat_sent:       "BAT envoyé",
  bat_validated:  "BAT validé",
  production:    "Production",
  delivered:      "Livrées",
};

// ─── Types raw (alignés sur GET /api/orders/admin) ────────────────────────────

export interface RawAdminItem {
  id: string;
  product_name?: string;
  product_reference?: string;
  quantity: number;
  size?: string;
  color_label?: string;
  color_hex?: string;
  technique?: string;
  placement?: string;
  unit_price_ttc?: number;
  total_ttc?: number;
  logo_file_url?: string;
  logo_file_name?: string;
  logo_file_type?: string;
  logo_file_size?: number;
  logo_file_status?: string;
  logo_effect?: string;
  bat_ref?: string;
  product_snapshot?: Record<string, unknown>;
}

export interface RawAdminOrder {
  id: string;
  order_number?: string;
  status: OrderStatus;
  total_ttc?: number;
  subtotal_ht?: number;
  shipping?: number;
  free_shipping?: boolean;
  stripe_payment_status?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  created_at?: string;
  tracking_number?: string;
  invoice_url?: string;
  admin_note?: string;
  supplier_mode?: string;
  /** Présent si migration `production_method` appliquée (sinon undefined → dérivation). */
  production_method?: ProductionMethod;
  /** Présent si migration `is_test_order` appliquée (sinon undefined → heuristique). */
  is_test_order?: boolean;
  profiles?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    type?: string;
    company?: string;
  } | null;
  order_items?: RawAdminItem[];
}

// ─── Helpers métier ───────────────────────────────────────────────────────────

/**
 * Détermine le circuit de production effectif d'une commande.
 *
 * Si la colonne DB `production_method` existe (future migration), on la lit.
 * Sinon, on dérive depuis les données disponibles :
 *   - admin_note contenant "devis" / "sur devis"     → SUR_DEVIS
 *   - supplier_mode === "secours_interne"            → EXPRESS_INTERNE_HM
 *   - sinon                                          → STANDARD_FOURNISSEUR
 *
 * TODO migration `010_production_method_and_test_orders.sql` :
 *   ajouter `orders.production_method` text DEFAULT 'STANDARD_FOURNISSEUR'
 *   avec CHECK IN ('STANDARD_FOURNISSEUR','EXPRESS_INTERNE_HM','SUR_DEVIS').
 */
export function getProductionMethod(order: Pick<RawAdminOrder, "production_method" | "supplier_mode" | "admin_note">): ProductionMethod {
  if (order.production_method) return order.production_method;

  const note = (order.admin_note ?? "").toLowerCase();
  if (/\b(sur\s+devis|devis)\b/.test(note)) return "SUR_DEVIS";

  if (order.supplier_mode === "secours_interne") return "EXPRESS_INTERNE_HM";

  return "STANDARD_FOURNISSEUR";
}

/**
 * Détermine si un BAT est requis ou recommandé pour cette commande.
 * - requis : quantité totale ≥ 20
 * - recommandé : présence de broderie
 */
export function getBatRequirement(items: RawAdminItem[]): "required" | "recommended" | "no" {
  const totalQty = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
  if (totalQty >= 20) return "required";
  if (items.some((i) => i.technique === "broderie")) return "recommended";
  return "no";
}

/**
 * Dérive le statut BAT effectif (4 valeurs) à partir du statut commande
 * et de la présence d'un `bat_ref` sur les items.
 *
 * Limite V1 : on n'a pas de champ `bat_status` dédié en DB. On infère.
 * Pour la prochaine étape : ajouter `orders.bat_status` enum dédié.
 */
export function getBatStatus(order: Pick<RawAdminOrder, "status">, items: RawAdminItem[]): BatStatusMeta {
  const req = getBatRequirement(items);
  const hasBatRef = items.some((i) => Boolean(i.bat_ref));

  const status = order.status;

  if (status === "bat_a_preparer") return BAT_STATUS_META.a_preparer;

  if (status === "attente_validation_client" || status === "en_attente_client") {
    return BAT_STATUS_META.envoye;
  }

  // Statuts post-validation BAT
  const postBat: OrderStatus[] = [
    "a_commander_fournisseur",
    "validee",
    "commande_fournisseur_passee",
    "attente_reception_textile",
    "en_production",
    "en_traitement",
    "prete_a_expedier",
    "expediee",
    "terminee",
  ];
  if (postBat.includes(status)) {
    if (req === "no" && !hasBatRef) return BAT_STATUS_META.non_applicable;
    return BAT_STATUS_META.valide;
  }

  // Statuts amont (paiement_recu, commande_a_valider, fichier_a_verifier, annulee)
  if (status === "annulee") return BAT_STATUS_META.non_applicable;
  if (req === "no") return BAT_STATUS_META.non_requis;
  return BAT_STATUS_META.a_preparer;
}

/**
 * Détecte si une commande est une commande de test, sans nécessiter de colonne DB.
 *
 * Heuristiques (combinables) :
 *   - colonne DB `is_test_order = true` si présente
 *   - numéro de commande contient "TEST" (cf. HM-TEST-PRINTFUL-001)
 *   - email client contient "+test@" (alias de test)
 *   - total TTC < 1 € (commande à 0 ou centimes)
 *   - admin_note contient "test"
 *
 * TODO migration `is_test_order` : stocker `payment_intent.livemode === false`
 * depuis le webhook Stripe pour fiabiliser la détection.
 */
export function isTestOrder(order: RawAdminOrder): boolean {
  if (order.is_test_order === true) return true;
  if (order.is_test_order === false) return false; // colonne DB explicitement false

  const num = (order.order_number ?? "").toUpperCase();
  if (num.includes("TEST")) return true;

  const email = (order.profiles?.email ?? "").toLowerCase();
  if (email.includes("+test@")) return true;
  if (email.endsWith("@example.com")) return true;
  if (email.endsWith("@test.com")) return true;

  const total = order.total_ttc ?? 0;
  if (total > 0 && total < 1) return true;

  const note = (order.admin_note ?? "").toLowerCase();
  if (note.includes("commande test") || note.includes("ceci est un test")) return true;

  return false;
}

/**
 * Action humaine suivante, formulée courte (≤ 60 caractères).
 * Utilisé en colonne "Prochaine action" de la liste simplifiée.
 */
export function getNextActionShort(status: OrderStatus): string {
  switch (status) {
    case "paiement_recu":
    case "commande_a_valider":          return "Valider la commande";
    case "fichier_a_verifier":          return "Vérifier le fichier logo";
    case "bat_a_preparer":              return "Préparer et envoyer le BAT";
    case "en_attente_client":
    case "attente_validation_client":   return "Attendre validation client";
    case "validee":
    case "a_commander_fournisseur":     return "Passer commande fournisseur";
    case "commande_fournisseur_passee": return "Attendre réception textile";
    case "attente_reception_textile":   return "Réceptionner les textiles";
    case "en_traitement":
    case "en_production":               return "Suivre la production";
    case "prete_a_expedier":            return "Emballer et expédier";
    case "expediee":                    return "Confirmer la livraison";
    case "terminee":                    return "Terminée ✓";
    case "annulee":                     return "Annulée";
    default:                            return "—";
  }
}

/**
 * Map un statut commande vers un filtre simple "Commandes à traiter".
 * Plusieurs statuts peuvent matcher un même filtre (ex. en_production +
 * en_traitement → "production").
 */
export function matchSimpleFilter(status: OrderStatus, filter: SimpleFilterKey): boolean {
  if (filter === "all") {
    return status !== "annulee";
  }
  if (filter === "paid") {
    // "Payées" = post-paiement non encore livrées et non annulées
    const after: OrderStatus[] = [
      "paiement_recu", "commande_a_valider", "fichier_a_verifier",
      "bat_a_preparer", "attente_validation_client", "en_attente_client",
      "a_commander_fournisseur", "validee", "commande_fournisseur_passee",
      "attente_reception_textile", "en_production", "en_traitement",
      "prete_a_expedier",
    ];
    return after.includes(status);
  }
  if (filter === "bat_to_prepare") {
    return status === "bat_a_preparer" || status === "fichier_a_verifier";
  }
  if (filter === "bat_sent") {
    return status === "attente_validation_client" || status === "en_attente_client";
  }
  if (filter === "bat_validated") {
    return ["a_commander_fournisseur", "validee", "commande_fournisseur_passee", "attente_reception_textile"].includes(status);
  }
  if (filter === "production") {
    return ["en_production", "en_traitement", "prete_a_expedier"].includes(status);
  }
  if (filter === "delivered") {
    return status === "expediee" || status === "terminee";
  }
  return true;
}

/**
 * Statut paiement court pour badge.
 */
export function getPaymentStatusBadge(order: Pick<RawAdminOrder, "stripe_payment_status" | "paid_at">): {
  label: string;
  className: string;
  ok: boolean;
} {
  const ok = order.stripe_payment_status === "succeeded" || Boolean(order.paid_at);
  if (ok) return { label: "Payé ✓", className: "bg-green-50 text-green-700", ok: true };
  if (order.stripe_payment_status === "pending") return { label: "En attente", className: "bg-amber-50 text-amber-700", ok: false };
  if (order.stripe_payment_status === "failed") return { label: "Échec", className: "bg-red-50 text-red-700", ok: false };
  return { label: "—", className: "bg-[var(--hm-surface)] text-[var(--hm-text-soft)]", ok: false };
}

/**
 * Format compact d'un montant TTC en EUR.
 */
export function fmtEUR(n: number | null | undefined): string {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

/**
 * Format compact d'une date ISO en JJ/MM/AA.
 */
export function fmtDateShort(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(d);
}
