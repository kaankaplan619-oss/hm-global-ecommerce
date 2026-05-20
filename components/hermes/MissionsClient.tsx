"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, Inbox, PauseCircle, PlayCircle, Send, Wand2 } from "lucide-react";
import Card from "@/components/hermes/Card";
import CopyButton from "@/components/hermes/CopyButton";
import StatusBadge from "@/components/hermes/StatusBadge";
import type { AgentId, HermesAgent, HermesProject, MissionType, Priority } from "@/lib/hermes/types";
import { AGENT_LABELS, PROJECT_CATEGORY_LABELS } from "@/lib/hermes/types";

const EXAMPLES = [
  "Corriger une page du site avec Claude Code",
  "Tester une page avec Claude Navigation",
  "Préparer un email client",
  "Transformer une demande client en devis",
  "Résumer un rapport IA",
  "Faire le point sur les tâches de l’agence",
  "Créer une mission personnelle",
];

const TYPE_LABELS: Record<MissionType, string> = {
  code: "Code",
  navigation: "Navigation",
  strategy: "Stratégie",
  email: "Email",
  quote: "Devis",
  design: "Design / DA",
  admin: "Admin",
  personal: "Personnel",
};

interface PreparedMission {
  title: string;
  summary: string;
  agentId: AgentId;
  projectId: string;
  type: MissionType;
  priority: Priority;
  reason: string;
  checklist: string[];
  prompt: string;
}

