import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * POST /api/contact — message du formulaire de contact public.
 *
 * Demande Kaan 2026-06-13 : ne PAS exposer l'adresse email sur le site
 * (anti-spam). Le visiteur écrit dans un formulaire, le message arrive
 * directement dans la boîte HM Global via Resend. L'adresse n'est jamais
 * visible côté client.
 *
 * - Anti-bot : honeypot (`website`) + validation stricte.
 * - Reply-To = email du visiteur → on répond en un clic.
 * - Destinataire : CONTACT_TO_EMAIL (.env.local). Tant que le domaine hmga.fr
 *   n'est pas vérifié chez Resend, l'expéditeur reste le bac à sable Resend et
 *   le destinataire doit être l'adresse propriétaire du compte Resend.
 */

const SUBJECTS = [
  "Textile personnalisé",
  "DTF, flex ou broderie",
  "Logo / identité visuelle",
  "Signalétique / print",
  "Autre demande",
];

function clean(v: unknown, max = 4000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  // Anti email-bombing : envoi Resend déclenchable par un anonyme.
  const limited = rateLimit(req, { key: "contact", limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Honeypot — un bot remplit ce champ caché. On feint le succès.
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  // Anti-bot Turnstile (no-op tant que TURNSTILE_SECRET_KEY n'est pas configurée).
  const captcha = await verifyTurnstile(
    typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
    req,
  );
  if (!captcha.ok) {
    return NextResponse.json(
      { error: "Validation anti-robot échouée. Merci de réessayer." },
      { status: 400 },
    );
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160).toLowerCase();
  const phone = clean(body.phone, 40);
  const subject = clean(body.subject, 120);
  const message = clean(body.message, 4000);
  const consent = body.consent === true || body.consent === "true";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Merci de remplir votre nom, votre email et votre message." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Merci d'indiquer une adresse email valide." },
      { status: 400 }
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Votre message est un peu court — donnez-nous quelques détails." },
      { status: 400 }
    );
  }
  if (!consent) {
    return NextResponse.json(
      { error: "Merci d'accepter le traitement de vos données pour être recontacté." },
      { status: 400 }
    );
  }

  const subjectLabel = SUBJECTS.includes(subject) ? subject : "Contact";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[Contact] RESEND_API_KEY manquante");
    return NextResponse.json(
      { error: "Le service de messagerie est momentanément indisponible. Appelez-nous au 06 76 16 11 88." },
      { status: 503 }
    );
  }

  const fromAddr = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const toAddr = process.env.CONTACT_TO_EMAIL ?? "contact@hmga.fr";

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#2D2340;font-size:15px;line-height:1.7">
    <h2 style="margin:0 0 12px;font-size:19px;color:#2D2340">Nouveau message — ${esc(subjectLabel)}</h2>
    <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#4b4257">
      <tr><td style="padding:3px 12px 3px 0;color:#8a8198">Nom</td><td><strong>${esc(name)}</strong></td></tr>
      <tr><td style="padding:3px 12px 3px 0;color:#8a8198">Email</td><td><a href="mailto:${esc(email)}" style="color:#b13f74;text-decoration:none">${esc(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:3px 12px 3px 0;color:#8a8198">Téléphone</td><td>${esc(phone)}</td></tr>` : ""}
      <tr><td style="padding:3px 12px 3px 0;color:#8a8198">Sujet</td><td>${esc(subjectLabel)}</td></tr>
    </table>
    <div style="margin:16px 0;padding:14px 16px;background:#f6f4f7;border-left:3px solid #b13f74;border-radius:4px;white-space:pre-wrap">${esc(message)}</div>
    <p style="font-size:12px;color:#a59cb0;margin:8px 0 0">Envoyé depuis le formulaire de contact de hm-global.fr — répondez directement à cet email pour recontacter ${esc(name)}.</p>
  </div>`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `HM Global Agence <${fromAddr}>`,
      to: toAddr,
      replyTo: email,
      subject: `Contact — ${subjectLabel} — ${name}`,
      html,
    });

    if (error) {
      console.error("[Contact] Resend:", error);
      return NextResponse.json(
        { error: "L'envoi a échoué. Réessayez ou appelez-nous au 06 76 16 11 88." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Contact]", err);
    return NextResponse.json({ error: "Erreur serveur. Réessayez dans un instant." }, { status: 500 });
  }
}
