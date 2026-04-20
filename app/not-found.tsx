import Link from "next/link";
import { Home, Search, ArrowRight } from "lucide-react";

const QUICK_LINKS = [
  { label: "T-shirts",  href: "/catalogue/tshirts" },
  { label: "Hoodies",   href: "/catalogue/hoodies" },
  { label: "Polos",     href: "/catalogue/polos" },
  { label: "Softshells",href: "/catalogue/softshells" },
  { label: "Contact",   href: "/contact" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 pt-[var(--site-header-offset)]">
      <div className="w-full max-w-lg text-center">

        {/* Pill */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--hm-rose)]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-rose)]">
            Page introuvable
          </span>
        </div>

        <h1 className="mb-4 text-[6rem] font-black leading-none text-[var(--hm-primary)]">404</h1>
        <h2 className="mb-3 text-2xl font-bold text-[var(--hm-text)]">Cette page n&apos;existe pas</h2>
        <p className="mb-8 text-sm leading-7 text-[var(--hm-text-soft)]">
          Le lien que vous avez suivi est peut-être incorrect ou la page a été déplacée.
          Utilisez le catalogue pour trouver votre produit.
        </p>

        {/* CTAs */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary gap-2">
            <Home size={14} />
            Retour à l&apos;accueil
          </Link>
          <Link href="/catalogue" className="btn-outline gap-2">
            <Search size={14} />
            Voir le catalogue
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 border-t border-[var(--hm-line)] pt-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-muted)]">
            Accès rapide
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hm-line)]
                  bg-[var(--hm-surface)] px-3 py-1.5 text-xs text-[var(--hm-text-soft)]
                  transition-colors hover:border-[var(--hm-rose)] hover:text-[var(--hm-rose)]"
              >
                {item.label}
                <ArrowRight size={10} />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
