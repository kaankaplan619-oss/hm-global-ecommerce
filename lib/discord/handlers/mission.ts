/**
 * lib/discord/handlers/mission.ts — Handler /hermes mission
 *
 * Recoit l'interaction Discord, extrait titre + options, genere le template
 * de mission Hermes et retourne la reponse ephemeral.
 */

import {
  buildMissionTemplate,
  type MissionType,
  type MissionPriority,
} from "../templates/mission";

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

function asType(s: string): MissionType {
  if (s === "audit" || s === "doc") return s;
  return "exec";
}

function asPriority(s: string): MissionPriority {
  if (s === "P1" || s === "P3") return s;
  return "P2";
}

export function handleMissionCommand(interaction: DiscordInteraction): unknown {
  const titre   = getStringOption(interaction.data, "titre");
  const type    = asType(getStringOption(interaction.data, "type"));
  const prio    = asPriority(getStringOption(interaction.data, "priority"));
  const context = getStringOption(interaction.data, "context");

  const content = buildMissionTemplate({
    title: titre,
    type,
    priority: prio,
    context,
  });

  // Discord limite a 2000 caracteres pour le content d'un message.
  // Si le template depasse, on tronque + on indique la suite.
  const truncated = content.length > 1900
    ? content.slice(0, 1900) + "\n\n_… (tronqué, copier-coller le brouillon complet depuis un audit local si besoin)_"
    : content;

  return {
    type: RESPONSE_CHANNEL_MESSAGE,
    data: {
      content: truncated,
      flags: FLAG_EPHEMERAL,
    },
  };
}
