/**
 * lib/email.ts — Service email transactionnel (Resend v6)
 *
 * Fonctions exportées :
 *   sendConfirmationPaiement   → webhook payment_intent.succeeded
 *   sendFichierNonConforme     → admin-update reject-file
 *   sendCommandeValidee        → admin-update status → validee
 *   sendCommandeExpediee       → admin-update status → expediee
 *   sendCommandeAnnulee        → webhook charge.refunded
 *   sendFactureDisponible      → generate-invoice
 *   sendDemandeAvis            → admin-update status → terminee
 */

import type { Order } from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const FROM_NAME  = "HM Global Agence";
const REPLY_TO   = "contact@hmglobalagence.fr";
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hmglobalagence.fr";

// ─── Resend client (lazy — évite l'import au build) ──────────────────────────

async function getResend() {
  const { Resend } = await import("resend");
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

// ─── Guard ────────────────────────────────────────────────────────────────────

function getFromEmail(): string {
  const fromAddr = process.env.RESEND_FROM_EMAIL;
  if (!fromAddr) {
    throw new Error("RESEND_FROM_EMAIL is not set");
  }

  return `${FROM_NAME} <${fromAddr}>`;
}

function getRecipientEmail(order: Order, fn: string): string | null {
  const email = order.user?.email;
  if (!email) {
    console.warn(
      `[Email:${fn}] Envoi ignoré pour la commande #${order.orderNumber}: order.user.email est vide ou absent.`
    );
    return null;
  }

  return email;
}

// ─── Layout HTML partagé ──────────────────────────────────────────────────────

function baseLayout(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#0a0a0a; font-family: Arial, sans-serif; color:#f5f5f5; }
    .wrapper { max-width:600px; margin:0 auto; padding:40px 24px; }
    .logo { font-size:20px; font-weight:700; letter-spacing:0.05em; color:#c9a96e; margin-bottom:32px; }
    .divider { height:1px; background:linear-gradient(90deg,transparent,#c9a96e55,transparent); margin:24px 0; }
    .footer { font-size:12px; color:#555555; margin-top:32px; line-height:1.6; }
    .btn { display:inline-block; padding:12px 24px; background:#c9a96e; color:#0a0a0a !important; font-weight:700; font-size:14px; text-decoration:none; border-radius:4px; margin:16px 0; }
    p { line-height:1.7; margin:8px 0; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="logo">HM GLOBAL AGENCE</div>
  ${content}
  <div class="divider"></div>
  <div class="footer">
    HM Global Agence — Souffelweyersheim, Alsace<br/>
    <a href="mailto:${REPLY_TO}" style="color:#c9a96e">${REPLY_TO}</a>
  </div>
</div>
</body>
</html>`;
}

// ─── 1. Confirmation de paiement ─────────────────────────────────────────────
// Déclencheur : webhook payment_intent.succeeded

export async function sendConfirmationPaiement(order: Order) {
  const to = getRecipientEmail(order, "sendConfirmationPaiement");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const html = baseLayout(
    `<h2 style="color:#f5f5f5;margin:0 0 8px">Paiement reçu ✓</h2>
     <p style="color:#8a8a8a">Bonjour ${order.user.firstName},</p>
     <p>Votre paiement de <strong style="color:#c9a96e">${order.totalTTC.toFixed(2)} €</strong> a bien été reçu.</p>
     <p>Commande : <strong>#${order.orderNumber}</strong></p>
     <p style="color:#8a8a8a;font-size:14px">Votre commande est en cours de vérification. Nous vous contacterons si votre fichier doit être ajusté.</p>
     <a href="${SITE_URL}/mon-compte/commandes/${order.id}" class="btn">Suivre ma commande</a>`,
    "Paiement reçu — HM Global Agence"
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `✓ Paiement reçu — Commande #${order.orderNumber}`,
    html,
  });
}

// ─── 2. Fichier non conforme ──────────────────────────────────────────────────
// Déclencheur : admin reject-file (status → en_attente_client)

export async function sendFichierNonConforme(order: Order, reason: string) {
  const to = getRecipientEmail(order, "sendFichierNonConforme");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const html = baseLayout(
    `<h2 style="color:#f5f5f5;margin:0 0 8px">Action requise : fichier à corriger</h2>
     <p>Bonjour ${order.user.firstName},</p>
     <p>Votre fichier logo pour la commande <strong>#${order.orderNumber}</strong> nécessite une correction :</p>
     <p style="padding:16px;background:#1a1a1a;border-left:3px solid #c9a96e;border-radius:4px;color:#8a8a8a">${reason}</p>
     <p>Vous pouvez déposer votre nouveau fichier depuis votre espace client :</p>
     <a href="${SITE_URL}/mon-compte/commandes/${order.id}" class="btn">Déposer mon fichier</a>
     <p style="font-size:13px;color:#555555">Formats acceptés : PDF, PNG, SVG, AI — maximum 50 Mo</p>`,
    "Fichier à corriger — HM Global Agence"
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `⚠️ Fichier à corriger — Commande #${order.orderNumber}`,
    html,
  });
}

// ─── 3. Commande validée ──────────────────────────────────────────────────────
// Déclencheur : admin-update status → validee

export async function sendCommandeValidee(order: Order) {
  const to = getRecipientEmail(order, "sendCommandeValidee");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const html = baseLayout(
    `<h2 style="color:#f5f5f5;margin:0 0 8px">Commande validée ✓</h2>
     <p>Bonjour ${order.user.firstName},</p>
     <p>Excellente nouvelle ! Votre commande <strong>#${order.orderNumber}</strong> a été validée et est en cours de fabrication.</p>
     <p style="color:#8a8a8a;font-size:14px">Vous recevrez un email dès que votre commande sera expédiée.</p>
     <a href="${SITE_URL}/mon-compte/commandes/${order.id}" class="btn">Voir ma commande</a>`,
    "Commande validée — HM Global Agence"
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `✓ Commande validée — #${order.orderNumber}`,
    html,
  });
}

// ─── 4. Commande expédiée ─────────────────────────────────────────────────────
// Déclencheur : admin-update status → expediee

export async function sendCommandeExpediee(order: Order) {
  const to = getRecipientEmail(order, "sendCommandeExpediee");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const trackingBlock = order.trackingNumber
    ? `<p>Numéro de suivi : <strong style="color:#c9a96e">${order.trackingNumber}</strong></p>`
    : "";

  const html = baseLayout(
    `<h2 style="color:#f5f5f5;margin:0 0 8px">Commande expédiée 🚀</h2>
     <p>Bonjour ${order.user.firstName},</p>
     <p>Votre commande <strong>#${order.orderNumber}</strong> a été expédiée !</p>
     ${trackingBlock}
     <a href="${SITE_URL}/mon-compte/commandes/${order.id}" class="btn">Suivre ma commande</a>`,
    "Commande expédiée — HM Global Agence"
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `🚀 Commande expédiée — #${order.orderNumber}`,
    html,
  });
}

// ─── 5. Commande annulée ──────────────────────────────────────────────────────
// Déclencheur : webhook charge.refunded

export async function sendCommandeAnnulee(order: Order) {
  const to = getRecipientEmail(order, "sendCommandeAnnulee");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const html = baseLayout(
    `<h2 style="color:#f5f5f5;margin:0 0 8px">Commande annulée</h2>
     <p>Bonjour ${order.user.firstName},</p>
     <p>Votre commande <strong>#${order.orderNumber}</strong> a été annulée.</p>
     <p>Un remboursement de <strong style="color:#c9a96e">${order.totalTTC.toFixed(2)} €</strong> sera traité sous 5 à 10 jours ouvrés sur votre moyen de paiement d'origine.</p>
     <p style="color:#8a8a8a;font-size:13px">Des questions ? Contactez-nous à <a href="mailto:${REPLY_TO}" style="color:#c9a96e">${REPLY_TO}</a></p>`,
    "Commande annulée — HM Global Agence"
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Commande annulée — #${order.orderNumber}`,
    html,
  });
}

// ─── 6. Facture disponible ────────────────────────────────────────────────────
// Déclencheur : generate-invoice (après validation Pennylane)

export async function sendFactureDisponible(order: Order) {
  const to = getRecipientEmail(order, "sendFactureDisponible");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const downloadBtn = order.invoiceUrl
    ? `<a href="${order.invoiceUrl}" class="btn">Télécharger ma facture</a>`
    : "";

  const html = baseLayout(
    `<h2 style="color:#f5f5f5;margin:0 0 8px">Votre facture est disponible</h2>
     <p>Bonjour ${order.user.firstName},</p>
     <p>La facture pour votre commande <strong>#${order.orderNumber}</strong> est maintenant disponible.</p>
     ${downloadBtn}
     <a href="${SITE_URL}/mon-compte/factures" class="btn" style="margin-left:${order.invoiceUrl ? "8px" : "0"}">Voir mes factures</a>`,
    "Facture disponible — HM Global Agence"
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Facture disponible — Commande #${order.orderNumber}`,
    html,
  });
}

// ─── 7. Demande d'avis ────────────────────────────────────────────────────────
// Déclencheur : admin-update status → terminee

export async function sendDemandeAvis(order: Order) {
  const to = getRecipientEmail(order, "sendDemandeAvis");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const html = baseLayout(
    `<h2 style="color:#f5f5f5;margin:0 0 8px">Votre avis compte pour nous</h2>
     <p>Bonjour ${order.user.firstName},</p>
     <p>Nous espérons que vos articles vous ont satisfait ! Votre retour nous aide à améliorer nos services.</p>
     <a href="${SITE_URL}/avis/${order.id}" class="btn">Laisser mon avis</a>
     <p style="font-size:13px;color:#555555">Cela ne prend que 30 secondes.</p>`,
    "Donnez votre avis — HM Global Agence"
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `⭐ Comment s'est passée votre commande ?`,
    html,
  });
}
