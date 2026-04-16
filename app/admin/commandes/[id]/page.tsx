"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, CheckCircle, XCircle, FileText, AlertTriangle, Truck, Package } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import type { Order, OrderStatus } from "@/types";

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "paiement_recu",      label: "Paiement reçu" },
  { value: "fichier_a_verifier", label: "Fichier à vérifier" },
  { value: "en_attente_client",  label: "En attente client" },
  { value: "validee",            label: "Validée" },
  { value: "en_traitement",      label: "En traitement" },
  { value: "expediee",           label: "Expédiée" },
  { value: "terminee",           label: "Terminée" },
  { value: "annulee",            label: "Annulée" },
];

type Props = { params: Promise<{ id: string }> };

export default function AdminCommandeDetailPage({ params }: Props) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus>("paiement_recu");
  const [adminNote, setAdminNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [supplierMode, setSupplierMode] = useState<"fournisseur" | "secours_interne">("fournisseur");
  const [supplierNote, setSupplierNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [fileRejectionReason, setFileRejectionReason] = useState("");

  useEffect(() => {
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
  }, [isAuthenticated, user, router, params]);

  if (!isAuthenticated || user?.role !== "admin") return null;

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await fetch(`/api/orders/${order.id}/admin-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNote,
          trackingNumber,
          supplierMode,
          supplierNote,
        }),
      });
      setOrder({ ...order, status: newStatus, adminNote, trackingNumber, supplierMode, supplierNote });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;
    setInvoiceLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/generate-invoice`, { method: "POST" });
      const data = await res.json();
      setOrder({ ...order, invoiceUrl: data.invoiceUrl });
    } catch (err) {
      console.error(err);
    } finally {
      setInvoiceLoading(false);
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

  if (loading) {
    return (
      <div className="pt-24 pb-20">
        <div className="container max-w-4xl">
          <div className="skeleton h-8 w-48 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 skeleton h-64 rounded-xl" />
            <div className="skeleton h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) return (
    <div className="pt-24 text-center">
      <p className="text-[#555555]">Commande introuvable</p>
      <Link href="/admin/commandes" className="btn-ghost mt-4">Retour</Link>
    </div>
  );

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555555] mb-6">
          <Link href="/admin" className="hover:text-[#f5f5f5]">Admin</Link>
          <span>/</span>
          <Link href="/admin/commandes" className="hover:text-[#f5f5f5]">Commandes</Link>
          <span>/</span>
          <span className="text-[#f5f5f5]">#{order.orderNumber}</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-[#f5f5f5]">Commande #{order.orderNumber}</h1>
          <div className="flex gap-2">
            {!order.invoiceUrl && order.status === "validee" && (
              <button onClick={handleGenerateInvoice} disabled={invoiceLoading} className="btn-outline text-xs gap-2">
                <FileText size={12} />
                {invoiceLoading ? "Génération..." : "Générer facture"}
              </button>
            )}
            {order.invoiceUrl && (
              <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs gap-2">
                <ExternalLink size={12} />
                Voir facture
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Order info */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Client info */}
            <div className="p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <h2 className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-4">Client</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[#555555] mb-0.5">Nom</p>
                  <p className="text-sm font-semibold text-[#f5f5f5]">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555555] mb-0.5">Email</p>
                  <p className="text-sm text-[#f5f5f5]">{order.user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555555] mb-0.5">Téléphone</p>
                  <p className="text-sm text-[#f5f5f5]">{order.user.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555555] mb-0.5">Type</p>
                  <p className="text-sm text-[#f5f5f5] capitalize">{order.user.type}</p>
                </div>
                {order.user.company && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-[#555555] mb-0.5">Société</p>
                    <p className="text-sm text-[#f5f5f5]">{order.user.company}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order items */}
            <div className="p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <h2 className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-4">Articles</h2>
              <div className="flex flex-col gap-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-[#1e1e1e] last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#f5f5f5]">{item.product.shortName}</p>
                      <p className="text-[10px] font-mono text-[#555555]">{item.product.reference}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="badge badge-neutral text-[9px]">Taille {item.size}</span>
                        <span className="badge badge-neutral text-[9px]">{item.color.label}</span>
                        <span className="badge badge-neutral text-[9px]">{item.technique.toUpperCase()}</span>
                        <span className="badge badge-neutral text-[9px]">{item.placement}</span>
                      </div>

                      {/* Logo file */}
                      {item.logoFile && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`badge ${item.logoFile.status === "valide" ? "badge-success" : item.logoFile.status === "invalide" ? "badge-error" : "badge-warning"} text-[9px]`}>
                            {item.logoFile.status === "valide" ? "Fichier ✓" : item.logoFile.status === "invalide" ? "Fichier ✗" : "À vérifier"}
                          </span>
                          <a
                            href={item.logoFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#c9a96e] hover:underline flex items-center gap-1"
                          >
                            {item.logoFile.name}
                            <ExternalLink size={9} />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[#555555]">×{item.quantity}</p>
                      <p className="text-sm font-bold text-[#c9a96e]">
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(item.totalTTC)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[#1e1e1e] flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-[#555555]">
                  <span>Sous-total HT</span>
                  <span>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.subtotalHT)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#555555]">
                  <span>TVA (20%)</span>
                  <span>{new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.tva)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#555555]">
                  <span>Livraison</span>
                  <span>{order.freeShipping ? "Offerte" : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#f5f5f5] pt-2">
                  <span>Total TTC</span>
                  <span className="text-[#c9a96e]">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(order.totalTTC)}
                  </span>
                </div>
              </div>
            </div>

            {/* File rejection form */}
            {(order.status === "paiement_recu" || order.status === "fichier_a_verifier") && (
              <div className="p-5 bg-[#facc1508] border border-[#facc1522] rounded-xl">
                <h2 className="text-xs font-bold text-[#facc15] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertTriangle size={12} />
                  Rejeter le fichier
                </h2>
                <div className="mb-3">
                  <label className="label">Raison du rejet (visible par le client)</label>
                  <textarea
                    className="input h-20 resize-none"
                    placeholder="Ex: Le fichier PNG est de résolution insuffisante. Merci de fournir un fichier vectoriel (PDF ou AI)."
                    value={fileRejectionReason}
                    onChange={(e) => setFileRejectionReason(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleRejectFile}
                  disabled={!fileRejectionReason}
                  className="btn-outline text-xs border-[#f8717133] text-[#f87171] hover:border-[#f87171]"
                >
                  Demander nouveau fichier
                </button>
              </div>
            )}
          </div>

          {/* Right — Admin actions */}
          <div className="flex flex-col gap-4">
            {/* Status update */}
            <div className="p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <h2 className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-4">
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

              {/* Tracking number */}
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

              {/* Admin note */}
              <div className="mb-3">
                <label className="label">Note interne admin</label>
                <textarea
                  className="input h-20 resize-none"
                  placeholder="Note visible uniquement par l'admin"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>

              {/* Supplier mode */}
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
            <div className="p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <h2 className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-4">
                Actions rapides
              </h2>
              <div className="flex flex-col gap-2">
                {!order.invoiceUrl && (
                  <button onClick={handleGenerateInvoice} disabled={invoiceLoading} className="btn-outline text-xs gap-2 w-full">
                    <FileText size={12} />
                    Générer la facture Pennylane
                  </button>
                )}
                <button
                  onClick={() => {
                    setNewStatus("expediee");
                  }}
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
            <div className="p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl">
              <h2 className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-3">
                Paiement Stripe
              </h2>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#555555]">Statut</span>
                  <span className={`font-semibold ${order.stripePaymentStatus === "succeeded" ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                    {order.stripePaymentStatus === "succeeded" ? "Payé ✓" : order.stripePaymentStatus ?? "—"}
                  </span>
                </div>
                {order.stripePaymentIntentId && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#555555]">ID Stripe</span>
                    <span className="font-mono text-[10px] text-[#8a8a8a] truncate max-w-[120px]">
                      {order.stripePaymentIntentId}
                    </span>
                  </div>
                )}
                {order.paidAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#555555]">Payé le</span>
                    <span className="text-[#8a8a8a]">
                      {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(order.paidAt))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