export default function MissionsClient({
  agents,
  projects,
}: {
  agents: HermesAgent[];
  projects: HermesProject[];
}) {
  const [request, setRequest] = useState("");
  const [agentId, setAgentId] = useState<AgentId>("chatgpt-strategist");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [type, setType] = useState<MissionType>("strategy");
  const [priority, setPriority] = useState<Priority>("P2");
  const [prepared, setPrepared] = useState<PreparedMission | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [localState, setLocalState] = useState<"draft" | "launched" | "waiting">("draft");

  const agentById = useMemo(() => {
    return Object.fromEntries(agents.map((agent) => [agent.id, agent])) as Record<AgentId, HermesAgent>;
  }, [agents]);

  const projectById = useMemo(() => {
    return Object.fromEntries(projects.map((project) => [project.id, project])) as Record<string, HermesProject>;
  }, [projects]);

  const prepareMission = (value = request) => {
    const text = value.trim();
    if (!text) return;
    const recommendation = recommend(text);
    const selectedProject = inferProject(text, projects);
    const mission = buildMission({
      text,
      agentId: recommendation.agentId,
      projectId: selectedProject,
      type: recommendation.type,
      priority: recommendation.priority,
      reason: recommendation.reason,
      agentById,
      projectById,
    });

    setAgentId(mission.agentId);
    setProjectId(mission.projectId);
    setType(mission.type);
    setPriority(mission.priority);
    setPrepared(mission);
    setShowPrompt(false);
    setLocalState("draft");
  };

  const handleExample = (example: string) => {
    setRequest(example);
    prepareMission(example);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <Card variant="accent">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-5 flex items-start gap-3">
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(84,182,210,0.12)", color: "#9ed7e8", border: "1px solid rgba(84,182,210,0.28)" }}
            >
              <Wand2 size={18} />
            </span>
            <div>
              <h2 className="text-[17px] font-semibold text-white">Mode ultra simple</h2>
              <p className="mt-1 text-[13px] leading-6 text-white/60">
                Décris ce que tu veux obtenir. Hermès prépare le brief pour le bon agent.
              </p>
            </div>
          </div>

          <textarea
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="Exemple : teste la page /impression, vérifie les boutons et prépare un rapport clair avec les bugs à corriger."
            className="min-h-40 w-full resize-y rounded-lg px-4 py-3 text-[14px] leading-6 text-white outline-none"
            style={{
              background: "rgba(0,0,0,0.24)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => prepareMission()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition disabled:opacity-45 sm:w-auto"
              disabled={!request.trim()}
              style={{
                background: "linear-gradient(135deg, #54B6D2 0%, #C13C8A 100%)",
                boxShadow: "0 12px 28px rgba(84,182,210,0.16)",
              }}
            >
              <Send size={15} />
              Préparer mission
            </button>
            <p className="text-[11.5px] text-white/42">Pré-remplissage local, sans envoi externe.</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniSelect label="Agent" value={agentId} onChange={(v) => setAgentId(v as AgentId)}>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </MiniSelect>
            <MiniSelect label="Projet" value={projectId} onChange={setProjectId}>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </MiniSelect>
            <MiniSelect label="Type" value={type} onChange={(v) => setType(v as MissionType)}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </MiniSelect>
            <MiniSelect label="Priorité" value={priority} onChange={(v) => setPriority(v as Priority)}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </MiniSelect>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">Exemples</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExample(example)}
                  className="rounded-md px-3 py-1.5 text-[12px] text-white/70 transition hover:text-white"
                  style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {prepared ? (
        <Card>
          <div className="px-5 py-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">Mission préparée</p>
                <h2 className="mt-1 text-[17px] font-semibold leading-tight text-white">{prepared.title}</h2>
              </div>
              <StatusBadge label={localState === "draft" ? "Prête" : localState === "launched" ? "Lancée" : "Attente agent"} tone={localState === "waiting" ? "warning" : localState === "launched" ? "info" : "success"} />
            </div>

            <MissionBlock title="Résumé">
              <p>{prepared.summary}</p>
            </MissionBlock>
            <MissionBlock title="Agent recommandé">
              <p className="font-medium text-white">{AGENT_LABELS[prepared.agentId]}</p>
            </MissionBlock>
            <MissionBlock title="Pourquoi cet agent">
              <p>{prepared.reason}</p>
            </MissionBlock>
            <MissionBlock title="Prompt prêt à copier">
              <div
                className="rounded-lg p-3 text-[12px] leading-6 text-white/72"
                style={{ background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
              >
                {showPrompt ? prepared.prompt : `${prepared.prompt.slice(0, 360)}...`}
              </div>
              <button
                type="button"
                onClick={() => setShowPrompt((value) => !value)}
                className="mt-2 text-[11.5px] font-medium text-white/55 transition hover:text-white"
              >
                {showPrompt ? "Masquer le prompt complet" : "Afficher le prompt complet"}
              </button>
            </MissionBlock>
            <MissionBlock title="Checklist courte">
              <ul className="space-y-1.5">
                {prepared.checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </MissionBlock>

            <div className="mt-5 flex flex-wrap gap-2">
              <CopyButton text={prepared.prompt} label="Copier prompt" />
              <LocalAction icon={<ClipboardList size={13} />} label="Créer tâche" doneLabel="Tâche créée" />
              <LocalAction icon={<Inbox size={13} />} label="Envoyer dans Inbox" doneLabel="Envoyé Inbox" />
              <LocalAction icon={<PlayCircle size={13} />} label="Marquer lancé" doneLabel="Mission lancée" onClick={() => setLocalState("launched")} />
              <LocalAction icon={<PauseCircle size={13} />} label="Attente retour agent" doneLabel="En attente agent" onClick={() => setLocalState("waiting")} />
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
            <span
              className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ background: "rgba(255,255,255,0.045)", color: "#9ed7e8", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <ArrowRight size={19} />
            </span>
            <h2 className="text-[16px] font-semibold text-white">Aucune mission préparée</h2>
            <p className="mt-2 max-w-sm text-[13px] leading-6 text-white/52">
              Écris une demande ou clique un exemple. Hermès proposera l’agent, le projet et un brief copiable.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function MiniSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg px-3 py-2 text-[12px] text-white outline-none"
        style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {children}
      </select>
    </label>
  );
}

function MissionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t py-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">{title}</h3>
      <div className="text-[12.5px] leading-6 text-white/68">{children}</div>
    </section>
  );
}

function LocalAction({
  icon,
  label,
  doneLabel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  doneLabel: string;
  onClick?: () => void;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        setDone(true);
      }}
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-medium transition sm:flex-none"
      style={{
        background: done ? "rgba(74,222,128,0.10)" : "rgba(255,255,255,0.045)",
        border: done ? "1px solid rgba(74,222,128,0.24)" : "1px solid rgba(255,255,255,0.08)",
        color: done ? "#86efac" : "rgba(232,230,240,0.72)",
      }}
    >
      {icon}
      <span>{done ? doneLabel : label}</span>
    </button>
  );
}

function recommend(text: string): { agentId: AgentId; type: MissionType; priority: Priority; reason: string } {
  const lower = text.toLowerCase();
  if (/(code|bug|corriger|git|vercel|build|typescript|page du site)/.test(lower)) {
    return { agentId: "claude-code", type: "code", priority: "P1", reason: "La demande touche au code, au debug ou à une livraison technique." };
  }
  if (/(tester|navigateur|cliquer|navigation|supabase|railway|vérifier une page)/.test(lower)) {
    return { agentId: "claude-navigation", type: "navigation", priority: "P2", reason: "La mission demande une vérification visuelle ou un parcours navigateur." };
  }
  if (/(email|mail|relance|réponse client)/.test(lower)) {
    return { agentId: "email-agent", type: "email", priority: "P2", reason: "Le résultat attendu est une réponse client claire et professionnelle." };
  }
  if (/(devis|pennylane|demande client|prix|tarif)/.test(lower)) {
    return { agentId: "quote-agent", type: "quote", priority: "P2", reason: "La demande doit être transformée en base de devis exploitable." };
  }
  if (/(design|interface|mockup|visuel|graphique|da)/.test(lower)) {
    return { agentId: "design-agent", type: "design", priority: "P2", reason: "La mission concerne la lisibilité, la direction artistique ou les visuels." };
  }
  if (/(admin|finance|facture|banque|aide|document|cgv)/.test(lower)) {
    return { agentId: "admin-finance-agent", type: "admin", priority: "P2", reason: "La mission relève du suivi administratif ou financier." };
  }
  if (/(personnel|rappel|perso|organisation personnelle)/.test(lower)) {
    return { agentId: "personal-agent", type: "personal", priority: "P3", reason: "La demande est hors agence et doit rester simple." };
  }
  return { agentId: "chatgpt-strategist", type: "strategy", priority: "P2", reason: "La demande doit d’abord être clarifiée et structurée avant exécution." };
}

function inferProject(text: string, projects: HermesProject[]) {
  const lower = text.toLowerCase();
  const find = (needle: string) => projects.find((project) => project.name.toLowerCase().includes(needle))?.id;
  if (lower.includes("impression") || lower.includes("print")) return find("impression") ?? projects[0]?.id ?? "";
  if (lower.includes("textile") || lower.includes("broderie")) return find("textile") ?? projects[0]?.id ?? "";
  if (lower.includes("discord")) return find("discord") ?? projects[0]?.id ?? "";
  if (lower.includes("hermès") || lower.includes("hermes")) return find("hermès") ?? projects[0]?.id ?? "";
  if (lower.includes("erasmus")) return find("erasmus") ?? projects[0]?.id ?? "";
  if (lower.includes("personnel") || lower.includes("perso")) return find("personnel") ?? projects[0]?.id ?? "";
  if (lower.includes("admin") || lower.includes("finance")) return find("admin") ?? projects[0]?.id ?? "";
  return projects[0]?.id ?? "";
}

function buildMission({
  text,
  agentId,
  projectId,
  type,
  priority,
  reason,
  agentById,
  projectById,
}: {
  text: string;
  agentId: AgentId;
  projectId: string;
  type: MissionType;
  priority: Priority;
  reason: string;
  agentById: Record<AgentId, HermesAgent>;
  projectById: Record<string, HermesProject>;
}): PreparedMission {
  const agent = agentById[agentId];
  const project = projectById[projectId];
  const title = text.length > 62 ? `${text.slice(0, 59)}...` : text;
  const prompt = [
    `Mission : ${title}`,
    "",
    `Agent recommandé : ${agent?.name ?? AGENT_LABELS[agentId]}`,
    `Projet : ${project?.name ?? "À classer"}`,
    `Domaine : ${project ? PROJECT_CATEGORY_LABELS[project.category] : "Général"}`,
    `Type : ${TYPE_LABELS[type]}`,
    `Priorité : ${priority}`,
    "",
    "Contexte demandé par Kaan :",
    text,
    "",
    "Objectif : produire un résultat directement exploitable par HM Global Agence.",
    "",
    "Méthode attendue :",
    "1. Reformuler brièvement le besoin.",
    "2. Identifier les informations manquantes si nécessaire.",
    "3. Exécuter ou préparer la réponse sans ajouter de complexité inutile.",
    "4. Terminer par un rapport court : fait, à valider, prochaines actions.",
    "",
    "Contraintes : ne pas toucher aux zones protégées, rester clair, actionnable et lisible pour Kaan.",
  ].join("\n");

  return {
    title,
    summary: `Brief ${TYPE_LABELS[type].toLowerCase()} pour ${project?.name ?? "un projet à classer"}, priorité ${priority}.`,
    agentId,
    projectId,
    type,
    priority,
    reason,
    checklist: ["Contexte clair", "Agent choisi", "Résultat attendu défini", "Rapport court demandé"],
    prompt,
  };
}
