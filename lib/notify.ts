/**
 * lib/notify.ts — Notifications internes légères (Discord webhook).
 *
 * Best-effort : jamais bloquant, jamais d'exception remontée. Si aucun webhook
 * n'est configuré, c'est un no-op silencieux.
 *
 * Webhook utilisé : DISCORD_ORDERS_WEBHOOK_URL si défini (canal dédié commandes),
 * sinon DISCORD_WEBHOOK_URL (canal Hermès existant).
 */

function ordersWebhook(): string | undefined {
  return process.env.DISCORD_ORDERS_WEBHOOK_URL ?? process.env.DISCORD_WEBHOOK_URL;
}

async function postDiscord(url: string, content: string): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.slice(0, 1900) }),
    });
  } catch (err) {
    console.error("[notify] Discord post failed:", err);
  }
}

/** Notifie l'admin d'une nouvelle commande (CB payée ou virement à recevoir). */
export async function notifyNewOrder(o: {
  orderNumber: string;
  totalTTC: number;
  paymentMethod: "stripe" | "bank_transfer";
  email?: string | null;
  itemCount?: number;
}): Promise<void> {
  const url = ordersWebhook();
  if (!url) return;

  const method =
    o.paymentMethod === "bank_transfer" ? "🏦 Virement (à recevoir)" : "💳 Carte (payé)";
  const parts = [
    `🛒 **Nouvelle commande #${o.orderNumber}** — ${o.totalTTC.toFixed(2)} € · ${method}`,
  ];
  if (o.itemCount) parts[0] += ` · ${o.itemCount} article(s)`;
  if (o.email) parts.push(`📧 ${o.email}`);

  await postDiscord(url, parts.join("\n"));
}
