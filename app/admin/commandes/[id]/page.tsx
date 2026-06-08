"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink, CheckCircle, XCircle, AlertTriangle,
  Truck, Package, Copy, FileText, Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getSupplierInfo } from "@/lib/supplierMap";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import type { Order, OrderStatus, OrderItem, SupplierMode } from "@/types";

// ─── All 16 statuses (ordered by workflow) ────────────────────────────────────

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "awaiting_bank_transfer",       label: "Attente virement bancaire" },
  { value: "commande_a_valider",           label: "À valider" },
  { value: "paiement_recu",               label: "Paiement reçu" },
  { value: "fichier_a_verifier",          label: "Fichier à vérifier" },
  { value: "bat_a_preparer",              label: "BAT à préparer" },
  { value: "attente_validation_client",   label: "Attente validation client" },
  { value: "en_attente_client",           label: "En attente client" },
  { value: "a_commander_fournisseur",     label: "À commander fournisseur" },
  { value: "validee",                     label: "Validée" },
  { value: "commande_fournisseur_passee", label: "Commande fournisseur passée" },
  { value: "attente_reception_textile",   label: "Attente réception textile" },
  { value: "en_production",              label: "En production" },
  { value: "en_traitement",              label: "En traitement" },
  { value: "prete_a_expedier",           label: "Prête à expédier" },
  { value: "expediee",                   label: "Expédiée" },
  { value: "terminee",                   label: "Terminée" },
  { value: "annulee",                    label: "Annulée" },
];

// ─── Statuts où le rejet de fichier est pertinent ────────────────────────────

const FILE_CHECK_STATUSES: OrderStatus[] = [
  "paiement_recu",
  "commande_a_valider",
  "fichier_a_verifier",
  "bat_a_preparer",
  "attente_validation_client",
  "en_attente_client",
];

// ─── Workflow linéaire — étape suivante par statut ────────────────────────────

