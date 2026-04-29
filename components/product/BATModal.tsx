"use client";

/**
 * BATModal — modal de prévisualisation BAT imprimable (V2).
 *
 * Améliorations V2 :
 * - Badge statut "À VALIDER" dans l'en-tête
 * - Section logo enrichie : source URL (Supabase / blob local / aucun)
 * - Section "Position logo" (si logoTransform Fabric.js disponible)
 * - Mention légale obligatoire claire dans les avertissements et la validation
 * - Rendu via createPortal → @media print fonctionne dans globals.css
 */

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Printer, FileCheck, CheckCircle2 } from "lucide-react";
import BATPreviewCard from "@/components/product/BATPreviewCard";
import {
  type BATData,
  TECHNIQUE_LABELS,
  PLACEMENT_LABELS,
  LOGO_EFFECT_LABELS,
  CATEGORY_LABELS,
  SUPPLIER_LABELS,
} from "@/lib/bat-utils";

// ── Row du tableau de données ──────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-1.5 pr-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400 align-top whitespace-nowrap w-40">
        {label}
      </td>
      <td className="py-1.5 text-[12px] text-gray-800 font-medium">{value}</td>
    </tr>
  );
}

// ── Section bloc ──────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[var(--hm-primary,#b13f74)]">
        {title}
      </p>
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-1">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Détermine la source lisible de l'URL logo. */
function getLogoUrlSource(logoUrl: string | null): string | undefined {
  if (!logoUrl) return undefined;
  if (logoUrl.startsWith("blob:"))  return "Fichier local (aperçu session)";
  if (logoUrl.startsWith("https:")) return "URL Supabase — stable ✓";
  return "URL distante";
}

// ── BATModal ──────────────────────────────────────────────────────────────────
interface Props {
  bat:     BATData;
  onClose: () => void;
}

