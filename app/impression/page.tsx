import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Image as ImageIcon, CreditCard, Frame, BookOpen, Palette, ShieldCheck, Brush, Package, MapPin } from "lucide-react";
import { getGelatoProducts, isGelatoConfigured } from "@/lib/gelato";
import PrintImageStage, { type PrintFamily } from "@/components/print/PrintImageStage";
import PrintCardThumbnail, { type PrintThumbnailFamily } from "@/components/print/PrintCardThumbnail";
import { getMockupsByFamily, resolveMockupFamily } from "@/data/printMockupTemplates";

export const metadata: Metadata = {
  title: "Impression — Cartes de visite, Flyers, Affiches",
  description:
    "Imprimez vos cartes de visite, flyers, affiches et posters en ligne. Qualité professionnelle, livraison rapide partout en France.",
};

// ─── Config catégories ────────────────────────────────────────────────────────

const PRINT_CATEGORIES = [
  {
    uid:         "business-cards",
    label:       "Cartes de visite",
    description: "Papier 350 g/m², finition mate ou brillante, coins arrondis disponibles.",
    icon:        CreditCard,
    iconBg:      "bg-[var(--hm-accent-soft-blue)]",
    iconColor:   "text-[var(--hm-blue)]",
    tag:         "Le basique premium",
  },
  {
    uid:         "flyer",
    label:       "Flyers",
    description: "A4, A5 ou A6 — papier couché 170 g/m², impression recto ou recto-verso.",
    icon:        FileText,
    iconBg:      "bg-[var(--hm-accent-soft-purple)]",
    iconColor:   "text-[var(--hm-purple)]",
    tag:         "Diffusion terrain",
  },
  {
    uid:         "poster",
    label:       "Affiches & posters",
    description: "Du 30×40 cm au 50×70 cm, papier 200 g/m² non couché, impression 4/0.",
    icon:        ImageIcon,
    iconBg:      "bg-[var(--hm-accent-soft-rose)]",
    iconColor:   "text-[var(--hm-rose)]",
    tag:         "Grand format",
  },
  {
    uid:         "canvas",
    label:       "Toiles canvas",
    description: "Impression sur toile tendue, cadre bois FSC, format carré ou panoramique.",
    icon:        Frame,
    iconBg:      "bg-[var(--hm-accent-soft-purple)]",
    iconColor:   "text-[var(--hm-purple)]",
    tag:         "Décoration & signalétique",
  },
  {
    uid:         "cards",
    label:       "Cartes & invitations",
    description: "A6 ou carré, 350 g/m² couché satiné, option dorure ou protection brillante.",
    icon:        BookOpen,
    iconBg:      "bg-[var(--hm-accent-soft-blue)]",
    iconColor:   "text-[var(--hm-blue)]",
    tag:         "Événements & cadeaux",
  },
] as const;

// ─── Fallback statique ────────────────────────────────────────────────────────
// Utilisé quand Gelato n'est pas configuré ou retourne une liste vide.
// Permet d'afficher une page propre en toutes circonstances.

/**
 * Fallback statique par famille.
 *
 * `image` : visuel à servir. Priorité auto :
 *   1. /mockups/print/hm/{family}.webp si présent (vrais visuels HM à
 *      générer — cf docs/prompts/print-mockups-prompts.md)
 *   2. fichier de fallback actuel (carte-visite-premium.webp, etc.)
 *
 * Tant que les visuels HM ne sont pas générés, on reste sur les fallbacks
 * mais `PrintImageStage` applique des fonds + cadrages différents par
 * famille pour visualiser la distinction.
 */
