import { Star } from "lucide-react";

// Avis de démonstration — en prod, chargés depuis la DB avec modération admin
const DEMO_REVIEWS = [
  {
    id: "1",
    name: "Thomas M.",
    company: "Entreprise BTP — Strasbourg",
    rating: 5,
    comment:
      "Commande de 50 t-shirts pour notre équipe. Qualité irréprochable, DTF parfaitement rendu. Livraison rapide et suivi professionnel. Je recommande sans hésitation.",
    date: "Mars 2025",
  },
  {
    id: "2",
    name: "Sophie L.",
    company: "Restaurant — Colmar",
    rating: 5,
    comment:
      "Hoodies brodés pour notre personnel. Le rendu est vraiment premium, nos clients nous en parlent ! Processus simple et équipe très réactive.",
    date: "Février 2025",
  },
  {
    id: "3",
    name: "Marc D.",
    company: "Association sportive — Mulhouse",
    rating: 5,
    comment:
      "20 softshells pour notre association. La broderie est magnifique, les couleurs fidèles à notre charte. Service impeccable du début à la fin.",
    date: "Janvier 2025",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "text-[#c9a96e] fill-[#c9a96e]" : "text-[#2a2a2a]"}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const avgRating = DEMO_REVIEWS.reduce((acc, r) => acc + r.rating, 0) / DEMO_REVIEWS.length;

  return (
    <section className="section">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-tag justify-center">Avis clients</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-4">
            Ce que disent<br />
            <span className="text-gradient-gold">nos clients</span>
          </h2>
          {/* Global rating */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm font-bold text-[#f5f5f5]">{avgRating.toFixed(1)}/5</span>
            <span className="text-xs text-[#555555]">({DEMO_REVIEWS.length} avis vérifiés)</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="p-6 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl"
            >
              {/* Stars */}
              <StarRating rating={review.rating} />

              {/* Comment */}
              <p className="text-sm text-[#8a8a8a] leading-relaxed mt-4 mb-6">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                  <span className="text-xs font-bold text-[#c9a96e]">
                    {review.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f5f5f5]">{review.name}</p>
                  <p className="text-[10px] text-[#555555]">{review.company} · {review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
