// scripts/hermes/test-discord.mjs
//
// Util de test Hermes — envoi d'un message court vers un webhook Discord.
//
// Conforme au contrat documente dans :
//   docs/hermes/missions/2026-05-18_hermes-discord-channel.md
//
// Garanties :
//   - Ne crash JAMAIS si le webhook est absent (fallback no-crash, regle 3.5).
//   - N'affiche JAMAIS l'URL du webhook ni aucune partie de celle-ci.
//   - Aucune dependance externe — fetch global Node >= 18, --env-file Node >= 20.6.
//
// USAGE (depuis hm-global/) :
//   node --env-file=.env.local scripts/hermes/test-discord.mjs            # canal "main"
//   node --env-file=.env.local scripts/hermes/test-discord.mjs main
//   node --env-file=.env.local scripts/hermes/test-discord.mjs night
//   node --env-file=.env.local scripts/hermes/test-discord.mjs both
//   node --env-file=.env.local scripts/hermes/test-discord.mjs main --dry-run
//
// Codes de sortie :
//   0  succes (ou webhook absent — fallback no-crash, comportement nominal documente)
//   1  echec d'envoi (HTTP non-2xx ou erreur reseau)
//   2  argument invalide

const WEBHOOK_ENV_BY_CHANNEL = {
  main:  "DISCORD_WEBHOOK_URL",
  night: "DISCORD_NIGHT_WEBHOOK_URL",
};

// Identifiant interne masque — JAMAIS l'URL.
// `webhook=main` ou `webhook=night` — c'est tout ce qu'on logge.
function maskedId(channel) {
  return `webhook=${channel}`;
}

// Messages tests conformes au format 6 lignes / 400 caracteres max
// (section 2 du contrat). Pas de bloc code, pas de tableau.
function buildTestMessage(channel) {
  const now = new Date().toISOString().replace("T", " ").slice(0, 16);
  if (channel === "night") {
    return [
      "🌙 **Test webhook Hermes** · canal nuit",
      "**Mission** · test-discord.mjs",
      "**Risque** · aucun",
      "**Fichiers** · — (script test)",
      "**Tests** · ping webhook uniquement",
      `**Decision** · aucune — ping ${now} UTC`,
    ].join("\n");
  }
  return [
    "✅ **Test webhook Hermes** · canal general",
    "**Mission** · test-discord.mjs",
    "**Risque** · aucun",
    "**Fichiers** · — (script test)",
    "**Tests** · ping webhook uniquement",
    `**Decision** · aucune — ping ${now} UTC`,
  ].join("\n");
}

async function sendOne(channel, { dryRun }) {
  const envName = WEBHOOK_ENV_BY_CHANNEL[channel];
  if (!envName) {
    console.error(`[hermes/discord] canal inconnu: "${channel}". Valeurs attendues : main | night | both`);
    return { ok: false, code: 2 };
  }

  const url = process.env[envName];
  const present = typeof url === "string" && url.trim() !== "";

  if (!present) {
    // Regle 3.5 — fallback no-crash : on log et on continue.
    console.log(`[hermes/discord] ${maskedId(channel)} absent — test non envoye`);
    return { ok: true, code: 0, skipped: true };
  }

  if (dryRun) {
    console.log(`[hermes/discord] ${maskedId(channel)} present — dry-run, aucun envoi`);
    return { ok: true, code: 0, skipped: true };
  }

  const message = buildTestMessage(channel);
  if (message.length > 400) {
    // Garde-fou contrat (section 2 : 400 caracteres max).
    // Ne devrait jamais arriver avec les messages ci-dessus mais on verifie.
    console.error(`[hermes/discord] ${maskedId(channel)} message trop long (${message.length} > 400) — envoi refuse`);
    return { ok: false, code: 1 };
  }

  const body = JSON.stringify({
    content: message,
    // Aucun ping @everyone / @here / role / user sur un test.
    allowed_mentions: { parse: [] },
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) {
      // Log : code HTTP + identifiant masque. Pas d'URL, pas de body de reponse Discord
      // (qui pourrait renvoyer l'URL en cas de validation server-side).
      console.error(`[hermes/discord] ${maskedId(channel)} HTTP ${res.status} ${res.statusText}`);
      return { ok: false, code: 1 };
    }

    console.log(`[hermes/discord] ${maskedId(channel)} OK — message envoye`);
    return { ok: true, code: 0 };
  } catch (err) {
    // Log de l'erreur sans URL. On garde uniquement code/name/cause type-safe.
    const safeKind = err?.code ?? err?.cause?.code ?? err?.name ?? "unknown";
    console.error(`[hermes/discord] ${maskedId(channel)} erreur reseau (${safeKind})`);
    return { ok: false, code: 1 };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const positional = args.filter((a) => !a.startsWith("--"));
  const target = positional[0] ?? "main";

  const channels =
    target === "both" ? ["main", "night"]
    : [target];

  let worstCode = 0;
  for (const ch of channels) {
    const { code } = await sendOne(ch, { dryRun });
    if (code > worstCode) worstCode = code;
  }

  process.exit(worstCode);
}

main();
