import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Camera,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Search,
  Target,
} from "lucide-react";
import PageHeader from "@/components/hermes/PageHeader";
import Card from "@/components/hermes/Card";
import StatusBadge from "@/components/hermes/StatusBadge";
import { MOCK_SALES_PROSPECTS } from "@/lib/hermes/mock-data";
import {
  SALES_NEED_LABELS,
  SALES_PROSPECT_STATUS_LABELS,
  type HermesSalesProspect,
  type SalesChannel,
  type SalesProspectPriority,
  type SalesProspectStatus,
} from "@/lib/hermes/types";

export const metadata = {
  title: "Clients & Prospects",
};

const CHANNEL_ICON: Record<SalesChannel, typeof Globe2> = {
  phone:     Phone,
  email:     Mail,
  website:   Globe2,
  instagram: Camera,
  facebook:  Globe2,
  linkedin:  Globe2,
  google:    MapPin,
};

export default function HermesVentePage() {
  const prospects = [...MOCK_SALES_PROSPECTS].sort((a, b) => b.score - a.score);
  const hotCount = prospects.filter((p) => p.priority === "hot").length;
  const toCallCount = prospects.filter((p) => p.status === "to_call").length;
  const emailReadyCount = prospects.filter((p) => p.status === "email_ready").length;
  const avgScore = Math.round(prospects.reduce((acc, p) => acc + p.score, 0) / prospects.length);

  return (
    <>
      <PageHeader
        eyebrow="Agent vente"
        title="Clients & Prospects"
        description="Classe les entreprises à contacter, leurs canaux publics et la meilleure approche commerciale pour vendre textile, print et signalétique HM Global."
        actions={
          <Link
            href="/hermes/missions?agent=sales-agent"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-medium text-white transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #54B6D2 0%, #C13C8A 100%)",
              boxShadow: "0 10px 28px rgba(84,182,210,0.16)",
            }}
          >
            <Search size={14} />
            Mission recherche
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Metric icon={<Target size={15} />} label="Prospects classés" value={prospects.length} subline="V1 mockée" />
        <Metric icon={<Building2 size={15} />} label="Priorité chaude" value={hotCount} subline="À traiter d'abord" />
        <Metric icon={<Phone size={15} />} label="À appeler" value={toCallCount} subline="Contact direct" />
        <Metric icon={<Mail size={15} />} label="Score moyen" value={`${avgScore}%`} subline={`${emailReadyCount} email prêt`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          {prospects.map((prospect) => (
            <ProspectCard key={prospect.id} prospect={prospect} />
          ))}
        </div>

        <aside className="space-y-4">
          <Card>
            <div className="px-5 py-5">
              <h2 className="text-[14px] font-semibold text-white">Méthode agent vente</h2>
              <div className="mt-4 space-y-3">
                <Step n="1" title="Trouver" text="Google Maps par secteur et zone Strasbourg / Eurométropole." />
                <Step n="2" title="Enrichir" text="Site web, téléphone pro, email public, Instagram, Facebook ou LinkedIn." />
                <Step n="3" title="Qualifier" text="Besoin probable, urgence, qualité de marque, taille d'équipe." />
                <Step n="4" title="Contacter" text="Appel court ou email personnalisé avec opposition simple." />
              </div>
            </div>
          </Card>

          <Card variant="accent">
            <div className="px-5 py-5">
              <h2 className="text-[14px] font-semibold text-white">Règle à garder</h2>
              <p className="mt-2 text-[12.5px] leading-6 text-white/58">
                Le système prépare les contacts, mais chaque email doit rester B2B, utile, personnalisé et avec une option claire pour ne plus être recontacté.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}

function ProspectCard({ prospect }: { prospect: HermesSalesProspect }) {
  return (
    <Card>
      <div className="px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold text-white">{prospect.companyName}</h2>
              <StatusBadge label={SALES_PROSPECT_STATUS_LABELS[prospect.status]} tone={toneForSalesStatus(prospect.status)} />
              <PriorityBadge priority={prospect.priority} />
            </div>
            <p className="mt-1 text-[11.5px] uppercase tracking-[0.16em] text-white/38">
              {prospect.sector} · {prospect.city}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div
              className="rounded-lg px-3 py-2 text-center"
              style={{ background: "rgba(134,239,172,0.08)", border: "1px solid rgba(134,239,172,0.18)" }}
            >
              <div className="text-[18px] font-semibold tabular-nums text-white">{prospect.score}</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/38">score</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {prospect.needs.map((need) => (
            <span
              key={need}
              className="rounded-full px-2.5 py-1 text-[10.5px] font-medium text-white/70"
              style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {SALES_NEED_LABELS[need]}
            </span>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <InfoBlock title="Signaux détectés" items={prospect.signals} />
          <div className="rounded-lg px-3 py-3" style={{ background: "rgba(0,0,0,0.16)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Offre recommandée</p>
            <p className="mt-2 text-[12.5px] leading-6 text-white/62">{prospect.recommendedOffer}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {prospect.channels.map((channel) => {
              const Icon = CHANNEL_ICON[channel];
              return (
                <span
                  key={channel}
                  title={channel}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/62"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Icon size={13} strokeWidth={1.8} />
                </span>
              );
            })}
          </div>

          <div className="flex min-w-0 items-center gap-2 text-[12px] text-white/58">
            <ArrowRight size={13} className="shrink-0 text-white/28" />
            <span className="line-clamp-1">{prospect.nextAction}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg px-3 py-3" style={{ background: "rgba(0,0,0,0.16)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">{title}</p>
      <div className="mt-2 space-y-1.5">
        {items.map((item) => (
          <p key={item} className="text-[11.8px] leading-5 text-white/55">• {item}</p>
        ))}
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  subline,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subline: string;
}) {
  return (
    <Card>
      <div className="px-4 py-3.5">
        <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#9ed7e8]" style={{ background: "rgba(84,182,210,0.10)" }}>
          {icon}
        </div>
        <div className="text-[22px] font-semibold tabular-nums text-white">{value}</div>
        <div className="mt-0.5 text-[12px] font-medium text-white/68">{label}</div>
        <div className="mt-1 text-[11px] text-white/38">{subline}</div>
      </div>
    </Card>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-white"
        style={{ background: "rgba(84,182,210,0.12)", border: "1px solid rgba(84,182,210,0.25)" }}
      >
        {n}
      </span>
      <div>
        <p className="text-[12.5px] font-medium text-white">{title}</p>
        <p className="mt-0.5 text-[11.5px] leading-5 text-white/48">{text}</p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: SalesProspectPriority }) {
  const label = priority === "hot" ? "Chaud" : priority === "warm" ? "Tiède" : "Froid";
  const color = priority === "hot" ? "#86efac" : priority === "warm" ? "#fde68a" : "rgba(232,230,240,0.55)";
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium"
      style={{ background: `${color}14`, border: `1px solid ${color}35`, color }}
    >
      {label}
    </span>
  );
}

function toneForSalesStatus(status: SalesProspectStatus) {
  switch (status) {
    case "new":          return "neutral";
    case "qualified":    return "info";
    case "to_call":      return "warning";
    case "email_ready":  return "info";
    case "contacted":    return "muted";
    case "interested":   return "success";
    case "not_relevant": return "danger";
    case "opted_out":    return "danger";
  }
}
