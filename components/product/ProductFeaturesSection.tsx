import type { Product, Technique, ProductCategory } from "@/types";
import { Printer, Layers, Star, Tag, Leaf, Ruler, Shield, Sparkles } from "lucide-react";

// ── Technique labels & descriptions ──────────────────────────────────────────

const TECHNIQUE_LABELS: Record<Technique, string> = {
  dtf:                "Impression DTF",
  dtflex:             "DTFlex",
  flex:               "Flocage Flex",
  broderie:           "Broderie Standard",
  broderie_illimitee: "Broderie · Couleur illimitée",
  print:              "Impression",
};

const TECHNIQUE_DESC: Record<Technique, string> = {
  dtf:                "Couleurs vives, dégradés, visuels complexes. Rendu photo-réaliste.",
  dtflex:             "DTF sur film flex — toucher soyeux, très longue durée de vie.",
  flex:               "Logos simples, typographies, aplats de couleur. Très durable.",
  broderie:           "Finition premium en relief, jusqu'à 6 couleurs incluses.",
  broderie_illimitee: "Broderie en couleurs illimitées — aucun surcoût couleur.",
  print:              "Impression offset numérique haute résolution.",
};

const TECHNIQUE_COLOR_CLASS: Record<Technique, string> = {
  dtf:                "bg-blue-50 text-blue-700 border-blue-200",
  dtflex:             "bg-purple-50 text-purple-700 border-purple-200",
  flex:               "bg-amber-50 text-amber-700 border-amber-200",
  broderie:           "bg-rose-50 text-rose-700 border-rose-200",
  broderie_illimitee: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  print:              "bg-gray-50 text-gray-700 border-gray-200",
};

// Emplacements par technique (Printful-style, enrichis)
const PLACEMENTS_BY_TECHNIQUE: Record<Technique, string[]> = {
  dtf:                ["Cœur (poitrine gauche)", "Dos centré", "Cœur + Dos"],
  dtflex:             ["Cœur (poitrine gauche)", "Dos centré", "Manche gauche", "Manche droite", "Étiquette intérieure"],
  flex:               ["Cœur (poitrine gauche)", "Dos centré", "Cœur + Dos"],
  broderie:           ["Cœur (poitrine gauche)", "Dos centré", "Manche gauche", "Manche droite"],
  broderie_illimitee: ["Cœur (poitrine gauche)", "Dos centré", "Manche gauche"],
  print:              ["Recto", "Recto-verso"],
};

const PLACEMENT_LABELS_SIMPLE: Record<string, string> = {
  coeur:      "Cœur (poitrine gauche)",
  dos:        "Dos centré",
  "coeur-dos": "Cœur + Dos (recto/verso)",
};

// ── Style & coupe par catégorie ───────────────────────────────────────────────

type StyleInfo = {
  lookTitle:  string;
  lookDesc:   string;
  coupeTitle: string;
  coupeDesc:  string;
  extraTitle: string;
  extraDesc:  string;
};

