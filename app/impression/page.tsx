import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Image as ImageIcon, CreditCard, Frame, BookOpen } from "lucide-react";
import { getGelatoProducts, isGelatoConfigured } from "@/lib/gelato";

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

const STATIC_FALLBACK: Record<string, {
  image:   string;
  formats: string[];
  specs:   string[];
}> = {
  "business-cards": {
    image:   "/mockups/print/business-card/carte-visite-premium.webp",
    formats: ["85×55 mm standard", "85×55 mm coins ronds"],
    specs:   ["350 g/m²", "Mat ou brillant"],
  },
  flyer: {
    image:   "/mockups/print/flyer/flyer-premium.webp",
    formats: ["A4", "A5", "A6"],
    specs:   ["170 g/m² couché", "Recto / recto-verso"],
  },
  poster: {
    image:   "/mockups/print/affiche/affiche-premium.webp",
    formats: ["30×40 cm", "40×60 cm", "50×70 cm"],
    specs:   ["200 g/m²", "Impression 4/0"],
  },
  canvas: {
    image:   "/mockups/print/canvas/canvas-premium.webp",
    formats: ["30×30 cm carré", "40×60 cm portrait", "60×90 cm panoramique"],
    specs:   ["Toile canvas tendue", "Cadre bois FSC"],
  },
  cards: {
    image:   "/print/carte-visite-mockup.jpg",
    formats: ["A6 portrait", "Carré 140×140 mm"],
    specs:   ["350 g/m² couché satiné", "Option dorure"],
  },
};

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
        <div className="mb-14">
          <p className="section-tag">Impression professionnelle</p>
          <h1 className="mb-4 text-3xl font-black text-[var(--hm-text)] md:text-5xl">
            Imprimez votre communication<br />
            <span className="text-gradient-gold">en quelques clics</span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
            Cartes de visite, flyers, affiches, toiles — tous vos supports print livrés
            directement depuis nos ateliers partenaires. Fichiers PDF acceptés, BAT validé avant impression.
          </p>
        </div>

        {/* ── Bandeau réassurance ───────────────────────────────────────── */}
        <div className="mb-14 flex flex-wrap gap-3">
          {[
            "📦 Livraison suivie incluse",
            "🎨 Fichiers PDF / PNG acceptés",
            "✅ BAT validé avant impression",
            "⚡ Délai 5–7 jours ouvrés",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-2 text-xs font-semibold text-[var(--hm-text-soft)]"
            >
              {item}
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
                    <h2 className="text-lg font-black text-[var(--hm-text)]">{cat.label}</h2>
                    <p className="text-xs text-[var(--hm-text-soft)]">{cat.description}</p>
                  </div>
                  <div className="ml-auto h-[1px] flex-1 bg-[var(--hm-line)]" />
                  <span className="rounded-full bg-[var(--hm-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--hm-text-muted)]">
                    {cat.tag}
                  </span>
                </div>

                {products.length > 0 ? (
                  /* ── Produits Gelato dynamiques ── */
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => {
                      const dimLabel    = getDimensionLabel(product.dimensions ?? []);
                      const paperLabel  = getPaperLabel(product.productUid);
                      const finishLabel = getFinishLabel(product.productUid);
                      const isLandscape = product.productUid.includes("_hor");

                      return (
                        <article
                          key={product.id}
                          className="group flex flex-col rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4 transition-all duration-300
                            hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_10px_28px_rgba(63,45,88,0.08)] hover:-translate-y-0.5"
                        >
                          {/* Visuel format */}
                          <div className="mb-4 flex items-center justify-center rounded-xl border border-[var(--hm-line)] bg-white py-5">
                            <div
                              className={`border-2 border-[var(--hm-primary)] bg-[rgba(177,63,116,0.06)] ${
                                isLandscape ? "h-14 w-20" : "h-20 w-14"
                              } rounded-md`}
                            />
                          </div>

                          <div className="flex-1">
                            <p className="mb-1 text-[13px] font-bold text-[var(--hm-text)] leading-tight">
                              {dimLabel || cat.label}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {paperLabel && (
                                <span className="rounded-full border border-[var(--hm-line)] px-2 py-0.5 text-[10px] text-[var(--hm-text-muted)]">
                                  {paperLabel}
                                </span>
                              )}
                              {finishLabel && (
                                <span className="rounded-full border border-[var(--hm-line)] px-2 py-0.5 text-[10px] text-[var(--hm-text-muted)]">
                                  {finishLabel}
                                </span>
                              )}
                              {isLandscape && (
                                <span className="rounded-full border border-[var(--hm-line)] px-2 py-0.5 text-[10px] text-[var(--hm-text-muted)]">
                                  Paysage
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={`/contact?sujet=impression&produit=${encodeURIComponent(product.productUid)}&format=${encodeURIComponent(dimLabel)}`}
                            className="mt-4 flex items-center justify-between rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2.5 text-[11px] font-bold text-[var(--hm-text-soft)] transition-all group-hover:border-[var(--hm-primary)] group-hover:text-[var(--hm-primary)]"
                          >
                            Demander un devis
                            <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                ) : fallback ? (
                  /* ── Fallback statique — jamais de skeleton infini ── */
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {/* Carte principale avec photo réelle */}
                    <article className="group flex flex-col rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] overflow-hidden transition-all duration-300 hover:border-[rgba(177,63,116,0.22)] hover:shadow-[0_10px_28px_rgba(63,45,88,0.08)] hover:-translate-y-0.5">
                      <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--hm-line)] bg-white">
                        <Image
                          src={fallback.image}
                          alt={cat.label}
                          fill
                          sizes="(min-width: 768px) 33vw, 95vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="mb-2 text-[13px] font-bold text-[var(--hm-text)]">
                          Formats disponibles
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {[...fallback.formats, ...fallback.specs].map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[var(--hm-line)] px-2 py-0.5 text-[10px] text-[var(--hm-text-muted)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <Link
                          href={`/contact?sujet=impression&categorie=${encodeURIComponent(cat.uid)}`}
                          className="mt-4 flex items-center justify-between rounded-xl border border-[var(--hm-line)] bg-white px-3 py-2.5 text-[11px] font-bold text-[var(--hm-text-soft)] transition-all group-hover:border-[var(--hm-primary)] group-hover:text-[var(--hm-primary)]"
                        >
                          Demander un devis
                          <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </article>

                    {/* Carte secondaire — formats & specs */}
                    <div className="flex flex-col gap-4">
                      <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
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
                      <div className="rounded-2xl border border-[var(--hm-line)] bg-white p-5">
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

        {/* ── CTA bas de page ──────────────────────────────────────────── */}
        <div className="mt-16 rounded-[2rem] border border-[rgba(63,45,88,0.08)] bg-[linear-gradient(180deg,#433053_0%,#3f2d58_100%)] p-8 text-center text-white shadow-[0_18px_40px_rgba(63,45,88,0.14)]">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Besoin d&apos;un projet sur-mesure ?
          </p>
          <h2 className="mb-3 text-2xl font-black">
            Textile + Print + Signalétique — on gère tout
          </h2>
          <p className="mb-6 max-w-lg mx-auto text-sm text-white/70">
            Commande mixte, grand volume, adaptation logo ou projet complet : HM Global vous accompagne du fichier à la livraison.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary px-6 py-3 text-[0.8rem]">
              Demander un devis global
              <ArrowRight size={13} className="ml-2" />
            </Link>
            <Link
              href="/catalogue"
              className="btn-outline border-white/20 bg-white/10 px-6 py-3 text-[0.8rem] text-white hover:bg-white hover:text-[var(--hm-text)]"
            >
              Voir le textile
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
