"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

function InstagramGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * HomeV3Reels — Mur de réels Instagram (preuve sociale vidéo).
 * Montre que HM Global est actif sur Instagram et réalise des projets variés
 * (textile, enseignes, véhicules, print) pour de vrais clients locaux.
 *
 * Affichage : carrousel horizontal à défilement (swipe mobile / flèches desktop)
 * avec scroll-snap, pour parcourir les réels sans empiler une longue colonne.
 *
 * POUR ACTIVER : coller les liens des réels dans REELS ci-dessous
 * (Instagram → ouvrir le réel → ··· / Partager → « Copier le lien »).
 * La section reste masquée tant que REELS est vide.
 *
 * NB i18n : textes en dur pour l'instant (section non publiée) — à passer
 * en clés i18n (fr/en/tr) au moment de la mise en ligne.
 */

const REELS: string[] = [
  "https://www.instagram.com/reel/DVOx9LzApW5/",
  "https://www.instagram.com/reel/DVOuSWNgvt-/",
  "https://www.instagram.com/reel/DRe3kQ1gs7M/",
  "https://www.instagram.com/reel/DRe1G4jgjWV/",
  "https://www.instagram.com/reel/DRKi1sJApbt/",
  "https://www.instagram.com/reel/DRKDEhMjBs9/",
  "https://www.instagram.com/reel/DRKABAjjBp4/",
];

const INSTAGRAM_PROFILE = "https://www.instagram.com/hmglobalagence/";

export default function HomeV3Reels() {
  const t = useT();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (REELS.length === 0) return;
    const process = () =>
      (window as unknown as { instgrm?: { Embeds?: { process?: () => void } } }).instgrm?.Embeds?.process?.();
    if (document.getElementById("ig-embed-js")) {
      process();
      return;
    }
    const s = document.createElement("script");
    s.id = "ig-embed-js";
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    s.onload = process;
    document.body.appendChild(s);
  }, []);

  if (REELS.length === 0) return null;

  const scrollByCards = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-reel-card]");
    const step = card ? card.offsetWidth + 20 : 360;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="bg-[var(--hm-surface)] py-14 sm:py-20">
      <div className="container">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-tag">{t("home.reels.tag")}</p>
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--hm-text)] sm:text-4xl">
              {t("home.reels.title")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--hm-text-soft)]">
              {t("home.reels.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label={t("home.reels.prev")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--hm-text)] shadow-sm transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label={t("home.reels.next")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[var(--hm-text)] shadow-sm transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <a
              href={INSTAGRAM_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--hm-primary)]"
            >
              <InstagramGlyph /> @hmglobalagence <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory items-start gap-5 overflow-x-auto scroll-smooth pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {REELS.map((url) => (
            <div
              key={url}
              data-reel-card
              className="w-[300px] shrink-0 snap-start overflow-hidden rounded-[1.25rem] bg-white sm:w-[340px]"
            >
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{ margin: 0, width: "100%", minWidth: "auto", border: "none" }}
              />
            </div>
          ))}
        </div>

        <p className="mt-1 text-xs font-medium text-[var(--hm-text-soft)] sm:hidden">
          {t("home.reels.swipeHint")}
        </p>
      </div>
    </section>
  );
}
