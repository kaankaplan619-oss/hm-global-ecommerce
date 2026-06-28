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
 *
 * Design email (2026-06-12) : thème CLAIR, robuste Gmail/Outlook, DA du site.
 *   - Fond de page gris très clair, carte blanche centrée (max 600 px).
 *   - Logo HM Global réel en en-tête (URL absolue publique — voir LOGO_URL).
 *   - Couleurs en ligne (les clients mail ignorent souvent <style> et le fond
 *     du <body>) : titres violet foncé #2D2340 → lisibles sur blanc.
 *   - Accent MAGENTA #b13f74 = --hm-primary du site (prix / liens / bouton,
 *     texte blanc sur bouton comme les CTA du site). Demande Kaan 2026-06-12 :
 *     plus de doré, l'email suit la DA du site.
 *
 * Ton éditorial : chaleureux et premium, ancré sur l'atelier alsacien
 * (Souffelweyersheim) et le savoir-faire HM Global — jamais générique.
 */

import type { Order } from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const FROM_NAME  = "HM Global Agence";
const SIGNATURE  = "L'équipe HM Global Agence";
// Adresse de contact / réponse — configurable (le domaine n'est pas encore actif).
// Par défaut l'adresse de marque ; surchargeable tant que le domaine n'est pas en
// place via EMAIL_REPLY_TO (ex. une boîte qui fonctionne déjà).
const REPLY_TO   = process.env.EMAIL_REPLY_TO ?? "contact@hmga.fr";
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr";

/**
 * URL ABSOLUE et PUBLIQUE du logo affiché en en-tête des emails.
 * Doit être joignable sans authentification (Gmail charge l'image côté client).
 * Par défaut : Supabase Storage (bucket public "mockups") — URL stable,
 * indépendante du domaine, donc valable en test comme en production.
 * Surchargeable par EMAIL_LOGO_URL si besoin.
 */
const LOGO_URL =
  process.env.EMAIL_LOGO_URL ??
  "https://kbeeedbfkalovtusaden.supabase.co/storage/v1/object/public/mockups/brand/hm-global-logo-email.png";

// Palette email — ALIGNÉE SUR LA DA DU SITE (app/globals.css, 2026-06-12) :
// magenta --hm-primary #b13f74 (CTA/accents), violet --hm-text-main #2D2340
// (titres), gris violacé pour les textes secondaires. Plus de doré.
const C = {
  page:    "#f6f4f7",
  card:    "#ffffff",
  border:  "#ece8ef",
  heading: "#2D2340",
  body:    "#4b4257",
  muted:   "#8a8198",
  faint:   "#a59cb0",
  accent:  "#b13f74",
};

// ─── Resend client (lazy — évite l'import au build) ──────────────────────────

type MailArgs = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Transport email partagé.
 * - Si SMTP_HOST + SMTP_USER + SMTP_PASSWORD sont définis → envoi via SMTP
 *   (ex. Titan / contact@hm-global.fr). Chemin recommandé en prod.
 * - Sinon → repli sur Resend (RESEND_API_KEY).
 * Renvoie `{ error }` — compatible avec l'interface `resend.emails.send()`.
 */
export async function sendEmail(args: MailArgs): Promise<{ error: { message: string } | null }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    try {
      const { createTransport } = await import("nodemailer");
      const port = Number(process.env.SMTP_PORT ?? "465");
      const transporter = createTransport({
        host,
        port,
        secure: port === 465, // 465 = SSL implicite · 587 = STARTTLS
        auth: { user, pass },
      });
      await transporter.sendMail({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        replyTo: args.replyTo,
      });
      return { error: null };
    } catch (err) {
      console.error("[email] SMTP send failed:", err);
      return { error: { message: err instanceof Error ? err.message : String(err) } };
    }
  }

  // ── Repli Resend ──────────────────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { error: { message: "Aucun transport email configuré (SMTP_* ou RESEND_API_KEY)" } };
  }
  const { Resend } = await import("resend");
  const { error } = await new Resend(apiKey).emails.send({
    from: args.from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    replyTo: args.replyTo,
  });
  return { error: error ? { message: error.message } : null };
}

/** Conserve l'interface `resend.emails.send()` utilisée par les fonctions ci-dessous. */
async function getResend() {
  return { emails: { send: sendEmail } };
}

// ─── Guard ────────────────────────────────────────────────────────────────────

