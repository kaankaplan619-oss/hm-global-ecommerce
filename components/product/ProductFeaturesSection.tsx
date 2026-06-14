"use client";

import type { Product, Technique, ProductCategory } from "@/types";
import { Printer, Layers, Star, Tag, Leaf, Ruler, Shield, Sparkles } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

// ── Technique labels & descriptions ──────────────────────────────────────────
// Les valeurs sont des CLÉS de traduction résolues via t() dans le rendu.

const TECHNIQUE_LABELS: Record<Technique, string> = {
  dtf:                "features.technique.dtf.label",
  dtflex:             "features.technique.dtflex.label",
  flex:               "features.technique.flex.label",
  broderie:           "features.technique.broderie.label",
  broderie_illimitee: "features.technique.broderie_illimitee.label",
  print:              "features.technique.print.label",
};

const TECHNIQUE_DESC: Record<Technique, string> = {
  dtf:                "features.technique.dtf.desc",
  dtflex:             "features.technique.dtflex.desc",
  flex:               "features.technique.flex.desc",
  broderie:           "features.technique.broderie.desc",
  broderie_illimitee: "features.technique.broderie_illimitee.desc",
  print:              "features.technique.print.desc",
};

const TECHNIQUE_COLOR_CLASS: Record<Technique, string> = {
  dtf:                "bg-blue-50 text-blue-700 border-blue-200",
  dtflex:             "bg-purple-50 text-purple-700 border-purple-200",
  flex:               "bg-amber-50 text-amber-700 border-amber-200",
  broderie:           "bg-rose-50 text-rose-700 border-rose-200",
  broderie_illimitee: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  print:              "bg-gray-50 text-gray-700 border-gray-200",
};

// Emplacements par technique (Printful-style, enrichis) — CLÉS de traduction.
const PLACEMENTS_BY_TECHNIQUE: Record<Technique, string[]> = {
  dtf:                ["features.placement.coeur", "features.placement.dos", "features.placement.coeur_dos"],
  dtflex:             ["features.placement.coeur", "features.placement.dos", "features.placement.manche_gauche", "features.placement.manche_droite", "features.placement.etiquette_interieure"],
  flex:               ["features.placement.coeur", "features.placement.dos", "features.placement.coeur_dos"],
  broderie:           ["features.placement.coeur", "features.placement.dos", "features.placement.manche_gauche", "features.placement.manche_droite"],
  broderie_illimitee: ["features.placement.coeur", "features.placement.dos", "features.placement.manche_gauche"],
  print:              ["features.placement.recto", "features.placement.recto_verso"],
};

const PLACEMENT_LABELS_SIMPLE: Record<string, string> = {
  coeur:      "features.placement.coeur",
  dos:        "features.placement.dos",
  "coeur-dos": "features.placement.coeur_dos_rv",
};

// Wording non-vestimentaire : « poitrine gauche / manches » n'a pas de sens
// sur une casquette ou un sac. — CLÉS de traduction.
const OBJECT_PLACEMENT_LABELS: Record<string, string> = {
  coeur:      "features.placement.face_avant",
  dos:        "features.placement.dos_objet",
  "coeur-dos": "features.placement.avant_dos",
};

// Emplacements affichés pour une technique sur un produit donné :
// goodies → wording objet ; contrainte produit (techniqueConstraints) → liste
// réellement commandable ; casquettes/sacs → emplacements réels du produit ;
// sinon → liste indicative par technique (textile atelier).
// Retourne soit une CLÉ de traduction, soit un libellé brut (issu des données
// produit) ; le rendu résout les clés via t() et laisse les libellés tels quels.
function getDisplayedPlacements(product: Product, t: Technique): string[] {
  if (product.category === "goodies") {
    return [
      "features.goodies.placement.impression",
      "features.goodies.placement.zone",
      "features.goodies.placement.validation",
    ];
  }
  const constrained = product.techniqueConstraints?.[t]?.placements;
  if (constrained) {
    return constrained.map((p) => PLACEMENT_LABELS_SIMPLE[p] ?? p);
  }
  if (product.category === "casquettes" || product.category === "sacs") {
    return product.placements.map((p) => OBJECT_PLACEMENT_LABELS[p] ?? p);
  }
  return PLACEMENTS_BY_TECHNIQUE[t];
}

// ── Style & coupe par catégorie ───────────────────────────────────────────────

type StyleInfo = {
  lookTitle:  string;
  lookDesc:   string;
  coupeTitle: string;
  coupeDesc:  string;
  extraTitle: string;
  extraDesc:  string;
};

