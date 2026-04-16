"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/data/pricing";
import type { Order } from "@/types";

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  paiement_recu:      { label: "Paiement reçu", badge: "badge-info" },
  fichier_a_verifier: { label: "Fichier à vérifier", badge: "badge-warning" },
  en_attente_client:  { label: "Action requise", badge: "badge-warning" },
  validee:            { label: "Validée", badge: "badge-success" },
  en_traitement:      { label: "En production", badge: "badge-info" },
  expediee:           { label: "Expédiée", badge: "badge-success" },
  terminee:           { label: "Terminée", badge: "badge-neutral" },
  annulee:            { label: "Annulée", badge: "badge-error" },
};

export default function CommandesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/connexion"); return; }
    // Charger les commandes depuis l'API
    fetch(`/api/orders?userId=${user?.id}`)
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated) return null;

  return (
    <div className="pt-24 pb-20">
      <div className="container max-w-3xl">
        {/* Back */}
        <nav className="flex items-center gap-2 text-xs text-[#555555] mb-6">
          <Link href="/mon-compte" className="hover:text-[#f5f5f5]">Mon compte</Link>
          <span>/</span>
          <span className="text-[#f5f5f5]">Mes commandes</span>
        </nav>

        <h1 className="text-2xl font-black text-[#f5f5f5] mb-8">Mes commandes</h1>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="text-[#2a2a2a] mx-auto mb-4" />
            <p className="text-sm text-[#555555] mb-6">Vous n&rsquo;avez pas encore de commande.</p>
            <Link href="/catalogue" className="btn-primary">
              Passer ma première commande
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status];
              return (
                <Link
                  key={order.id}
                  href={`/mon-compte/commandes/${order.id}`}
                  className="p-5 bg-[#111111] border border-[#1e1e1e] rounded-xl hover:border-[#2a2a2a] transition-colors flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    <Package size={18} className="text-[#555555]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[#f5f5f5]">#{order.orderNumber}</span>
                      <span className={`badge ${statusInfo.badge}`}>{statusInfo.label}</span>
                    </div>
                    <p className="text-xs text-[#555555]">
                      {formatDate(order.createdAt)} · {order.items.length} article{order.items.length > 1 ? "s" : ""} · {formatPrice(order.totalTTC)} TTC
                    </p>
                    {order.status === "en_attente_client" && (
                      <p className="text-xs text-[#facc15] mt-1 flex items-center gap-1">
                        ⚠ Action requise : vérifiez votre fichier
                      </p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-[#555555] shrink-0 group-hover:text-[#f5f5f5]" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

