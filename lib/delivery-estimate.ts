/**
 * lib/delivery-estimate.ts
 *
 * Estimation d'une fenêtre de livraison "style Pixartprinting" :
 *   production (jours ouvrés) + transport (fourchette jours ouvrés).
 * Affichée sur la page produit pour rassurer / convertir.
 *
 * Volontairement prudent : la fenêtre commence APRÈS validation du BAT et
 * exclut les week-ends. Les délais sont des estimations (Gelato POD + port FR).
 */

export interface DeliveryWindow { from: Date; to: Date; }

/** Ajoute N jours OUVRÉS à une date (saute samedi/dimanche). */
function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start.getTime());
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

/**
 * Fenêtre de livraison estimée.
 * @param now        date de référence (commande)
 * @param prodDays   jours ouvrés de production
 * @param shipMin    transport min (jours ouvrés)
 * @param shipMax    transport max (jours ouvrés)
 */
export function estimateDelivery(now: Date, prodDays = 3, shipMin = 2, shipMax = 4): DeliveryWindow {
  return {
    from: addBusinessDays(now, prodDays + shipMin),
    to:   addBusinessDays(now, prodDays + shipMax),
  };
}

/** "entre le 12 et le 14 juin" (mois unique) ou "entre le 30 juin et le 2 juillet". */
export function formatDeliveryWindow(w: DeliveryWindow): string {
  const sameMonth = w.from.getMonth() === w.to.getMonth();
  const day = (d: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric" }).format(d);
  const dayMonth = (d: Date) => new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(d);
  return sameMonth
    ? `entre le ${day(w.from)} et le ${dayMonth(w.to)}`
    : `entre le ${dayMonth(w.from)} et le ${dayMonth(w.to)}`;
}
