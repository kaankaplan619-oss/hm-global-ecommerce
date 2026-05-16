import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

export default function ReviewsBand() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-xl font-bold text-amber-600">4.9</span>
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <p className="mt-1 text-[12px] text-[var(--hm-text-soft)]">
                Note moyenne · <strong className="text-[var(--hm-text)]">1 200+ commandes livrées</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="text-[13px] font-semibold text-[var(--hm-text)]">Ils nous font confiance</p>
            <Link
              href="/realisations"
              className="inline-flex items-center gap-1.5 text-[12px] text-[var(--hm-primary)] transition hover:underline"
            >
              Voir nos réalisations <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
