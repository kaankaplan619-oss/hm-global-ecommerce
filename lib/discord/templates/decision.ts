/**
 * lib/discord/templates/decision.ts
 *
 * Template texte pour /hermes decision.
 * Genere un bloc decision pret a copier-coller en tete de
 * docs/hermes/05_DECISION_LOG.md sous la section "Decisions actives".
 */

const HERMES_FOOTER =
  "_Hermès Bot V0 — génération de texte uniquement, aucune action de production._";

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface BuildDecisionOptions {
  decision: string;
  reason?: string;
  impact?: string;
}

export function buildDecisionTemplate({
  decision,
  reason,
  impact,
}: BuildDecisionOptions): string {
  const safeDecision = decision.trim() || "[décision à préciser]";
  const date = todayISO();
  // Titre court derive de la decision (premiere phrase, max 60 chars).
  const title = safeDecision.split(/[.!?]/)[0].slice(0, 60).trim();

  return [
    `## 📌 Entrée à coller dans \`docs/hermes/05_DECISION_LOG.md\``,
    ``,
    `> Insère ce bloc en tête de la section **"Décisions actives"**,`,
    `> au-dessus des décisions existantes.`,
    ``,
    `\`\`\`markdown`,
    `### ${title}`,
    `- **Date :** ${date}`,
    `- **Décision :** ${safeDecision}`,
    `- **Why :** ${reason?.trim() || "<!-- Pourquoi cette décision a été prise. Contexte business, contrainte, déclencheur. -->"}`,
    `- **How to apply :** ${impact?.trim() || "<!-- Comment cette décision doit influencer les futures missions / le code / la communication. -->"}`,
    `- **Statut :** Active`,
    `- **Décidé par :** Kaan`,
    `\`\`\``,
    ``,
    `---`,
    ``,
    HERMES_FOOTER,
  ].join("\n");
}
