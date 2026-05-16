import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Printer } from "lucide-react";

// ─── Produits mis en avant ────────────────────────────────────────────────────

const PRINT_ITEMS = [
  {
    label:       "Cartes de visite",
    description: "350 g/m² · Mat ou brillant · Coins ronds dispo",
    image:       "/mockups/print/business-card/carte-visite-premium.webp",
    href:        "/impression#business-cards",
    tag:         "Le basique premium",
    color:       "from-[#3f2d58] to-[#5c3d7a]",
  },
  {
    label:       "Flyers",
    description: "A4, A5 · 170 g/m² couché · Recto / recto-verso",
    image:       "/mockups/print/flyer/flyer-premium.webp",
    href:        "/impression#flyer",
    tag:         "Diffusion terrain",
    color:       "from-[#b13f74] to-[#d4527e]",
  },
  {
    label:       "Affiches",
    description: "30×40 à 50×70 cm · 200 g/m² · Grand format",
    image:       "/mockups/print/affiche/affiche-premium.webp",
    href:        "/impression#poster",
    tag:         "Grand format",
    color:       "from-[#5fa8d2] to-[#3f8ab5]",
  },
  {
    label:       "Toiles canvas",
    description: "Cadre bois FSC · Impression haute résolution",
    image:       "/mockups/print/canvas/canvas-premium.webp",
    href:        "/impression#canvas",
    tag:         "Déco & signalétique",
    color:       "from-[#3f2d58] to-[#b13f74]",
  },
] as const;

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ImpressionSection() {
  return (
    <section className="section bg-[var(--hm-surface)]" id="impression">
      <div className="container">

        {/* ── En-tête ──────────────────────────────────────────────────── */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-tag">Impression professionnelle</p>
            <h2 className="mb-3 text-3xl font-black leading-tight tracking-tight text-[var(--hm-text)] md:text-4xl">
              Cartes de visite, flyers, affiches —
              <br />
              <span className="text-gradient-gold">imprimés et livrés chez vous</span>
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--hm-text-soft)]">
              Envoyez votre fichier PDF ou PNG, choisissez le format et la finition.
              Nos ateliers partenaires impriment et livrent en 5 à 7 jours ouvrés partout en France.
            </p>
          </div>

          <Link
            href="/impression"
            className="btn-primary shrink-0 gap-2 px-6 py-3 text-[0.8rem]"
          >
            <Printer size={15} />
            Voir tout le catalogue print
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
              {/* Image mockup */}
              <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--hm-line)] bg-[var(--hm-surface)]">
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 95vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                {/* Tag flottant */}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)] shadow-sm backdrop-blur-sm">
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
                    Devis en ligne
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--hm-primary)] transition group-hover:translate-x-0.5">
                    Voir <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Bandeau réassurance ───────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            "📦 Livraison suivie incluse",
            "🎨 PDF / PNG acceptés",
            "✅ BAT validé avant impression",
            "⚡ 5–7 jours ouvrés",
            "🇫🇷 Ateliers certifiés",
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
