import { ShoppingBag, Upload, Eye, Truck, ShieldCheck, Paintbrush, Zap, Package } from "lucide-react";

const STEPS = [
  {
    number: "01",
    Icon: ShoppingBag,
    title: "Choisissez votre textile",
    description:
      "Sélectionnez le vêtement qui vous correspond parmi notre large gamme.",
    color: "#6EC1E4",
  },
  {
    number: "02",
    Icon: Upload,
    title: "Ajoutez votre logo ou design",
    description:
      "Importez votre logo, ajoutez un texte ou créez votre design facilement.",
    color: "#6A3FA0",
  },
  {
    number: "03",
    Icon: Eye,
    title: "Validez l'aperçu",
    description:
      "Visualisez le rendu final et validez votre personnalisation en toute confiance.",
    color: "#C34A7E",
  },
  {
    number: "04",
    Icon: Truck,
    title: "Impression et livraison",
    description:
      "Nous imprimons avec soin et livrons rapidement chez vous.",
    color: "#A8366A",
  },
];

const ADVANTAGES = [
  {
    Icon: ShieldCheck,
    title: "Qualité professionnelle",
    description: "Textiles et impressions haut de gamme.",
    color: "#6EC1E4",
  },
  {
    Icon: Paintbrush,
    title: "100% personnalisable",
    description: "Votre style, votre logo, votre identité.",
    color: "#6A3FA0",
  },
  {
    Icon: Zap,
    title: "Impression textile",
    description: "Technologie de pointe pour un rendu exceptionnel.",
    color: "#C34A7E",
  },
  {
    Icon: Package,
    title: "Livraison gratuite",
    description: "Dès 10 produits commandés en France métropolitaine.",
    color: "#A8366A",
  },
];

export default function ProcessSection() {
  return (
    <section
      id="comment-ca-marche"
      className="py-20 lg:py-28"
      style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 100%)" }}
    >
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: "#6A3FA0" }}
          >
            Simple, rapide &amp; professionnel
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F1C2E] mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-[#64748B] max-w-lg mx-auto text-sm leading-relaxed">
            De votre idée à votre textile personnalisé,{" "}
            <span className="font-semibold" style={{ color: "#C34A7E" }}>
              on s&rsquo;occupe de tout.
            </span>
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Gradient progress line — desktop only, sits behind the step dots */}
          <div
            className="hidden lg:block absolute top-5 z-0 h-[2px] rounded-full"
            style={{
              left: "12.5%",
              right: "12.5%",
              background:
                "linear-gradient(90deg, #6EC1E4 0%, #6A3FA0 50%, #C34A7E 100%)",
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center group"
              >
                {/* Step number bubble */}
                <div
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: step.color,
                    boxShadow: `0 4px 18px ${step.color}55`,
                  }}
                >
                  {step.number}
                </div>

                {/* Card */}
                <div
                  className="bg-white rounded-2xl p-6 w-full flex flex-col items-center shadow-[0_4px_24px_rgba(15,28,46,0.07)] hover:shadow-[0_8px_40px_rgba(15,28,46,0.13)] transition-shadow duration-300"
                >
                  {/* Icon circle */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${step.color}18` }}
                  >
                    <step.Icon
                      size={24}
                      style={{ color: step.color }}
                      strokeWidth={1.75}
                    />
                  </div>

                  <h3 className="font-bold text-[#0F1C2E] mb-2 text-sm leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {ADVANTAGES.map((adv) => (
            <div
              key={adv.title}
              className="flex items-start gap-3 p-4 bg-white rounded-xl"
              style={{ boxShadow: "0 2px 12px rgba(15,28,46,0.05)" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${adv.color}18` }}
              >
                <adv.Icon
                  size={16}
                  style={{ color: adv.color }}
                  strokeWidth={1.75}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F1C2E]">{adv.title}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
                  {adv.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
