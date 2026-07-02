"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  REALISATIONS,
  realisationCategoriesPresent,
  type RealisationCategory,
  type Realisation,
} from "@/data/realisations";
import { useT } from "@/components/i18n/I18nProvider";

// Mappe une réalisation textile vers sa catégorie catalogue (d'après ses tags)
// pour proposer « Personnaliser ce produit » → configurateur de la catégorie.
const TAG_TO_CATEGORY: Record<string, string> = {
  polo: "polos",
  polos: "polos",
  "t-shirt": "tshirts",
  tshirt: "tshirts",
  tee: "tshirts",
  softshell: "softshells",
  veste: "softshells",
  sweat: "hoodies",
  "sweat-shirt": "hoodies",
  hoodie: "hoodies",
  casquette: "casquettes",
  tote: "sacs",
  "tote bag": "sacs",
  sac: "sacs",
};

function customizeCategory(r: Realisation): string | null {
  if (r.category !== "textile") return null;
  for (const tag of r.tags) {
    const cat = TAG_TO_CATEGORY[tag.trim().toLowerCase()];
    if (cat) return cat;
  }
  return null;
}

/**
 * Galerie des vraies réalisations HM Global (photos clients).
 * Filtres par catégorie (dérivés des données réelles — aucun filtre vide) +
 * CTA « Je veux un projet similaire » sur chaque carte → /devis-rapide.
 * DA inchangée (magenta/tokens). Responsive : filtres qui s'enroulent, cartes
 * 1/2/3 colonnes, CTA pleine largeur tappable sur mobile.
 */

type Filter = RealisationCategory | "all";

export default function RealisationsGallery() {
  const t = useT();
  const categories = useMemo(() => realisationCategoriesPresent(), []);
  const [active, setActive] = useState<Filter>("all");

  const items = useMemo(
    () => (active === "all" ? REALISATIONS : REALISATIONS.filter((r) => r.category === active)),
    [active],
  );

  const filters: Filter[] = ["all", ...categories];

  return (
    <div>
      {/* Filtres */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = active === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setActive(f)}
              aria-pressed={isActive}
              className={`min-h-10 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                isActive
                  ? "border-[var(--hm-primary)] bg-[var(--hm-primary)] text-white"
                  : "border-[var(--hm-line)] bg-white text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
              }`}
            >
              {f === "all" ? t("realisationsGallery.all") : t(`realisationsGallery.category.${f}`)}
            </button>
          );
        })}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r, i) => {
          const cat = customizeCategory(r);
          const ctaHref = cat ? `/catalogue/${cat}` : "/devis-rapide";
          const ctaLabel = cat ? "realisationsGallery.customizeCta" : "realisationsGallery.similarCta";
          return (
          <figure
            key={r.id}
            className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] shadow-[0_12px_30px_rgba(63,45,88,0.06)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={r.image}
                alt={r.alt}
                fill
                sizes="(min-width:1024px) 32vw, (min-width:640px) 48vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                priority={i < 3}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--hm-primary)] shadow-sm">
                {r.sector}
              </span>
              <figcaption className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[15px] font-semibold leading-tight text-white drop-shadow">{r.title}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </figcaption>
            </div>

            {/* CTA par réalisation */}
            <Link
              href={ctaHref}
              className="flex min-h-12 items-center justify-between gap-2 px-4 text-[13px] font-semibold text-[var(--hm-primary)] transition-colors hover:bg-[var(--hm-accent-soft-rose)]"
            >
              {t(ctaLabel)}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </figure>
          );
        })}
      </div>
    </div>
  );
}
