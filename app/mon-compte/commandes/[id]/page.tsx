"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload, X, AlertCircle, Clock, CheckCircle2, Package,
  ChevronLeft, Truck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { validateLogoFile, formatFileSize, canCancelOrder, getRemainingCancelTime } from "@/lib/utils";
import type { Order } from "@/types";

// ── Gradient signature HM Global ──────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

const STATUS_CONFIG: Record<string, { label: string; description: string; color: string; bg: string; border: string }> = {
  paiement_recu:      { label: "Paiement reçu",                    description: "Votre paiement a été validé. Votre commande est en cours de vérification.",                                color: "#5BC4D8", bg: "#edf9fc", border: "#5BC4D844" },
  fichier_a_verifier: { label: "Fichier en cours de vérification",  description: "Notre équipe examine votre fichier logo.",                                                                  color: "#f59e0b", bg: "#fffbeb", border: "#f59e0b44" },
  en_attente_client:  { label: "Action requise",                    description: "Votre fichier logo nécessite une correction. Veuillez en déposer un nouveau.",                              color: "#ef4444", bg: "#fef2f2", border: "#ef444444" },
  validee:            { label: "Commande validée",                  description: "Votre commande est validée et en cours de production.",                                                     color: "#22c55e", bg: "#f0fdf4", border: "#22c55e44" },
  en_traitement:      { label: "En production",                     description: "Votre commande est en cours de fabrication.",                                                               color: "#7B4FA6", bg: "#f3eefb", border: "#7B4FA644" },
  expediee:           { label: "Expédiée",                          description: "Votre commande est en route vers vous !",                                                                   color: "#22c55e", bg: "#f0fdf4", border: "#22c55e44" },
  terminee:           { label: "Terminée",                          description: "Commande livrée et clôturée.",                                                                              color: "#6e6280", bg: "#f8f9fb", border: "#e6e8ee"   },
  annulee:            { label: "Annulée",                           description: "Cette commande a été annulée.",                                                                             color: "#ef4444", bg: "#fef2f2", border: "#ef444444" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

type Props = { params: Promise<{ id: string }> };

export default function CommandeDetailPage({ params }: Props) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push("/connexion"); return; }
    params.then(({ id }) => {
      setOrderId(id);
      fetch(`/api/orders/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setOrder(data.order);
          if (data.order?.createdAt) {
            setRemainingTime(getRemainingCancelTime(data.order.createdAt));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [_hasHydrated, isAuthenticated, router, params]);

  // Countdown
  useEffect(() => {
    if (remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime((t) => Math.max(0, t - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  const handleFileUpload = async () => {
    if (!newLogoFile || !order) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", newLogoFile);
    formData.append("orderId", order.id);
    try {
      await fetch("/api/orders/upload-logo", { method: "POST", body: formData });
      setNewLogoFile(null);
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.order) setOrder(data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelLoading(true);
    try {
      await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      router.push("/mon-compte/commandes");
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  if (!_hasHydrated || !isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-6 h-4 w-48 animate-pulse rounded bg-[#e6e8ee]" />
          <div className="h-8 w-64 animate-pulse rounded bg-[#e6e8ee] mb-8" />
          <div className="h-32 animate-pulse rounded-2xl bg-white border border-[#e6e8ee]" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20 text-center">
        <p className="text-[#6e6280]">Commande introuvable</p>
        <Link href="/mon-compte/commandes" className="btn-ghost mt-4">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.terminee;
  const canCancel = canCancelOrder(order.createdAt) && order.status === "paiement_recu";
  const needsNewFile = order.status === "en_attente_client";

  const formatMinsecs = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20">
      <div className="container max-w-3xl">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#6e6280]">
          <Link href="/mon-compte" className="hover:text-[#7B4FA6] transition-colors">
            Mon compte
          </Link>
          <span>/</span>
          <Link href="/mon-compte/commandes" className="hover:text-[#7B4FA6] transition-colors flex items-center gap-1">
            <ChevronLeft size={12} />
            Commandes
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3f2d58]">#{order.orderNumber}</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-black text-[#3f2d58]">
            Commande #{order.orderNumber}
          </h1>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Status card */}
        <div
          className="mb-6 rounded-2xl border p-5"
          style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
        >
          <p className="text-sm" style={{ color: cfg.color }}>{cfg.description}</p>
          {order.trackingNumber && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-xs font-semibold" style={{ color: cfg.color }}>
              <Truck size={13} />
              Numéro de suivi : <strong>{order.trackingNumber}</strong>
            </div>
          )}
        </div>

        {/* Cancel window */}
        {canCancel && (
          <div className="mb-6 rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-5">
            <div className="mb-2 flex items-center gap-2">
              <Clock size={14} className="text-[#f59e0b]" />
              <p className="text-sm font-semibold text-[#92400e]">
                Annulation possible encore {formatMinsecs(remainingTime)}
              </p>
            </div>
            <p className="mb-4 text-xs text-[#78350f]">
              Après ce délai, l&rsquo;annulation devra être demandée à notre équipe.
            </p>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="rounded-xl border border-[#fecaca] bg-white px-4 py-2 text-xs font-semibold text-[#ef4444] transition-colors hover:bg-[#fef2f2] disabled:opacity-50"
            >
              {cancelLoading ? "Annulation..." : "Annuler cette commande"}
            </button>
          </div>
        )}

        {/* New logo file required */}
        {needsNewFile && (
          <div className="mb-6 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#ef4444]" />
              <p className="text-sm font-semibold text-[#ef4444]">Nouveau fichier logo requis</p>
            </div>
            {order.adminNote && (
              <p className="mb-4 rounded-xl border-l-4 border-[#ef4444] bg-white/70 px-4 py-3 text-xs text-[#7f1d1d]">
                {order.adminNote}
              </p>
            )}

            {!newLogoFile ? (
              <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-[#fca5a5] bg-white/60 p-6 text-center transition-colors hover:border-[#ef4444]"
                onClick={() => document.getElementById("new-logo-input")?.click()}
              >
                <Upload size={18} className="mx-auto mb-2 text-[#ef4444]" />
                <p className="text-xs font-semibold text-[#ef4444]">Déposer votre nouveau fichier ici</p>
                <p className="mt-1 text-[10px] text-[#6e6280]">PDF, PNG, SVG, AI — max 50 Mo</p>
                <input
                  id="new-logo-input"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.png,.svg,.ai"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const v = validateLogoFile(file);
                    if (!v.valid) { setFileError(v.error!); return; }
                    setNewLogoFile(file);
                    setFileError("");
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-[#86efac] bg-white/70 p-3">
                <CheckCircle2 size={14} className="text-[#22c55e]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#3f2d58]">{newLogoFile.name}</p>
                  <p className="text-[10px] text-[#6e6280]">{formatFileSize(newLogoFile.size)}</p>
                </div>
                <button onClick={() => setNewLogoFile(null)} className="text-[#6e6280] hover:text-[#ef4444]">
                  <X size={12} />
                </button>
              </div>
            )}

            {fileError && <p className="mt-2 text-xs text-[#ef4444]">{fileError}</p>}

            {newLogoFile && (
              <button
                onClick={handleFileUpload}
                disabled={uploading}
                className="btn-primary mt-4 text-xs"
              >
                {uploading ? "Envoi en cours..." : "Envoyer le nouveau fichier"}
              </button>
            )}
          </div>
        )}

        {/* Articles commandés */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-[#e6e8ee] px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3eefb]">
              <Package size={15} className="text-[#7B4FA6]" />
            </div>
            <h2 className="text-sm font-bold text-[#3f2d58]">Articles commandés</h2>
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-b border-[#f0f2f7] pb-4 last:border-0 last:pb-0"
                >
                  {/* Color swatch */}
                  <div
                    className="mt-1 h-5 w-5 shrink-0 rounded-full border border-[#e6e8ee]"
                    style={{ backgroundColor: item.color?.hex ?? "#ccc" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#3f2d58]">
                      {item.product?.shortName}
                    </p>
                    <p className="font-mono text-[10px] text-[#6e6280]">
                      {item.product?.reference}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {[
                        `Taille ${item.size}`,
                        item.color?.label,
                        item.technique?.toUpperCase(),
                        item.placement,
                      ].filter(Boolean).map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-[#f8f9fb] px-2 py-0.5 text-[10px] text-[#6e6280]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-[#6e6280]">×{item.quantity}</p>
                    <p className="text-sm font-bold text-[#3f2d58]">
                      {formatCurrency(item.totalTTC)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="mt-5 border-t border-[#e6e8ee] pt-4 space-y-2">
              <div className="flex justify-between text-xs text-[#6e6280]">
                <span>Sous-total HT</span>
                <span>{formatCurrency(order.subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6e6280]">
                <span>TVA (20&nbsp;%)</span>
                <span>{formatCurrency(order.tva)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6e6280]">
                <span>Livraison</span>
                <span>{order.freeShipping ? "Offerte 🎁" : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-[#e6e8ee] pt-2 text-sm font-black text-[#3f2d58]">
                <span>Total TTC</span>
                <span
                  style={{
                    background: HM_GRADIENT,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {formatCurrency(order.totalTTC)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Facture */}
        {order.invoiceUrl && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#e6e8ee] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
            <div>
              <p className="text-sm font-bold text-[#3f2d58]">Facture disponible</p>
              {order.invoiceNumber && (
                <p className="text-xs text-[#6e6280]">N° {order.invoiceNumber}</p>
              )}
            </div>
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs"
            >
              Télécharger
            </a>
          </div>
        )}

        <p className="mt-8 text-center text-[11px] text-[#a09bb0]">
          Un problème avec cette commande ?{" "}
          <Link href="/contact" className="font-semibold text-[#7B4FA6] hover:underline">
            Contactez-nous
          </Link>
        </p>
      </div>
    </div>
  );
}
