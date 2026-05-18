/**
 * POST /api/discord/interactions
 *
 * Endpoint Discord Interactions pour Hermes Bot V0.
 *
 * Securite (3 niveaux) :
 *   1. Verification signature Ed25519 obligatoire (sinon 401)
 *   2. Whitelist user IDs via env HERMES_BOT_ALLOWED_USERS (sinon ephemeral 403)
 *   3. Validation des slash commands acceptees (sinon "Commande inconnue")
 *
 * Commande Discord unique : /hermes <subcommand>
 *   - /hermes audit    -> handleAuditCommand
 *   - /hermes mission  -> handleMissionCommand
 *   - /hermes decision -> handleDecisionCommand
 *
 * Aucune action de production declenchee : tous les handlers generent du
 * texte uniquement, repondu en ephemeral, et le contenu inclut un footer
 * "Hermes Bot V0 — generation de texte uniquement, aucune action de production".
 *
 * Aucun appel a GitHub, Vercel, Supabase, Stripe, Resend, supplierMap,
 * pricing, ou commandes clients en V0.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyDiscordSignature } from "@/lib/discord/verify";
import { handleAuditCommand }    from "@/lib/discord/handlers/audit";
import { handleMissionCommand }  from "@/lib/discord/handlers/mission";
import { handleDecisionCommand } from "@/lib/discord/handlers/decision";

// ── Types minimaux Discord (sous-set utilise) ─────────────────────────────────

const INTERACTION_TYPE_PING                = 1;
const INTERACTION_TYPE_APPLICATION_COMMAND = 2;

const OPTION_TYPE_SUB_COMMAND = 1;

const RESPONSE_PONG                = 1;
const RESPONSE_CHANNEL_MESSAGE     = 4;
const FLAG_EPHEMERAL               = 64;

interface DiscordInteractionUser {
  id?: string;
}

interface DiscordInteractionMember {
  user?: DiscordInteractionUser;
}

interface DiscordInteractionOption {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: DiscordInteractionOption[];
}

interface DiscordInteractionData {
  name?: string;
  options?: DiscordInteractionOption[];
}

interface DiscordInteraction {
  type: number;
  data?: DiscordInteractionData;
  member?: DiscordInteractionMember;
  user?: DiscordInteractionUser;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ephemeralMessage(content: string): unknown {
  return {
    type: RESPONSE_CHANNEL_MESSAGE,
    data: { content, flags: FLAG_EPHEMERAL },
  };
}

function getUserId(interaction: DiscordInteraction): string | undefined {
  // Pour une commande dans un serveur, l'auteur est dans interaction.member.user
  // Pour un DM, l'auteur est dans interaction.user
  return interaction.member?.user?.id ?? interaction.user?.id;
}

function isUserAllowed(userId: string | undefined): boolean {
  if (!userId) return false;
  const raw = process.env.HERMES_BOT_ALLOWED_USERS;
  if (!raw) {
    // Aucun whitelist configure -> refus par defaut (fail-safe)
    console.warn("[discord/interactions] HERMES_BOT_ALLOWED_USERS not configured");
    return false;
  }
  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return allowed.includes(userId);
}

/**
 * Extrait le sous-commande et ses options depuis une interaction `/hermes <sub>`.
 * Renvoie un objet plat compatible avec les handlers existants (qui lisent
 * `interaction.data.options` directement comme un tableau de {name, type, value}).
 *
 * Retourne `null` si l'interaction ne correspond pas a un /hermes <subcommand> valide.
 */
function extractSubcommand(
  interaction: DiscordInteraction,
): { name: string; synthInteraction: DiscordInteraction } | null {
  if (interaction.data?.name !== "hermes") return null;

  const subOpt = interaction.data.options?.[0];
  if (!subOpt || subOpt.type !== OPTION_TYPE_SUB_COMMAND || !subOpt.name) return null;

  // Reconstruit une interaction "a plat" pour les handlers : data.options contient
  // directement les arguments du sous-commande (topic, titre, decision, ...).
  const synthInteraction: DiscordInteraction = {
    ...interaction,
    data: {
      name: subOpt.name,
      options: subOpt.options ?? [],
    },
  };

  return { name: subOpt.name, synthInteraction };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Verification signature Discord Ed25519 ──────────────────────────────
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    return new NextResponse("Missing signature headers", { status: 401 });
  }

  const publicKey = process.env.HERMES_DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    // Configuration manquante cote env -> on refuse plutot que d'accepter aveuglement.
    console.error("[discord/interactions] HERMES_DISCORD_PUBLIC_KEY not configured");
    return new NextResponse("Bot not configured", { status: 503 });
  }

  // Lire le body brut (string) pour la verification signature
  const body = await req.text();

  const isValid = await verifyDiscordSignature(publicKey, signature, timestamp, body);
  if (!isValid) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  // ── 2. Parser le payload une fois la signature validee ─────────────────────
  let interaction: DiscordInteraction;
  try {
    interaction = JSON.parse(body) as DiscordInteraction;
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // ── 3. PING handshake Discord (verification endpoint URL) ──────────────────
  if (interaction.type === INTERACTION_TYPE_PING) {
    return NextResponse.json({ type: RESPONSE_PONG });
  }

  // ── 4. Slash command ───────────────────────────────────────────────────────
  if (interaction.type === INTERACTION_TYPE_APPLICATION_COMMAND) {
    // 4a. Whitelist user
    const userId = getUserId(interaction);
    if (!isUserAllowed(userId)) {
      return NextResponse.json(
        ephemeralMessage(
          "🚫 Vous n'êtes pas autorisé à utiliser Hermès Bot.\n" +
            "_Hermès Bot V0 — génération de texte uniquement, aucune action de production._",
        ),
      );
    }

    // 4b. La seule commande racine acceptee est /hermes <subcommand>
    const rootName = interaction.data?.name;
    if (rootName !== "hermes") {
      return NextResponse.json(
        ephemeralMessage(
          `Commande inconnue : \`${rootName ?? "?"}\`.\n` +
            "Commande disponible : `/hermes audit | mission | decision`.",
        ),
      );
    }

    const extracted = extractSubcommand(interaction);
    if (!extracted) {
      return NextResponse.json(
        ephemeralMessage(
          "Sous-commande manquante.\n" +
            "Utilisez : `/hermes audit`, `/hermes mission` ou `/hermes decision`.",
        ),
      );
    }

    // 4c. Router vers le bon handler selon le nom de la sous-commande
    switch (extracted.name) {
      case "audit":
        return NextResponse.json(handleAuditCommand(extracted.synthInteraction));
      case "mission":
        return NextResponse.json(handleMissionCommand(extracted.synthInteraction));
      case "decision":
        return NextResponse.json(handleDecisionCommand(extracted.synthInteraction));
      default:
        return NextResponse.json(
          ephemeralMessage(
            `Sous-commande inconnue : \`${extracted.name}\`.\n` +
              "Sous-commandes disponibles : `audit`, `mission`, `decision`.",
          ),
        );
    }
  }

  // ── 5. Type inconnu -> reponse generique ────────────────────────────────────
  return NextResponse.json(ephemeralMessage("Type d'interaction non supporté."));
}
