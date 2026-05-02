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
import type { Order, OrderStatus, OrderItem } from "@/types";

// ─── All 16 statuses (ordered by workflow) ────────────────────────────────────

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNextAction(status: OrderStatus): {
  text: string;
  urgency: "urgent" | "info" | "done" | "none";
} {
  switch (status) {
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
  const [supplierMode, setSupplierMode] = useState<"fournisseur" | "secours_interne">("fournisseur");
  const [supplierNote, setSupplierNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [fileRejectionReason, setFileRejectionReason] = useState("");
  const [validatingFile, setValidatingFile] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") { router.push("/connexion"); return; }
    params.then(({ id }) => {
      fetch(`/api/orders/${id}?admin=true`)
        .then((r) => r.json())
        .then((data) => {
          setOrder(data.order);
          if (data.order) {
            setNewStatus(data.order.status);
            setAdminNote(data.order.adminNote ?? "");
            setTrackingNumber(data.order.trackingNumber ?? "");
            setSupplierMode(data.order.supplierMode ?? "fournisseur");
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
    try {
      await fetch(`/api/orders/${order.id}/validate-file`, { method: "POST" });
      const updatedItems = (order.items ?? []).map((item) =>
        item.logoFile
          ? { ...item, logoFile: { ...item.logoFile, status: "valide" as const } }
          : item
      );
      setOrder({ ...order, items: updatedItems, status: "bat_a_preparer" });
      setNewStatus("bat_a_preparer");
    } catch (err) {
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

                          {/* Logo & BAT bloc */}
                          {(item.logoFile || item.batRef || item.logoEffect) && (
                            <div className="mt-3 p-3 bg-[var(--hm-surface)] border border-[var(--hm-line)] rounded-xl">
                              <p className="text-[9px] font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-2">
                                Logo & BAT
                              </p>

                              {item.logoFile && (
                                <div className="mb-2">
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
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
                                  {item.logoFile.status === "en_attente" && (
                                    <button
                                      onClick={handleValidateFile}
                                      disabled={validatingFile}
                                      className="btn-outline text-[10px] gap-1 py-1 px-2 border-green-400/40 text-green-600 hover:border-green-500"
                                    >
                                      <CheckCircle size={10} />
                                      {validatingFile ? "Validation..." : "Valider le fichier"}
                                    </button>
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

                          {/* Fournisseur bloc */}
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

            {/* File rejection form */}
            {(order.status === "paiement_recu"
              || order.status === "fichier_a_verifier"
              || order.status === "commande_a_valider"
              || hasFileToVerify) && (
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
                  onChange={(e) => setSupplierMode(e.target.value as "fournisseur" | "secours_interne")}
                  className="input"
                >
                  <option value="fournisseur">Fournisseur (Falk & Ross / TopTex)</option>
                  <option value="secours_interne">Secours interne</option>
                </select>
                {supplierMode === "secours_interne" && (
                  <textarea
                    className="input mt-2 h-16 resize-none"
                    placeholder="Raison du traitement en interne"
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

            {/* Quick actions */}
            <div className="p-5 bg-white border border-[var(--hm-line)] rounded-2xl shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
              <h2 className="text-xs font-bold text-[var(--hm-text-soft)] uppercase tracking-wider mb-4">
                Actions rapides
              </h2>
              <div className="flex flex-col gap-2">
                {!order.invoiceUrl
                  && (order.status === "validee" || order.status === "a_commander_fournisseur") && (
                  <div className="rounded-lg border border-[var(--hm-primary)]/20 bg-[var(--hm-accent-soft-rose)] px-3 py-2 text-xs text-[var(--hm-primary)]">
                    Facture à créer dans Pennylane avant envoi.
                  </div>
                )}
                <button
                  onClick={() => setNewStatus("prete_a_expedier")}
                  className="btn-outline text-xs gap-2 w-full"
                >
                  <Package size={12} />
                  Marquer prête à expédier
                </button>
                <button
                  onClick={() => setNewStatus("expediee")}
                  className="btn-outline text-xs gap-2 w-full"
                >
                  <Truck size={12} />
                  Marquer comme expédiée
                </button>
                <button
                  onClick={() => setNewStatus("terminee")}
                  className="btn-outline text-xs gap-2 w-full"
                >
                  <CheckCircle size={12} />
                  Marquer comme terminée
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
                    <span className="font-mono text-[10px] text-[var(--hm-text-soft)] truncate max-w-[120px]">
                      {order.stripePaymentIntentId}
                    </span>
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
