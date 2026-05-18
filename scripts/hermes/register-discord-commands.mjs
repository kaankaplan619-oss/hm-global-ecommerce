// scripts/hermes/register-discord-commands.mjs
//
// Script offline d'enregistrement des slash commands chez Discord pour
// Hermès Bot V0. À lancer UNE FOIS apres deploiement initial, et a chaque
// fois qu'on modifie les commandes (nom, options, etc.).
//
// Usage (depuis hm-global/) :
//   node --env-file=.env.local scripts/hermes/register-discord-commands.mjs
//
// Variables d'env requises (dans .env.local) :
//   HERMES_DISCORD_APP_ID      — id de l'application Discord (numerique)
//   HERMES_DISCORD_BOT_TOKEN   — token bot (commence par MTxxxxx...)
//
// Garanties :
//   - Lecture seule du repo, ecriture uniquement vers l'API Discord.
//   - Aucun envoi d'email, aucun appel GitHub/Supabase/Stripe.
//   - N'enregistre qu'UNE seule commande racine /hermes avec 3 sous-commandes :
//       /hermes audit, /hermes mission, /hermes decision.

const APP_ID    = process.env.HERMES_DISCORD_APP_ID;
const BOT_TOKEN = process.env.HERMES_DISCORD_BOT_TOKEN;

if (!APP_ID || !BOT_TOKEN) {
  console.error(
    "[register-discord-commands] Manquent HERMES_DISCORD_APP_ID et/ou HERMES_DISCORD_BOT_TOKEN.\n" +
      "Ajoute-les dans hm-global/.env.local puis relance via :\n" +
      "  node --env-file=.env.local scripts/hermes/register-discord-commands.mjs",
  );
  process.exit(1);
}

// Types d'options Discord utilises ici :
//   1 = SUB_COMMAND
//   3 = STRING
const SUB_COMMAND = 1;
const STRING      = 3;

const COMMANDS = [
  {
    name: "hermes",
    description: "Hermès Bot V0 — génération de texte uniquement (aucune action de production).",
    options: [
      {
        type: SUB_COMMAND,
        name: "audit",
        description: "Génère une autorisation d'audit lecture seule (texte à copier).",
        options: [
          {
            name: "topic",
            description: "Sujet de l'audit (ex: page admin, configurateur, catalogue, ...).",
            type: STRING,
            required: true,
          },
        ],
      },
      {
        type: SUB_COMMAND,
        name: "mission",
        description: "Génère une mission Hermès structurée (texte à copier dans docs/hermes/missions/).",
        options: [
          {
            name: "titre",
            description: "Titre court de la mission.",
            type: STRING,
            required: true,
          },
          {
            name: "type",
            description: "Type de mission : audit, exec, doc.",
            type: STRING,
            required: false,
            choices: [
              { name: "audit (lecture seule)", value: "audit" },
              { name: "exec (modifications code)", value: "exec" },
              { name: "doc (documentaire)", value: "doc" },
            ],
          },
          {
            name: "priority",
            description: "Priorité : P1 (semaine), P2 (quinzaine), P3 (backlog).",
            type: STRING,
            required: false,
            choices: [
              { name: "P1 — cette semaine", value: "P1" },
              { name: "P2 — quinzaine",     value: "P2" },
              { name: "P3 — backlog",       value: "P3" },
            ],
          },
          {
            name: "context",
            description: "Contexte court : pourquoi cette mission existe (optionnel).",
            type: STRING,
            required: false,
          },
        ],
      },
      {
        type: SUB_COMMAND,
        name: "decision",
        description: "Génère un bloc décision à coller dans docs/hermes/05_DECISION_LOG.md.",
        options: [
          {
            name: "decision",
            description: "Décision prise (1-2 phrases).",
            type: STRING,
            required: true,
          },
          {
            name: "reason",
            description: "Raison / motivation de la décision (optionnel).",
            type: STRING,
            required: false,
          },
          {
            name: "impact",
            description: "Impact / comment appliquer la décision (optionnel).",
            type: STRING,
            required: false,
          },
        ],
      },
    ],
  },
];

const url = `https://discord.com/api/v10/applications/${APP_ID}/commands`;

console.log(`[register-discord-commands] PUT ${url}`);
console.log(`[register-discord-commands] ${COMMANDS.length} commande(s) racine a enregistrer (avec sous-commandes)`);

try {
  const res = await fetch(url, {
    method: "PUT", // PUT overwrite = clean replacement de toutes les commandes globales
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bot ${BOT_TOKEN}`,
    },
    body: JSON.stringify(COMMANDS),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[register-discord-commands] HTTP ${res.status} ${res.statusText}`);
    console.error(`  Body: ${errorText.slice(0, 500)}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`[register-discord-commands] OK — ${Array.isArray(data) ? data.length : "?"} commande(s) racine enregistree(s)`);
  if (Array.isArray(data)) {
    for (const cmd of data) {
      console.log(`  /${cmd.name} (id=${cmd.id})`);
      if (Array.isArray(cmd.options)) {
        for (const opt of cmd.options) {
          if (opt.type === SUB_COMMAND) {
            console.log(`    └─ /${cmd.name} ${opt.name}`);
          }
        }
      }
    }
  }
  console.log(
    "\nLes commandes peuvent prendre jusqu'a 1 heure pour apparaitre dans Discord (cache).\n" +
      "Pour les voir immediatement, deconnecte/reconnecte ton client Discord.",
  );
} catch (err) {
  console.error("[register-discord-commands] Network error:", err?.code ?? err?.name ?? "unknown");
  process.exit(1);
}