const STYLE_BY_CATEGORY: Record<ProductCategory, StyleInfo> = {
  tshirts: {
    lookTitle:  "Look polyvalent",
    lookDesc:   "Coton épais qui donne une belle tenue sans être rigide, parfait pour tous les usages.",
    coupeTitle: "Coupe régulière",
    coupeDesc:  "Longueur standard, tissu qui s'adapte aux mouvements sans tirer.",
    extraTitle: "Construction tubulaire",
    extraDesc:  "Fabriqué d'une seule pièce de tissu, sans coutures latérales.",
  },
  hoodies: {
    lookTitle:  "Look streetwear",
    lookDesc:   "Coton épais et capuche structurée pour un rendu premium immédiat.",
    coupeTitle: "Coupe décontractée",
    coupeDesc:  "Silhouette ample confortable, épaules bien placées.",
    extraTitle: "Poche kangourou",
    extraDesc:  "Grande poche avant pour les mains, pratique et stylée.",
  },
  softshells: {
    lookTitle:  "Look technique premium",
    lookDesc:   "Tissu tricoté 3 couches, aspect professionnel et moderne.",
    coupeTitle: "Coupe ajustée (Slim fit)",
    coupeDesc:  "Silhouette affinée qui valorise la morphologie.",
    extraTitle: "Traitement déperlant",
    extraDesc:  "Résistant aux projections d'eau légères et au vent.",
  },
  polos: {
    lookTitle:  "Look professionnel",
    lookDesc:   "Col polo tricoté et finitions soignées pour un rendu corporate.",
    coupeTitle: "Coupe classique",
    coupeDesc:  "Ni trop ample ni trop ajusté, idéal pour le travail.",
    extraTitle: "Tissu respirant",
    extraDesc:  "Fil peigné pour un toucher doux et une bonne évacuation de l'humidité.",
  },
  polaires: {
    lookTitle:  "Look chaud & léger",
    lookDesc:   "Polaire microfibre pour une chaleur optimale sans alourdissement.",
    coupeTitle: "Coupe confort",
    coupeDesc:  "Espace suffisant pour se superposer sur un t-shirt.",
    extraTitle: "Anti-boulochage",
    extraDesc:  "Tissu traité pour garder son aspect neuf sur la durée.",
  },
  casquettes: {
    lookTitle:  "Profil structuré",
    lookDesc:   "Panneau avant rigide qui maintient parfaitement la forme.",
    coupeTitle: "Taille universelle",
    coupeDesc:  "Fermeture réglable à l'arrière pour s'adapter à toutes les têtes.",
    extraTitle: "Visière pré-courbée",
    extraDesc:  "Cambre parfait prêt à porter, sans besoin de formage.",
  },
  sacs: {
    lookTitle:  "Format généreux",
    lookDesc:   "Grande surface d'impression visible, impact visuel maximal.",
    coupeTitle: "Anses longues",
    coupeDesc:  "Portage épaule confortable, adapté à un usage quotidien.",
    extraTitle: "Fond plat renforcé",
    extraDesc:  "Tient debout seul, stable pour les courses ou les goodies.",
  },
  // Fallback générique — chaque goodie (mug, sticker, dessous de verre…) doit
  // définir son propre product.styleInfo dans data/products.ts.
  goodies: {
    lookTitle:  "Impression pleine couleur",
    lookDesc:   "Votre logo ou visuel imprimé en haute définition, couleurs éclatantes.",
    coupeTitle: "Format adapté à l'objet",
    coupeDesc:  "Dimensions et zone d'impression détaillées sur chaque fiche produit.",
    extraTitle: "Qualité durable",
    extraDesc:  "Matériaux sélectionnés pour un usage quotidien en entreprise.",
  },
  enfants: {
    lookTitle:  "Coupe enfant",
    lookDesc:   "Proportions adaptées pour un confort optimal de 3 à 14 ans.",
    coupeTitle: "Coupe régulière",
    coupeDesc:  "Ni trop ample ni trop étroit, laisse de la liberté de mouvement.",
    extraTitle: "Matières douces",
    extraDesc:  "Coton certifié Oeko-Tex, doux pour les peaux sensibles.",
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

const FEATURES_BY_CATEGORY: Record<ProductCategory, string[]> = {
  tshirts:    ["Coutures double-aiguille renforcées", "Col côtelé avec fil Lycra®", "Lavable en machine à 60°", "Certifié Oeko-Tex Standard 100", "Compatible tous types de marquage"],
  hoodies:    ["Poche kangourou double épaisseur", "Cordon de serrage en coton", "Poignets et bas côtelés 1×1", "Certifié Oeko-Tex Standard 100", "Lavable en machine à 40°"],
  softshells: ["3 couches : polyester / polaire / membrane", "Résistant au vent & déperlant DWR", "Doublure polaire intérieure 100 g", "2 poches zippées + poche intérieure", "Manchettes élastiques anti-froid"],
  polos:      ["Col polo tricoté sans couture", "Boutons nacre ton-sur-ton", "Tissu Jersey respirant", "Entretien facile 40°C", "Coutures épaule à épaule"],
  polaires:   ["100% polyester recyclé", "Traitement déperlant DWR", "Col zippé 1/4 ou intégral", "Résistant aux lavages intensifs", "Anti-boulochage longue durée"],
  casquettes: ["Bande de sueur intégrée absorbante", "Bouton supérieur tressé", "Visière pré-courbée 6 panneaux", "Fermeture réglable à scratch ou boucle", "Construction structurée haute tenue"],
  sacs:       ["Anses renforcées double couture", "Fond plat stable portage aisé", "Coton bio certifié GOTS", "Grande zone d'impression recto", "Résistant charges jusqu'à 10 kg"],
  // Fallback générique — chaque goodie doit définir product.featureHighlights dans data/products.ts.
  goodies:    ["Impression pleine couleur haute définition", "Matériaux qualité supérieure", "Visuel vérifié avant production", "Commande possible dès 1 pièce", "Production et expédition UE"],
  enfants:    ["Matières certifiées Oeko-Tex", "Coutures plates sans irritation", "Étiquette repositionnable", "Lavable à 40°C sans déformation", "Coupe adaptée de 3 à 12 ans"],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseGrams(w: string): number {
  const m = w.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function weightLabel(g: number): string {
  if (g < 150) return "Très léger";
  if (g < 200) return "Léger / Medium";
  if (g < 260) return "Épais";
  if (g < 320) return "Très épais";
  return "Lourd";
}

function weightPercent(g: number): number {
  return Math.min(100, Math.max(0, ((g - 100) / 300) * 100));
}

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
  const style    = product.styleInfo ?? STYLE_BY_CATEGORY[product.category] ?? STYLE_BY_CATEGORY.tshirts;
  const scales   = FABRIC_SCALES[product.category]      ?? { epaisseur: 50, douceur: 60 };
  const features = product.featureHighlights ?? FEATURES_BY_CATEGORY[product.category] ?? [];
  const isGoodie = product.category === "goodies";
  const certs    = CERTS_BY_SUPPLIER[product.supplierName ?? ""] ?? ["Oeko-Tex Standard 100"];
  const grams    = parseGrams(product.weight);
  const wPct     = weightPercent(grams);
  const wLabel   = weightLabel(grams);

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-lg font-bold text-[var(--hm-text)] whitespace-nowrap">Caractéristiques du produit</h2>
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
              Options de personnalisation
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {product.techniques.map((t) => (
              <div key={t} className={`rounded-xl border px-3 py-2.5 ${TECHNIQUE_COLOR_CLASS[t]}`}>
                {/* Goodies : pas de DTF textile — impression pleine couleur (sublimation, vinyle…) */}
                <p className="text-[11px] font-bold leading-tight mb-1.5">
                  {isGoodie ? "Impression pleine couleur" : TECHNIQUE_LABELS[t]}
                </p>
                <p className="text-[10px] leading-snug opacity-75 mb-2">
                  {isGoodie
                    ? "Impression haute définition de votre logo ou visuel, couleurs éclatantes et durables."
                    : TECHNIQUE_DESC[t]}
                </p>
                <div className="flex flex-col gap-0.5">
                  {(product.category === "goodies"
                    ? ["Impression logo ou visuel", "Zone personnalisable selon gabarit produit", "Validation du visuel avant production"]
                    : PLACEMENTS_BY_TECHNIQUE[t]
                  ).map((pl) => (
                    <div key={pl} className="flex items-center gap-1.5 text-[10px] opacity-80">
                      <span className="text-[8px]">✓</span>
                      {pl}
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
              Style et coupe
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Look */}
            <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-3">
              <p className="text-[11px] font-bold text-[var(--hm-text)] mb-1">{style.lookTitle}</p>
              <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">{style.lookDesc}</p>
            </div>
            {/* Coupe */}
            <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-3">
              <p className="text-[11px] font-bold text-[var(--hm-text)] mb-1">{style.coupeTitle}</p>
              <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">{style.coupeDesc}</p>
            </div>
            {/* Extra */}
            <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-3">
              <p className="text-[11px] font-bold text-[var(--hm-text)] mb-1">{style.extraTitle}</p>
              <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">{style.extraDesc}</p>
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
              Matériau
            </p>
          </div>

          {/* Composition */}
          <div className="rounded-xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--hm-text-soft)] mb-1">Composition</p>
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
                  label="Épaisseur du tissu"
                  leftLabel="Léger"
                  rightLabel="Lourd"
                  value={wPct}
                />
              )}
              <ScaleBar
                label="Échelle de douceur"
                leftLabel="Ferme"
                rightLabel="Extra doux"
                value={scales.douceur}
              />
            </div>
          )}

          {/* Certifications */}
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--hm-text-soft)]">
              Certifications
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
              Caractéristiques
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <Shield size={11} className="mt-0.5 shrink-0 text-[var(--hm-primary)]" />
                <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">{f}</p>
              </div>
            ))}
          </div>

          {/* Étiquette — non applicable aux goodies (mugs, objets) */}
          {product.category !== "goodies" && (
            <div className="mt-auto rounded-xl border border-[var(--hm-primary)]/20 bg-[var(--hm-accent-soft-rose)] px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1">
                <Tag size={11} className="text-[var(--hm-primary)] shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hm-primary)]">
                  Étiquette détachable
                </p>
              </div>
              <p className="text-[11px] text-[var(--hm-text-soft)] leading-snug">
                {product.category === "casquettes" || product.category === "sacs"
                  ? "Étiquette tissée permanente."
                  : "Étiquette repositionnable retirable — idéal pour ajouter votre propre étiquette intérieure personnalisée."}
              </p>
            </div>
          )}

          {/* Sparkle — conseil marquage */}
          <div className="flex items-start gap-2">
            <Sparkles size={11} className="mt-0.5 shrink-0 text-[var(--hm-purple)]" />
            <p className="text-[10px] text-[var(--hm-text-soft)] leading-snug italic">
              HM Global valide chaque fichier avant production pour garantir un rendu parfait.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
