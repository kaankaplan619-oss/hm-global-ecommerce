import Link from "next/link";
import { ArrowRight, Printer } from "lucide-react";
import PrintImageStage, { type PrintFamily } from "@/components/print/PrintImageStage";

/**
 * Section Impression homepage — V1 (devis pas auto-commande).
 *
 * Stratégie business :
 *   - Printify = textile V1 (commande auto)
 *   - Gelato API = uniquement canvas / posters encadrés / hanging posters
 *     (en back-office uniquement, pas branché front V1 car prix non compétitifs
 *      sur cartes/flyers/affiches courants)
 *   - Print courant (cartes / flyers / affiches) = devis ou fournisseur manuel
 *     (PrintOclock / Pixart / Exaprint) jusqu'à validation prix
 *
 * Les CTAs des 4 cartes pointent donc vers le formulaire de devis,
 * pas vers un parcours de commande automatique.
 */

// ─── Familles print mises en avant ──────────────────────────────────────────

const PRINT_ITEMS: {
  label:       string;
  description: string;
  image:       string;
  family:      PrintFamily;
  href:        string;
  tag:         string;
  ctaLabel:    string;
}[] = [
  {
    label:       "Cartes de visite",
    description: "350 g/m² · Mat ou brillant · Coins ronds disponibles",
    image:       "/mockups/print/business-card/carte-visite-premium.webp",
    family:      "business-cards",
    href:        "/contact?sujet=devis&support=cartes-de-visite",
    tag:         "Le basique pro",
    ctaLabel:    "Demander un devis",
  },
  {
    label:       "Flyers",
    description: "A4, A5 · 170 g/m² couché · Recto ou recto-verso",
    image:       "/mockups/print/flyer/flyer-premium.webp",
    family:      "flyer",
    href:        "/contact?sujet=devis&support=flyers",
    tag:         "Diffusion terrain",
    ctaLabel:    "Demander un devis",
  },
  {
    label:       "Affiches & posters",
    description: "30×40 à 50×70 cm · 200 g/m² · Grand format disponible",
    image:       "/mockups/print/affiche/affiche-premium.webp",
    family:      "poster",
    href:        "/contact?sujet=devis&support=affiches",
    tag:         "Grand format",
    ctaLabel:    "Demander un devis",
  },
  {
    label:       "Toiles canvas",
    description: "Cadre bois FSC · Impression haute résolution unitaire",
    image:       "/mockups/print/canvas/canvas-premium.webp",
    family:      "canvas",
    href:        "/contact?sujet=devis&support=canvas",
    tag:         "Déco & signalétique",
    ctaLabel:    "Voir les options",
  },
];

// ─── Composant ───────────────────────────────────────────────────────────────

export default function ImpressionSection() {
  return (
    <section className="section bg-[var(--hm-surface)]" id="impression">
      <div className="container">

        {/* ── En-tête ──────────────────────────────────────────────────── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-tag">Impression professionnelle</p>
            <h2
              className="mb-3 font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--hm-text)]"
              style={{ fontSize: "clamp(1.6rem, 2.8vw + 0.5rem, 2.4rem)" }}
            >
              Cartes, flyers, affiches & canvas —
              <br />
              <span className="text-[var(--hm-primary)]">cadrés avec vous avant production.</span>
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
              Envoyez votre fichier PDF ou PNG. Nous validons le BAT avec vous,
              puis lançons la production chez le bon partenaire d&apos;impression
              selon le format et la quantité.
            </p>
          </div>

          <Link
            href="/contact?sujet=devis&support=impression"
            className="btn-primary shrink-0 gap-2 px-6 py-3 text-[0.8rem]"
          >
            <Printer size={15} />
            Demander un devis print
          </Link>
        </div>

        {/* ── Grille produits ───────────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PRINT_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative flex flex-col overflow-hidden rounded-[1.8rem] border border-[var(--hm-line)] bg-white shadow-[0_12px_30px_rgba(63,45,88,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(177,63,116,0.20)] hover:shadow-[0_20px_42px_rgba(63,45,88,0.10)]"
            >
              {/* Image mockup — PrintImageStage avec différenciation par famille */}
              <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--hm-line)]">
                <PrintImageStage
                  src={item.image}
                  alt={item.label}
                  family={item.family}
                  variant="compact"
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 95vw"
                />
                {/* Tag flottant */}
                <span className="absolute left-3 top-3 z-20 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)] shadow-sm backdrop-blur-sm">
                  {item.tag}
                </span>
              </div>

              {/* Infos */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-[1rem] font-black text-[var(--hm-text)] transition-colors group-hover:text-[var(--hm-rose)]">
                  {item.label}
                </h3>
                <p className="mt-1 flex-1 text-[11px] leading-relaxed text-[var(--hm-text-soft)]">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[var(--hm-line)] pt-3">
                  <span className="text-[11px] font-bold text-[var(--hm-text-muted)]">
                    Sur devis
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--hm-primary)] transition group-hover:translate-x-0.5">
                    {item.ctaLabel} <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Bandeau réassurance ───────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            "🎨 Fichiers PDF / PNG acceptés",
            "✅ BAT validé avant impression",
            "🖌️ Accompagnement PAO possible",
            "📦 Production après validation",
            "🇫🇷 Livraison France via partenaires certifiés",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--hm-line)] bg-white px-4 py-2 text-[11px] font-semibold text-[var(--hm-text-soft)]"
            >
              {item}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