// Valeurs = CLÉS de traduction résolues via t() dans le rendu.
const STYLE_BY_CATEGORY: Record<ProductCategory, StyleInfo> = {
  tshirts: {
    lookTitle:  "features.style.tshirts.lookTitle",
    lookDesc:   "features.style.tshirts.lookDesc",
    coupeTitle: "features.style.tshirts.coupeTitle",
    coupeDesc:  "features.style.tshirts.coupeDesc",
    extraTitle: "features.style.tshirts.extraTitle",
    extraDesc:  "features.style.tshirts.extraDesc",
  },
  hoodies: {
    lookTitle:  "features.style.hoodies.lookTitle",
    lookDesc:   "features.style.hoodies.lookDesc",
    coupeTitle: "features.style.hoodies.coupeTitle",
    coupeDesc:  "features.style.hoodies.coupeDesc",
    extraTitle: "features.style.hoodies.extraTitle",
    extraDesc:  "features.style.hoodies.extraDesc",
  },
  softshells: {
    lookTitle:  "features.style.softshells.lookTitle",
    lookDesc:   "features.style.softshells.lookDesc",
    coupeTitle: "features.style.softshells.coupeTitle",
    coupeDesc:  "features.style.softshells.coupeDesc",
    extraTitle: "features.style.softshells.extraTitle",
    extraDesc:  "features.style.softshells.extraDesc",
  },
  polos: {
    lookTitle:  "features.style.polos.lookTitle",
    lookDesc:   "features.style.polos.lookDesc",
    coupeTitle: "features.style.polos.coupeTitle",
    coupeDesc:  "features.style.polos.coupeDesc",
    extraTitle: "features.style.polos.extraTitle",
    extraDesc:  "features.style.polos.extraDesc",
  },
  polaires: {
    lookTitle:  "features.style.polaires.lookTitle",
    lookDesc:   "features.style.polaires.lookDesc",
    coupeTitle: "features.style.polaires.coupeTitle",
    coupeDesc:  "features.style.polaires.coupeDesc",
    extraTitle: "features.style.polaires.extraTitle",
    extraDesc:  "features.style.polaires.extraDesc",
  },
  casquettes: {
    lookTitle:  "features.style.casquettes.lookTitle",
    lookDesc:   "features.style.casquettes.lookDesc",
    coupeTitle: "features.style.casquettes.coupeTitle",
    coupeDesc:  "features.style.casquettes.coupeDesc",
    extraTitle: "features.style.casquettes.extraTitle",
    extraDesc:  "features.style.casquettes.extraDesc",
  },
  sacs: {
    lookTitle:  "features.style.sacs.lookTitle",
    lookDesc:   "features.style.sacs.lookDesc",
    coupeTitle: "features.style.sacs.coupeTitle",
    coupeDesc:  "features.style.sacs.coupeDesc",
    extraTitle: "features.style.sacs.extraTitle",
    extraDesc:  "features.style.sacs.extraDesc",
  },
  // Fallback générique — chaque goodie (mug, sticker, dessous de verre…) doit
  // définir son propre product.styleInfo dans data/products.ts.
  goodies: {
    lookTitle:  "features.style.goodies.lookTitle",
    lookDesc:   "features.style.goodies.lookDesc",
    coupeTitle: "features.style.goodies.coupeTitle",
    coupeDesc:  "features.style.goodies.coupeDesc",
    extraTitle: "features.style.goodies.extraTitle",
    extraDesc:  "features.style.goodies.extraDesc",
  },
  enfants: {
    lookTitle:  "features.style.enfants.lookTitle",
    lookDesc:   "features.style.enfants.lookDesc",
    coupeTitle: "features.style.enfants.coupeTitle",
    coupeDesc:  "features.style.enfants.coupeDesc",
    extraTitle: "features.style.enfants.extraTitle",
    extraDesc:  "features.style.enfants.extraDesc",
  },
};

// ── Épaisseur & douceur par catégorie ────────────────────────────────────────
// Scale 0-100 pour les deux barres

type FabricScales = {
  epaisseur: number; // 0 = léger, 100 = très épais
  douceur:   number; // 0 = rêche, 100 = extra doux
};

const FABRIC_SCALES: Record<ProductCategory, FabricScales> = {
  tshirts:    { epaisseur: 55, douceur: 65 },
  hoodies:    { epaisseur: 75, douceur: 70 },
  softshells: { epaisseur: 80, douceur: 55 },
  polos:      { epaisseur: 50, douceur: 60 },
  polaires:   { epaisseur: 60, douceur: 85 },
  casquettes: { epaisseur: 65, douceur: 50 },
  sacs:       { epaisseur: 45, douceur: 55 },
  goodies:    { epaisseur: 90, douceur: 30 },  // céramique dense
  enfants:    { epaisseur: 40, douceur: 80 },
};

