import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageSquare } from "lucide-react";
import { PRODUCTS_BY_CATEGORY } from "@/data/products";

const CATEGORIES = [
  {
    id: "tshirts",
    label: "T-shirts personnalisés",
    intro: "Le support le plus rapide à activer",
    description:
      "Pour équiper une équipe, lancer une opération ou démarrer un merchandising propre avec un budget net.",
    image: "/mockups/gildan-5000/blanc-front.png",
    href: "/catalogue/tshirts",
    price: "19,90 €",
  },
  {
    id: "hoodies",
    label: "Hoodies & sweats",
    intro: "La version plus visible et plus premium",
    description:
      "Pour les marques, clubs ou équipes qui veulent un rendu plus installé, plus durable et plus valorisant.",
    image: "/mockups/gildan-18500/noir-front.png",
    href: "/catalogue/hoodies",
    price: "39,90 €",
  },
] as const;

const DISPLAY_ORDER: Array<keyof typeof CATEGORY_DATA> = ["tshirts", "hoodies", "tshirts_premium"];

export default function CategorySection() {
  return (
    <section className="py-18 sm:py-22" id="catalogue">
      <div className="container">
        <div className="mb-10 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] border border-[var(--hm-line)] bg-white p-7 shadow-[0_16px_34px_rgba(63,45,88,0.05)] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--hm-primary)]">
              Deux chemins simples
            </p>
            <h2 className="mt-4 max-w-[12ch] text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--hm-text)] sm:text-[4.2rem]">
              Commander vite
              <br />
              ou cadrer mieux.
            </h2>
            <p className="mt-5 max-w-[34rem] text-[15px] leading-7 text-[var(--hm-text-soft)]">
              Le site doit rassurer en deux secondes : soit le besoin est simple et le catalogue
              suffit, soit le projet demande de l’accompagnement et le devis devient la bonne porte.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-muted)]">
                  Parcours catalogue
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--hm-text)]">
                  Pour un besoin textile déjà cadré
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                  Choix du produit, technique, quantité et passage à l’action rapide.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--hm-line)] bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-text-muted)]">
                  Parcours devis
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--hm-text)]">
                  Pour un projet plus stratégique ou mixte
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                  Design, adaptation logo, volume, signalétique ou besoin multi-supports.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[rgba(63,45,88,0.08)] bg-[linear-gradient(180deg,#433053_0%,#3f2d58_100%)] p-7 text-white shadow-[0_18px_40px_rgba(63,45,88,0.14)] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/64">
              Entrée idéale
            </p>
            <p className="mt-3 max-w-[24ch] text-2xl font-semibold leading-[1.06] tracking-[-0.04em]">
              Faire comprendre très vite quoi faire ensuite.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/78">
              <p>Le catalogue sert les commandes simples.</p>
              <p>Le devis sert les besoins plus flous, plus larges ou plus sensibles.</p>
              <p>Cette séparation rend le site plus élégant et augmente la sensation de maîtrise.</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/catalogue" className="btn-primary px-5 py-3 text-[0.78rem]">
                Accéder au catalogue
              </Link>
              <Link href="/contact" className="btn-outline border-white/20 bg-white/10 px-5 py-3 text-[0.78rem] text-white hover:bg-white hover:text-[var(--hm-text)]">
                Demander un devis
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.9fr]">
          {CATEGORIES.map((category) => {
            const count = PRODUCTS_BY_CATEGORY[category.id as keyof typeof PRODUCTS_BY_CATEGORY]?.length ?? 0;

            return (
              <Link
                key={category.id}
                href={category.href}
                className="group flex flex-col overflow-hidden rounded-[1.8rem] border border-[var(--hm-line)] bg-white shadow-[0_16px_34px_rgba(63,45,88,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(177,63,116,0.18)] hover:shadow-[0_20px_42px_rgba(63,45,88,0.08)]"
              >
                <div className="relative aspect-[4/4.25] overflow-hidden border-b border-[var(--hm-line)] bg-[var(--hm-surface)]">
                  <Image
                    src={category.image}
                    alt={category.label}
                    fill
                    sizes="(min-width: 1280px) 26vw, (min-width: 768px) 50vw, 100vw"
                    className="object-contain p-5 transition duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute right-4 top-4 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--hm-text-soft)] shadow-sm">
                    {count} modèle{count > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                    {category.intro}
                  </p>
                  <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-[var(--hm-text)]">
                    {category.label}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-[var(--hm-text-soft)]">
                    {category.description}
                  </p>

                  <div className="mt-auto pt-5">
                    <div className="flex items-end justify-between border-t border-[var(--hm-line)] pt-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--hm-text-muted)]">
                          Dès
                        </p>
                        <p className="text-[1.4rem] font-semibold tracking-[-0.04em] text-[var(--hm-primary)]">
                          {category.price}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--hm-text)] transition group-hover:text-[var(--hm-primary)]">
                        Voir la sélection
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          <Link
            href="/contact"
            className="group flex h-full flex-col justify-between rounded-[1.8rem] border border-[var(--hm-line)] bg-white p-6 shadow-[0_16px_34px_rgba(63,45,88,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(177,63,116,0.20)] hover:shadow-[0_20px_42px_rgba(63,45,88,0.08)]"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--hm-primary)] shadow-sm">
                <MessageSquare size={18} />
              </div>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--hm-primary)]">
                Projet accompagné
              </p>
              <h3 className="mt-2 max-w-[12ch] text-[1.6rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--hm-text)]">
                Besoin plus large qu’un simple textile ?
              </h3>
              <p className="mt-4 text-[14px] leading-7 text-[var(--hm-text-soft)]">
                Logo à reprendre, volume particulier, besoin multi-supports, signalétique ou accompagnement
                créatif : HM Global reprend le sujet avec toi avant production.
              </p>

              <div className="mt-5 space-y-2">
                {[
                  "Grand volume ou commande récurrente",
                  "Projet qui mélange textile, print ou habillage",
                  "Besoin de design, adaptation ou préparation fichier",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-[13px] text-[var(--hm-text)]">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[var(--hm-primary)]" />
                    <span className="leading-6">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[1.35rem] border border-[var(--hm-line)] bg-[var(--hm-surface)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--hm-text)]">Demander un devis</p>
                  <p className="text-[12px] text-[var(--hm-text-soft)]">Réponse rapide, sans engagement.</p>
                </div>
                <ArrowRight size={14} className="text-[var(--hm-primary)]" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
