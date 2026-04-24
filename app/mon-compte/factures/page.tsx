"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ChevronLeft, Download, ExternalLink, Loader2, Receipt } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/data/pricing";

// ── Gradient signature HM Global ──────────────────────────────────────────────
const HM_GRADIENT = "linear-gradient(135deg, #5BC4D8, #7B4FA6, #C4387A)";

interface InvoiceOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalTTC: number;
  invoiceUrl: string;
  invoiceNumber?: string;
  status: string;
}

export default function FacturesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<InvoiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/connexion"); return; }

    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        // Keep only orders that have an invoice URL
        const withInvoices = (data.orders ?? []).filter(
          (o: Record<string, unknown>) => o.invoice_url || o.invoiceUrl
        ).map((o: Record<string, unknown>) => ({
          id:            o.id as string,
          orderNumber:   (o.order_number ?? o.orderNumber) as string,
          createdAt:     (o.created_at   ?? o.createdAt)   as string,
          totalTTC:      (o.total_ttc    ?? o.totalTTC)    as number,
          invoiceUrl:    (o.invoice_url  ?? o.invoiceUrl)  as string,
          invoiceNumber: (o.invoice_number ?? o.invoiceNumber) as string | undefined,
          status:        o.status as string,
        }));
        setOrders(withInvoices);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] pt-24 pb-20">
      <div className="container max-w-3xl">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#6e6280]">
          <Link href="/mon-compte" className="flex items-center gap-1 hover:text-[#7B4FA6] transition-colors">
            <ChevronLeft size={12} />
            Mon compte
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#3f2d58]">Mes factures</span>
        </nav>

        {/* Header card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-[0_8px_24px_rgba(63,45,88,0.06)]">
          <div className="h-2 w-full" style={{ background: HM_GRADIENT }} />
          <div className="flex items-center gap-4 p-6">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #edf9fc, #f3eefb)" }}
            >
              <FileText size={20} style={{ color: "#5BC4D8" }} />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#3f2d58]">Mes factures</h1>
              <p className="text-sm text-[#6e6280]">
                Téléchargez vos factures et justificatifs de commande.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#6e6280]">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-[#e6e8ee] bg-white p-16 text-center shadow-[0_4px_12px_rgba(63,45,88,0.04)]">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #edf9fc, #f3eefb)" }}
            >
              <Receipt size={28} style={{ color: "#5BC4D8" }} />
            </div>
            <p className="mb-2 text-sm font-semibold text-[#3f2d58]">
              Aucune facture disponible
            </p>
            <p className="mb-6 text-xs leading-6 text-[#6e6280]">
              Les factures sont générées automatiquement une fois votre commande validée.
              <br />
              Elles apparaîtront ici dès qu&rsquo;elles seront disponibles.
            </p>
            <Link
              href="/mon-compte/commandes"
              className="inline-flex items-center gap-2 rounded-xl border border-[#e6e8ee] bg-[#f8f9fb] px-4 py-2.5 text-xs font-semibold text-[#3f2d58] transition-colors hover:bg-white"
            >
              <FileText size={12} />
              Voir mes commandes
            </Link>
          </div>
        ) : (
          /* Invoice list */
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 rounded-2xl border border-[#e6e8ee] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]"
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf9fc] border border-[#5BC4D844]">
                  <FileText size={18} style={{ color: "#5BC4D8" }} />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-bold text-[#3f2d58]">
                      {order.invoiceNumber ? `Facture ${order.invoiceNumber}` : `Commande #${order.orderNumber}`}
                    </span>
                  </div>
                  <p className="text-xs text-[#6e6280]">
                    {formatDate(order.createdAt)}
                    {" · "}
                    <span className="font-semibold">{formatPrice(order.totalTTC)} TTC</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={order.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-[#e6e8ee] px-3 py-2 text-[11px] font-semibold text-[#6e6280] transition-colors hover:border-[#5BC4D8] hover:text-[#5BC4D8]"
                    title="Voir la facture"
                  >
                    <ExternalLink size={12} />
                    <span className="hidden sm:inline">Voir</span>
                  </a>
                  <a
                    href={order.invoiceUrl}
                    download
                    className="flex items-center gap-1.5 rounded-xl border border-[#7B4FA6] bg-[#7B4FA6] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#6a3f95]"
                    title="Télécharger la facture"
                  >
                    <Download size={12} />
                    <span className="hidden sm:inline">Télécharger</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info banner */}
        <div className="mt-8 rounded-2xl border border-[#e6e8ee] bg-white p-5">
          <p className="text-xs leading-6 text-[#6e6280]">
            <span className="font-semibold text-[#3f2d58]">Besoin d&rsquo;une facture spécifique ?</span>
            {" "}
            Contactez notre équipe pour toute demande de document comptable ou justificatif.
            {" "}
            <Link href="/contact" className="font-semibold text-[#7B4FA6] hover:underline">
              Nous contacter →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