function getFromEmail(): string {
  // Priorité au compte SMTP Titan (EMAIL_FROM ou l'adresse du compte),
  // repli sur RESEND_FROM_EMAIL.
  const fromAddr =
    process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? process.env.RESEND_FROM_EMAIL;
  if (!fromAddr) {
    throw new Error("EMAIL_FROM / SMTP_USER / RESEND_FROM_EMAIL non configuré");
  }
  // Si l'adresse contient déjà « Nom <...> », on la garde telle quelle.
  return fromAddr.includes("<") ? fromAddr : `${FROM_NAME} <${fromAddr}>`;
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

// ─── Bouton « bulletproof » (rendu fiable Gmail/Outlook) ─────────────────────

function button(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0">
    <tr><td align="center" bgcolor="${C.accent}" style="border-radius:6px">
      <a href="${href}" target="_blank"
         style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px">${label}</a>
    </td></tr>
  </table>`;
}

// ─── Layout HTML partagé (table-based, thème clair) ──────────────────────────

function baseLayout(content: string, title: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page};font-size:1px;line-height:1px">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${C.page}">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:${C.card};border:1px solid ${C.border};border-radius:10px;overflow:hidden">
          <!-- En-tête : logo -->
          <tr>
            <td align="center" style="padding:36px 32px 20px">
              <img src="${LOGO_URL}" alt="HM Global Agence" width="210" style="display:block;width:210px;max-width:60%;height:auto;border:0;outline:none;text-decoration:none" />
            </td>
          </tr>
          <tr><td style="padding:0 32px"><div style="height:1px;background:linear-gradient(90deg,transparent,${C.accent}55,transparent)"></div></td></tr>
          <!-- Contenu -->
          <tr>
            <td style="padding:28px 32px 8px;color:${C.body};font-size:15px;line-height:1.7">
              ${content}
            </td>
          </tr>
          <!-- Pied -->
          <tr>
            <td style="padding:24px 32px 32px;border-top:1px solid ${C.border}">
              <p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:${C.muted}">
                <strong style="color:${C.heading}">HM Global Agence</strong> — Atelier de personnalisation textile &amp; impression<br/>
                Souffelweyersheim, Alsace · Un savoir-faire local depuis 2018
              </p>
              <p style="margin:0;font-size:12px;line-height:1.7;color:${C.faint}">
                Une question ? Écrivez-nous à <a href="mailto:${REPLY_TO}" style="color:${C.accent};text-decoration:none">${REPLY_TO}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Styles inline réutilisables pour le contenu
const H2   = `margin:0 0 14px;font-size:21px;font-weight:700;color:${C.heading}`;
const P    = `margin:10px 0;font-size:15px;line-height:1.7;color:${C.body}`;
const SUB  = `margin:10px 0;font-size:14px;line-height:1.6;color:${C.muted}`;
const SIGN = `margin:18px 0 4px;font-size:14px;color:${C.muted}`;

// ─── 1. Confirmation de paiement ─────────────────────────────────────────────
// Déclencheur : webhook payment_intent.succeeded

export async function sendConfirmationPaiement(order: Order) {
  const to = getRecipientEmail(order, "sendConfirmationPaiement");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const html = baseLayout(
    `<h2 style="${H2}">Merci, votre paiement est confirmé ✓</h2>
     <p style="${P}">Bonjour ${order.user.firstName},</p>
     <p style="${P}">Merci pour votre confiance. Nous avons bien reçu votre paiement de <strong style="color:${C.accent}">${order.totalTTC.toFixed(2)} €</strong> pour la commande <strong>#${order.orderNumber}</strong>.</p>
     <p style="${P}">Notre atelier alsacien prend le relais : nous vérifions votre visuel avec soin et reviendrons vers vous si le moindre ajustement est nécessaire avant le lancement en production.</p>
     ${button(`${SITE_URL}/mon-compte/commandes/${order.id}`, "Suivre ma commande")}
     <p style="${SIGN}">À très vite,<br/>${SIGNATURE}</p>`,
    "Paiement reçu — HM Global Agence",
    `Merci ! Votre paiement de ${order.totalTTC.toFixed(2)} € pour la commande #${order.orderNumber} est confirmé.`
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Votre paiement est confirmé — Commande #${order.orderNumber}`,
    html,
  });
}

