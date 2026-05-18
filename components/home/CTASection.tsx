import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * CTASection — CTA final court (P8).
 *
 * Bloc épuré, moins massif. Un seul message clair :
 * « Besoin d'un projet complet ou multi-supports ? »
 * Deux actions explicites : devis global ou voir le textile.
 */
export default function CTASection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="container">
        <div
          className="relative overflow-hidden rounded-[2rem] text-white shadow-[0_24px_56px_rgba(0,0,0,0.20)]"
          style={{ background: "linear-gradient(135deg, #0f2535 0%, #1e0f3a 52%, #30101f 100%)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 12% 22%, rgba(110,193,223,0.20) 0%, transparent 52%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 86% 84%, rgba(177,63,116,0.26) 0%, transparent 50%)" }}
          />

          <div className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--hm-rose)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                Projet accompagné
              </p>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h2
                className="max-w-[20ch] font-semibold leading-[1.05] tracking-[-0.03em]"
                style={{ fontSize: "clamp(1.6rem, 3.2vw + 0.4rem, 2.8rem)" }}
              >
                Besoin d&apos;un projet complet
                <br />
                <span style={{ color: "#ffbfd7" }}>ou multi-supports ?</span>
              </h2>

              <p className="max-w-[40rem] text-[14px] leading-7 text-white/70 sm:text-[15px]">
                Textile, print, signalétique, adaptation de logo : HM Global vous
                accompagne de la préparation du fichier jusqu&apos;à la livraison.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/contact?sujet=devis"
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-[12px]"
              >
                Demander un devis global
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/catalogue"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-[12px] font-semibold text-white/85 transition hover:bg-white hover:text-[var(--hm-text)]"
              >
                Voir le textile
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
