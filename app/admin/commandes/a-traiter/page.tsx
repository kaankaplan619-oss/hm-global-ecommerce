"use client";

/**
 * Admin — Vue simplifiée "Commandes à traiter"
 *
 * Objectif : permettre à l'agence de voir EN UN COUP D'ŒIL, après paiement
 * client, quelles commandes attendent une action humaine.
 *
 * Différences vs `/admin/commandes` (vue complète) :
 *   - Filtres simples (7 catégories métier au lieu de 16 statuts)
 *   - Masquage par défaut des commandes test
 *   - Affichage explicite logo / BAT / circuit de production / prochaine action
 *   - Bouton "Voir détails" pour basculer vers la fiche complète
 *
 * Cette page NE remplace PAS l'ancienne — elle vit à côté pour un usage
 * production quotidien.
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, RefreshCw, FileText, AlertTriangle, Eye, EyeOff,
  Zap, Factory, FileQuestion, Mail, Phone, ChevronRight,
  ExternalLink, Download,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
  getProductionMethod,
  getBatStatus,
  isTestOrder,
  getNextActionShort,
  getPaymentStatusBadge,
  matchSimpleFilter,
  fmtEUR,
  fmtDateShort,
  PRODUCTION_METHOD_META,
  SIMPLE_FILTER_LABELS,
  type RawAdminOrder,
  type SimpleFilterKey,
} from "@/lib/admin/orderHelpers";

const FILTER_ORDER: SimpleFilterKey[] = [
  "all", "paid", "bat_to_prepare", "bat_sent", "bat_validated", "production", "delivered",
];

function ProductionIcon({ method }: { method: ReturnType<typeof getProductionMethod> }) {
  const meta = PRODUCTION_METHOD_META[method];
  if (meta.icon === "zap")            return <Zap size={11} />;
  if (meta.icon === "file-question")  return <FileQuestion size={11} />;
  return <Factory size={11} />;
}

export default function AdminCommandesATraiterPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  const [orders, setOrders] = useState<RawAdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SimpleFilterKey>("all");
  const [search, setSearch] = useState("");
  const [hideTest, setHideTest] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/admin");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/connexion");
      return;
    }
    loadOrders();
  }, [_hasHydrated, isAuthenticated, user, router, loadOrders]);

  if (!_hasHydrated || !isAuthenticated || user?.role !== "admin") return null;

  // ── Filtrage ───────────────────────────────────────────────────────────────
  const filtered = orders.filter((o) => {
    if (hideTest && isTestOrder(o)) return false;
    if (!matchSimpleFilter(o.status, filter)) return false;

    if (search) {
      const q = search.toLowerCase();
      const profile = o.profiles ?? {};
      const num = (o.order_number ?? "").toLowerCase();
      const email = (profile.email ?? "").toLowerCase();
      const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.toLowerCase();
      const company = (profile.company ?? "").toLowerCase();
      const refs = (o.order_items ?? []).map((i) => (i.product_reference ?? "").toLowerCase()).join(" ");
      if (![num, email, name, company, refs].some((s) => s.includes(q))) return false;
    }

    return true;
  });

  // ── Counts par filtre ──────────────────────────────────────────────────────
  const visibleForCount = orders.filter((o) => !(hideTest && isTestOrder(o)));
  const counts: Record<SimpleFilterKey, number> = {
    all:            visibleForCount.filter((o) => matchSimpleFilter(o.status, "all")).length,
    paid:           visibleForCount.filter((o) => matchSimpleFilter(o.status, "paid")).length,
    bat_to_prepare: visibleForCount.filter((o) => matchSimpleFilter(o.status, "bat_to_prepare")).length,
    bat_sent:       visibleForCount.filter((o) => matchSimpleFilter(o.status, "bat_sent")).length,
    bat_validated:  visibleForCount.filter((o) => matchSimpleFilter(o.status, "bat_validated")).length,
    production:     visibleForCount.filter((o) => matchSimpleFilter(o.status, "production")).length,
    delivered:      visibleForCount.filter((o) => matchSimpleFilter(o.status, "delivered")).length,
  };

  const testCount = orders.filter((o) => isTestOrder(o)).length;

  return (
    <div className="min-h-screen bg-[var(--hm-bg)] pt-24 pb-20">
      <div className="container max-w-6xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] mb-6">
          <Link href="/admin" className="hover:text-[var(--hm-text)]">Admin</Link>
          <span>/</span>
          <Link href="/admin/commandes" className="hover:text-[var(--hm-text)]">Commandes</Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">À traiter</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-[var(--hm-text)]">Commandes à traiter</h1>
            <p className="text-xs text-[var(--hm-text-soft)] mt-1">
              Vue simplifiée orientée production. Pour la vue complète avec tous les filtres,{" "}
              <Link href="/admin/commandes" className="underline hover:text-[var(--hm-text)]">
                consulter la liste détaillée
              </Link>.
            </p>
          </div>
          <button onClick={loadOrders} className="btn-ghost gap-2 text-xs">
            <RefreshCw size={12} />
            Actualiser
          </button>
        </div>

        {/* Toggle masquage commandes test */}
        {testCount > 0 && (
          <div className="mb-4 mt-4 flex items-center gap-3 text-xs">
            <button
              onClick={() => setHideTest(!hideTest)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors text-[11px] font-semibold
                ${hideTest
                  ? "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:text-[var(--hm-text)]"
                  : "border-amber-300 bg-amber-50 text-amber-700"
                }`}
            >
              {hideTest ? <EyeOff size={11} /> : <Eye size={11} />}
              {hideTest ? `Masquer les commandes test (${testCount})` : `Commandes test affichées (${testCount})`}
            </button>
            <span className="text-[10px] text-[var(--hm-text-soft)]">
              Détection : numéro contient TEST, email +test@, total &lt; 1 €
            </span>
          </div>
        )}

        {/* Recherche */}
        <div className="relative mb-4 max-w-md">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hm-text-soft)]" />
          <input
            type="text"
            placeholder="N° commande, email, nom client, référence produit…"
            className="input pl-8 text-xs w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtres simples */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {FILTER_ORDER.map((k) => {
            const isActive = filter === k;
            return (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-colors
                  ${isActive
                    ? "border-[var(--hm-primary)] text-[var(--hm-primary)] bg-[var(--hm-accent-soft-rose)]"
                    : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-text-soft)]/40"
                  }`}
              >
                {SIMPLE_FILTER_LABELS[k]}{" "}
                <span className="text-[10px] opacity-70">({counts[k]})</span>
              </button>
            );
          })}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[var(--hm-line)] rounded-2xl">
            <p className="text-[var(--hm-text-soft)] text-sm">Aucune commande pour ce filtre</p>
            <button
              onClick={() => { setFilter("all"); setSearch(""); }}
              className="btn-ghost mt-4 text-xs"
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Carte commande ──────────────────────────────────────────────────────────