// ── Caractéristiques par catégorie ────────────────────────────────────────────
// Valeurs = CLÉS de traduction résolues via t() dans le rendu.

const FEATURES_BY_CATEGORY: Record<ProductCategory, string[]> = {
  tshirts:    ["features.list.tshirts.0", "features.list.tshirts.1", "features.list.tshirts.2", "features.list.tshirts.3", "features.list.tshirts.4"],
  hoodies:    ["features.list.hoodies.0", "features.list.hoodies.1", "features.list.hoodies.2", "features.list.hoodies.3", "features.list.hoodies.4"],
  softshells: ["features.list.softshells.0", "features.list.softshells.1", "features.list.softshells.2", "features.list.softshells.3", "features.list.softshells.4"],
  polos:      ["features.list.polos.0", "features.list.polos.1", "features.list.polos.2", "features.list.polos.3", "features.list.polos.4"],
  polaires:   ["features.list.polaires.0", "features.list.polaires.1", "features.list.polaires.2", "features.list.polaires.3", "features.list.polaires.4"],
  casquettes: ["features.list.casquettes.0", "features.list.casquettes.1", "features.list.casquettes.2", "features.list.casquettes.3", "features.list.casquettes.4"],
  sacs:       ["features.list.sacs.0", "features.list.sacs.1", "features.list.sacs.2", "features.list.sacs.3", "features.list.sacs.4"],
  // Fallback générique — chaque goodie doit définir product.featureHighlights dans data/products.ts.
  goodies:    ["features.list.goodies.0", "features.list.goodies.1", "features.list.goodies.2", "features.list.goodies.3", "features.list.goodies.4"],
  enfants:    ["features.list.enfants.0", "features.list.enfants.1", "features.list.enfants.2", "features.list.enfants.3", "features.list.enfants.4"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseGrams(w: string): number {
  const m = w.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

// Retourne une CLÉ de traduction (résolue via t() dans le rendu).
function weightLabelKey(g: number): string {
  if (g < 150) return "features.weight.tresLeger";
  if (g < 200) return "features.weight.legerMedium";
  if (g < 260) return "features.weight.epais";
  if (g < 320) return "features.weight.tresEpais";
  return "features.weight.lourd";
}

function weightPercent(g: number): number {
  return Math.min(100, Math.max(0, ((g - 100) / 300) * 100));
}

// Certifications fournisseur = données catalogue, non traduites.
const CERTS_BY_SUPPLIER: Record<string, string[]> = {
  "falk-ross": ["Oeko-Tex Standard 100", "REACH conforme"],
  "toptex":    ["Oeko-Tex Standard 100", "GOTS (coton bio certifié)"],
  "printful":  ["Responsibly sourced", "CPSIA compliant"],
};

// ── Scale bar component ───────────────────────────────────────────────────────

function ScaleBar({
  label, leftLabel, rightLabel, value,
}: { label: string; leftLabel: string; rightLabel: string; value: number }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold text-[var(--hm-text)]">{label}</p>
      <div className="relative h-1.5 rounded-full bg-[var(--hm-line)] overflow-hidden mb-1">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[var(--hm-primary)] to-[var(--hm-purple)]"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] text-[var(--hm-text-muted)]">{leftLabel}</span>
        <span className="text-[9px] text-[var(--hm-text-muted)]">{rightLabel}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  product: Product;
}

export default function ProductFeaturesSection({ product }: Props) {
  const t = useT();

  const style    = product.styleInfo ?? STYLE_BY_CATEGORY[product.category] ?? STYLE_BY_CATEGORY.tshirts;
  const scales   = FABRIC_SCALES[product.category]      ?? { epaisseur: 50, douceur: 60 };
  const features = product.featureHighlights ?? FEATURES_BY_CATEGORY[product.category] ?? [];
  const isGoodie = product.category === "goodies";
  const certs    = CERTS_BY_SUPPLIER[product.supplierName ?? ""] ?? ["Oeko-Tex Standard 100"];
  const grams    = parseGrams(product.weight);
  const wPct     = weightPercent(grams);
  const wLabel   = t(weightLabelKey(grams));

  // Résout une valeur : si c'est une clé de traduction "features.*", renvoie la
  // traduction ; sinon (libellé brut issu des données produit) renvoie tel quel.
  const resolve = (v: string) => (v.startsWith("features.") ? t(v) : v);

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg font-bold text-[var(--hm-text)] whitespace-nowrap">{t("features.section.title")}</h2>
        <div className="h-[1px] flex-1 bg-[var(--hm-line)]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* ── 1. Options de personnalisation ─────────────────────────────────── */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-rose)]">
              <Printer size={15} className="text-[var(--hm-rose)]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--hm-text)]">
              {t("features.card.customization")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {product.techniques.map((tech) => (
              <div key={tech} className={`rounded-xl border px-3 py-2.5 ${TECHNIQUE_COLOR_CLASS[tech]}`}>
                {/* Goodies : pas de DTF textile — impression pleine couleur (sublimation, vinyle…) */}
                <p className="text-[11px] font-bold leading-tight mb-1.5">
                  {isGoodie ? t("features.goodies.printTitle") : t(TECHNIQUE_LABELS[tech])}
                </p>
                <p className="text-[10px] leading-snug opacity-75 mb-2">
                  {isGoodie
                    ? t("features.goodies.printDesc")
                    : t(TECHNIQUE_DESC[tech])}
                </p>
                <div className="flex flex-col gap-0.5">
                  {getDisplayedPlacements(product, tech).map((pl) => (
                    <div key={pl} className="flex items-center gap-1.5 text-[10px] opacity-80">
                      <span className="text-[8px]">✓</span>
                      {resolve(pl)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Style et coupe ──────────────────────────────────────────────── */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-purple)]">
              <Ruler size={15} className="text-[var(--hm-purple)]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--hm-text)]">
              {t("features.card.style")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Look */}
            <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-3">
              <p className="text-[11px] font-bold text-[var(--hm-text)] mb-1">{resolve(style.lookTitle)}</p>
              <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">{resolve(style.lookDesc)}</p>
            </div>
            {/* Coupe */}
            <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-3">
              <p className="text-[11px] font-bold text-[var(--hm-text)] mb-1">{resolve(style.coupeTitle)}</p>
              <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">{resolve(style.coupeDesc)}</p>
            </div>
            {/* Extra */}
            <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-3">
              <p className="text-[11px] font-bold text-[var(--hm-text)] mb-1">{resolve(style.extraTitle)}</p>
              <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">{resolve(style.extraDesc)}</p>
            </div>
          </div>
        </div>

        {/* ── 3. Matériau ────────────────────────────────────────────────────── */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-blue)]">
              <Layers size={15} className="text-[var(--hm-primary)]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--hm-text)]">
              {t("features.card.material")}
            </p>
          </div>

          {/* Composition */}
          <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--hm-text-soft)] mb-1">{t("features.material.composition")}</p>
            <p className="text-[12px] font-bold text-[var(--hm-text)] leading-snug">{product.composition}</p>
            {grams > 0 && (
              <p className="text-[10px] text-[var(--hm-text-muted)] mt-0.5">
                {isGoodie ? product.weight : `${product.weight} · ${wLabel}`}
              </p>
            )}
          </div>

          {/* Scale bars — concepts textile, sans objet pour les goodies (céramique, vinyle…) */}
          {!isGoodie && (
            <div className="flex flex-col gap-3">
              {grams > 0 && (
                <ScaleBar
                  label={t("features.scale.thickness.label")}
                  leftLabel={t("features.scale.thickness.left")}
                  rightLabel={t("features.scale.thickness.right")}
                  value={wPct}
                />
              )}
              <ScaleBar
                label={t("features.scale.softness.label")}
                leftLabel={t("features.scale.softness.left")}
                rightLabel={t("features.scale.softness.right")}
                value={scales.douceur}
              />
            </div>
          )}

          {/* Certifications */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--hm-text-soft)]">
              {t("features.material.certifications")}
            </p>
            <div className="flex flex-col gap-1.5">
              {certs.map((c) => (
                <div key={c} className="flex items-center gap-2 text-[11px] text-[var(--hm-text-soft)]">
                  <Leaf size={10} className="text-green-500 shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. Caractéristiques ────────────────────────────────────────────── */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--hm-accent-soft-rose)]">
              <Star size={15} className="text-[var(--hm-rose)]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--hm-text)]">
              {t("features.card.features")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <Shield size={11} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
                <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">{resolve(f)}</p>
              </div>
            ))}
          </div>

          {/* Étiquette — non applicable aux goodies (mugs, objets) */}
          {product.category !== "goodies" && (
            <div className="mt-auto rounded-xl border border-[var(--hm-primary)]/20 bg-[var(--hm-accent-soft-rose)] px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1">
                <Tag size={11} className="text-[var(--hm-primary)] shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hm-primary)]">
                  {t("features.label.title")}
                </p>
              </div>
              <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">
                {product.category === "casquettes" || product.category === "sacs"
                  ? t("features.label.woven")
                  : t("features.label.removable")}
              </p>
            </div>
          )}

          {/* Sparkle — conseil marquage */}
          <div className="flex items-start gap-2">
            <Sparkles size={11} className="mt-0.5 shrink-0 text-[var(--hm-purple)]" />
            <p className="text-[10px] text-[var(--hm-text-soft)] leading-snug italic">
              {t("features.note.validation")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