const STATIC_FALLBACK: Record<string, {
  image:   string;
  family:  PrintFamily;
  formats: string[];
  specs:   string[];
}> = {
  // Bascule 2026-05-27 : remplacement des visuels "hm-print-*" éditoriaux
  // génériques/IA par les vrais mockups réalistes Mockups Design (sources
  // documentées dans data/printMockupTemplates.ts). Chaque famille a son
  // mockup principal différencié → un coup d'œil = un type de support identifié.
  "business-cards": {
    image:   "/mockups/print/business-card/business-card-stack-01.webp",
    family:  "business-cards",
    formats: ["85×55 mm standard", "85×55 mm coins ronds"],
    specs:   ["350 g/m²", "Mat ou brillant"],
  },
  flyer: {
    image:   "/mockups/print/flyer/flyer-shadow-01.webp",
    family:  "flyer",
    formats: ["A4", "A5", "A6"],
    specs:   ["170 g/m² couché", "Recto / recto-verso"],
  },
  poster: {
    image:   "/mockups/print/poster/poster-framed-01.webp",
    family:  "poster",
    formats: ["30×40 cm", "40×60 cm", "50×70 cm"],
    specs:   ["200 g/m²", "Impression 4/0"],
  },
  canvas: {
    image:   "/mockups/print/canvas/canvas-01.webp",
    family:  "canvas",
    formats: ["30×30 cm carré", "40×60 cm portrait", "60×90 cm panoramique"],
    specs:   ["Toile canvas tendue", "Cadre bois FSC"],
  },
  cards: {
    image:   "/mockups/print/brochure/brochure-trifold-01.webp",
    family:  "cards",
    formats: ["DL 3 volets (210×99 mm)", "A4 plié 3 volets"],
    specs:   ["170 g/m² couché", "Pliage 3 volets accordéon"],
  },
};

// ─── Pool de variantes visuelles par catégorie ───────────────────────────────
// Dérivé automatiquement depuis `data/printMockupTemplates.ts` (source de vérité
// unique) pour éviter la duplication des chemins entre les deux fichiers. Si on
// ajoute / supprime un mockup dans PRINT_MOCKUP_TEMPLATES, la grille catalogue
// se met à jour sans toucher à ce fichier.
//
// Mapping catalogue uid → famille mockup (cf resolveMockupFamily) :
//   "business-cards" → famille "business-cards"
//   "flyer"          → famille "flyer"
//   "poster"         → famille "poster"
//   "canvas"         → famille "canvas"
//   "cards"          → famille "brochure" (V1 — à remplacer par un vrai
//                                          mockup carte/invitation A6 en V1.1)
//
// La rotation `index % length` du helper getPrintProductVisual garantit
// qu'aucune image adjacente ne se répète dans la grille.
const IMAGE_VARIANTS_BY_CATEGORY: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const uid of ["business-cards", "flyer", "poster", "canvas", "cards"] as const) {
    const family = resolveMockupFamily(uid);
    if (!family) continue;
    const list = getMockupsByFamily(family).map((m) => m.sceneImage);
    // Pour "cards" (cartes & invitations), V1 utilise les mockups brochure trifold
    // car aucun mockup carte/invitation A6 dédié n'est encore dans le catalogue
    // (TODO V1.1 : sourcer un mockup invitation pliée ou carrée A6). En attendant,
    // on ajoute une variante business-card face pour aérer la grille catalogue
    // — une carte d'invitation et une carte de visite ont une présentation
    // visuelle suffisamment proche pour éviter la répétition stricte.
    if (uid === "cards") {
      list.push("/mockups/print/business-card/business-card-stack-02.webp");
    }
    map[uid] = list;
  }
  return map;
})();

/**
 * getPrintProductVisual — Sélectionne le visuel d'une card produit print.
 *
 * Règle anti-répétition visuelle (DA HM Global) :
 *   Dans une même section catégorie, deux cards voisines n'utilisent jamais
 *   exactement la même image tant qu'une alternative existe dans
 *   `IMAGE_VARIANTS_BY_CATEGORY`. La rotation cyclique
 *   `variants[index % variants.length]` garantit que les positions adjacentes
 *   (i et i+1) sont toujours différentes quand variants.length ≥ 2.
 *
 *   Objectif : la grille doit paraître pensée par une agence, pas générée
 *   automatiquement. Quand Gelato retourne plusieurs formats d'une catégorie
 *   (ex. 3 tailles d'affiche), on alterne stack ↔ packshot ↔ stack…
 *
 * Fallback safe : si la catégorie n'a pas de pool défini, utilise
 *   `fallbackImage` (typiquement `STATIC_FALLBACK[uid].image`). Aucun risque
 *   de broken image.
 *
 * @param product       Produit Gelato (réservé pour évolutions futures —
 *                      ex. mapping explicite via `product.productUid`).
 *                      Non utilisé en V1 mais conservé dans la signature
 *                      pour stabilité d'API.
 * @param index         Position de la card dans la liste de variants de la
 *                      catégorie (0-indexed).
 * @param category      UID catégorie (`business-cards`, `flyer`, `poster`,
 *                      `canvas`, `cards`).
 * @param fallbackImage Image de repli si la catégorie n'a pas de pool.
 * @returns             Chemin `/public` à passer à `<PrintImageStage src />`.
 */
