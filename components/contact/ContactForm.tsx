"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

/**
 * ContactForm — formulaire de contact public (demande Kaan 2026-06-13).
 *
 * L'adresse email n'est volontairement PAS affichée sur le site (anti-spam) :
 * le visiteur écrit ici, le message part directement vers la boîte HM Global
 * via /api/contact (Resend). Honeypot `website` caché contre les bots.
 */

const SUBJECTS = [
  "Textile personnalisé",
  "DTF, flex ou broderie",
  "Logo / identité visuelle",
  "Signalétique / print",
  "Autre demande",
];

const inputClass =
  "w-full rounded-xl border border-[var(--hm-line)] bg-white px-4 py-3 text-sm text-[var(--hm-text)] placeholder:text-[var(--hm-text-muted)] outline-none transition-colors focus:border-[rgba(177,63,116,0.4)] focus:ring-2 focus:ring-[rgba(177,63,116,0.12)]";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-[var(--hm-text)]";

export default function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      subject: data.get("subject"),
      message: data.get("message"),
      consent: data.get("consent") === "on",
      website: data.get("website"), // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(json.error || "L'envoi a échoué. Réessayez.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setErrorMsg("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl border border-[var(--hm-line)] bg-white p-8 text-center shadow-[0_18px_48px_rgba(63,45,88,0.08)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)]">
          <CheckCircle2 className="h-7 w-7 text-[var(--hm-rose)]" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--hm-text)]">Message envoyé, merci !</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--hm-text-soft)]">
          Nous revenons vers vous au plus vite, généralement sous 24 h ouvrées. Pour une demande
          urgente, vous pouvez aussi nous appeler au{" "}
          <a href="tel:+33676161188" className="font-semibold text-[var(--hm-rose)]">
            06 76 16 11 88
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-[var(--hm-rose)] underline-offset-4 hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[var(--hm-line)] bg-white p-7 shadow-[0_18px_48px_rgba(63,45,88,0.08)]"
    >
      <h2 className="mb-1 text-2xl font-semibold text-[var(--hm-text)]">Écrivez-nous</h2>
      <p className="mb-6 text-sm leading-6 text-[var(--hm-text-soft)]">
        Décrivez votre besoin en quelques lignes — nous vous répondons directement par email.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className={labelClass}>
            Nom / structure *
          </label>
          <input id="ct-name" name="name" type="text" required autoComplete="name" className={inputClass} placeholder="Votre nom ou société" />
        </div>
        <div>
          <label htmlFor="ct-email" className={labelClass}>
            Email *
          </label>
          <input id="ct-email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="vous@exemple.fr" />
        </div>
        <div>
          <label htmlFor="ct-phone" className={labelClass}>
            Téléphone <span className="font-normal text-[var(--hm-text-muted)]">(facultatif)</span>
          </label>
          <input id="ct-phone" name="phone" type="tel" autoComplete="tel" className={inputClass} placeholder="06 …" />
        </div>
        <div>
          <label htmlFor="ct-subject" className={labelClass}>
            Sujet
          </label>
          <select id="ct-subject" name="subject" defaultValue={defaultSubject ?? SUBJECTS[0]} className={inputClass}>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="ct-message" className={labelClass}>
          Votre message *
        </label>
        <textarea
          id="ct-message"
          name="message"
          required
          rows={5}
          className={`${inputClass} resize-y`}
          placeholder="Produit souhaité, quantité, technique, délai, et si vous avez déjà un logo prêt…"
        />
      </div>

      {/* Honeypot anti-bot — caché aux humains */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="ct-website">Ne pas remplir</label>
        <input id="ct-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="mt-5 flex items-start gap-3 text-[13px] leading-6 text-[var(--hm-text-soft)]">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--hm-rose)]" />
        <span>
          J&apos;accepte que mes informations soient utilisées pour traiter ma demande, conformément à la{" "}
          <Link href="/confidentialite" className="font-semibold text-[var(--hm-rose)] underline-offset-2 hover:underline">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {status === "error" && (
        <p className="mt-4 rounded-xl bg-[var(--hm-accent-soft-rose)] px-4 py-3 text-sm text-[var(--hm-rose-dark)]" role="alert">
          {errorMsg}
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-primary mt-6 w-full justify-center gap-2 sm:w-auto">
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi…
          </>
        ) : (
          <>
            Envoyer le message
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
