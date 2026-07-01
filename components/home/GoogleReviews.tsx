import { Star } from "lucide-react";
import { getGoogleReviews, FALLBACK_MAPS_URI } from "@/lib/google-reviews";
import { getT } from "@/lib/i18n/server";

/**
 * GoogleReviews — Bandeau d'avis Google (server component async).
 *
 * - Branché (GOOGLE_PLACES_API_KEY posée) : note + nb d'avis RÉELS + cartes
 *   d'avis (auteur, photo, texte) tirées de la Places API.
 * - Non branché : bandeau honnête « Consultez les avis à jour sur Google » +
 *   lien vers la fiche, SANS note ni compteur codés en dur (aucune métrique
 *   affichée qui ne provienne de l'API en direct).
 *
 * Aucune donnée inventée : la note et le nombre d'avis ne s'affichent QUE
 * lorsqu'ils viennent réellement de l'API Google.
 */

function fmtRating(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

export default async function GoogleReviews() {
  const data = await getGoogleReviews();
  const t = await getT();

  // ── Fallback honnête (API non branchée) : aucun chiffre inventé ──────────
  if (!data) {
    return (
      <section className="py-12 sm:py-16">
        <div className="container">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-[var(--hm-line)] bg-white p-6 shadow-[0_2px_8px_rgba(63,45,88,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50">
                <Star size={20} className="text-amber-400" fill="currentColor" />
              </div>
              <p className="text-sm font-semibold text-[var(--hm-text)]">
                {t("home.reviews.liveOnGoogle")}
              </p>
            </div>
            <a
              href={FALLBACK_MAPS_URI}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-4 py-2 text-[12px] font-semibold text-[var(--hm-text)] shadow-sm transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
            >
              {t("home.reviews.readOnGoogle")}
            </a>
          </div>
        </div>
      </section>
    );
  }

  const { rating, total, mapsUri, reviews } = data;
  const rounded = Math.round(rating);

  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        {/* En-tête note moyenne (RÉELLE, issue de l'API) */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50">
              <span className="text-xl font-bold text-amber-600">{fmtRating(rating)}</span>
            </div>
            <div>
              <div className="flex items-center gap-0.5" aria-label={`${t("home.reviews.rating")} ${fmtRating(rating)}/5`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < rounded ? "text-amber-400" : "text-amber-200"}
                    fill="currentColor"
                  />
                ))}
              </div>
              <p className="mt-1 text-[12px] text-[var(--hm-text-soft)]">
                {t("home.reviews.averageRating")} ·{" "}
                <a
                  href={mapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--hm-text)] underline decoration-dotted underline-offset-2 transition hover:text-[var(--hm-primary)]"
                >
                  {total} {t("home.reviews.googleReviews")}
                </a>
              </p>
            </div>
          </div>
          <a
            href={mapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-4 py-2 text-[12px] font-semibold text-[var(--hm-text)] shadow-sm transition hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
          >
            {t("home.reviews.readOnGoogle")}
          </a>
        </div>

        {/* Cartes d'avis — uniquement quand l'API est branchée */}
        {reviews.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <figure
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--hm-line)] bg-white p-5 shadow-[0_2px_8px_rgba(63,45,88,0.04)]"
              >
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s < r.rating ? "text-amber-400" : "text-amber-200"}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <blockquote className="text-[13px] leading-relaxed text-[var(--hm-text-soft)] line-clamp-5">
                  {r.text}
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-2 pt-1">
                  {r.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo} alt={r.author} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--hm-accent-soft-rose)] text-[11px] font-bold text-[var(--hm-primary)]">
                      {r.author.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-[var(--hm-text)]">{r.author}</p>
                    {r.relativeTime && (
                      <p className="truncate text-[10px] text-[var(--hm-text-muted)]">{r.relativeTime}</p>
                    )}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