export default function BATModal({ bat, onClose }: Props) {
  // createPortal requiert document côté client
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Fermeture sur Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Blocage du scroll body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handlePrint = useCallback(() => { window.print(); }, []);

  if (!mounted) return null;

  const logoUrlSource = getLogoUrlSource(bat.logoUrl);
  const hasTransform  = !!bat.logoTransform;

  const content = (
    <div id="bat-print-root" className="bat-print-root">

      {/* ── Fond overlay (masqué à l'impression) ── */}
      <div
        className="no-print fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Panneau scrollable ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bon à Tirer"
        className="fixed inset-x-4 bottom-4 top-4 z-[9999] mx-auto flex max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl
                   sm:inset-x-8 sm:bottom-8 sm:top-8"
      >
        {/* ── Header (no-print) ── */}
        <div className="no-print flex shrink-0 items-center justify-between border-b border-[var(--hm-line,#ede8f4)] bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-rose,#fdf2f7)]">
              <FileCheck size={18} className="text-[var(--hm-primary,#b13f74)]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--hm-text-soft,#8b7a9a)]">
                Aperçu
              </p>
              <h2 className="text-sm font-black text-[var(--hm-text,#1a1225)]">
                Bon à Tirer
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-[var(--hm-primary,#b13f74)] px-4 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
            >
              <Printer size={14} />
              Imprimer / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--hm-line,#ede8f4)] text-[var(--hm-text-soft,#8b7a9a)] transition-colors hover:bg-gray-50"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Corps scrollable ── */}
        <div className="bat-body flex-1 overflow-y-auto px-6 pb-8 pt-6">

          {/* === CONTENU IMPRIMABLE === */}
          <div className="bat-content">

            {/* ── En-tête BAT ─────────────────────────────────────────────── */}
            <div className="bat-header mb-6 flex items-start justify-between border-b-2 border-[var(--hm-primary,#b13f74)] pb-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--hm-primary,#b13f74)]">
                  HM Global Agence
                </p>
                <h1 className="mt-0.5 text-xl font-black text-gray-900">
                  Bon à Tirer
                </h1>
                <p className="mt-0.5 text-[11px] text-gray-400">Réf. {bat.batRef}</p>
                {/* Badge statut */}
                <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  À valider
                </span>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-400">Généré le</p>
                <p className="text-sm font-bold text-gray-800">{bat.generatedAt}</p>
              </div>
            </div>

            {/* ── Grid : données + aperçu ──────────────────────────────────── */}
            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_200px]">

              {/* ── Colonne données ── */}
              <div>

                {/* Produit */}
                <Section title="Produit">
                  <Row label="Nom"         value={bat.productName} />
                  <Row label="Référence"   value={bat.productReference} />
                  <Row label="Catégorie"   value={CATEGORY_LABELS[bat.productCategory] ?? bat.productCategory} />
                  <Row label="Marque"      value={bat.supplierName ? SUPPLIER_LABELS[bat.supplierName] ?? bat.supplierName : undefined} />
                  <Row label="Composition" value={bat.composition} />
                  <Row label="Grammage"    value={bat.weight} />
                </Section>

                {/* Configuration */}
                <Section title="Personnalisation">
                  <Row label="Couleur"     value={bat.color ? `${bat.color.label} (${bat.color.id})` : "—"} />
                  <Row label="Taille"      value={bat.size || "—"} />
                  <Row label="Quantité"    value={bat.quantity} />
                  <Row label="Technique"   value={TECHNIQUE_LABELS[bat.technique]} />
                  <Row label="Emplacement" value={PLACEMENT_LABELS[bat.placement]} />
                </Section>

                {/* Logo */}
                <Section title="Logo & visuel">
                  <Row label="Fichier"     value={bat.logoFileName ?? "Aucun logo"} />
                  <Row label="Effet"       value={bat.logoFileName ? LOGO_EFFECT_LABELS[bat.logoEffect] : undefined} />
                  <Row label="Source URL"  value={logoUrlSource} />
                </Section>

                {/* Position Fabric.js — affiché uniquement si logoTransform disponible */}
                {hasTransform && (
                  <Section title="Position logo enregistrée">
                    <Row
                      label="Centre (X / Y)"
                      value={`${Math.round(bat.logoTransform!.left)} px / ${Math.round(bat.logoTransform!.top)} px`}
                    />
                    <Row
                      label="Échelle"
                      value={`${(bat.logoTransform!.scaleX * 100).toFixed(0)} %`}
                    />
                    <Row
                      label="Canevas"
                      value={`${bat.logoTransform!.canvasSize} × ${bat.logoTransform!.canvasSize} px`}
                    />
                    <Row
                      label="Source"
                      value="Fabric.js — position capturée après drag/resize"
                    />
                  </Section>
                )}

              </div>

              {/* ── Aperçu visuel ── */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--hm-primary,#b13f74)]">
                  Aperçu visuel
                </p>
                {bat.imageUrl ? (
                  <BATPreviewCard
                    imageUrl={bat.imageUrl}
                    logoUrl={bat.logoUrl}
                    placement={bat.placement}
                    category={bat.productCategory}
                    logoEffect={bat.logoEffect}
                    productName={bat.productName}
                    size="compact"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 text-[11px] text-gray-400">
                    Pas d&apos;image
                  </div>
                )}
                {bat.color && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <div
                      className="h-4 w-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: bat.color.hex }}
                    />
                    <span className="text-[11px] text-gray-500">{bat.color.label}</span>
                  </div>
                )}
                {/* Indication aperçu (sans transform) */}
                {!hasTransform && bat.logoFileName && (
                  <p className="text-[10px] leading-tight text-gray-400">
                    Position indicative — basée sur le type d&apos;emplacement.
                  </p>
                )}
                {/* Indication aperçu (avec transform Fabric.js) */}
                {hasTransform && (
                  <p className="text-[10px] leading-tight text-green-600 flex items-start gap-1">
                    <CheckCircle2 size={11} className="mt-0.5 shrink-0" />
                    Position Fabric.js capturée
                  </p>
                )}
              </div>

            </div>
            {/* /grid */}

            {/* ── Mentions importantes ──────────────────────────────────────── */}
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="mb-1.5 text-[11px] font-bold text-amber-800">
                ⚠ BAT à vérifier par le client avant production. Toute validation vaut accord pour impression / personnalisation.
              </p>
              <ul className="space-y-0.5">
                <li className="text-[11px] text-amber-700">
                  • La position du logo est indicative — le positionnement exact est confirmé avant impression.
                </li>
                <li className="text-[11px] text-amber-700">
                  • Les couleurs à l&apos;écran peuvent différer légèrement du rendu final selon le support et la technique de marquage.
                </li>
                <li className="text-[11px] text-amber-700">
                  • Vérifiez la lisibilité du logo, les proportions, la technique choisie et l&apos;emplacement avant de signer.
                </li>
              </ul>
            </div>

            {/* ── Bloc validation client ────────────────────────────────────── */}
            <div className="validation-block rounded-xl border-2 border-gray-200 p-5">
              <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                Validation client — Bon pour accord
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">Nom / Société</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">Date</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
                <div className="col-span-2">
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">Signature</p>
                  <div className="h-16 border-b border-gray-300" />
                </div>
                <div className="col-span-2">
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">Bon pour accord</p>
                  <div className="h-8 border-b border-gray-300" />
                </div>
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-gray-400">
                BAT à vérifier par le client avant production. Toute validation vaut accord pour impression/personnalisation.
                En signant ce document, le client confirme avoir vérifié et approuvé le visuel, les couleurs, les textes et
                le positionnement du logo. HM Global Agence ne pourra être tenu responsable des erreurs non signalées avant production.
              </p>
            </div>

            {/* ── Pied de page ─────────────────────────────────────────────── */}
            <p className="mt-4 text-center text-[9px] text-gray-300">
              HM Global Agence · hmglobal.fr · BAT V2 · {bat.batRef}
            </p>

          </div>
          {/* /bat-content */}

        </div>
        {/* /corps */}

      </div>
      {/* /panneau */}

    </div>
  );

  return createPortal(content, document.body);
}