function OrderCard({ order }: { order: RawAdminOrder }) {
  const items = order.order_items ?? [];
  const profile = order.profiles ?? {};
  const method = getProductionMethod(order);
  const methodMeta = PRODUCTION_METHOD_META[method];
  const batMeta = getBatStatus(order, items);
  const payment = getPaymentStatusBadge(order);
  const nextAction = getNextActionShort(order.status);
  const isTest = isTestOrder(order);

  const totalQty = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
  const hasAnyLogo = items.some((i) => i.logo_file_url);
  const missingLogo = !hasAnyLogo && items.length > 0;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white shadow-[0_2px_8px_rgba(63,45,88,0.04)]
      ${isTest ? "border-amber-200 bg-amber-50/30" : "border-[var(--hm-line)]"}`}>

      {/* Ligne 1 : en-tête commande + circuit + statut paiement */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-[var(--hm-text)]">
                #{order.order_number ?? "—"}
              </span>
              {isTest && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  TEST
                </span>
              )}
            </div>
            <p className="text-[10px] text-[var(--hm-text-soft)]">
              {fmtDateShort(order.created_at)}
            </p>
          </div>

          {/* Badge circuit de production */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] ${methodMeta.className}`}>
            <ProductionIcon method={method} />
            {methodMeta.shortLabel}
          </span>

          {/* Badge paiement */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${payment.className}`}>
            {payment.label}
          </span>

          {/* Badge BAT */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${batMeta.className}`}>
            {batMeta.label}
          </span>
        </div>

        <div className="text-right">
          <p className="text-lg font-black text-[var(--hm-primary)]">
            {fmtEUR(order.total_ttc)}
          </p>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Col client */}
        <div className="md:col-span-3 min-w-0">
          <p className="text-[9px] uppercase tracking-wider text-[var(--hm-text-soft)] font-bold mb-1">Client</p>
          <p className="text-xs font-semibold text-[var(--hm-text)] truncate">
            {profile.first_name || profile.last_name
              ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
              : "—"}
          </p>
          {profile.company && (
            <p className="text-[10px] text-[var(--hm-text-soft)] truncate">{profile.company}</p>
          )}
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-1 text-[10px] text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)] truncate mt-1"
            >
              <Mail size={9} className="shrink-0" />
              <span className="truncate">{profile.email}</span>
            </a>
          )}
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center gap-1 text-[10px] text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)]"
            >
              <Phone size={9} className="shrink-0" />
              <span>{profile.phone}</span>
            </a>
          )}
        </div>

        {/* Col produits */}
        <div className="md:col-span-5 min-w-0">
          <p className="text-[9px] uppercase tracking-wider text-[var(--hm-text-soft)] font-bold mb-1">
            Articles ({totalQty} pièce{totalQty > 1 ? "s" : ""})
          </p>
          <ul className="space-y-1">
            {items.slice(0, 4).map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-[11px]">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 mt-1"
                  style={{ backgroundColor: item.color_hex ?? "#ccc" }}
                  title={item.color_label}
                />
                <span className="text-[var(--hm-text)] min-w-0 flex-1">
                  <span className="font-semibold">{item.product_name ?? item.product_reference ?? "—"}</span>
                  <span className="text-[var(--hm-text-soft)]">
                    {" — "}{item.color_label ?? "—"} · T.{item.size ?? "—"} · ×{item.quantity}
                  </span>
                  {item.technique && (
                    <span className="ml-1 px-1 py-0.5 rounded bg-[var(--hm-surface)] text-[9px] uppercase tracking-wider text-[var(--hm-text-soft)]">
                      {item.technique}
                    </span>
                  )}
                </span>
              </li>
            ))}
            {items.length > 4 && (
              <li className="text-[10px] text-[var(--hm-text-soft)] italic">
                + {items.length - 4} autre{items.length - 4 > 1 ? "s" : ""} article{items.length - 4 > 1 ? "s" : ""}…
              </li>
            )}
          </ul>
        </div>

        {/* Col logo + action */}
        <div className="md:col-span-4 min-w-0">
          <p className="text-[9px] uppercase tracking-wider text-[var(--hm-text-soft)] font-bold mb-1">Logo client</p>
          <LogoSection items={items} missing={missingLogo} />

          <p className="text-[9px] uppercase tracking-wider text-[var(--hm-text-soft)] font-bold mt-3 mb-1">
            Prochaine action
          </p>
          <p className="text-[11px] text-[var(--hm-text)] leading-tight">{nextAction}</p>
        </div>
      </div>

      {/* Footer : lien vers détail */}
      <div className="mt-4 pt-3 border-t border-[var(--hm-line)] flex items-center justify-end">
        <Link
          href={`/admin/commandes/${order.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--hm-primary)] hover:underline"
        >
          Voir détails
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

// ─── Section logo ────────────────────────────────────────────────────────────

function LogoSection({
  items,
  missing,
}: {
  items: RawAdminOrder["order_items"];
  missing: boolean;
}) {
  if (missing) {
    return (
      <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
        <AlertTriangle size={12} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-800 leading-tight">
          Logo manquant — demander fichier au client
        </p>
      </div>
    );
  }

  const withLogo = (items ?? []).filter((i) => i.logo_file_url);
  if (withLogo.length === 0) {
    return (
      <p className="text-[10px] text-[var(--hm-text-soft)] italic">Pas de logo (produit standard)</p>
    );
  }

  return (
    <ul className="space-y-1">
      {withLogo.slice(0, 2).map((item) => {
        const sizeKb = item.logo_file_size ? Math.round(item.logo_file_size / 1024) : null;
        const status = item.logo_file_status;
        return (
          <li key={item.id} className="flex items-start gap-2">
            <FileText size={11} className="text-[var(--hm-text-soft)] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <a
                href={item.logo_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-medium text-[var(--hm-primary)] hover:underline truncate flex items-center gap-1"
              >
                <span className="truncate">{item.logo_file_name ?? "logo.png"}</span>
                <ExternalLink size={9} className="shrink-0" />
              </a>
              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                {item.logo_file_type && (
                  <span className="text-[9px] text-[var(--hm-text-soft)]">{item.logo_file_type}</span>
                )}
                {sizeKb !== null && (
                  <span className="text-[9px] text-[var(--hm-text-soft)]">· {sizeKb} Ko</span>
                )}
                {status && (
                  <span className={`px-1 py-0.5 rounded text-[9px] font-semibold ${
                    status === "valide"   ? "bg-green-50 text-green-700" :
                    status === "invalide" ? "bg-red-50 text-red-700" :
                                            "bg-amber-50 text-amber-700"
                  }`}>
                    {status === "valide" ? "validé" : status === "invalide" ? "rejeté" : "à vérifier"}
                  </span>
                )}
              </div>
            </div>
            {item.logo_file_url && (
              <a
                href={item.logo_file_url}
                download={item.logo_file_name ?? true}
                className="text-[var(--hm-text-soft)] hover:text-[var(--hm-primary)]"
                title="Télécharger"
              >
                <Download size={11} />
              </a>
            )}
          </li>
        );
      })}
      {withLogo.length > 2 && (
        <li className="text-[10px] text-[var(--hm-text-soft)] italic">
          + {withLogo.length - 2} autre fichier{withLogo.length - 2 > 1 ? "s" : ""}
        </li>
      )}
    </ul>
  );
}
