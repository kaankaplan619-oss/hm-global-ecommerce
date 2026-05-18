/**
 * lib/discord/handlers/audit.ts — Handler /hermes audit
 *
 * Recoit l'interaction Discord (slash command), extrait l'option `topic`,
 * genere le template texte et retourne la reponse au format Discord (ephemeral).
 */

import { buildAuditTemplate } from "../templates/audit";

// Type minimal d'une interaction Discord (sous-set des champs utilises).
// Pas d'import depuis @types/discord pour eviter une dependance lourde.
interface DiscordInteractionOption {
  name: string;
  type: number;
  value?: string | number | boolean;
}

interface DiscordInteractionData {
  options?: DiscordInteractionOption[];
}

interface DiscordInteraction {
  data?: DiscordInteractionData;
}

// Discord response type 4 = CHANNEL_MESSAGE_WITH_SOURCE (reponse immediate visible)
// Flag 64 = EPHEMERAL (seul l'auteur de la commande voit la reponse)
const RESPONSE_CHANNEL_MESSAGE = 4;
const FLAG_EPHEMERAL = 64;

function getStringOption(data: DiscordInteractionData | undefined, name: string): string {
  const opt = data?.options?.find((o) => o.name === name);
  return typeof opt?.value === "string" ? opt.value : "";
}

export function handleAuditCommand(interaction: DiscordInteraction): unknown {
  const topic = getStringOption(interaction.data, "topic");
  const content = buildAuditTemplate(topic);
  return {
    type: RESPONSE_CHANNEL_MESSAGE,
    data: {
      content,
      flags: FLAG_EPHEMERAL,
    },
  };
}
