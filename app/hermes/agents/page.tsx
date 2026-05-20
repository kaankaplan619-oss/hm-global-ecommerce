import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import PageHeader from "@/components/hermes/PageHeader";
import Card from "@/components/hermes/Card";
import { MOCK_AGENTS } from "@/lib/hermes/mock-data";

export const metadata = {
  title: "Agents",
};

export default function HermesAgentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Équipe IA"
        title="Agents"
        description="Les agents mockés de Hermès OS. Ils servent déjà à préparer missions, rapports, tâches et prompts."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_AGENTS.map((agent) => (
          <Card key={agent.id}>
            <div className="px-5 py-4">
              <div className="mb-3 flex items-start gap-3">
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${agent.accent}18`, color: agent.accent, border: `1px solid ${agent.accent}35` }}
                >
                  <Bot size={16} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-semibold leading-tight text-white">{agent.name}</h2>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/35">{agent.shortName}</p>
                </div>
              </div>

              <p className="line-clamp-2 text-[12.5px] leading-6 text-white/62">{agent.role}</p>

              <div className="mt-4 space-y-1.5">
                {agent.bestFor.slice(0, 3).map((item) => (
                  <p key={item} className="text-[11.5px] text-white/48">• {item}</p>
                ))}
              </div>

              <Link
                href={`/hermes/missions?agent=${agent.id}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11.5px] font-medium transition hover:text-white"
                style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,230,240,0.72)" }}
              >
                Préparer une mission
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
