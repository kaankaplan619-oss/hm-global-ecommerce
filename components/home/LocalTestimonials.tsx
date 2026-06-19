import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";
import { getT } from "@/lib/i18n/server";

/**
 * LocalTestimonials — témoignages clients curatés (preuve sociale locale B2B).
 *
 * Données dans data/testimonials.ts (uniquement de VRAIS avis autorisés).
 * Tant qu'il n'y a pas de témoignage réel, la section ne s'affiche pas
 * (return null) — aucun risque de publier du faux (DGCCRF).
 */

export default async function LocalTestimonials() {
  if (TESTIMONIALS.length === 0) return null;
  const t = await getT();

  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="mb-8 max-w-2xl">
          <p className="section-tag">{t("home.testimonials.tag")}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--hm-text)]">
            {t("home.testimonials.heading")}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((tm, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-[var(--hm-line)] bg-white p-6 shadow-[0_2px_8px_rgba(63,45,88,0.04)]"
            >
              <Quote size={22} className="text-[var(--hm-primary)] opacity-30" aria-hidden="true" />

              {typeof tm.rating === "number" && (
                <div className="mt-3 flex items-center gap-0.5" aria-label={`${tm.rating}/5`}>
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      size={13}
                      className={s < tm.rating! ? "text-amber-400" : "text-amber-200"}
                      fill="currentColor"
                    />
                  ))}
                </div>
              )}

              <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-[var(--hm-text-soft)]">
                “{tm.quote}”
              </blockquote>

              <figcaption className="mt-5 border-t border-[var(--hm-line)] pt-4">
                <p className="text-[13px] font-semibold text-[var(--hm-text)]">{tm.author}</p>
                {(tm.company || tm.city) && (
                  <p className="text-[12px] text-[var(--hm-text-muted)]">
                    {[tm.company, tm.city].filter(Boolean).join(" · ")}
                  </p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
