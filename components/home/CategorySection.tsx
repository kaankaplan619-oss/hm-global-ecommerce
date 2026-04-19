import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { SEASONAL_ORDER, CURRENT_SEASON } from "@/data/products";
import ProductImage from "@/components/product/ProductImage";

// ─── Données catégories ───────────────────────────────────────────────────────

const CATEGORY_DATA = {
  tshirts: {
    label: "T-shirts",
    tagline: "L'essentiel du quotidien, habillé à votre image",
    description:
      "Coton bio ou respirant, coupe régulière ou slim. Le support le plus polyvalent pour vos équipes, événements et promotions.",
    href: "/catalogue/tshirts",
    image: "/images/products/tu01t/front-blanc.jpg",
    imageAlt: "T-shirt personnalisé B&C",
    count: 3,
    from: "8,50",
    techniques: ["DTF", "Flex", "Broderie"],
    accent: "border-t-[var(--hm-rose)]",
    dot: "bg-[var(--hm-rose)]",
    badgeBg: "bg-[var(--hm-accent-soft-rose)]",
    badgeText: "text-[var(--hm-rose)]",
    ctaText: "Voir les t-shirts",
  },
  hoodies: {
    label: "Hoodies & Sweats",
    tagline: "Confort professionnel, identité forte",
    description:
      "Molleton épais, capuche réglable ou col rond. Les incontournables pour les équipes sportives, associations et entreprises.",
    href: "/catalogue/hoodies",
    image: "/images/products/wu620/front-noir.jpg",
    imageAlt: "Hoodie personnalisé B&C",
    count: 2,
    from: "18,50",
    techniques: ["DTF", "Flex", "Broderie"],
    accent: "border-t-[var(--hm-blue)]",
    dot: "bg-[var(--hm-blue)]",
    badgeBg: "bg-[var(--hm-accent-soft-blue)]",
    badgeText: "text-[var(--hm-blue)]",
    ctaText: "Voir les hoodies",
  },
  softshells: {
    label: "Softshells & Vestes",
    tagline: "La finition premium pour les projets corporate",
    description:
      "Imperméable, respirant, coupe ajustée. La veste de référence pour les tenues pro, les équipes terrain et les cadeaux clients.",
    href: "/catalogue/softshells",
    image: "/images/products/jui62/front-marine.jpg",
    imageAlt: "Softshell personnalisé B&C",
    count: 2,
    from: "65,00",
    techniques: ["Broderie", "DTF"],
    accent: "border-t-[var(--hm-purple)]",
    dot: "bg-[var(--hm-purple)]",
    badgeBg: "bg-[var(--hm-accent-soft-purple)]",
    badgeText: "text-[var(--hm-purple)]",
    ctaText: "Voir les softshells",
  },
} as const;

// ─── Composant ────────────────────────────────────────────────────────────────