function getPrintProductVisual(
  product: { productUid: string },
  index: number,
  category: string,
  fallbackImage: string,
): string {
  const variants = IMAGE_VARIANTS_BY_CATEGORY[category];
  if (!variants || variants.length === 0) return fallbackImage;
  return variants[index % variants.length];
}

// ─── Helpers Gelato ───────────────────────────────────────────────────────────

function getDimensionLabel(dimensions: { name: string; valueFormatted: string }[]): string {
  const size = dimensions.find((d) => d.name === "size");
  return size?.valueFormatted ?? "";
}

function getPaperLabel(uid: string): string {
  if (uid.includes("350-gsm"))  return "350 g/m²";
  if (uid.includes("300-gsm"))  return "300 g/m²";
  if (uid.includes("200-gsm"))  return "200 g/m²";
  if (uid.includes("170-gsm"))  return "170 g/m²";
  if (uid.includes("110-lb"))   return "Couverture 110 lb";
  if (uid.includes("canvas"))   return "Toile canvas";
  return "";
}

function getFinishLabel(uid: string): string {
  if (uid.includes("coated-silk")) return "Satiné";
  if (uid.includes("uncoated"))    return "Mat";
  if (uid.includes("glossy"))      return "Brillant";
  if (uid.includes("foil-gold"))   return "Dorure or";
  return "";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ImpressionPage() {
  let gelatoProducts: Awaited<ReturnType<typeof getGelatoProducts>> = [];
  let apiError = false;

  if (isGelatoConfigured()) {
    try {
      gelatoProducts = await getGelatoProducts();
    } catch {
      apiError = true;
    }
  }

  const productsByCategory = PRINT_CATEGORIES.reduce<
    Record<string, typeof gelatoProducts>
  >((acc, cat) => {
    acc[cat.uid] = gelatoProducts.filter((p) => p.productTypeUid === cat.uid);
    return acc;
  }, {});

  return (
    <div className="bg-white pb-20 pt-24">
      <div className="container">

        {/* ── En-tête ──────────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="section-tag">Impression professionnelle</p>
          <h1
            className="mb-4 font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--hm-text)]"
            style={{ fontSize: "clamp(1.8rem, 3.4vw + 0.4rem, 3.2rem)" }}
          >
            Vos supports imprimés<br />
            <span style={{ color: "var(--hm-violet)" }}>cadrés avec vous avant production.</span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            Cartes de visite, flyers, affiches, toiles canvas — envoyez votre
            fichier PDF ou PNG, on valide le BAT avec vous puis on lance la production
            chez le partenaire d&apos;impression adapté au format et à la quantité.
          </p>
        </div>

        {/* ── Bandeau réassurance ───────────────────────────────────────── */}
        <div className="mb-12 flex flex-wrap gap-2">
          {[
            { icon: Palette,     label: "Fichiers PDF / PNG acceptés" },
            { icon: ShieldCheck, label: "BAT validé avant impression" },
            { icon: Brush,       label: "Accompagnement PAO possible" },
            { icon: Package,     label: "Production après validation" },
            { icon: MapPin,      label: "Livraison France via partenaires certifiés" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] font-semibold"
              style={{
                color: "var(--hm-text-main)",
                border: "1px solid rgba(45,35,64,0.08)",
              }}
            >
              <Icon size={13} style={{ color: "var(--hm-cyan)" }} strokeWidth={1.8} />
              {label}
            </span>
          ))}
        </div>

        {/* ── Catégories ────────────────────────────────────────────────── */}
        <div className="space-y-16">
          {PRINT_CATEGORIES.map((cat) => {
            const Icon     = cat.icon;
            const products = productsByCategory[cat.uid] ?? [];
            const fallback = STATIC_FALLBACK[cat.uid];

            return (
              <div key={cat.uid} id={cat.uid}>

                {/* En-tête catégorie */}
                <div className="mb-6 flex items-center gap-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cat.iconBg}`}>
                    <Icon size={16} className={cat.iconColor} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.015em] text-[var(--hm-text)]">{cat.label}</h2>
                    <p className="text-xs text-[var(--hm-text-soft)]">{cat.description}</p>
                  </div>
                  <div className="ml-auto h-[1px] flex-1 bg-[var(--hm-line)]" />
                  <span className="rounded-full bg-[var(--hm-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--hm-text-muted)]">
                    {cat.tag}
                  </span>
                </div>

                {products.length > 0 ? (
                  /* ── Produits Gelato dynamiques ── */
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product, index) => {
                      const dimLabel    = getDimensionLabel(product.dimensions ?? []);
                      const paperLabel  = getPaperLabel(product.productUid);
                      const finishLabel = getFinishLabel(product.productUid);
                      const isLandscape = product.productUid.includes("_hor");
                      // Anti-répétition visuelle : deux cards voisines d'une même
                      // section catégorie ne partagent jamais la même image quand
                      // une alternative existe dans IMAGE_VARIANTS_BY_CATEGORY.
                      const variantImage = getPrintProductVisual(
                        product,
                        index,
                        cat.uid,
                        fallback?.image ?? "",
                      );

                      return (
                        <article
                          key={product.id}
                          className={`group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-[var(--hm-line)] bg-white shadow-[0_12px_30px_rgba(63,45,88,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(177,63,116,0.20)] hover:shadow-[0_20px_42px_rgba(63,45,88,0.10)]${
                            cat.uid === "business-cards" ? " cursor-pointer" : ""
                          }`}
                        >
                          {/* V1.1 (2026-05-27) — Card cliquable comme les t-shirts.
                             Overlay <Link> sur toute la surface pour business-cards
                             uniquement → mène au configurateur. Les autres familles
                             gardent le comportement "bouton seul" qui ouvre /contact.
                             aria-label décrit l'action pour les screen readers. */}
                          {cat.uid === "business-cards" && (
                            <Link
                              href="/impression/cartes-de-visite"
                              aria-label={`Personnaliser cette carte de visite ${dimLabel}`}
                              className="absolute inset-0 z-10"
                            />
                          )}

                          {/* V1.2 (2026-05-27) — Vignette CSS pur (PrintCardThumbnail)
                             à la place du mockup Mockups Design "Pastel" qui
                             était visible sur la grille catalogue. Look B2B
                             premium, pas de "Free mockup" / "mockups-design.com"
                             visible. Les fiches produit individuelles gardent
                             les vrais mockups Mockups Design pour le moteur
                             preview overlay (cf BusinessCardConfigurator). */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <PrintCardThumbnail
                              family={(cat.uid as PrintThumbnailFamily)}
                              formatLabel={dimLabel || undefined}
                            />
                          </div>

                          <div className="flex flex-1 flex-col p-5">
                            <p className="text-[14px] font-semibold text-[var(--hm-text)] leading-tight">
                              {dimLabel || cat.label}
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              {paperLabel && (
                                <span className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--hm-text-muted)]">
                                  {paperLabel}
                                </span>
                              )}
                              {finishLabel && (
                                <span className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--hm-text-muted)]">
                                  {finishLabel}
                                </span>
                              )}
                              {isLandscape && (
                                <span className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--hm-text-muted)]">
                                  Paysage
                                </span>
                              )}
                            </div>

                            {/* V1.1 (2026-05-27) — CTA différencié par catégorie :
                               - Cartes de visite : configurateur direct
                                 /impression/cartes-de-visite (upload + preview live)
                               - Autres familles (flyer, poster, canvas, cards) :
                                 devis manuel via /contact (configurateurs à venir
                                 en V1.2). On garde le format dans l'URL devis pour
                                 contexte commercial. */}
                            {cat.uid === "business-cards" ? (
                              <Link
                                href="/impression/cartes-de-visite"
                                className="mt-auto flex items-center justify-between rounded-xl border border-[var(--hm-primary)]/30 bg-[var(--hm-accent-soft-rose)] px-3 py-2.5 text-[11px] font-bold text-[var(--hm-primary)] transition-all group-hover:border-[var(--hm-primary)] group-hover:bg-[var(--hm-primary)] group-hover:text-white pt-3"
                              >
                                Personnaliser maintenant
                                <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                              </Link>
                            ) : (
                              <Link
                                href={`/contact?sujet=impression&produit=${encodeURIComponent(product.productUid)}&format=${encodeURIComponent(dimLabel)}`}
                                className="mt-auto flex items-center justify-between rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2.5 text-[11px] font-bold text-[var(--hm-text-soft)] transition-all group-hover:border-[var(--hm-primary)] group-hover:text-[var(--hm-primary)] pt-3"
                              >
                                Demander un devis
                                <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                              </Link>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : fallback ? (
                  /* ── Fallback statique — card visuelle dominante 60% / specs 40% ── */
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
                    {/* Carte principale — vignette CSS pur (cf PrintCardThumbnail).
                       V1.2 (2026-05-27) : remplace PrintImageStage qui chargeait
                       les mockups Mockups Design avec design démo "Pastel" visible. */}
                    <article className="group flex flex-col overflow-hidden rounded-[1.8rem] border border-[var(--hm-line)] bg-white shadow-[0_14px_32px_rgba(63,45,88,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_22px_50px_rgba(63,45,88,0.10)]">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <PrintCardThumbnail
                          family={(cat.uid as PrintThumbnailFamily)}
                          formatLabel={fallback.formats[0]}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--hm-text-muted)]">
                          {cat.label}
                        </p>
                        <h3 className="text-[1.15rem] font-semibold tracking-[-0.01em] text-[var(--hm-text)]">
                          {cat.description}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {[...fallback.formats, ...fallback.specs].map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--hm-text-muted)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* V1.1 — pareil que la grille produits : configurateur
                           direct pour les cartes de visite, devis pour le reste. */}
                        {cat.uid === "business-cards" ? (
                          <Link
                            href="/impression/cartes-de-visite"
                            className="mt-auto inline-flex items-center justify-between gap-2 rounded-xl border border-[var(--hm-primary)]/30 bg-[var(--hm-accent-soft-rose)] px-4 py-2.5 text-[12px] font-bold text-[var(--hm-primary)] transition-all group-hover:border-[var(--hm-primary)] group-hover:bg-[var(--hm-primary)] group-hover:text-white"
                          >
                            Personnaliser maintenant
                            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/contact?sujet=impression&categorie=${encodeURIComponent(cat.uid)}`}
                            className="mt-auto inline-flex items-center justify-between gap-2 rounded-xl border border-[var(--hm-line)] bg-white px-4 py-2.5 text-[12px] font-bold text-[var(--hm-text-soft)] transition-all group-hover:border-[var(--hm-primary)] group-hover:text-[var(--hm-primary)]"
                          >
                            Demander un devis pour ce support
                            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        )}
                      </div>
                    </article>

                    {/* Carte secondaire — formats & specs */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-[1.4rem] border border-[var(--hm-line)] bg-white p-5">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--hm-text-muted)]">
                          Formats
                        </p>
                        <ul className="space-y-2">
                          {fallback.formats.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--hm-text-soft)]">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hm-primary)]" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-[1.4rem] border border-[var(--hm-line)] bg-white p-5">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--hm-text-muted)]">
                          Spécifications
                        </p>
                        <ul className="space-y-2">
                          {fallback.specs.map((s) => (
                            <li key={s} className="flex items-center gap-2 text-[13px] text-[var(--hm-text-soft)]">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--hm-blue)]" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}

              </div>
            );
          })}
        </div>

        {/* ── CTA bas de page (palette 2026, fond blanc épuré) ─────────── */}
        <div
          className="mt-16 rounded-[1.8rem] p-8 text-center sm:p-12"
          style={{
            background:
              "linear-gradient(135deg, #f4f8fb 0%, #ffffff 50%, #faf3f7 100%)",
            border: "1px solid rgba(45,35,64,0.06)",
            boxShadow: "0 10px 32px rgba(45,35,64,0.06)",
          }}
        >
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--hm-cyan)" }}
          >
            Besoin d&apos;un projet sur-mesure&nbsp;?
          </p>
          <h2
            className="mb-3 font-semibold leading-[1.08] tracking-[-0.02em]"
            style={{
              fontSize: "clamp(1.4rem, 2.4vw + 0.4rem, 2rem)",
              color: "var(--hm-text-main)",
            }}
          >
            Textile + Print + Signalétique —{" "}
            <span style={{ color: "var(--hm-magenta)" }}>on gère tout</span>
          </h2>
          <p
            className="mb-7 max-w-xl mx-auto text-[14px] leading-[1.7]"
            style={{ color: "var(--hm-text-muted-2)" }}
          >
            Commande mixte, grand volume, adaptation logo ou projet complet :
            HM Global vous accompagne du fichier à la livraison.
          </p>
          <div className="flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Link href="/contact" className="btn-hm-magenta w-full sm:w-auto">
              Demander un devis global
              <ArrowRight size={15} />
            </Link>
            <Link href="/catalogue" className="btn-hm-violet-outline w-full sm:w-auto">
              Voir le textile
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
