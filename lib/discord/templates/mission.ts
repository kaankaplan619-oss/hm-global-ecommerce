/**
 * lib/discord/templates/mission.ts
 *
 * Template texte pour /hermes mission.
 * Genere une mission Hermes formelle au format docs/hermes/01_MISSION_TEMPLATE.md
 * pre-remplie. Le texte est copiable dans docs/hermes/missions/<date>_<titre>.md.
 */

const HERMES_FOOTER =
  "_Hermès Bot V0 — génération de texte uniquement, aucune action de production._";

export type MissionType = "audit" | "exec" | "doc";
export type MissionPriority = "P1" | "P2" | "P3";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface BuildMissionOptions {
  title: string;
  type?: MissionType;
  priority?: MissionPriority;
  context?: string;
  scope?: string;
}

export function buildMissionTemplate({
  title,
  type = "exec",
  priority = "P2",
  context,
  scope,
}: BuildMissionOptions): string {
  const safeTitle = title.trim() || "[titre à préciser]";
  const date = todayISO();
  const slug = slugify(safeTitle) || "mission-sans-titre";
  const filename = `docs/hermes/missions/${date}_${slug}.md`;

  const typeLabel = type === "audit" ? "Audit (lecture seule)"
    : type === "doc" ? "Documentaire"
    : "Exécution (modifications code)";

  return [
    `# Mission — ${safeTitle}`,
    ``,
    `> À copier dans \`${filename}\``,
    `> Conforme au template \`docs/hermes/01_MISSION_TEMPLATE.md\`.`,
    ``,
    `---`,
    ``,
    `## Titre mission`,
    safeTitle,
    ``,
    `## Date`,
    date,
    ``,
    `## Type`,
    typeLabel,
    ``,
    `## Priorité`,
    `${priority} — ${priority === "P1" ? "cette semaine" : priority === "P2" ? "quinzaine" : "backlog"}`,
    ``,
    `## Agent responsable`,
    type === "audit"
      ? "Claude Code (lecture seule, audit uniquement)."
      : "Claude Code (exécution selon périmètre).",
    ``,
    `## Contexte`,
    context?.trim() || "<!-- Pourquoi cette mission existe maintenant. Lien avec une décision, un retour utilisateur, un test, une priorité Phase 1. -->",
    ``,
    `## Objectif`,
    `<!-- Une phrase. Ce qui doit être vrai à la fin de la mission. Mesurable si possible. -->`,
    ``,
    `## Périmètre autorisé`,
    scope?.trim() || `<!-- Liste explicite de ce que l'agent a le droit de faire :`,
    `- Modifier les fichiers listés ci-dessous`,
    `- Lire les fichiers nécessaires à comprendre le contexte`,
    `- Lancer typecheck + lint + build`,
    `-->`,
    ``,
    `## Fichiers autorisés`,
    `<!-- Chemins explicites. Wildcards interdits sauf justification.`,
    `Exemple :`,
    `- app/X/page.tsx`,
    `- lib/Y.ts`,
    `-->`,
    ``,
    `## Fichiers / zones interdits`,
    `- lib/stripe/**`,
    `- lib/supabase/** (logic)`,
    `- components/checkout/**, components/cart/**`,
    `- app/api/checkout/**, app/api/payment/**, app/api/webhook/**`,
    `- lib/auth/**, app/api/auth/**`,
    `- data/products/pricing.ts (et tout fichier pricing)`,
    `- data/suppliers/supplierMap.ts`,
    `- .env*`,
    `- supabase/migrations/** (sauf autorisation explicite)`,
    ``,
    `## Niveau de risque`,
    type === "audit" ? "LOW — audit lecture seule"
      : type === "doc" ? "LOW — documentaire"
      : "MEDIUM — modifications code applicatif",
    ``,
    `## Contraintes business / design / technique`,
    `<!-- Règles à respecter (ex : mobile-first, 6 clics max, pas de nouvelle dépendance npm, etc.) -->`,
    ``,
    `## Étapes demandées`,
    `1. Lire les fichiers du périmètre`,
    `2. Identifier précisément les changements nécessaires`,
    `3. Appliquer les modifications`,
    `4. Lancer \`npx tsc --noEmit\` (exit 0 attendu)`,
    `5. Lancer \`npm run build\` (exit 0 attendu)`,
    `6. Présenter le diff complet avant commit`,
    `7. **Ne pas push sans validation Kaan**`,
    ``,
    `## Tests obligatoires`,
    `- [ ] \`npx tsc --noEmit\` passe`,
    `- [ ] \`npm run build\` passe`,
    `- [ ] Captures Chrome MCP desktop + mobile si UI`,
    `- [ ] Console JS : aucune erreur rouge`,
    ``,
    `## Livrable attendu`,
    `Rapport conforme \`docs/hermes/03_REPORT_TEMPLATE.md\`, archivé à côté de cette mission.`,
    ``,
    `## Critères de validation`,
    `- [ ] Le rapport est conforme au template \`03\`.`,
    `- [ ] Aucun fichier interdit n'a été modifié.`,
    `- [ ] Aucune dépendance npm introduite sans validation séparée.`,
    `- [ ] \`git status\` propre après commit (sauf untracked pré-existants).`,
    `- [ ] Recommandation finale claire.`,
    ``,
    `## Décision finale attendue`,
    `- **Valider** → ouverture PR vers main.`,
    `- **Demander itération** → laisser feedback en review.`,
    `- **Rejeter** → reformuler.`,
    ``,
    `---`,
    ``,
    HERMES_FOOTER,
  ].join("\n");
}
