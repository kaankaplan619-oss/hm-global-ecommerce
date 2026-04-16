import { Check, X } from "lucide-react";

const TECHNIQUES = [
  {
    id: "dtf",
    label: "DTF",
    badge: "Populaire",
    badgeColor: "#c9a96e",
    priceLabel: "Dès 19,90 €",
    description:
      "Direct To Film. Impression haute définition, couleurs illimitées et dégradés. Rendu vif et durable, lavage à 40°C.",
    features: [
      { label: "Couleurs illimitées", ok: true },
      { label: "Dégradés & visuels complexes", ok: true },
      { label: "Rendu premium", ok: true },
      { label: "Coeur, dos, coeur+dos", ok: true },
      { label: "Feeling souple sur tissu", ok: true },
      { label: "Résistance lavage", ok: true },
    ],
    highlight: true,
  },
  {
    id: "flex",
    label: "Flex / Vinyle",
    badge: "Économique",
    badgeColor: "#60a5fa",
    priceLabel: "Dès 19,90 €",
    description:
      "Découpe vinyle thermocollant. Trait net et précis, idéal pour les logos simples, textes et typographies.",
    features: [
      { label: "Couleurs illimitées", ok: false },
      { label: "Dégradés & visuels complexes", ok: false },
      { label: "Rendu premium", ok: true },
      { label: "Coeur, dos, coeur+dos", ok: true },
      { label: "Feeling souple sur tissu", ok: true },
      { label: "Résistance lavage", ok: true },
    ],
    highlight: false,
  },
  {
    id: "broderie",
    label: "Broderie",
    badge: "Premium",
    badgeColor: "#a78bfa",
    priceLabel: "Dès 25,90 €",
    description:
      "Broderie machine haute définition. Rendu 3D premium, toucher noble. Idéal pour softshells, polaires et polos.",
    features: [
      { label: "Couleurs illimitées", ok: false },
      { label: "Dégradés & visuels complexes", ok: false },
      { label: "Rendu premium", ok: true },
      { label: "Coeur, dos, coeur+dos", ok: true },
      { label: "Feeling souple sur tissu", ok: false },
      { label: "Résistance lavage", ok: true },
    ],
    highlight: false,
  },
];

export default function TechniqueComparison() {
  return (
    <section className="section bg-[#080808]" id="techniques">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-tag justify-center">Nos techniques</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-4">
            DTF, Flex ou Broderie —<br />
            <span className="text-gradient-gold">Quelle technique choisir ?</span>
          </h2>
          <p className="text-[#555555] text-sm max-w-xl mx-auto">
            Chaque technique a ses avantages. Nous vous guidons pour choisir la meilleure option selon votre projet et votre budget.
          </p>
        </div>

        {/* Technique cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TECHNIQUES.map((tech) => (
            <div
              key={tech.id}
              className={`relative rounded-xl p-6 border transition-all
                ${tech.highlight
                  ? "bg-[#111111] border-[#c9a96e33]"
                  : "bg-[#0f0f0f] border-[#1e1e1e]"
                }`}
            >
              {/* Badge */}
              <span
                className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: `${tech.badgeColor}22`,
                  color: tech.badgeColor,
                  border: `1px solid ${tech.badgeColor}44`,
                }}
              >
                {tech.badge}
              </span>

              {/* Title + Price */}
              <div className="flex items-start justify-between mb-4 mt-2">
                <h3 className="text-xl font-black text-[#f5f5f5]">{tech.label}</h3>
                <span className="text-xs font-semibold text-[#c9a96e]">{tech.priceLabel}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#555555] leading-relaxed mb-6">
                {tech.description}
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-3">
                {tech.features.map((feat) => (
                  <li key={feat.label} className="flex items-center gap-3">
                    {feat.ok ? (
                      <Check size={14} className="text-[#4ade80] shrink-0" />
                    ) : (
                      <X size={14} className="text-[#2a2a2a] shrink-0" />
                    )}
                    <span className={`text-xs ${feat.ok ? "text-[#8a8a8a]" : "text-[#2a2a2a]"}`}>
                      {feat.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center">
          <p className="text-xs text-[#555555]">
            Vous ne savez pas quelle technique choisir ?{" "}
            <a href="/contact" className="text-[#c9a96e] hover:underline">
              Contactez-nous
            </a>
            , on vous conseille gratuitement.
          </p>
        </div>
      </div>
    </section>
  );
}