// ─── 1 bis. Instructions de virement ─────────────────────────────────────────
// Déclencheur : create-bank-transfer (commande awaiting_bank_transfer)

export async function sendInstructionsVirement(
  order: Order,
  bank: { beneficiary: string; iban: string; bic: string },
) {
  const to = getRecipientEmail(order, "sendInstructionsVirement");
  if (!to) return null;

  const resend = await getResend();
  const from = getFromEmail();

  const row = (label: string, value: string, mono = false) =>
    `<tr>
       <td style="padding:11px 14px;background:${C.page};font-size:13px;color:${C.muted};width:42%;border-bottom:1px solid ${C.border}">${label}</td>
       <td style="padding:11px 14px;font-size:14px;font-weight:700;color:${C.heading};border-bottom:1px solid ${C.border}${mono ? ";font-family:'Courier New',monospace;letter-spacing:0.5px" : ""}">${value}</td>
     </tr>`;

  const html = baseLayout(
    `<h2 style="${H2}">Votre commande est enregistrée ✓</h2>
     <p style="${P}">Bonjour ${order.user.firstName},</p>
     <p style="${P}">Merci pour votre commande <strong>#${order.orderNumber}</strong>. Pour la lancer, il vous suffit d'effectuer un virement avec les coordonnées ci-dessous.</p>
     <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0;border:1px solid ${C.border};border-radius:8px;overflow:hidden">
       ${row("Bénéficiaire", bank.beneficiary)}
       ${row("IBAN", bank.iban, true)}
       ${row("BIC", bank.bic, true)}
       ${row("Montant", `${order.totalTTC.toFixed(2)} €`)}
       <tr>
         <td style="padding:11px 14px;background:${C.page};font-size:13px;color:${C.muted};width:42%">Référence à indiquer</td>
         <td style="padding:11px 14px;font-size:14px;font-weight:700;color:${C.accent}">${order.orderNumber}</td>
       </tr>
     </table>
     <p style="${SUB}">⚠️ Indiquez bien la référence <strong>${order.orderNumber}</strong> dans le motif du virement : c'est ce qui nous permet d'identifier votre paiement. Votre commande démarre dès réception.</p>
     ${button(`${SITE_URL}/mon-compte/commandes/${order.id}`, "Voir ma commande")}
     <p style="${SIGN}">À très vite,<br/>${SIGNATURE}</p>`,
    "Instructions de virement — HM Global Agence",
    `Réglez votre commande #${order.orderNumber} (${order.totalTTC.toFixed(2)} €) par virement.`,
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Instructions de virement — Commande #${order.orderNumber}`,
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
    `<h2 style="${H2}">Votre visuel a besoin d'un petit ajustement</h2>
     <p style="${P}">Bonjour ${order.user.firstName},</p>
     <p style="${P}">Avant de lancer la fabrication de votre commande <strong>#${order.orderNumber}</strong>, notre atelier a repéré un point à corriger sur votre fichier pour garantir un rendu impeccable :</p>
     <p style="margin:16px 0;padding:14px 16px;background:#faf0f6;border-left:3px solid ${C.accent};border-radius:4px;color:#6b4259;font-size:14px;line-height:1.6">${reason}</p>
     <p style="${P}">Déposez votre fichier corrigé en un clic — on s'occupe du reste.</p>
     ${button(`${SITE_URL}/mon-compte/commandes/${order.id}`, "Déposer mon fichier")}
     <p style="margin:8px 0;font-size:13px;color:${C.faint}">Formats acceptés : PDF, PNG, SVG, AI — jusqu'à 50 Mo. Un doute sur votre fichier ? Répondez à cet email, on vous guide.</p>
     <p style="${SIGN}">${SIGNATURE}</p>`,
    "Votre fichier a besoin d'un ajustement — HM Global Agence",
    `Un petit ajustement est nécessaire sur le visuel de votre commande #${order.orderNumber}.`
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Action requise : votre visuel — Commande #${order.orderNumber}`,
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
    `<h2 style="${H2}">C'est parti — votre commande est en fabrication 🎨</h2>
     <p style="${P}">Bonjour ${order.user.firstName},</p>
     <p style="${P}">Bonne nouvelle : votre visuel est validé et votre commande <strong>#${order.orderNumber}</strong> est désormais en fabrication dans notre atelier.</p>
     <p style="${SUB}">Nos équipes y apportent le plus grand soin. Vous recevrez un email dès qu'elle sera expédiée.</p>
     ${button(`${SITE_URL}/mon-compte/commandes/${order.id}`, "Voir ma commande")}
     <p style="${SIGN}">${SIGNATURE}</p>`,
    "Commande en fabrication — HM Global Agence",
    `Votre visuel est validé : la commande #${order.orderNumber} part en fabrication.`
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Votre commande est en fabrication — #${order.orderNumber}`,
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
    ? `<p style="${P}">Votre numéro de suivi : <strong style="color:${C.accent}">${order.trackingNumber}</strong></p>`
    : "";

  const html = baseLayout(
    `<h2 style="${H2}">Votre commande est en route 🚚</h2>
     <p style="${P}">Bonjour ${order.user.firstName},</p>
     <p style="${P}">Votre commande <strong>#${order.orderNumber}</strong> vient de quitter notre atelier et arrive bientôt chez vous.</p>
     ${trackingBlock}
     ${button(`${SITE_URL}/mon-compte/commandes/${order.id}`, "Suivre ma commande")}
     <p style="${SIGN}">Merci encore pour votre confiance,<br/>${SIGNATURE}</p>`,
    "Commande expédiée — HM Global Agence",
    `Votre commande #${order.orderNumber} vient d'être expédiée.`
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Votre commande est en route — #${order.orderNumber}`,
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
    `<h2 style="${H2}">Votre commande a été annulée</h2>
     <p style="${P}">Bonjour ${order.user.firstName},</p>
     <p style="${P}">Votre commande <strong>#${order.orderNumber}</strong> a bien été annulée.</p>
     <p style="${P}">Un remboursement de <strong style="color:${C.accent}">${order.totalTTC.toFixed(2)} €</strong> sera traité sous 5 à 10 jours ouvrés sur votre moyen de paiement d'origine.</p>
     <p style="${SUB}">Un imprévu, une question, ou l'envie de relancer votre projet ? Écrivez-nous à <a href="mailto:${REPLY_TO}" style="color:${C.accent};text-decoration:none">${REPLY_TO}</a>, nous serons ravis de vous accompagner.</p>
     <p style="${SIGN}">${SIGNATURE}</p>`,
    "Commande annulée — HM Global Agence",
    `Votre commande #${order.orderNumber} a été annulée et remboursée.`
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
    ? button(order.invoiceUrl, "Télécharger ma facture")
    : button(`${SITE_URL}/mon-compte/factures`, "Voir mes factures");

  const html = baseLayout(
    `<h2 style="${H2}">Votre facture est disponible</h2>
     <p style="${P}">Bonjour ${order.user.firstName},</p>
     <p style="${P}">La facture de votre commande <strong>#${order.orderNumber}</strong> est désormais disponible dans votre espace client.</p>
     ${downloadBtn}
     <p style="${SIGN}">${SIGNATURE}</p>`,
    "Facture disponible — HM Global Agence",
    `La facture de votre commande #${order.orderNumber} est disponible.`
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Votre facture est disponible — Commande #${order.orderNumber}`,
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
    `<h2 style="${H2}">Votre avis nous aiderait beaucoup</h2>
     <p style="${P}">Bonjour ${order.user.firstName},</p>
     <p style="${P}">Merci d'avoir fait confiance à notre atelier alsacien pour votre commande <strong>#${order.orderNumber}</strong>. Nous espérons que le résultat est à la hauteur !</p>
     <p style="${P}">Si vous avez 30 secondes, votre avis — <strong>bon comme moins bon</strong> — compte énormément pour nous, et il aide d'autres entreprises et associations de la région à nous trouver.</p>
     ${button(`${SITE_URL}/avis`, "Laisser un avis Google")}
     <p style="margin:8px 0;font-size:13px;color:${C.faint}">Un mot honnête sur la qualité, les délais ou le contact suffit largement. Un immense merci 🙏</p>
     <p style="${SIGN}">${SIGNATURE}</p>`,
    "Votre commande HM Global — un retour rapide ?",
    `Votre avis sur la commande #${order.orderNumber} nous aiderait beaucoup (30 secondes).`
  );

  return resend.emails.send({
    from,
    replyTo: REPLY_TO,
    to,
    subject: `Votre commande HM Global — un retour rapide ?`,
    html,
  });
}
