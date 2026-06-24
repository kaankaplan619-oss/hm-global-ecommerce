"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ScrollCarousel — rangée à défilement horizontal (swipe mobile / flèches
 * desktop) avec scroll-snap et barre masquée. Wrapper client réutilisable :
 * les cartes (children) sont rendues côté serveur et passées ici.
 * Chaque carte enfant doit porter l'attribut `data-card` (sert au pas de défilement).
 */
export default function ScrollCarousel({
  children,
  prevLabel,
  nextLabel,
}: {
  children: ReactNode;
  prevLabel: string;
  nextLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          aria-label={prevLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--hm-text)] shadow-sm transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          aria-label={nextLabel}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--hm-text)] shadow-sm transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto scroll-smooth pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
