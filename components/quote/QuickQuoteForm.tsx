"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import TurnstileWidget, { isTurnstileEnabled } from "@/components/security/TurnstileWidget";

const NEED_OPTIONS = [
  { value: "tenues-entreprise", label: "Tenues entreprise" },
  { value: "restaurant-commerce", label: "Restaurant / commerce" },
  { value: "evenement-association", label: "Événement / association" },
  { value: "chantier-nettoyage", label: "Chantier / nettoyage" },
  { value: "marque-createur", label: "Marque / créateur" },
  { value: "erasmus-ecole", label: "Erasmus / école" },
  { value: "print-signaletique", label: "Print / signalétique" },
  { value: "autre", label: "Autre" },
];

const QUANTITY_OPTIONS = [
  { value: "5-10", label: "5-10" },
  { value: "10-25", label: "10-25" },
  { value: "25-50", label: "25-50" },
  { value: "50-plus", label: "50+" },
  { value: "unknown", label: "Je ne sais pas encore" },
];

const TECHNIQUE_OPTIONS = [
  { value: "unknown", label: "Je ne sais pas" },
  { value: "dtf", label: "DTF" },
  { value: "broderie", label: "Broderie" },
  { value: "flex", label: "Flex" },
  { value: "print", label: "Print" },
  { value: "autre", label: "Autre" },
];

type SubmitState =
  | { status: "idle"; message: "" }
  | { status: "loading"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export default function QuickQuoteForm({
  initialNeedType = "tenues-entreprise",
  initialProduct = "",
}: {
  initialNeedType?: string;
  initialProduct?: string;
}) {
  const [state, setState] = useState<SubmitState>({ status: "idle", message: "" });
  const [fileName, setFileName] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";

  const pagePath = useMemo(() => {
    if (typeof window === "undefined") return "/devis-rapide";
    return window.location.pathname + window.location.search;
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("pagePath", pagePath);

    // Anti-bot Turnstile — uniquement si activé (clé publique présente).
    if (isTurnstileEnabled() && !captchaToken) {
      setState({ status: "error", message: "Merci de valider le test anti-robot avant d'envoyer." });
      return;
    }
    formData.set("turnstileToken", captchaToken ?? "");

    setState({ status: "loading", message: "" });

    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "La demande n'a pas pu être envoyée.");
      }

      form.reset();
      setFileName("");
      setState({
        status: "success",
        message: "Votre demande a bien été envoyée. Nous revenons vers vous rapidement avec une proposition adaptée.",
      });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Une erreur est survenue. Merci de réessayer.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-5 shadow-[0_18px_48px_rgba(63,45,88,0.08)] sm:p-7">
      {isSuccess ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-green-600">
            <CheckCircle2 size={22} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--hm-text)]">Demande envoyée</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--hm-text-soft)]">{state.message}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom / entreprise" htmlFor="companyName" required>
              <input id="companyName" name="companyName" required autoComplete="organization" className="input w-full" placeholder="Votre nom ou société" />
            </Field>

            <Field label="Email" htmlFor="email" required>
              <input id="email" name="email" type="email" required autoComplete="email" className="input w-full" placeholder="vous@email.fr" />
            </Field>

            <Field label="Téléphone" htmlFor="phone">
              <input id="phone" name="phone" type="tel" autoComplete="tel" className="input w-full" placeholder="06 00 00 00 00" />
            </Field>

            <Field label="Type de besoin" htmlFor="needType" required>
              <select id="needType" name="needType" required className="input w-full" defaultValue={initialNeedType}>
                {NEED_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Quantité approximative" htmlFor="quantityRange" required>
              <select id="quantityRange" name="quantityRange" required className="input w-full">
                {QUANTITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Technique souhaitée" htmlFor="desiredTechnique" required>
              <select id="desiredTechnique" name="desiredTechnique" required className="input w-full">
                {TECHNIQUE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-4 grid gap-4">
            <Field label="Produit souhaité" htmlFor="desiredProduct">
              <input id="desiredProduct" name="desiredProduct" className="input w-full" defaultValue={initialProduct} placeholder="Ex : polos brodés, hoodies, cartes de visite..." />
            </Field>

            <Field label="Upload logo / fichier" htmlFor="file">
              <label htmlFor="file" className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-5 text-center transition hover:border-[var(--hm-primary)]">
                <UploadCloud size={22} className="mb-2 text-[var(--hm-primary)]" />
                <span className="text-sm font-semibold text-[var(--hm-text)]">
                  {fileName || "Ajouter un fichier"}
                </span>
                <span className="mt-1 text-[11px] text-[var(--hm-text-soft)]">PNG, JPG, SVG ou PDF · max 10 Mo</span>
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.pdf,image/png,image/jpeg,image/svg+xml,application/pdf"
                className="sr-only"
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
              />
            </Field>

            <Field label="Message libre" htmlFor="message">
              <textarea
                id="message"
                name="message"
                rows={5}
                className="input min-h-32 w-full resize-y py-3"
                placeholder="Décrivez votre besoin : type de textile, couleur, zones de marquage, délai souhaité, budget si vous l'avez..."
              />
            </Field>
          </div>

          {state.status === "error" && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </p>
          )}

          {/* Anti-bot Turnstile — invisible tant que la clé publique n'est pas posée */}
          <TurnstileWidget onToken={setCaptchaToken} className="mt-5" />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--hm-primary)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(177,63,116,0.30)] transition hover:bg-[var(--hm-rose-dark)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Envoi en cours
              </>
            ) : (
              <>
                Envoyer ma demande
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </>
      )}
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)]">
        {label}
        {required && <span className="text-[var(--hm-primary)]"> *</span>}
      </label>
      {children}
    </div>
  );
}
