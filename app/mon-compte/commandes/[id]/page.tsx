"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload, X, AlertCircle, Clock, CheckCircle2, Package,
  ChevronLeft, Truck, Repeat,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { getProductById } from "@/data/products";
import { validateLogoFile, formatFileSize, canCancelOrder, getRemainingCancelTime } from "@/lib/utils";
import { getOrderItemImage } from "@/lib/order-image";
import { useT } from "@/components/i18n/I18nProvider";
import type { Order } from "@/types";

// ── Gradient signature HM Global ──────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  paiement_recu:      { color: "#5BC4D8", bg: "#edf9fc", border: "#5BC4D844" },
  fichier_a_verifier: { color: "#f59e0b", bg: "#fffbeb", border: "#f59e0b44" },
  en_attente_client:  { color: "#ef4444", bg: "#fef2f2", border: "#ef444444" },
  validee:            { color: "#22c55e", bg: "#f0fdf4", border: "#22c55e44" },
  en_traitement:      { color: "#7B4FA6", bg: "#f3eefb", border: "#7B4FA644" },
  expediee:           { color: "#22c55e", bg: "#f0fdf4", border: "#22c55e44" },
  terminee:           { color: "#6e6280", bg: "#f8f9fb", border: "#e6e8ee"   },
  annulee:            { color: "#ef4444", bg: "#fef2f2", border: "#ef444444" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

type Props = { params: Promise<{ id: string }> };

type OrderRequestRow = {
  id: string;
  type: "facture" | "remboursement";
  status: string;
  reason: string | null;
  created_at: string;
};

export default function CommandeDetailPage({ params }: Props) {
  const t = useT();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [requests, setRequests] = useState<OrderRequestRow[]>([]);
  const [openForm, setOpenForm] = useState<null | "facture" | "remboursement">(null);
  const [reqReason, setReqReason] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqError, setReqError] = useState("");
  const [reqSent, setReqSent] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push("/connexion"); return; }
    params.then(({ id }) => {
      setOrderId(id);
      fetch(`/api/orders/${id}/request`)
        .then((r) => r.json())
        .then((d) => setRequests(d.requests ?? []))
        .catch(() => {});
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

  const handleCreateRequest = async (type: "facture" | "remboursement") => {
    if (!order) return;
    setReqSubmitting(true);
    setReqError("");
    try {
      const res = await fetch(`/api/orders/${order.id}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, reason: reqReason || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setReqError(d.error || t("accountOrderDetail.help.error"));
        return;
      }
      setReqSent(true);
      setOpenForm(null);
      setReqReason("");
      const list = await fetch(`/api/orders/${order.id}/request`).then((r) => r.json());
      setRequests(list.requests ?? []);
    } catch {
      setReqError(t("accountOrderDetail.help.error"));
    } finally {
      setReqSubmitting(false);
    }
  };

  // Réassort 1 clic — recharge chaque ligne de la commande dans le panier.
  // Produit relu via getProductById → prix recalculés au tarif courant (volume).
  // Logo Supabase, transform, aperçus composés et config print ré-attachés tels quels.
  const handleReorder = () => {
    if (!order) return;
    let added = 0;
    for (const item of order.items) {
      const product = getProductById(item.product?.id) ?? item.product;
      if (!product) continue;
      const logoFile = item.logoFile
        ? {
            name: item.logoFile.name,
            size: item.logoFile.size,
            type: item.logoFile.type,
            url: item.logoFile.url,
            path: item.logoFile.path,
            uploadedAt: item.logoFile.uploadedAt,
          }
        : undefined;
      addItem({
        product,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        technique: item.technique,
        placement: item.placement,
        logoFile,
        logoEffect: item.logoEffect,
        logoPlacementTransform: item.logoPlacementTransform,
        batRef: item.batRef,
        composedPreviewUrl: item.composedPreviewUrl,
        composedPreviewBack: item.composedPreviewBack,
        printConfig: item.printConfig,
      });
      added++;
    }
    if (added > 0) openCart();
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
        <p className="text-[#6e6280]">{t("accountOrderDetail.notFound")}</p>
        <Link href="/mon-compte/commandes" className="btn-ghost mt-4">
          {t("accountOrderDetail.backToOrders")}
        </Link>
      </div>
    );
  }

  const statusKey = STATUS_CONFIG[order.status] ? order.status : "terminee";
  const cfg = STATUS_CONFIG[statusKey];
  const statusLabel = t(`accountOrderDetail.status.${statusKey}.label`);
  const statusDescription = t(`accountOrderDetail.status.${statusKey}.description`);
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

        {/* Bouton retour visible (mobile-first) */}
        <Link
          href="/mon-compte/commandes"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e6e8ee] bg-white px-4 py-2 text-sm font-semibold text-[#3f2d58] shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-colors hover:border-[#c4c0cf] hover:text-[#7B4FA6]"
        >
          <ChevronLeft size={16} />
          {t("accountOrderDetail.backToOrders")}
        </Link>

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#6e6280]">
          <Link href="/mon-compte" className="hover:text-[#7B4FA6] transition-colors">
            {t("accountOrderDetail.breadcrumbAccount")}
          </Link>
          <span>/</span>
          <Link href="/mon-compte/commandes" className="hover:text-[#7B4FA6] transition-colors flex items-center gap-1">
            <ChevronLeft size={12} />
            {t("accountOrderDetail.breadcrumbOrders")}
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3f2d58]">#{order.orderNumber}</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-black text-[#3f2d58]">
            {t("accountOrderDetail.title")} #{order.orderNumber}
          </h1>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Status card */}
        <div
          className="mb-6 rounded-2xl border p-5"
          style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
        >
          <p className="text-sm" style={{ color: cfg.color }}>{statusDescription}</p>
          {order.trackingNumber && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-xs font-semibold" style={{ color: cfg.color }}>
              <Truck size={13} />
              {t("accountOrderDetail.trackingNumber")} <strong>{order.trackingNumber}</strong>
            </div>
          )}
        </div>

        {/* Cancel window */}
        {canCancel && (
          <div className="mb-6 rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-5">
            <div className="mb-2 flex items-center gap-2">
              <Clock size={14} className="text-[#f59e0b]" />
              <p className="text-sm font-semibold text-[#92400e]">
                {t("accountOrderDetail.cancelWindow").replace("{time}", formatMinsecs(remainingTime))}
              </p>
            </div>
            <p className="mb-4 text-xs text-[#78350f]">
              {t("accountOrderDetail.cancelWindowNote")}
            </p>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="rounded-xl border border-[#fecaca] bg-white px-4 py-2 text-xs font-semibold text-[#ef4444] transition-colors hover:bg-[#fef2f2] disabled:opacity-50"
            >
              {cancelLoading ? t("accountOrderDetail.cancelling") : t("accountOrderDetail.cancelOrder")}
            </button>
          </div>
        )}

        {/* New logo file required */}
        {needsNewFile && (
          <div className="mb-6 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-[#ef4444]" />
              <p className="text-sm font-semibold text-[#ef4444]">{t("accountOrderDetail.newLogoRequired")}</p>
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
                <p className="text-xs font-semibold text-[#ef4444]">{t("accountOrderDetail.dropNewFile")}</p>
                <p className="mt-1 text-[10px] text-[#6e6280]">{t("accountOrderDetail.fileHint")}</p>
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
                {uploading ? t("accountOrderDetail.uploading") : t("accountOrderDetail.sendNewFile")}
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
            <h2 className="text-sm font-bold text-[#3f2d58]">{t("accountOrderDetail.itemsTitle")}</h2>
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-4">
              {order.items.map((item) => {
                const itemImg =
                  item.printConfig?.frontPreviewUrl
                  ?? getOrderItemImage(item.product?.id, item.color?.id);
                return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-b border-[#f0f2f7] pb-4 last:border-0 last:pb-0"
                >
                  {/* Vignette produit */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e6e8ee] bg-white">
                    {itemImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={itemImg} alt={item.product?.shortName ?? t("accountOrderDetail.productAlt")} className="h-full w-full object-contain p-1" />
                    ) : (
                      <Package size={20} className="text-[#c4c0cf]" />
                    )}
                  </div>
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
                        `${t("accountOrderDetail.sizeLabel")} ${item.size}`,
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
                );
              })}
            </div>

            {/* Totaux */}
            <div className="mt-5 border-t border-[#e6e8ee] pt-4 space-y-2">
              <div className="flex justify-between text-xs text-[#6e6280]">
                <span>{t("accountOrderDetail.subtotalHT")}</span>
                <span>{formatCurrency(order.subtotalHT)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6e6280]">
                <span>{t("accountOrderDetail.vat")}</span>
                <span>{formatCurrency(order.tva)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6e6280]">
                <span>{t("accountOrderDetail.shipping")}</span>
                <span>{order.freeShipping ? t("accountOrderDetail.shippingFree") : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-[#e6e8ee] pt-2 text-sm font-black text-[#3f2d58]">
                <span>{t("accountOrderDetail.totalTTC")}</span>
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

        {/* Réassort 1 clic — friction minimale pour les commandes récurrentes B2B */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#7B4FA6]/25 bg-[#faf7fe] p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#3f2d58]">{t("accountOrderDetail.reorderTitle")}</p>
            <p className="mt-0.5 text-xs text-[#6e6280]">{t("accountOrderDetail.reorderHint")}</p>
          </div>
          <button
            onClick={handleReorder}
            className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-xs"
          >
            <Repeat size={15} />
            {t("accountOrderDetail.reorder")}
          </button>
        </div>

        {/* Facture */}
        {order.invoiceUrl && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#e6e8ee] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
            <div>
              <p className="text-sm font-bold text-[#3f2d58]">{t("accountOrderDetail.invoiceAvailable")}</p>
              {order.invoiceNumber && (
                <p className="text-xs text-[#6e6280]">{t("accountOrderDetail.invoiceNumber")} {order.invoiceNumber}</p>
              )}
            </div>
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs"
            >
              {t("accountOrderDetail.download")}
            </a>
          </div>
        )}

        {/* Dossiers : demander sa facture / un remboursement */}
        <div className="mb-6 rounded-2xl border border-[#e6e8ee] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]">
          <h2 className="text-sm font-bold text-[#3f2d58]">{t("accountOrderDetail.help.title")}</h2>

          {requests.length > 0 && (
            <ul className="mb-1 mt-3 space-y-2">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-[#f8f9fb] px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-[#3f2d58]">
                    {r.type === "facture"
                      ? t("accountOrderDetail.help.typeFacture")
                      : t("accountOrderDetail.help.typeRemboursement")}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-[#6e6280]">
                    {t(`accountOrderDetail.help.status.${r.status}`)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {reqSent && (
            <p className="mt-3 text-xs font-semibold text-[#22c55e]">
              {t("accountOrderDetail.help.sent")}
            </p>
          )}

          {openForm === null ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {!order.invoiceUrl && (
                <button
                  onClick={() => handleCreateRequest("facture")}
                  disabled={reqSubmitting}
                  className="rounded-xl border border-[#e6e8ee] bg-white px-4 py-2 text-xs font-semibold text-[#3f2d58] transition-colors hover:border-[#7B4FA6] hover:text-[#7B4FA6] disabled:opacity-50"
                >
                  {t("accountOrderDetail.help.requestInvoice")}
                </button>
              )}
              <button
                onClick={() => { setOpenForm("remboursement"); setReqSent(false); setReqError(""); }}
                disabled={reqSubmitting}
                className="rounded-xl border border-[#fecaca] bg-white px-4 py-2 text-xs font-semibold text-[#ef4444] transition-colors hover:bg-[#fef2f2] disabled:opacity-50"
              >
                {t("accountOrderDetail.help.requestRefund")}
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <textarea
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                placeholder={t("accountOrderDetail.help.reasonPlaceholder")}
                rows={3}
                className="w-full rounded-xl border border-[#e6e8ee] px-3 py-2 text-xs text-[#3f2d58] outline-none focus:border-[#7B4FA6]"
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleCreateRequest(openForm)}
                  disabled={reqSubmitting}
                  className="btn-primary text-xs"
                >
                  {reqSubmitting
                    ? t("accountOrderDetail.help.sending")
                    : t("accountOrderDetail.help.send")}
                </button>
                <button
                  onClick={() => { setOpenForm(null); setReqReason(""); setReqError(""); }}
                  className="rounded-xl border border-[#e6e8ee] bg-white px-4 py-2 text-xs font-semibold text-[#6e6280]"
                >
                  {t("accountOrderDetail.help.cancel")}
                </button>
              </div>
            </div>
          )}

          {reqError && <p className="mt-2 text-xs text-[#ef4444]">{reqError}</p>}
        </div>

        <p className="mt-8 text-center text-[11px] text-[#a09bb0]">
          {t("accountOrderDetail.problemPrefix")}{" "}
          <Link href="/contact" className="font-semibold text-[#7B4FA6] hover:underline">
            {t("accountOrderDetail.contactUs")}
          </Link>
        </p>
      </div>
    </div>
  );
}