export default function CategorySection() {
  const order = SEASONAL_ORDER[CURRENT_SEASON] as Array<keyof typeof CATEGORY_DATA>;

  return (
    <section className="bg-[var(--hm-surface)] py-20 sm:py-24" id="catalogue">
      <div className="container">

        {/* ── En-tête ──────────────────────────────────────────────────── */}
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-tag">Notre catalogue</p>
            <h2 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-[var(--hm-ink)] md:text-4xl">
              Trois familles de produits, un parcours simple pour bien choisir.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-[var(--hm-muted)] sm:text-base">
              T-shirts, hoodies et softshells couvrent l'essentiel des besoins textiles
              professionnels. Chaque famille a été sélectionnée pour rester claire à lire,
              simple à comparer et adaptée à la personnalisation.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="btn-outline gap-2 self-start shrink-0 lg:self-auto"
          >
            Tout le catalogue
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* ── Grille catégories ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* 3 cartes produit — ordre saisonnier */}
          {order.map((catId) => {
            const cat = CATEGORY_DATA[catId];
            if (!cat) return null;

            return (
              <Link
                key={catId}
                href={cat.href}
                className={`group flex flex-col overflow-hidden rounded-2xl border border-t-4
                  border-[var(--hm-border)] bg-white
                  transition-all duration-300
                  hover:border-[rgba(177,63,116,0.22)]
                  hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]
                  hover:-translate-y-0.5
                  ${cat.accent}`}
              >
                {/* ── Zone image ── */}
                <div className="relative aspect-[4/4.5] overflow-hidden bg-[var(--hm-surface)]">
                  <ProductImage
                    src={cat.image}
                    alt={cat.imageAlt}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain transition-transform duration-500
                      group-hover:scale-[1.04]"
                    label="Visuel à venir"
                  />

                  {/* Badge "X modèles" */}
                  <div className="absolute right-3 top-3">
                    <span className={`rounded-full border border-[var(--hm-border)] bg-white/95 px-3 py-1 text-[10px] font-semibold tracking-[0.14em]
                      shadow-sm backdrop-blur-sm ${cat.badgeText}`}>
                      {cat.count} modèle{cat.count > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* ── Infos ── */}
                <div className="flex flex-1 flex-col p-5">

                  {/* Nom + tagline */}
                  <h3 className="mb-1 text-[16px] font-semibold leading-snug
                    text-[var(--hm-ink)] transition-colors group-hover:text-[var(--hm-primary)]">
                    {cat.label}
                  </h3>
                  <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-[var(--hm-muted)]">
                    {cat.tagline}
                  </p>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-[13px] leading-6 text-[var(--hm-muted)]">
                    {cat.description}
                  </p>

                  {/* Techniques */}
                  <div className="mb-5 rounded-2xl border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 py-3">
                    <p className="text-[11px] font-medium leading-6 text-[var(--hm-ink)]">
                      {cat.techniques.join(" · ")}
                    </p>
                  </div>

                  {/* Prix + CTA */}
                  <div className="flex items-center justify-between border-t
                    border-[var(--hm-border)] pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--hm-muted)]">
                        À partir de
                      </p>
                      <span className="text-lg font-semibold text-[var(--hm-primary)]">
                        {cat.from} €
                      </span>
                      <span className="ml-1 text-[10px] text-[var(--hm-muted)]">TTC</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-semibold
                      text-[var(--hm-primary)] transition-all duration-200
                      group-hover:gap-1.5">
                      {cat.ctaText}
                      <ArrowRight
                        size={11}
                        className="transition-transform duration-200
                          group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* ── 4e carte : Sur mesure / Devis ──────────────────────────── */}
          <Link
            href="/contact"
            className="group flex flex-col justify-between overflow-hidden rounded-2xl
              border border-t-4 border-[var(--hm-border)] border-t-[var(--hm-primary)]
              bg-white
              transition-all duration-300
              hover:border-[rgba(177,63,116,0.22)]
              hover:shadow-[0_18px_40px_rgba(63,45,88,0.08)]
              hover:-translate-y-0.5"
          >
            <div className="p-5">
              {/* Icône */}
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl
                bg-[var(--hm-surface)] border border-[var(--hm-border)]">
                <MessageSquare size={17} className="text-[var(--hm-primary)]" />
              </div>

              {/* Titre */}
              <h3 className="mb-2 text-[16px] font-semibold leading-snug text-[var(--hm-ink)]
                transition-colors group-hover:text-[var(--hm-primary)]">
                Projet sur mesure
              </h3>
              <p className="mb-4 text-[11px] uppercase tracking-[0.14em] text-[var(--hm-muted)]">
                Devis personnalisé
              </p>

              {/* Points clés */}
              <ul className="flex flex-col gap-2.5 mb-6">
                {[
                  "Grand volume ou commande récurrente",
                  "Logo à adapter ou à créer",
                  "Mix de produits dans une commande",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full
                      bg-[var(--hm-primary)]" />
                    <span className="text-[12px] leading-6 text-[var(--hm-ink)]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-[var(--hm-border)] bg-[var(--hm-surface)] px-4 py-3">
                <p className="text-[11px] leading-6 text-[var(--hm-muted)]">
                  Pour les demandes mixtes, les volumes particuliers ou les besoins encore à cadrer.
                </p>
              </div>
            </div>

            {/* CTA bas de carte */}
            <div className="border-t border-[var(--hm-border)] p-5">
              <span className="flex items-center justify-between text-[12px] font-semibold
                text-[var(--hm-primary)]">
                Demander un devis
                <ArrowRight
                  size={13}
                  className="transition-transform duration-200
                    group-hover:translate-x-1"
                />
              </span>
              <p className="mt-1 text-[10px] text-[var(--hm-muted)]">
                Réponse rapide · Sans engagement
              </p>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
