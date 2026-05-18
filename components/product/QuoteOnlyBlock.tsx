import Link from "next/link";
import { ClipboardList, ArrowRight, MessageSquare, CheckCircle2 } from "lucide-react";
import type { Product } from "@/types";

/**
 * QuoteOnlyBlock — remplace ProductConfigurator quand `product.quoteOnly === true`.
 *
 * Affiché à la place du bouton "Ajouter au panier" pour les produits dont la
 * vente unitaire automatique n'est pas viable (volume requis, broderie uniquement,
 * provider en cours de migration, etc.).
 *
 * Aucun appel panier / Stripe / API commande. Pur CTA vers /contact.
 *
 * Cas d'usage mai 2026 :
 *   - Polo Gildan 64800 (broderie uniquement, pas de provider Printify EU
 *     exploitable, viable uniquement en volume).
 */
interface QuoteOnlyBlockProps {
  product: Product;
}

const BENEFITS = [
  "Devis sous 24h ouvrées",
  "BAT validé avant production",
  "Tarif dégressif selon quantité",
  "Conseil technique broderie ou print",
] as const;

export default function QuoteOnlyBlock({ product }: QuoteOnlyBlockProps) {
  const subject = product.quoteOnlySubject ?? "devis-broderie";
  const href = `/contact?sujet=${encodeURIComponent(subject)}&produit=${encodeURIComponent(product.slug)}`;

  const message =
    product.quoteOnlyMessage ??
    "Produit disponible uniquement sur devis. Demandez un tarif personnalisé adapté à votre volume et à votre marquage.";

  return (
    <div className="flex flex-col gap-5 rounded-[20px] border border-[var(--hm-line)] bg-white p-6 shadow-[0_12px_28px_rgba(63,45,88,0.05)]">
      {/* En-tête : badge + titre */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "rgba(76,47,111,0.10)",
            color: "var(--hm-purple)",
          }}
        >
          <ClipboardList size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--hm-text-muted)]">
            Produit sur devis
          </p>
          <h3 className="mt-1 text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-[var(--hm-text)]">
            Tarif et délai personnalisés
          </h3>
        </div>
      </div>

      {/* Message principal */}
      <p className="text-[13px] leading-6 text-[var(--hm-text-soft)]">
        {message}
      </p>

      {/* Bénéfices */}
      <ul className="space-y-2">
        {BENEFITS.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2.5 text-[12px] leading-5 text-[var(--hm-text-soft)]"
          >
            <CheckCircle2
              size={13}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--hm-purple)" }}
            />
            {b}
          </li>
        ))}
      </ul>

      {/* CTA principal */}
      <Link
        href={href}
        className="btn-primary w-full justify-center gap-2 px-6 py-3.5 text-[12px]"
        style={{
          background: "var(--hm-purple)",
        }}
      >
        Demander un devis broderie
        <ArrowRight size={14} />
      </Link>

      {/* CTA secondaire */}
      <Link
        href="/contact"
        className="inline-flex items-center justify-center gap-2 text-[11px] font-semibold text-[var(--hm-text-soft)] transition hover:text-[var(--hm-purple)]"
      >
        <MessageSquare size={12} />
        Échanger avec un conseiller HM Global
      </Link>

      <p className="text-center text-[10px] leading-5 text-[var(--hm-text-muted)]">
        Tarif volume possible selon quantité, textile et marquage. Aucun engagement
        de votre part avant validation du BAT.
      </p>
    </div>
  );
}