const WORKFLOW_STEPS: Partial<Record<OrderStatus, { label: string; nextStatus: OrderStatus }>> = {
  commande_a_valider:          { label: "Paiement confirmé → Fichier à vérifier",  nextStatus: "fichier_a_verifier" },
  paiement_recu:               { label: "Paiement confirmé → Fichier à vérifier",  nextStatus: "fichier_a_verifier" },
  fichier_a_verifier:          { label: "Fichier validé → BAT à préparer",          nextStatus: "bat_a_preparer" },
  bat_a_preparer:              { label: "BAT envoyé au client",                      nextStatus: "attente_validation_client" },
  attente_validation_client:   { label: "Client valide → Commander fournisseur",     nextStatus: "a_commander_fournisseur" },
  en_attente_client:           { label: "Client valide → Commander fournisseur",     nextStatus: "a_commander_fournisseur" },
  a_commander_fournisseur:     { label: "Commande fournisseur passée",               nextStatus: "commande_fournisseur_passee" },
  validee:                     { label: "Commande fournisseur passée",               nextStatus: "commande_fournisseur_passee" },
  commande_fournisseur_passee: { label: "Textile reçu → Lancer production",         nextStatus: "en_production" },
  attente_reception_textile:   { label: "Textile reçu → Lancer production",         nextStatus: "en_production" },
  en_production:               { label: "Production terminée → Prête à expédier",   nextStatus: "prete_a_expedier" },
  en_traitement:               { label: "Production terminée → Prête à expédier",   nextStatus: "prete_a_expedier" },
  prete_a_expedier:            { label: "Expédier la commande",                      nextStatus: "expediee" },
  expediee:                    { label: "Livraison confirmée → Terminer",            nextStatus: "terminee" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNextAction(status: OrderStatus): {
  text: string;
  urgency: "urgent" | "info" | "done" | "none";
} {
  switch (status) {
    case "awaiting_bank_transfer":
      return { text: "Attente du virement bancaire — marquer comme payé une fois reçu", urgency: "urgent" };
    case "commande_a_valider":
    case "paiement_recu":
      return { text: "Vérifier le paiement et valider la commande", urgency: "urgent" };
    case "fichier_a_verifier":
      return { text: "Vérifier le fichier logo — valider ou demander un nouveau fichier", urgency: "urgent" };
    case "bat_a_preparer":
      return { text: "Préparer le BAT et l'envoyer au client pour validation", urgency: "urgent" };
    case "attente_validation_client":
    case "en_attente_client":
      return { text: "En attente de réponse ou de nouveau fichier du client", urgency: "info" };
    case "a_commander_fournisseur":
    case "validee":
      return { text: "Passer la commande textile chez le fournisseur (manuellement)", urgency: "urgent" };
    case "commande_fournisseur_passee":
    case "attente_reception_textile":
      return { text: "Attendre la réception du textile fournisseur", urgency: "info" };
    case "en_production":
    case "en_traitement":
      return { text: "Production en cours — marquage / personnalisation en atelier", urgency: "info" };
    case "prete_a_expedier":
      return { text: "Emballer et expédier la commande au client", urgency: "urgent" };
    case "expediee":
      return { text: "Commande expédiée — suivre la livraison et confirmer réception", urgency: "info" };
    case "terminee":
      return { text: "Commande terminée et livrée ✓", urgency: "done" };
    case "annulee":
      return { text: "Commande annulée", urgency: "none" };
    default:
      return { text: "Vérifier la commande", urgency: "info" };
  }
}

function getBatRequired(items: OrderItem[]): "required" | "recommended" | "no" {
  const totalQty = items.reduce((acc, i) => acc + (i.quantity ?? 0), 0);
  if (totalQty >= 20) return "required";
  if (items.some((i) => i.technique === "broderie")) return "recommended";
  return "no";
}

function buildSupplierLine(item: OrderItem, orderNumber: string): string {
  const info = getSupplierInfo(item.product);
  return [
    info.supplierLabel,
    info.supplierReference || "—",
    item.product?.shortName ?? "—",
    item.color?.label ?? "—",
    `Taille ${item.size ?? "—"}`,
    `Quantité ${item.quantity}`,
    `Commande ${orderNumber}`,
  ].join(" | ");
}

function fmtCurrency(n: number | null | undefined): string {
  if (n === undefined || n === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ id: string }> };

export default function AdminCommandeDetailPage({ params }: Props) {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus>("paiement_recu");
  const [adminNote, setAdminNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  // Default = production_interne (le mode le plus fréquent pour HM : commande
  // textile à Falk&Ross/TopTex/NewWave puis perso au studio). Les commandes
  // legacy avec "fournisseur" / "secours_interne" sont supportées en lecture.
  const [supplierMode, setSupplierMode] = useState<SupplierMode>("production_interne");
  const [supplierNote, setSupplierNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [fileRejectionReason, setFileRejectionReason] = useState("");
  const [validatingFile, setValidatingFile] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") { router.push("/connexion"); return; }
    params.then(({ id }) => {
      fetch(`/api/orders/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setOrder(data.order);
          if (data.order) {
            setNewStatus(data.order.status);
            setAdminNote(data.order.adminNote ?? "");
            setTrackingNumber(data.order.trackingNumber ?? "");
            setSupplierMode(data.order.supplierMode ?? "production_interne");
            setSupplierNote(data.order.supplierNote ?? "");
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [_hasHydrated, isAuthenticated, user, router, params]);

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") return null;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await fetch(`/api/orders/${order.id}/admin-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNote, trackingNumber, supplierMode, supplierNote }),
      });
      setOrder({ ...order, status: newStatus, adminNote, trackingNumber, supplierMode, supplierNote });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Marque une commande virement comme payée : passe le statut DB de
  // awaiting_bank_transfer → paiement_recu pour qu'elle réintègre le
  // workflow standard de production. V1 manuel — pas de réconciliation bancaire.
  const handleMarkBankTransferPaid = async () => {
    if (!order) return;
    const confirmed = window.confirm(
      "Confirmez avoir reçu le virement de " +
      fmtCurrency(order.totalTTC ?? 0) +
      " pour la commande #" + order.orderNumber + " ?"
    );
    if (!confirmed) return;
    setMarkingPaid(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/admin-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paiement_recu" }),
      });
      if (!res.ok) throw new Error("Mise à jour échouée");
      setOrder({ ...order, status: "paiement_recu" });
      setNewStatus("paiement_recu");
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleRefund = async () => {
    if (!order) return;
    const confirmed = window.confirm("Confirmer le remboursement pour cette commande ?");
    if (!confirmed) return;
    setRefundLoading(true);
    try {
      await fetch(`/api/orders/${order.id}/refund`, { method: "POST" });
      setOrder({ ...order, status: "annulee" });
    } catch (err) {
      console.error(err);
    } finally {
      setRefundLoading(false);
    }
  };

  const handleRejectFile = async () => {
    if (!order || !fileRejectionReason) return;
    await fetch(`/api/orders/${order.id}/reject-file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: fileRejectionReason }),
    });
    setOrder({ ...order, status: "en_attente_client", adminNote: fileRejectionReason });
    setFileRejectionReason("");
  };

  const handleValidateFile = async () => {
    if (!order) return;
    setValidatingFile(true);
    setValidateError(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/validate-file`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setValidateError(body.error ?? "Erreur lors de la validation — réessayez.");
        return;
      }
      // Mise à jour locale : uniquement les fichiers en_attente → valide
      const updatedItems = (order.items ?? []).map((item) =>
        item.logoFile?.status === "en_attente"
          ? { ...item, logoFile: { ...item.logoFile, status: "valide" as const } }
          : item
      );
      setOrder({ ...order, items: updatedItems, status: "bat_a_preparer" });
      setNewStatus("bat_a_preparer");
    } catch (err) {
      setValidateError("Erreur réseau. Veuillez réessayer.");
      console.error(err);
    } finally {
      setValidatingFile(false);
    }
  };

  const handleCopySupplierLine = (itemId: string, line: string) => {
    navigator.clipboard.writeText(line).then(() => {
      setCopiedItemId(itemId);
      setTimeout(() => setCopiedItemId(null), 2000);
    });
  };

  const handleQuickAdvance = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/admin-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, adminNote, trackingNumber, supplierMode, supplierNote }),
      });
      if (res.ok) {
        setOrder({ ...order, status: nextStatus });
        setNewStatus(nextStatus);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdvancing(false);
    }
  };

  // ─── Loading / not found ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="pt-24 pb-20">
        <div className="container max-w-5xl">
          <div className="skeleton h-8 w-48 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="skeleton h-40 rounded-2xl" />
              <div className="skeleton h-64 rounded-2xl" />
            </div>
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 text-center">
      <p className="text-[var(--hm-text-soft)]">Commande introuvable</p>
      <Link href="/admin/commandes" className="btn-ghost mt-4">Retour</Link>
    </div>
  );

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const nextAction = getNextAction(order.status);
  const batRequired = getBatRequired(order.items ?? []);
  const totalQty = (order.items ?? []).reduce((acc, i) => acc + (i.quantity ?? 0), 0);
  const hasFileToVerify = (order.items ?? []).some((i) => i.logoFile?.status === "en_attente");

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 pb-20">
      <div className="container max-w-5xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] mb-6">
          <Link href="/admin" className="hover:text-[var(--hm-text)]">Admin</Link>
          <span>/</span>
          <Link href="/admin/commandes" className="hover:text-[var(--hm-text)]">Commandes</Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">#{order.orderNumber}</span>
        </nav>

        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black text-[var(--hm-text)]">Commande #{order.orderNumber}</h1>
          {order.invoiceUrl && (
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs gap-2"
            >
              <ExternalLink size={12} />
              Voir facture
            </a>
          )}
        </div>

        {/* Action suivante banner */}
        {nextAction.urgency !== "none" && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${
            nextAction.urgency === "urgent" ? "bg-[var(--hm-accent-soft-rose)] border-[var(--hm-rose)]/20"
            : nextAction.urgency === "done"   ? "bg-green-50 border-green-200"
            :                                   "bg-blue-50 border-blue-200"
          }`}>
            {nextAction.urgency === "urgent" && <AlertTriangle size={14} className="text-[var(--hm-rose)] shrink-0" />}
            {nextAction.urgency === "info"   && <Clock         size={14} className="text-blue-500 shrink-0" />}
            {nextAction.urgency === "done"   && <CheckCircle   size={14} className="text-green-500 shrink-0" />}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)]">
                Action suivante
              </p>
              <p className={`text-sm font-semibold ${
                nextAction.urgency === "urgent" ? "text-[var(--hm-rose)]"
                : nextAction.urgency === "done" ? "text-green-700"
                :                                 "text-blue-700"
              }`}>
                {nextAction.text}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Client */}
            <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-4">Client</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--hm-text-soft)] mb-0.5">Nom</p>
                  <p className="text-sm font-semibold text-[var(--hm-text)]">
                    {order.user?.firstName ?? "—"} {order.user?.lastName ?? ""}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--hm-text-soft)] mb-0.5">Email</p>
                  <p className="text-sm text-[var(--hm-text)]">{order.user?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--hm-text-soft)] mb-0.5">Téléphone</p>
                  <p className="text-sm text-[var(--hm-text)]">{order.user?.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--hm-text-soft)] mb-0.5">Type</p>
                  <p className="text-sm text-[var(--hm-text)] capitalize">{order.user?.type ?? "—"}</p>
                </div>
                {order.user?.company && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-[var(--hm-text-soft)] mb-0.5">Société</p>
                    <p className="text-sm text-[var(--hm-text)]">{order.user.company}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Facturation */}
            <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-2">
                    Facturation
                  </h2>
                  {order.invoiceUrl ? (
                    <p className="text-sm text-green-500">Facture enregistrée sur la commande.</p>
                  ) : (
                    <p className="text-sm text-[var(--hm-text)]">
                      Facture à créer manuellement dans Pennylane.
                    </p>
                  )}
                  {!order.invoiceUrl && (
                    <p className="text-xs text-[var(--hm-text-soft)] mt-1">
                      L&apos;automatisation API Pennylane est suspendue pour la V1.
                    </p>
                  )}
                </div>
                <span className={`badge ${order.invoiceUrl ? "badge-success" : "badge-warning"} text-[9px]`}>
                  {order.invoiceUrl ? "Facture liée" : "Facture manuelle requise"}
                </span>
              </div>
            </div>

            {/* Articles */}
            <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider">Articles</h2>
                <span className="text-[10px] text-[var(--hm-text-soft)]">
                  {totalQty} pièce{totalQty > 1 ? "s" : ""} au total
                </span>
              </div>

              {/* Bandeau global validation fichiers — affiché une seule fois si fichiers en attente */}
              {hasFileToVerify && (
                <div className="mb-4 flex items-center justify-between gap-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-amber-700">
                      {(order.items ?? []).filter((i) => i.logoFile?.status === "en_attente").length} fichier(s) en attente de validation
                    </p>
                    {validateError && (
                      <p className="text-[10px] text-red-500 mt-0.5">{validateError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleValidateFile}
                    disabled={validatingFile}
                    className="btn-outline text-[10px] gap-1.5 shrink-0 border-green-400/50 text-green-700 hover:border-green-500"
                  >
                    <CheckCircle size={11} />
                    {validatingFile ? "Validation..." : "Valider tous les fichiers"}
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-6">
                {(order.items ?? []).map((item) => {
                  const supplierInfo = getSupplierInfo(item.product);
                  const supplierLine = buildSupplierLine(item, order.orderNumber);
                  const isCopied = copiedItemId === item.id;

                  return (
                    <div key={item.id} className="pb-6 border-b border-[var(--hm-line)] last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--hm-text)]">
                            {item.product?.shortName ?? "—"}
                          </p>
                          <p className="text-[10px] font-mono text-[var(--hm-text-soft)]">
                            {item.product?.reference ?? "—"}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="badge badge-neutral text-[9px]">Taille {item.size ?? "—"}</span>
                            <span className="badge badge-neutral text-[9px]">{item.color?.label ?? "—"}</span>
                            <span className="badge badge-neutral text-[9px]">
                              {item.technique?.toUpperCase() ?? "—"}
                            </span>
                            <span className="badge badge-neutral text-[9px]">{item.placement ?? "—"}</span>
                          </div>

                          {/* ── PRINT : Fichiers recto / verso ──────────────── */}
                          {item.printConfig ? (
                            <div className="mt-3 p-3 bg-[var(--hm-surface)] border border-[var(--hm-line)] rounded-xl">
                              <p className="text-[9px] font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-2">
                                Fichiers impression & BAT
                              </p>

                              {/* Config lots */}
                              <div className="flex flex-col gap-1 mb-3">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[var(--hm-text-soft)]">Exemplaires</span>
                                  <span className="font-semibold text-[var(--hm-text)]">{item.printConfig.quantity} ex.</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[var(--hm-text-soft)]">Finition</span>
                                  <span className="text-[var(--hm-text)]">
                                    {item.printConfig.finish === "mat" ? "Mat"
                                      : item.printConfig.finish === "brillant" ? "Brillant"
                                      : "Premium (satiné velours)"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[var(--hm-text-soft)]">Faces</span>
                                  <span className="text-[var(--hm-text)]">
                                    {item.printConfig.faces === "recto" ? "Recto seul" : "Recto-verso"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[var(--hm-text-soft)]">Coins</span>
                                  <span className="text-[var(--hm-text)]">
                                    {item.printConfig.corners === "standard" ? "Angles droits" : "Coins arrondis"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[var(--hm-text-soft)]">Orientation</span>
                                  <span className="text-[var(--hm-text)]">
                                    {item.printConfig.orientation === "landscape" ? "Paysage" : "Portrait"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-[var(--hm-text-soft)]">Statut BAT</span>
                                  <span className={`font-semibold ${
                                    item.printConfig.batStatus === "valide"   ? "text-green-600"
                                    : item.printConfig.batStatus === "invalide" ? "text-red-500"
                                    : "text-amber-600"
                                  }`}>
                                    {item.printConfig.batStatus === "valide"   ? "Validé ✓"
                                     : item.printConfig.batStatus === "invalide" ? "Rejeté ✗"
                                     : "À vérifier"}
                                  </span>
                                </div>
                                {item.printConfig.batSignature && (
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-[var(--hm-text-soft)]">BAT signé par</span>
                                    <span className="font-semibold text-[var(--hm-text)]">
                                      {item.printConfig.batSignature.name}
                                      {" · "}
                                      {new Date(item.printConfig.batSignature.date).toLocaleDateString("fr-FR")}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Aperçu visuel de la carte (PNG éditeur / rendu PDF) */}
                              {(item.printConfig.frontPreviewUrl || item.printConfig.backPreviewUrl) && (
                                <div className="mb-3 grid grid-cols-2 gap-2">
                                  {item.printConfig.frontPreviewUrl && (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] text-[var(--hm-text-muted)]">Aperçu Recto</span>
                                      <a href={item.printConfig.frontPreviewUrl} target="_blank" rel="noopener noreferrer"
                                        className="overflow-hidden rounded-lg border border-[var(--hm-primary)]/30 bg-white">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.printConfig.frontPreviewUrl} alt="Aperçu recto carte"
                                          className="h-full w-full object-contain transition hover:scale-105" />
                                      </a>
                                    </div>
                                  )}
                                  {item.printConfig.backPreviewUrl && (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] text-[var(--hm-text-muted)]">Aperçu Verso</span>
                                      <a href={item.printConfig.backPreviewUrl} target="_blank" rel="noopener noreferrer"
                                        className="overflow-hidden rounded-lg border border-[var(--hm-primary)]/30 bg-white">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.printConfig.backPreviewUrl} alt="Aperçu verso carte"
                                          className="h-full w-full object-contain transition hover:scale-105" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Fichier recto */}
                              {item.printConfig.frontFileUrl && (
                                <div className="mb-1.5">
                                  <p className="text-[9px] text-[var(--hm-text-soft)] mb-0.5">Fichier Recto</p>
                                  <a
                                    href={item.printConfig.frontFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[var(--hm-primary)] hover:underline flex items-center gap-1 truncate"
                                  >
                                    Télécharger le fichier recto
                                    <ExternalLink size={9} className="shrink-0" />
                                  </a>
                                </div>
                              )}

                              {/* Fichier verso */}
                              {item.printConfig.backFileUrl && (
                                <div className="mb-1.5">
                                  <p className="text-[9px] text-[var(--hm-text-soft)] mb-0.5">Fichier Verso</p>
                                  <a
                                    href={item.printConfig.backFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[var(--hm-primary)] hover:underline flex items-center gap-1 truncate"
                                  >
                                    Télécharger le fichier verso
                                    <ExternalLink size={9} className="shrink-0" />
                                  </a>
                                </div>
                              )}

                              {/* Bloc fournisseur print */}
                              <div className="mt-3 pt-2 border-t border-[var(--hm-line)]">
                                <p className="text-[9px] text-[var(--hm-text-soft)] mb-1">Fournisseur impression</p>
                                <span className="badge badge-info text-[9px]">Gelato (V1 — commande manuelle)</span>
                                <p className="mt-1 text-[9px] text-[var(--hm-text-muted)]">
                                  Transmettre les fichiers ci-dessus à gelato.com. La commande Gelato automatique sera activée en V2.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* ── TEXTILE : Aperçu visuel commande ────────
                                 V1.1 (2026-05-26) : Si le BAT composite a été
                                 uploadé au moment du ajout au panier (champs
                                 composed_preview_url / composed_preview_back
                                 persistés via migration 013), on affiche
                                 directement les 2 aperçus tels que le client
                                 les a validés — c'est ce qu'il veut voir en
                                 ouvrant son récap, c'est ce que Kaan doit
                                 valider avant d'envoyer le BAT.
                                 Fallback V1 : si l'aperçu composite n'existe
                                 pas (commandes antérieures à la migration ou
                                 upload qui a foiré), on retombe sur
                                 packshot + logo séparés. */}
                              {(item.composedPreviewUrl || item.composedPreviewBack || item.logoFile?.url || item.product?.id) && (
                                <div className="mt-3 p-3 bg-white border border-[var(--hm-line)] rounded-xl">
                                  <p className="text-[9px] font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-3">
                                    Aperçu commande — à revoir avant envoi BAT
                                  </p>
                                  {/* Si composed previews dispos → on les affiche
                                     en priorité (le rendu validé par le client) */}
                                  {(item.composedPreviewUrl || item.composedPreviewBack) ? (
                                    <div className="grid grid-cols-2 gap-3">
                                      {item.composedPreviewUrl && (
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] text-[var(--hm-text-muted)]">
                                            BAT validé · Face
                                          </span>
                                          <a
                                            href={item.composedPreviewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="aspect-square overflow-hidden rounded-lg border border-[var(--hm-primary)]/30 bg-white"
                                            title="Ouvrir l'aperçu en plein écran"
                                          >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={item.composedPreviewUrl}
                                              alt="Aperçu BAT face"
                                              className="h-full w-full object-contain transition hover:scale-105"
                                            />
                                          </a>
                                        </div>
                                      )}
                                      {item.composedPreviewBack && (
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] text-[var(--hm-text-muted)]">
                                            BAT validé · Dos
                                          </span>
                                          <a
                                            href={item.composedPreviewBack}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="aspect-square overflow-hidden rounded-lg border border-[var(--hm-primary)]/30 bg-white"
                                            title="Ouvrir l'aperçu en plein écran"
                                          >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={item.composedPreviewBack}
                                              alt="Aperçu BAT dos"
                                              className="h-full w-full object-contain transition hover:scale-105"
                                            />
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                  <div className="grid grid-cols-2 gap-3">
                                    {/* Fallback packshot — pour commandes pré-migration 013 */}
                                    {item.product && (() => {
                                      const packshot = getProductCatalogImage(item.product, item.color?.id);
                                      return packshot ? (
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[9px] text-[var(--hm-text-muted)]">
                                            Textile · {item.color?.label ?? "—"}
                                          </span>
                                          <div className="aspect-square overflow-hidden rounded-lg border border-[var(--hm-line)] bg-white">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={packshot}
                                              alt={`Packshot ${item.product.shortName} ${item.color?.label ?? ""}`}
                                              className="h-full w-full object-contain"
                                            />
                                          </div>
                                        </div>
                                      ) : null;
                                    })()}

                                    {/* Fallback logo seul (sans composé) */}
                                    {item.logoFile?.url && (
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-[var(--hm-text-muted)]">
                                          Logo client · {item.placement ? item.placement : "—"}
                                        </span>
                                        <a
                                          href={item.logoFile.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Ouvrir en plein écran"
                                          className="aspect-square overflow-hidden rounded-lg border border-[var(--hm-line)] bg-white"
                                          style={{
                                            backgroundImage:
                                              "linear-gradient(45deg, #f5f5f4 25%, transparent 25%, transparent 75%, #f5f5f4 75%, #f5f5f4), linear-gradient(45deg, #f5f5f4 25%, transparent 25%, transparent 75%, #f5f5f4 75%, #f5f5f4)",
                                            backgroundSize: "12px 12px",
                                            backgroundPosition: "0 0, 6px 6px",
                                          }}
                                        >
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={item.logoFile.url}
                                            alt={item.logoFile.name || "Logo"}
                                            className="h-full w-full object-contain p-3 transition hover:scale-105"
                                          />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  )}
                                  {/* Métadonnées de placement (lecture seule).
                                     Le LogoPlacementTransform stocke des coords
                                     Fabric.js : left/top (coin haut-gauche du
                                     logo dans le canvas Studio), scaleX/scaleY
                                     (multiplicateur), angle (rotation). On les
                                     formate ici en pourcentage du canvas pour
                                     que l'admin comprenne sans connaître Fabric. */}
                                  {item.logoPlacementTransform && (() => {
                                    const t = item.logoPlacementTransform;
                                    const canvas = t.canvasSize || 1; // évite /0
                                    const leftPct = (t.left   / canvas) * 100;
                                    const topPct  = (t.top    / canvas) * 100;
                                    const wPct    = (t.width  / canvas) * 100;
                                    const hPct    = (t.height / canvas) * 100;
                                    return (
                                      <div className="mt-3 pt-2 border-t border-[var(--hm-line)] grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                                        <div className="flex justify-between">
                                          <span className="text-[var(--hm-text-soft)]">Position</span>
                                          <span className="font-mono text-[var(--hm-text)]">
                                            {leftPct.toFixed(1)}% / {topPct.toFixed(1)}%
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-[var(--hm-text-soft)]">Taille</span>
                                          <span className="font-mono text-[var(--hm-text)]">
                                            {wPct.toFixed(1)}% × {hPct.toFixed(1)}%
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-[var(--hm-text-soft)]">Échelle</span>
                                          <span className="font-mono text-[var(--hm-text)]">
                                            ×{t.scaleX.toFixed(2)} / ×{t.scaleY.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-[var(--hm-text-soft)]">Rotation</span>
                                          <span className="font-mono text-[var(--hm-text)]">
                                            {t.angle.toFixed(0)}°
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* ── TEXTILE : Logo & BAT bloc ──────────────── */}
                              {(item.logoFile || item.batRef || item.logoEffect) && (
                                <div className="mt-3 p-3 bg-[var(--hm-surface)] border border-[var(--hm-line)] rounded-xl">
                                  <p className="text-[9px] font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-2">
                                    Logo & BAT
                                  </p>

                                  {item.logoFile && (
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between gap-2 mb-2">
                                        <a
                                          href={item.logoFile.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[10px] text-[var(--hm-primary)] hover:underline flex items-center gap-1 min-w-0 truncate"
                                        >
                                          {item.logoFile.name || "Fichier logo"}
                                          <ExternalLink size={9} className="shrink-0" />
                                        </a>
                                        <span className={`badge text-[9px] shrink-0 ${
                                          item.logoFile.status === "valide"   ? "badge-success"
                                          : item.logoFile.status === "invalide" ? "badge-error"
                                          : "badge-warning"
                                        }`}>
                                          {item.logoFile.status === "valide"   ? "Validé ✓"
                                           : item.logoFile.status === "invalide" ? "Rejeté ✗"
                                           : "À vérifier"}
                                        </span>
                                      </div>
                                      {/* ── Aperçu visuel du logo ─────────────────
                                         Affichage du logo réel envoyé par le
                                         client pour que l'admin puisse JUGER
                                         visuellement le fichier sans avoir à
                                         ouvrir l'URL Supabase Storage.
                                         Limité à 96 px de haut + fond damier
                                         transparent pour les PNG, clic = ouvre
                                         en plein écran via l'URL Supabase. */}
                                      {item.logoFile.url && (
                                        <a
                                          href={item.logoFile.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block overflow-hidden rounded-lg border border-[var(--hm-line)] bg-white"
                                          title="Cliquer pour voir en plein écran"
                                          style={{
                                            // Damier subtil pour visualiser la
                                            // transparence des PNG. Cohérent
                                            // avec ce que voient les designers
                                            // dans Photoshop/Figma.
                                            backgroundImage:
                                              "linear-gradient(45deg, #f5f5f4 25%, transparent 25%, transparent 75%, #f5f5f4 75%, #f5f5f4), linear-gradient(45deg, #f5f5f4 25%, transparent 25%, transparent 75%, #f5f5f4 75%, #f5f5f4)",
                                            backgroundSize: "12px 12px",
                                            backgroundPosition: "0 0, 6px 6px",
                                          }}
                                        >
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={item.logoFile.url}
                                            alt={item.logoFile.name || "Logo client"}
                                            className="mx-auto block max-h-24 w-auto object-contain p-2 transition hover:scale-105"
                                          />
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex flex-col gap-1">
                                    {item.logoEffect && item.logoEffect !== "none" && (
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-[var(--hm-text-soft)]">Effet logo</span>
                                        <span className="text-[var(--hm-text)]">
                                          {item.logoEffect === "white-outline" ? "Contour blanc" : "Fond blanc"}
                                        </span>
                                      </div>
                                    )}
                                    {item.batRef && (
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-[var(--hm-text-soft)]">Réf. BAT</span>
                                        <span className="font-mono text-[var(--hm-primary)]">{item.batRef}</span>
                                      </div>
                                    )}
                                    {item.logoPlacementTransform && (
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-[var(--hm-text-soft)]">Position</span>
                                        <span className="text-green-500">Personnalisée enregistrée ✓</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* ── TEXTILE : Fournisseur bloc ─────────────── */}
                              <div className="mt-3 p-3 bg-[var(--hm-surface)] border border-[var(--hm-line)] rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-[9px] font-bold text-[var(--hm-text-soft)] uppercase tracking-wider">
                                    Fournisseur
                                  </p>
                                  <button
                                    onClick={() => handleCopySupplierLine(item.id, supplierLine)}
                                    className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                                      isCopied
                                        ? "border-green-400/40 text-green-600 bg-green-50"
                                        : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                                    }`}
                                  >
                                    <Copy size={9} />
                                    {isCopied ? "Copié ✓" : "Copier ligne"}
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="badge badge-info text-[9px]">
                                    {supplierInfo.supplierLabel}
                                  </span>
                                  {supplierInfo.supplierReference && supplierInfo.supplierReference !== "—" && (
                                    <span className="font-mono text-[10px] text-[var(--hm-text)]">
                                      {supplierInfo.supplierReference}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  {supplierInfo.estimatedPurchasePrice && (
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-[var(--hm-text-soft)]">Prix achat estimé</span>
                                      <span className="font-semibold text-[var(--hm-text)]">
                                        {fmtCurrency(supplierInfo.estimatedPurchasePrice)} / u
                                      </span>
                                    </div>
                                  )}
                                  {supplierInfo.supplierUrl && (
                                    <a
                                      href={supplierInfo.supplierUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-[var(--hm-primary)] hover:underline flex items-center gap-1"
                                    >
                                      Voir sur {supplierInfo.supplierLabel}
                                      <ExternalLink size={9} />
                                    </a>
                                  )}
                                </div>
                                {/* Supplier line preview */}
                                <p className="mt-2 text-[9px] font-mono text-[var(--hm-text-soft)] bg-white border border-[var(--hm-line)] rounded px-2 py-1.5 break-all leading-relaxed">
                                  {supplierLine}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Qty + price */}
                        <div className="text-right shrink-0">
                          <p className="text-xs text-[var(--hm-text-soft)]">×{item.quantity}</p>
                          <p className="text-sm font-bold text-[var(--hm-primary)]">
                            {fmtCurrency(item.totalTTC)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price summary */}
              <div className="mt-4 pt-4 border-t border-[var(--hm-line)] flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>Sous-total HT</span>
                  <span>{fmtCurrency(order.subtotalHT)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>TVA (20%)</span>
                  <span>{fmtCurrency(order.tva)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--hm-text-soft)]">
                  <span>Livraison</span>
                  <span>{order.freeShipping ? "Offerte" : fmtCurrency(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[var(--hm-text)] pt-2">
                  <span>Total TTC</span>
                  <span className="text-[var(--hm-primary)]">{fmtCurrency(order.totalTTC)}</span>
                </div>
              </div>
            </div>

            {/* BAT bloc */}
            {batRequired !== "no" && (
              <div className={`p-5 bg-white border rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)] ${
                batRequired === "required" ? "border-[var(--hm-rose)]/30" : "border-amber-200"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider flex items-center gap-2">
                    <FileText
                      size={12}
                      className={batRequired === "required" ? "text-[var(--hm-rose)]" : "text-amber-500"}
                    />
                    BAT — Bon à tirer
                  </h2>
                  <span className={`badge text-[9px] ${batRequired === "required" ? "badge-error" : "badge-warning"}`}>
                    {batRequired === "required"
                      ? `Requis — ${totalQty} pièces`
                      : "Recommandé (broderie)"}
                  </span>
                </div>

                {(order.items ?? []).some((i) => i.batRef) ? (
                  <div className="flex flex-col gap-2">
                    {(order.items ?? []).filter((i) => i.batRef).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs bg-[var(--hm-surface)] px-3 py-2 rounded-lg"
                      >
                        <span className="text-[var(--hm-text)]">{item.product?.shortName ?? "—"}</span>
                        <span className="font-mono text-[var(--hm-primary)]">{item.batRef}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--hm-text-soft)] text-center py-2">
                    {batRequired === "required"
                      ? "Aucun BAT enregistré — à préparer et envoyer au client avant lancement."
                      : "BAT recommandé pour la broderie — aucune référence enregistrée."}
                  </p>
                )}
              </div>
            )}

            {/* File rejection form — visible uniquement sur les statuts pré-production */}
            {FILE_CHECK_STATUSES.includes(order.status) && (
              <div className="p-5 bg-[var(--hm-accent-soft-rose)] border border-[var(--hm-rose)]/20 rounded-2xl">
                <h2 className="text-xs font-bold text-[var(--hm-rose)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle size={12} />
                  Rejeter le fichier logo
                </h2>
                <div className="mb-3">
                  <p className="text-[10px] text-[var(--hm-text-soft)] mb-2">
                    Message envoyé au client (personnalisable) :
                  </p>
                  <textarea
                    className="input h-24 resize-none text-xs"
                    placeholder={`Bonjour,\n\nVotre fichier logo n'est pas exploitable en l'état pour la technique choisie. Nous avons besoin d'un fichier vectoriel (format .ai, .pdf ou .eps) ou d'un PNG haute résolution (min. 300 dpi).\n\nMerci de nous envoyer un nouveau fichier.\n\nÀ bientôt,\nL'équipe HM Global`}
                    value={fileRejectionReason}
                    onChange={(e) => setFileRejectionReason(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleRejectFile}
                  disabled={!fileRejectionReason}
                  className="btn-outline text-xs border-[#f8717133] text-[#f87171] hover:border-[#f87171]"
                >
                  Demander un nouveau fichier
                </button>
              </div>
            )}
          </div>

          {/* ── Right column ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Bloc virement bancaire — visible seulement pour les commandes
               payées par virement (V1 manuel : on attend que l'admin confirme
               la réception sur le compte bancaire HM). Une fois marqué,
               status → paiement_recu et la commande rejoint le workflow standard. */}
            {order.paymentMethod === "bank_transfer" && (
              <div className={`p-5 rounded-2xl border ${
                order.status === "awaiting_bank_transfer"
                  ? "border-[var(--hm-primary)]/30 bg-[var(--hm-accent-soft-rose)]/40"
                  : "border-green-200 bg-green-50"
              }`}>
                <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-3">
                  Paiement par virement
                </h2>
                {order.status === "awaiting_bank_transfer" ? (
                  <>
                    <p className="text-xs text-[var(--hm-text-soft)] mb-3">
                      En attente de réception du virement sur le compte HM Global.
                      Référence client : <span className="font-mono font-bold text-[var(--hm-text)]">{order.orderNumber}</span>.
                    </p>
                    <button
                      onClick={handleMarkBankTransferPaid}
                      disabled={markingPaid}
                      className="btn-primary w-full text-xs gap-2"
                    >
                      <CheckCircle size={12} />
                      {markingPaid ? "Mise à jour…" : "Marquer comme payé par virement"}
                    </button>
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle size={12} />
                    Virement reçu — commande dans le workflow production.
                  </p>
                )}
              </div>
            )}

            {/* Status update */}
            <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-4">
                Statut de la commande
              </h2>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="input mb-3"
              >
                {ALL_STATUSES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {(newStatus === "expediee" || order.status === "expediee") && (
                <div className="mb-3">
                  <label className="label">Numéro de suivi</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="1Z999AA10123456784"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="label">Note interne admin</label>
                <textarea
                  className="input h-20 resize-none"
                  placeholder="Note visible uniquement par l'admin"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="label">Mode de traitement</label>
                <select
                  value={supplierMode}
                  onChange={(e) => setSupplierMode(e.target.value as SupplierMode)}
                  className="input"
                >
                  {/* ── Modes principaux (V1+) ── */}
                  <optgroup label="Modes principaux">
                    <option value="production_interne">
                      🏭 Production interne — Falk&Ross / TopTex / NewWave (commande manuelle, perso au studio)
                    </option>
                    <option value="printify">
                      🤖 Printify — POD automatisé (Gildan, Bella, mugs)
                    </option>
                    <option value="gelato">
                      🎨 Gelato — POD automatisé (mugs, posters, accessoires)
                    </option>
                    <option value="stock_interne">
                      📦 Stock interne — Produit déjà en stock à l&apos;agence (WG004 V1, etc.)
                    </option>
                  </optgroup>
                  {/* ── Legacy (lecture seule pour vieilles commandes) ── */}
                  {(supplierMode === "fournisseur" || supplierMode === "secours_interne") && (
                    <optgroup label="Anciennes valeurs (legacy)">
                      <option value="fournisseur">⚠️ Fournisseur (legacy — remplacé par Production interne)</option>
                      <option value="secours_interne">⚠️ Secours interne (legacy — remplacé par Stock interne)</option>
                    </optgroup>
                  )}
                </select>
                {/* Note libre uniquement pour les modes qui nécessitent de tracer
                   manuellement (production interne avec spécificités, ou stock
                   interne pour préciser le lot d'origine). */}
                {(supplierMode === "production_interne" || supplierMode === "stock_interne" || supplierMode === "secours_interne") && (
                  <textarea
                    className="input mt-2 h-16 resize-none"
                    placeholder={
                      supplierMode === "stock_interne"
                        ? "Référence lot stock (ex: WG004 noir Falk&Ross 100pcs 2026-05)"
                        : "Note interne (technique perso, particularité, etc.)"
                    }
                    value={supplierNote}
                    onChange={(e) => setSupplierNote(e.target.value)}
                  />
                )}
              </div>

              <button onClick={handleSave} disabled={saving} className="btn-primary w-full gap-2 text-xs">
                <CheckCircle size={12} />
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>

            {/* Workflow — étape suivante */}
            {WORKFLOW_STEPS[order.status] && (
              <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--hm-text-soft)] mb-2">
                  Étape suivante
                </p>
                <button
                  onClick={() => handleQuickAdvance(WORKFLOW_STEPS[order.status]!.nextStatus)}
                  disabled={advancing}
                  className="btn-primary w-full text-xs gap-2"
                >
                  <CheckCircle size={12} />
                  {advancing ? "Avancement..." : WORKFLOW_STEPS[order.status]!.label}
                </button>
                {!order.invoiceUrl
                  && (order.status === "validee" || order.status === "a_commander_fournisseur") && (
                  <p className="mt-2 text-[10px] text-[var(--hm-primary)]">
                    ⚠ Facture à créer dans Pennylane avant envoi.
                  </p>
                )}
              </div>
            )}

            {/* Actions génériques */}
            <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-3">
                Actions
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setNewStatus("prete_a_expedier")}
                  className="btn-outline text-xs gap-2 w-full"
                >
                  <Package size={12} />
                  Prête à expédier
                </button>
                <button
                  onClick={() => setNewStatus("expediee")}
                  className="btn-outline text-xs gap-2 w-full"
                >
                  <Truck size={12} />
                  Expédiée
                </button>
                <button
                  onClick={() => setNewStatus("terminee")}
                  className="btn-outline text-xs gap-2 w-full"
                >
                  <CheckCircle size={12} />
                  Terminée
                </button>
                {order.stripePaymentIntentId && (
                  <button
                    onClick={handleRefund}
                    disabled={refundLoading}
                    className="btn-outline text-xs border-[#f8717133] text-[#f87171] hover:border-[#f87171] gap-2 w-full"
                  >
                    <XCircle size={12} />
                    {refundLoading ? "Remboursement..." : "Rembourser et annuler"}
                  </button>
                )}
              </div>
            </div>

            {/* Payment info */}
            <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-3">
                Paiement Stripe
              </h2>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--hm-text-soft)]">Statut</span>
                  <span className={`font-semibold ${
                    order.stripePaymentStatus === "succeeded" ? "text-green-500" : "text-[#f87171]"
                  }`}>
                    {order.stripePaymentStatus === "succeeded" ? "Payé ✓" : order.stripePaymentStatus ?? "—"}
                  </span>
                </div>
                {order.stripePaymentIntentId && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--hm-text-soft)]">ID Stripe</span>
                    {/* Lien direct vers le dashboard Stripe. L'URL canonique
                       `dashboard.stripe.com/payments/<pi>` est intelligente :
                       Stripe détecte automatiquement si l'ID est test ou live
                       et redirige vers la bonne vue (ex: /test/payments/...
                       en mode test). Plus besoin de gérer test/live à la main. */}
                    <a
                      href={`https://dashboard.stripe.com/payments/${order.stripePaymentIntentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--hm-primary)] underline decoration-dotted underline-offset-2 transition hover:text-[var(--hm-primary)] hover:decoration-solid"
                      title="Ouvrir dans Stripe Dashboard"
                    >
                      <span className="truncate max-w-[110px]">{order.stripePaymentIntentId}</span>
                      <ExternalLink size={10} className="shrink-0" />
                    </a>
                  </div>
                )}
                {order.paidAt && !isNaN(new Date(order.paidAt).getTime()) && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--hm-text-soft)]">Payé le</span>
                    <span className="text-[var(--hm-text-soft)]">
                      {new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(order.paidAt))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs pt-1 border-t border-[var(--hm-line)]">
                  <span className="text-[var(--hm-text-soft)]">Montant TTC</span>
                  <span className="font-semibold text-[var(--hm-text)]">{fmtCurrency(order.totalTTC)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
