/**
 * lib/hermes/types.ts — Modèles de données Hermès OS V1.
 *
 * Tous les types sont marqués comme exports. Pour V1, ils alimentent les mocks
 * (lib/hermes/mock-data.ts). Quand on branchera Supabase, on créera des tables
 * miroir et des `Row` typés à partir d'ici.
 */

// ── Statuts ─────────────────────────────────────────────────────────────────

export type AgentId =
  | "claude-code"
  | "claude-navigation"
  | "chatgpt-strategist"
  | "hermes-discord"
  | "email-agent"
  | "quote-agent"
  | "design-agent"
  | "admin-finance-agent"
  | "sales-agent"
  | "personal-agent";

export type ReportSource = "claude-code" | "chatgpt" | "discord" | "manuel";

export type ReportStatus = "new" | "read" | "validated" | "rejected" | "to_review";

export type TaskStatus = "todo" | "doing" | "waiting_agent" | "done";

export type ProjectStatus = "active" | "paused" | "archived";

// ── Catégories projet ───────────────────────────────────────────────────────

export type ProjectCategory =
  | "site-web"
  | "impression"
  | "textile"
  | "hermes-os"
  | "discord"
  | "erasmus"
  | "instagram"
  | "vente"
  | "client"
  | "administratif"
  | "finance"
  | "personnel";

// ── Catégories prompt ───────────────────────────────────────────────────────

export type PromptCategory =
  | "claude-code"
  | "claude-navigation"
  | "chatgpt"
  | "discord"
  | "email"
  | "devis"
  | "design"
  | "admin"
  | "personnel"
  | "prospection"
  | "instagram"
  | "erasmus"
  | "textile";

export type MissionType =
  | "code"
  | "navigation"
  | "strategy"
  | "email"
  | "quote"
  | "design"
  | "admin"
  | "personal";

export type Priority = "P1" | "P2" | "P3";

export type ReportType = "audit" | "execution" | "brief" | "decision" | "note";

export type SalesProspectStatus =
  | "new"
  | "qualified"
  | "to_call"
  | "email_ready"
  | "contacted"
  | "interested"
  | "not_relevant"
  | "opted_out";

export type SalesProspectPriority = "hot" | "warm" | "cold";

export type SalesChannel = "phone" | "email" | "website" | "instagram" | "facebook" | "linkedin" | "google";

export type SalesNeed =
  | "textile-staff"
  | "print"
  | "signalétique"
  | "événementiel"
  | "cadeaux-pro"
  | "rebranding";

// ── Sections mémoire ─────────────────────────────────────────────────────────

export type MemorySection =
  | "regles-design"
  | "regles-techniques"
  | "prompts"
  | "process"
  | "decisions";

// ── Entités ────────────────────────────────────────────────────────────────

export interface HermesAgent {
  id:          AgentId;
  name:        string;
  shortName:   string;
  role:        string;
  bestFor:     string[];
  accent:      string;
  category:    PromptCategory;
}

/**
 * Un rapport IA reçu (généré par Hermès Bot, Claude Code, ChatGPT, etc.).
 */
export interface HermesReport {
  id:         string;
  title:      string;
  source:     ReportSource;
  status:     ReportStatus;
  createdAt:  string;          // ISO date
  summary:    string;          // 1-2 phrases résumé court
  body:       string;          // contenu complet (markdown)
  agentId?:   AgentId;
  projectId?: string;
  channel?:   "web" | "discord" | "manual" | "agent";
  priority?:  Priority;
  reportType?: ReportType;
  createdFromMissionId?: string;
  discordMessageId?: string;
  githubBranch?: string;
  vercelDeploymentUrl?: string;
  tags?:      string[];
}

/**
 * Une tâche actionnable (issue d'un rapport ou créée manuellement).
 */
export interface HermesTask {
  id:        string;
  title:     string;
  status:    TaskStatus;
  createdAt: string;
  dueAt?:    string;
  projectId?: string;
  reportId?: string;
  agentId?:   AgentId;
  priority?:  Priority;
  nextAction?: string;
  createdFromMissionId?: string;
  notes?:    string;
}

/**
 * Un projet HM Global (espace de regroupement).
 */
export interface HermesProject {
  id:         string;
  name:       string;
  category:   ProjectCategory;
  status:     ProjectStatus;
  description: string;
  objective:   string;
  updatedAt:  string;
}

