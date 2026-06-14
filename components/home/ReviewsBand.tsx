import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

export default function ReviewsBand() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-xl font-bold text-amber-600">4,7</span>
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <p className="mt-1 text-[12px] text-[var(--hm-text-soft)]">
                Note moyenne ·{" "}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=HM%20Global%20Agence%20Souffelweyersheim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--hm-text)] underline decoration-dotted underline-offset-2 transition hover:text-[var(--hm-primary)]"
                >
                  14 avis Google
                </a>
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
