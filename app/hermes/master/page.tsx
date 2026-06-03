import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckSquare, Inbox, MessageCircle, Send } from "lucide-react";
import PageHeader from "@/components/hermes/PageHeader";
import Card from "@/components/hermes/Card";
import {
  MOCK_REPORTS,
  MOCK_SALES_PROSPECTS,
  MOCK_TASKS,
} from "@/lib/hermes/mock-data";

export const metadata = {
  title: "Hermès Master",
};

export default function HermesMasterPage() {
  const urgentTasks = MOCK_TASKS
    .filter((task) => task.status !== "done" && task.priority === "P1")
    .slice(0, 3);
  const reportsToReview = MOCK_REPORTS
    .filter((report) => report.status === "new" || report.status === "to_review")
    .slice(0, 3);
  const hotProspects = MOCK_SALES_PROSPECTS
    .filter((prospect) => prospect.priority === "hot")
    .slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="Assistant principal"
        title="Hermès Master"
        description="Point d'entrée simple pour décider quoi faire maintenant, préparer une mission ou transformer un retour agent en tâche."
        actions={
          <Link
            href="/hermes/missions"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-medium text-white transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #C13C8A 0%, #3B235A 100%)",
              boxShadow: "0 10px 28px rgba(193,60,138,0.18)",
            }}
          >
            <Send size={14} />
            Lancer une mission
          </Link>
        }
      />

      <Card variant="accent" className="mb-6">
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(158,215,232,0.10)", border: "1px solid rgba(158,215,232,0.22)", color: "#9ed7e8" }}
            >
              <MessageCircle size={17} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-white">Ce fil</h2>
              <p className="mt-2 max-w-2xl text-[12.5px] leading-6 text-white/58">
                Mode automatique : Hermès choisit le bon agent selon ta demande. Les informations techniques restent masquées pour garder le fil lisible.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <MasterPanel
          icon={<CheckSquare size={15} />}
          title="Priorités P1"
          href="/hermes/tasks"
          empty="Aucune urgence P1 dans les mocks."
          items={urgentTasks.map((task) => task.title)}
        />
        <MasterPanel
          icon={<Inbox size={15} />}
          title="Rapports agents"
          href="/hermes/inbox"
          empty="Aucun rapport à traiter."
          items={reportsToReview.map((report) => report.title)}
        />
        <MasterPanel
          icon={<CalendarCheck size={15} />}
          title="Prospects chauds"
          href="/hermes/vente"
          empty="Aucun prospect chaud."
          items={hotProspects.map((prospect) => prospect.companyName)}
        />
      </div>

      <Card className="mt-6">
        <div className="px-5 py-5">
          <label htmlFor="master-message" className="text-[12px] font-semibold text-white">
            Demande à Hermès Master
          </label>
          <textarea
            id="master-message"
            rows={6}
            placeholder="Exemple : organise ma journée, prépare une réponse email, transforme ce retour agent en tâche..."
            className="mt-3 w-full resize-y rounded-xl border bg-black/20 px-4 py-3 text-[13px] leading-6 text-white outline-none placeholder:text-white/28"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          />
          <p className="mt-2 text-[11px] text-white/35">
            V1 mock/local : aucune donnée réelle n'est envoyée depuis ce champ.
          </p>
        </div>
      </Card>
    </>
  );
}

function MasterPanel({
  icon,
  title,
  href,
  items,
  empty,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  items: string[];
  empty: string;
}) {
  return (
    <Card>
      <div className="px-5 py-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#f9c9dd]" style={{ background: "rgba(177,63,116,0.10)" }}>
              {icon}
            </span>
            <h2 className="text-[13px] font-semibold">{title}</h2>
          </div>
          <Link href={href} className="text-white/42 transition hover:text-white">
            <ArrowRight size={14} />
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <p key={item} className="line-clamp-1 text-[12.5px] text-white/62">
                {item}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-white/38">{empty}</p>
        )}
      </div>
    </Card>
  );
}
