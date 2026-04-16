import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SEASONAL_ORDER, CURRENT_SEASON } from "@/data/products";

const CATEGORIES = {
  tshirts: {
    label: "T-shirts",
    description: "T-shirts personnalisés pour votre équipe. DTF, flex ou broderie, à partir de 19,90 €.",
    href: "/catalogue/tshirts",
    from: "19,90 €",
    color: "#c9a96e",
    emoji: "👕",
    items: ["B&C TU01T", "B&C TW02T", "B&C TU03T"],
  },
  hoodies: {
    label: "Hoodies & Sweats",
    description: "Sweats et hoodies chauds pour toute la saison. Qualité professionnelle, à partir de 42,90 €.",
    href: "/catalogue/hoodies",
    from: "42,90 €",
    color: "#60a5fa",
    emoji: "🧥",
    items: ["B&C WG004", "B&C WU620"],
  },
  softshells: {
    label: "Softshells & Vestes",
    description: "Vestes softshell imperméables et respirantes. Broderie premium recommandée, à partir de 79,90 €.",
    href: "/catalogue/softshells",
    from: "79,90 €",
    color: "#a78bfa",
    emoji: "🫧",
    items: ["B&C JUI62", "B&C JWI63"],
  },
};

export default function CategorySection() {
  // Ordre saisonnier configurable
  const order = SEASONAL_ORDER[CURRENT_SEASON];

  return (
    <section className="section" id="catalogue">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="section-tag justify-center">Notre catalogue</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-4">
            Textile de qualité,<br />
            <span className="text-gradient-gold">personnalisé à votre image</span>
          </h2>
          <p className="text-[#555555] text-sm max-w-xl mx-auto">
            Trois catégories, une seule mission : donner à votre entreprise une image forte, cohérente et professionnelle.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {order.map((catId, index) => {
            const cat = CATEGORIES[catId as keyof typeof CATEGORIES];
            if (!cat) return null;
            const isPrimary = index === 0;

            return (
              <Link
                key={catId}
                href={cat.href}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300
                  ${isPrimary
                    ? "bg-[#111111] border-[#c9a96e22] hover:border-[#c9a96e55] md:col-span-1"
                    : "bg-[#0f0f0f] border-[#1e1e1e] hover:border-[#2a2a2a]"
                  }`}
              >
                {/* Number indicator */}
                <div className="absolute top-5 right-5 text-[10px] font-bold text-[#2a2a2a] tracking-widest">
                  0{index + 1}
                </div>

                <div className="p-8">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-6"
                    style={{ background: `${cat.color}11` }}
                  >
                    {cat.emoji}
                  </div>

                  {/* Label + price */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-[#f5f5f5]">{cat.label}</h3>
                    <span className="text-xs text-[#c9a96e] font-semibold">
                      dès {cat.from}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#555555] leading-relaxed mb-6">
                    {cat.description}
                  </p>

                  {/* References */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {cat.items.map((ref) => (
                      <span
                        key={ref}
                        className="text-[10px] px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#555555] font-mono"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#c9a96e] group-hover:gap-3 transition-all">
                    Voir les produits
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${cat.color}66, transparent)` }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