/**
 * Une entrée de mémoire structurée.
 */
export interface HermesMemoryEntry {
  id:       string;
  section:  MemorySection;
  title:    string;
  body:     string;          // markdown
  updatedAt: string;
}

/**
 * Un prompt réutilisable.
 */
export interface HermesPrompt {
  id:        string;
  title:     string;
  category:  PromptCategory;
  body:      string;          // le prompt copiable
  updatedAt: string;
  agentId?:   AgentId;
  usage?:     string;
  tag?:       string;
  notes?:    string;
}

/**
 * Un prospect B2B repéré à Strasbourg ou autour de HM Global.
 */
export interface HermesSalesProspect {
  id: string;
  companyName: string;
  sector: string;
  city: string;
  address?: string;
  googleMapsUrl?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  phone?: string;
  email?: string;
  status: SalesProspectStatus;
  priority: SalesProspectPriority;
  score: number;
  needs: SalesNeed[];
  signals: string[];
  recommendedOffer: string;
  nextAction: string;
  channels: SalesChannel[];
  source: "google_places" | "site_web" | "instagram" | "manuel";
  lastContactAt?: string;
  notes?: string;
}

// ── Helpers UI ─────────────────────────────────────────────────────────────

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  new:        "Nouveau",
  read:       "Lu",
  validated:  "Validé",
  rejected:   "Refusé",
  to_review:  "À revoir",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo:          "À faire",
  doing:         "En cours",
  waiting_agent: "En attente retour agent",
  done:          "Terminé",
};

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "site-web":      "Site web",
  "impression":    "Impression",
  "textile":       "Textile",
  "hermes-os":     "Hermès OS",
  "discord":       "Discord",
  "erasmus":       "Erasmus",
  "instagram":     "Instagram",
  "vente":         "Vente",
  "client":        "Client",
  "administratif": "Administratif",
  "finance":       "Admin & finance",
  "personnel":     "Personnel",
};

export const PROMPT_CATEGORY_LABELS: Record<PromptCategory, string> = {
  "claude-code":       "Claude Code",
  "claude-navigation": "Claude Navigation",
  "chatgpt":           "ChatGPT",
  "discord":           "Discord",
  "email":             "Email",
  "devis":             "Devis",
  "design":            "Design / DA",
  "admin":             "Admin",
  "personnel":         "Personnel",
  "prospection":       "Prospection",
  "instagram":         "Instagram",
  "erasmus":           "Erasmus",
  "textile":           "Textile",
};

export const AGENT_LABELS: Record<AgentId, string> = {
  "claude-code":         "Claude Code",
  "claude-navigation":   "Claude Navigation",
  "chatgpt-strategist":  "ChatGPT Stratège",
  "hermes-discord":      "Hermès Bot Discord",
  "email-agent":         "Agent Email",
  "quote-agent":         "Agent Devis",
  "design-agent":        "Agent Design / DA",
  "admin-finance-agent": "Agent Admin / Finance",
  "sales-agent":         "Agent Vente",
  "personal-agent":      "Agent Personnel",
};

export const SALES_PROSPECT_STATUS_LABELS: Record<SalesProspectStatus, string> = {
  new:          "Nouveau",
  qualified:   "Qualifié",
  to_call:     "À appeler",
  email_ready: "Email prêt",
  contacted:   "Contacté",
  interested:  "Intéressé",
  not_relevant: "Pas pertinent",
  opted_out:   "Opposition",
};

export const SALES_NEED_LABELS: Record<SalesNeed, string> = {
  "textile-staff": "Textile équipe",
  print:           "Print",
  signalétique:    "Signalétique",
  événementiel:    "Événementiel",
  "cadeaux-pro":   "Cadeaux pro",
  rebranding:      "Rebranding",
};

export const REPORT_SOURCE_LABELS: Record<ReportSource, string> = {
  "claude-code": "Claude Code",
  chatgpt:       "ChatGPT",
  discord:       "Discord",
  manuel:        "Manuel",
};

export const MEMORY_SECTION_LABELS: Record<MemorySection, string> = {
  "regles-design":     "Règles design",
  "regles-techniques": "Règles techniques",
  "prompts":           "Prompts",
  "process":           "Process",
  "decisions":         "Décisions validées",
};
