"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/data/pricing";
import type { Order } from "@/types";

// ── Gradient signature HM Global ──────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  paiement_recu:      { label: "Paiement reçu",           color: "#5BC4D8", bg: "#edf9fc", border: "#5BC4D844" },
  fichier_a_verifier: { label: "Fichier à vérifier",       color: "#f59e0b", bg: "#fffbeb", border: "#f59e0b44" },
  en_attente_client:  { label: "Action requise",            color: "#ef4444", bg: "#fef2f2", border: "#ef444444" },
  validee:            { label: "Validée",                   color: "#22c55e", bg: "#f0fdf4", border: "#22c55e44" },
  en_traitement:      { label: "En production",             color: "#7B4FA6", bg: "#f3eefb", border: "#7B4FA644" },
  expediee:           { label: "Expédiée",                  color: "#22c55e", bg: "#f0fdf4", border: "#22c55e44" },
  terminee:           { label: "Terminée",                  color: "#6e6280", bg: "#f8f9fb", border: "#e6e8ee"   },
  annulee:            { label: "Annulée",                   color: "#ef4444", bg: "#fef2f2", border: "#ef444444" },
};

export default function CommandesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/connexion"); return; }
    fetch(`/api/orders`)
      .then((r) => r.json())
      .then((data) => { setOrders(data.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated, router, user]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20">
      <div className="container max-w-3xl">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#6e6280]">
          <Link href="/mon-compte" className="hover:text-[#7B4FA6] transition-colors">
            Mon compte
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3f2d58]">Mes commandes</span>
        </nav>

        <h1 className="mb-8 text-2xl font-black text-[#3f2d58]">Mes commandes</h1>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white border border-[#e6e8ee]" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#e6e8ee] bg-white p-16 text-center shadow-[0_4px_12px_rgba(63,45,88,0.04)]">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #edf9fc, #f3eefb)" }}
            >
              <Package size={28} style={{ color: "#7B4FA6" }} />
            </div>
            <p className="mb-2 text-sm font-semibold text-[#3f2d58]">
              Vous n&rsquo;avez pas encore de commande
            </p>
            <p className="mb-6 text-xs text-[#6e6280]">
              Explorez notre catalogue et passez votre première commande.
            </p>
            <Link href="/catalogue" className="btn-primary inline-flex gap-2">
              <ShoppingBag size={14} />
              Voir le catalogue
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.terminee;
              return (
                <Link
                  key={order.id}
                  href={`/mon-compte/commandes/${order.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-[#e6e8ee] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-all duration-200 hover:border-[#c4c0cf] hover:shadow-[0_8px_24px_rgba(63,45,88,0.08)] hover:-translate-y-0.5"
                >
                  {/* Icône */}
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                    style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                  >
                    <Package size={18} style={{ color: cfg.color }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#3f2d58]">
                        #{order.orderNumber}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#6e6280]">
                      {formatDate(order.createdAt)}
                      {" · "}
                      {order.items?.length ?? 0} article{(order.items?.length ?? 0) > 1 ? "s" : ""}
                      {" · "}
                      <span className="font-semibold">{formatPrice(order.totalTTC)} TTC</span>
                    </p>
                    {order.status === "en_attente_client" && (
                      <p className="mt-1 text-[10px] font-semibold text-[#ef4444]">
                        ⚠ Action requise — déposez un nouveau fichier logo
                      </p>
                    )}
                  </div>

                  <ChevronRight
                    size={16}
                    className="shrink-0 text-[#c4c0cf] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#7B4FA6]"
                  />
                </Link>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center text-[11px] text-[#a09bb0]">
          Une question sur une commande ?{" "}
          <Link href="/contact" className="font-semibold text-[#7B4FA6] hover:underline">
            Contactez-nous
          </Link>
        </p>
      </div>
    </div>
  );
}
