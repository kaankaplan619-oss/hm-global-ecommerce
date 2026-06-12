import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft, PackageSearch, AlertTriangle, RefreshCcw, Phone, Mail,
  Clock, ShieldCheck, FileQuestion, ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SAV & suivi de commande — HM Global Agence",
  description:
    "Un souci avec votre commande ? Suivi, fichier à corriger, article défectueux : le SAV HM Global répond sous 24 h ouvrées et réimprime en cas de défaut avéré.",
};

/**
 * Page SAV (demande Kaan 2026-06-12 : « au cas où c'est le client qui demande
 * un truc, il faudra mettre un SAV que j'ai oublié »).
 *
 * Volontairement simple et honnête : 3 situations → la bonne marche à suivre,
 * FAQ courte (produits personnalisés = règles spécifiques de rétractation),
 * contact direct. Pas de formulaire dédié en V1 — email + téléphone suffisent
 * et créent du contact humain (l'argument HM Global face aux pure players).
 */

const SITUATIONS = [
  {
    icon: PackageSearch,
    title: "Suivre ma commande",
    text: "Chaque étape est visible dans votre espace client : fichier vérifié, BAT, production, expédition (avec numéro de suivi).",
    cta: { label: "Voir mes commandes", href: "/mon-compte/commandes" },
  },
  {
    icon: AlertTriangle,
    title: "Un problème à la réception",
    text: "Article défectueux, marquage abîmé ou colis endommagé : envoyez-nous une photo et votre numéro de commande sous 14 jours. Réponse sous 24 h ouvrées.",
    cta: { label: "Signaler un problème", href: "mailto:contact@hmga.fr?subject=SAV%20—%20commande%20%23" },
  },
  {
    icon: RefreshCcw,
    title: "Défaut avéré = réimpression",
    text: "Si le défaut vient de la production (marquage, matière, erreur de référence), nous réimprimons ou remboursons. Sans débat.",
    cta: { label: "Nos engagements", href: "/engagements" },
  },
];

const FAQ = [
  {
    q: "Puis-je annuler ou modifier ma commande ?",
    a: "Oui, tant que le BAT n'est pas validé : contactez-nous immédiatement et nous bloquons la production. Après validation du BAT, la fabrication démarre — c'est précisément pour cela que nous le faisons valider.",
  },
  {
    q: "Ai-je un droit de rétractation sur un produit personnalisé ?",
    a: "Les articles personnalisés à votre logo sont confectionnés sur mesure : le droit de rétractation légal de 14 jours ne s'y applique pas (article L221-28 du Code de la consommation). En revanche, tout défaut de production est repris à nos frais.",
  },
  {
    q: "Mon fichier a été refusé, que faire ?",
    a: "Vous recevez un email expliquant précisément quoi corriger (résolution, fond, format). Déposez le nouveau fichier depuis votre espace client — et si vous bloquez, répondez à l'email : on prépare le fichier avec vous.",
  },
  {
    q: "Quel est le délai de livraison ?",
    a: "5 à 12 jours ouvrés après validation du BAT selon le produit (le délai exact est affiché sur chaque fiche produit et au panier). En cas de retard fournisseur, nous vous prévenons sans attendre.",
  },
  {
    q: "Le rendu peut-il différer de l'aperçu en ligne ?",
    a: "L'aperçu de l'atelier en ligne est indicatif. C'est le BAT que vous validez avant production qui fait foi — rien ne part en fabrication sans votre accord.",
  },
];

export default function SavPage() {
  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#e6e8ee] bg-white px-4 py-2 text-sm font-semibold text-[#3f2d58] shadow-[0_2px_8px_rgba(63,45,88,0.04)] transition-colors hover:border-[#c4c0cf] hover:text-[#7B4FA6]"
        >
          <ChevronLeft size={16} className="shrink-0" />
          Retour à l&apos;accueil
        </Link>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="mb-14 rounded-[2rem] border border-[var(--hm-line)] bg-[linear-gradient(180deg,rgba(248,249,251,0.95)_0%,rgba(255,255,255,1)_72%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="max-w-3xl">
            <p className="section-tag">SAV &amp; suivi de commande</p>
            <h1 className="mb-5 text-4xl font-semibold leading-tight tracking-tight text-[var(--hm-text)] md:text-5xl">
              Un souci, une question sur une commande&nbsp;? On s&apos;en occupe.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--hm-text-soft)]">
              Vous parlez à l&apos;atelier qui a produit votre commande, pas à un
              centre d&apos;appels. Réponse sous 24&nbsp;h ouvrées, et en cas de
              défaut de production avéré&nbsp;: réimpression ou remboursement.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: Clock, label: "Réponse sous 24 h ouvrées" },
                { icon: ShieldCheck, label: "Réimpression si défaut avéré" },
                { icon: Phone, label: "Un humain, à Souffelweyersheim" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-semibold"
                  style={{ color: "var(--hm-text-main)", border: "1px solid rgba(45,35,64,0.08)" }}
                >
                  <Icon size={13} style={{ color: "var(--hm-cyan)" }} strokeWidth={1.8} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3 situations ──────────────────────────────────────────────── */}
        <div className="mb-14 grid gap-5 md:grid-cols-3">
          {SITUATIONS.map(({ icon: Icon, title, text, cta }) => (
            <article key={title} className="flex flex-col rounded-[1.6rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_12px_30px_rgba(63,45,88,0.06)]">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--hm-accent-soft-rose)]">
                <Icon size={18} className="text-[var(--hm-primary)]" />
              </div>
              <h2 className="mb-2 text-base font-semibold text-[var(--hm-text)]">{title}</h2>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--hm-text-soft)]">{text}</p>
              <Link
                href={cta.href}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--hm-primary)] hover:underline"
              >
                {cta.label} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <div className="mb-14 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-purple)]">
                <FileQuestion size={16} className="text-[var(--hm-purple)]" />
              </div>
              <h2 className="text-lg font-semibold tracking-[-0.015em] text-[var(--hm-text)]">
                Questions fréquentes
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group rounded-2xl border border-[var(--hm-line)] bg-white px-5 py-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--hm-text)] marker:hidden">
                    {q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--hm-text-soft)]">{a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* ── Contact direct ───────────────────────────────────────────── */}
          <aside className="h-fit rounded-[1.6rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-6">
            <h2 className="mb-2 text-base font-semibold text-[var(--hm-text)]">Contact SAV direct</h2>
            <p className="mb-5 text-sm leading-relaxed text-[var(--hm-text-soft)]">
              Indiquez votre <strong>numéro de commande</strong> (#HM-…) et, si
              possible, une photo — on vous répond d&apos;autant plus vite.
            </p>
            <div className="flex flex-col gap-3">
              <a href="mailto:contact@hmga.fr?subject=SAV%20—%20commande%20%23" className="btn-primary justify-center gap-2 text-sm">
                <Mail size={15} /> Écrire au SAV
              </a>
              <a href="tel:+33676161188" className="btn-outline justify-center gap-2 text-sm">
                <Phone size={15} /> 06 76 16 11 88
              </a>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-[var(--hm-text-muted)]">
              Du lundi au vendredi, 9 h – 18 h · Atelier de Souffelweyersheim, Alsace.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
