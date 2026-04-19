import { MessageSquareQuote, Star } from "lucide-react";

const DEMO_REVIEWS = [
  {
    id: "review-1",
    name: "Thomas M.",
    activity: "Entreprise du BTP",
    city: "Strasbourg",
    rating: 5,
    comment:
      "Commande fluide, fichier vérifié avant lancement et rendu propre sur les t-shirts d'équipe. Le suivi a été clair jusqu'à la livraison.",
    period: "Mars 2025",
    topic: "T-shirts personnalisés",
  },
  {
    id: "review-2",
    name: "Sarah L.",
    activity: "Restaurant",
    city: "Colmar",
    rating: 5,
    comment:
      "Nous avions besoin d'un textile cohérent pour le personnel. Les échanges ont été simples, le marquage bien conseillé et le résultat sérieux.",
    period: "Février 2025",
    topic: "Sweats et hoodies brodés",
  },
  {
    id: "review-3",
    name: "Marc D.",
    activity: "Association sportive",
    city: "Mulhouse",
    rating: 5,
    comment:
      "Le projet a été cadré rapidement, avec une vraie relecture du visuel avant production. Les softshells sont arrivées conformes à notre demande.",
    period: "Janvier 2025",
    topic: "Softshells personnalisées",
  },
] as const;

const REVIEW_SIGNALS = [
  "Section prête à accueillir de vrais avis Google",
  "Structure réutilisable pour témoignages clients validés",
  "Ton court, crédible et non surjoué",
] as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < rating
              ? "h-4 w-4 fill-[var(--hm-accent)] text-[var(--hm-accent)]"
              : "h-4 w-4 text-[var(--hm-border-strong)]"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const averageRating =
    DEMO_REVIEWS.reduce((total, review) => total + review.rating, 0) / DEMO_REVIEWS.length;

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)]">
              Avis clients
            </span>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-[var(--hm-ink)] sm:text-4xl">
              Une preuve sociale sobre, lisible et pensée pour accueillir de vrais retours.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-[var(--hm-muted)] sm:text-lg">
              Cette section pose une base crédible pour les retours clients : des avis courts,
              situés, liés à un vrai usage produit, avec une structure qui pourra ensuite être
              branchée sur des avis Google ou des témoignages validés.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div className="rounded-[1.75rem] border border-[var(--hm-border)] bg-[var(--hm-surface)] px-6 py-5 shadow-[var(--hm-shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)]">
                Note affichée
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-3xl font-semibold text-[var(--hm-ink)]">
                  {averageRating.toFixed(1)}
                </span>
                <StarRating rating={Math.round(averageRating)} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--hm-muted)]">
                Base de démonstration propre, en attendant les premiers avis clients publiables.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[var(--hm-border)] bg-white px-6 py-5 shadow-[var(--hm-shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)]">
                Prévu pour la suite
              </p>
              <div className="mt-4 grid gap-3">
                {REVIEW_SIGNALS.map((signal) => (
                  <div
                    key={signal}
                    className="rounded-2xl border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 py-3 text-sm leading-6 text-[var(--hm-ink)]"
                  >
                    {signal}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {DEMO_REVIEWS.map((review) => (
            <article
              key={review.id}
              className="flex h-full flex-col rounded-[1.75rem] border border-[var(--hm-border)] bg-[var(--hm-surface)] p-6 shadow-[var(--hm-shadow-soft)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--hm-primary)]">
                    {review.topic}
                  </p>
                  <div className="mt-3">
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[var(--hm-primary)] shadow-sm">
                  <MessageSquareQuote className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-5 text-[15px] leading-7 text-[var(--hm-ink)]">
                &ldquo;{review.comment}&rdquo;
              </p>

              <div className="mt-6 border-t border-[var(--hm-border)] pt-4">
                <p className="text-sm font-semibold text-[var(--hm-ink)]">{review.name}</p>
                <p className="mt-1 text-sm text-[var(--hm-muted)]">
                  {review.activity} · {review.city}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                  {review.period}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
