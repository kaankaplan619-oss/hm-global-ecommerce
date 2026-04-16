"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, X, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { validateLogoFile, formatFileSize, canCancelOrder, getRemainingCancelTime } from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_LABELS: Record<string, { label: string; badge: string; description: string }> = {
  paiement_recu:      { label: "Paiement reçu", badge: "badge-info", description: "Votre paiement a été validé. Votre commande est en cours de vérification." },
  fichier_a_verifier: { label: "Fichier en cours de vérification", badge: "badge-warning", description: "Notre équipe examine votre fichier logo." },
  en_attente_client:  { label: "Action requise", badge: "badge-warning", description: "Votre fichier logo nécessite une correction. Veuillez en déposer un nouveau." },
  validee:            { label: "Commande validée", badge: "badge-success", description: "Votre commande est validée et en cours de production." },
  en_traitement:      { label: "En production", badge: "badge-info", description: "Votre commande est en cours de fabrication." },
  expediee:           { label: "Expédiée", badge: "badge-success", description: "Votre commande est en route vers vous !" },
  terminee:           { label: "Terminée", badge: "badge-neutral", description: "Commande livrée et clôturée." },
  annulee:            { label: "Annulée", badge: "badge-error", description: "Cette commande a été annulée." },
};

type Props = { params: Promise<{ id: string }> };

export default function CommandeDetailPage({ params }: Props) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
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
  }, [isAuthenticated, router, params]);

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
      // Refresh order after upload
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

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="pt-24 pb-20">
        <div className="container max-w-3xl">
          <div className="skeleton h-8 w-48 rounded mb-6" />
          <div className="skeleton h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 pb-20 text-center">
        <p className="text-[#555555]">Commande introuvable</p>
        <Link href="/mon-compte/commandes" className="btn-ghost mt-4">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[order.status];
  const canCancel = canCancelOrder(order.createdAt) && order.status === "paiement_recu";
  const needsNewFile = order.status === "en_attente_client";

  const formatMinutesSeconds = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555555] mb-6">
          <Link href="/mon-compte" className="hover:text-[#f5f5f5]">Mon compte</Link>
          <span>/</span>
          <Link href="/mon-compte/commandes" className="hover:text-[#f5f5f5]">Commandes</Link>
          <span>/</span>
          <span className="text-[#f5f5f5]">#{order.orderNumber}</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-[#f5f5f5]">
            Commande #{order.orderNumber}
          </h1>
          <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>
        </div>

        {/* Status description */}
        <div className="p-4 bg-[#111111] border border-[#1e1e1e] rounded-xl mb-6">
          <p className="text-sm text-[#8a8a8a]">{statusInfo.description}</p>
          {order.trackingNumber && (
            <p className="text-xs text-[#c9a96e] mt-2">
              Numéro de suivi : <strong>{order.trackingNumber}</strong>
            </p>
          )}
        </div>

        {/* Cancel window */}
        {canCancel && (
          <div className="p-4 bg-[#facc1511] border border-[#facc1533] rounded-xl mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-[#facc15]" />
              <p className="text-sm font-semibold text-[#facc15]">
                Annulation possible encore {formatMinutesSeconds(remainingTime)}
              </p>
            </div>
            <p className="text-xs text-[#8a8a8a] mb-3">
              Après ce délai, l&rsquo;annulation devra être demandée à notre équipe.
            </p>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="btn-outline text-xs border-[#f8717133] text-[#f87171] hover:border-[#f87171]"
            >
              {cancelLoading ? "Annulation..." : "Annuler cette commande"}
            </button>
          </div>
        )}

        {/* New file required */}
        {needsNewFile && (
          <div className="p-5 bg-[#facc1511] border border-[#facc1533] rounded-xl mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-[#facc15]" />
              <p className="text-sm font-semibold text-[#facc15]">Nouveau fichier logo requis</p>
            </div>
            {order.adminNote && (
              <p className="text-xs text-[#8a8a8a] mb-4 p-3 bg-[#1a1a1a] rounded-lg border-l-2 border-[#c9a96e]">
                {order.adminNote}
              </p>
            )}

            {!newLogoFile ? (
              <div
                className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-5 text-center cursor-pointer hover:border-[#c9a96e33] transition-colors"
                onClick={() => document.getElementById("new-logo-input")?.click()}
              >
                <Upload size={18} className="text-[#555555] mx-auto mb-2" />
                <p className="text-xs text-[#8a8a8a]">Déposer votre nouveau fichier ici</p>
                <p className="text-[10px] text-[#555555] mt-1">PDF, PNG, SVG, AI — max 50 Mo</p>
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
              <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] border border-[#4ade8033] rounded-lg mb-3">
                <CheckCircle size={14} className="text-[#4ade80]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#f5f5f5] truncate">{newLogoFile.name}</p>
                  <p className="text-[10px] text-[#555555]">{formatFileSize(newLogoFile.size)}</p>
                </div>
                <button onClick={() => setNewLogoFile(null)} className="text-[#555555] hover:text-[#f87171]">
                  <X size={12} />
                </button>
              </div>
            )}

            {fileError && <p className="text-xs text-[#f87171] mt-2">{fileError}</p>}

            {newLogoFile && (
              <button onClick={handleFileUpload} disabled={uploading} className="btn-primary text-xs mt-3">
                {uploading ? "Envoi en cours..." : "Envoyer le nouveau fichier"}
              </button>
            )}
          </div>
        )}

        {/* Order items */}
        <div className="p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl mb-6">
          <h2 className="text-sm font-bold text-[#f5f5f5] mb-4">Articles commandés</h2>
          <div className="flex flex-col gap-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-[#1e1e1e] last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#f5f5f5]">{item.product.shortName}</p>
                  <p className="text-[10px] font-mono text-[#555555]">{item.product.reference}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[10px] text-[#555555]">Taille {item.size}</span>
                    <span className="text-[10px] text-[#555555]">·</span>
                    <span className="text-[10px] text-[#555555]">{item.color.label}</span>
                    <span className="text-[10px] text-[#555555]">·</span>
                    <span className="text-[10px] text-[#555555]">{item.technique.toUpperCase()}</span>
                    <span className="text-[10px] text-[#555555]">·</span>
                    <span className="text-[10px] text-[#555555]">{item.placement}</span>
                  </div>
                  {item.logoFile && (
                    <p className="text-[10px] text-[#c9a96e] mt-1">📎 {item.logoFile.name}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[#555555]">×{item.quantity}</p>
                  <p className="text-sm font-bold text-[#f5f5f5]">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(item.totalTTC)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-[#1e1e1e] flex flex-col gap-2">
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

        {/* Invoice */}
        {order.invoiceUrl && (
          <div className="p-4 bg-[#111111] border border-[#1e1e1e] rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#f5f5f5]">Facture disponible</p>
              <a
                href={order.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs"
              >
                Télécharger
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
