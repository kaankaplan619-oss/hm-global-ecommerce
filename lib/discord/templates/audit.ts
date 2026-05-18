/**
 * lib/discord/templates/audit.ts
 *
 * Template texte pour /hermes audit.
 * Genere une autorisation d'audit lecture seule, formatee pour copier-coller
 * dans une session Claude Code ou ChatGPT.
 */

const HERMES_FOOTER =
  "_Hermès Bot V0 — génération de texte uniquement, aucune action de production._";

export function buildAuditTemplate(topic: string): string {
  const safeTopic = topic.trim() || "[sujet à préciser]";
  return [
    `## 📋 Autorisation d'audit lecture seule — ${safeTopic}`,
    ``,
    `**Périmètre** : audit lecture seule sur **${safeTopic}**.`,
    ``,
    `**Autorisations** :`,
    `- Lire les fichiers nécessaires à comprendre l'état actuel.`,
    `- Produire un rapport diagnostic structuré.`,
    `- Proposer un plan de modification **sans l'appliquer**.`,
    ``,
    `**Interdictions strictes** :`,
    `- ❌ Aucune modification de fichier.`,
    `- ❌ Aucun commit, aucun push, aucun stage.`,
    `- ❌ Aucune migration Supabase.`,
    `- ❌ Aucun email réel envoyé.`,
    `- ❌ Aucun accès Stripe / paiement / webhook.`,
    `- ❌ Aucun accès aux commandes clients en écriture.`,
    `- ❌ Aucun envoi de données de production.`,
    `- ❌ Aucune installation de dépendance.`,
    ``,
    `**Livrable attendu** :`,
    `1. Fichiers inspectés et leur rôle.`,
    `2. Comportement actuel observé.`,
    `3. Cause probable du problème (si applicable).`,
    `4. Plan de modification proposé sans l'appliquer.`,
    `5. Fichiers qui devront être modifiés plus tard.`,
    `6. Risques restants.`,
    `7. Confirmation que rien n'a été modifié.`,
    ``,
    `**Tu dois t'arrêter après le rapport d'audit.**`,
    `Aucune modification sans une nouvelle autorisation écrite explicite.`,
    ``,
    HERMES_FOOTER,
  ].join("\n");
}
