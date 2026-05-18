/**
 * lib/discord/handlers/decision.ts — Handler /hermes decision
 *
 * Recoit l'interaction Discord, extrait decision + raison + impact,
 * genere le bloc 05_DECISION_LOG.md pret a coller, repond ephemeral.
 */

import { buildDecisionTemplate } from "../templates/decision";

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

const RESPONSE_CHANNEL_MESSAGE = 4;
const FLAG_EPHEMERAL = 64;

function getStringOption(data: DiscordInteractionData | undefined, name: string): string {
  const opt = data?.options?.find((o) => o.name === name);
  return typeof opt?.value === "string" ? opt.value : "";
}

export function handleDecisionCommand(interaction: DiscordInteraction): unknown {
  const decision = getStringOption(interaction.data, "decision");
  const reason   = getStringOption(interaction.data, "reason");
  const impact   = getStringOption(interaction.data, "impact");

  const content = buildDecisionTemplate({ decision, reason, impact });

  return {
    type: RESPONSE_CHANNEL_MESSAGE,
    data: {
      content,
      flags: FLAG_EPHEMERAL,
    },
  };
}
