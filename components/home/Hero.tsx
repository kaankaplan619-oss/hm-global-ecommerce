import Link from "next/link";
import { ArrowRight, Shield, Zap, Award } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(#c9a96e 1px, transparent 1px),
            linear-gradient(90deg, #c9a96e 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,169,110,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="container relative z-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pre-title tag */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 border border-[#c9a96e33] rounded-full bg-[#c9a96e0a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#c9a96e]">
                Spécialiste textile personnalisé depuis 2018
              </span>
            </span>
          </div>

          {/* Main title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-[#f5f5f5]">Le textile personnalisé,</span>
            <br />
            <span className="text-gradient-gold">simple, rapide</span>
            <br />
            <span className="text-[#f5f5f5]">et professionnel.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-[#8a8a8a] max-w-2xl mx-auto leading-relaxed mb-10">
            Commandez en quelques clics avec HM Global Agence et donnez à votre entreprise une image plus forte et plus visible.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/catalogue" className="btn-primary gap-3 text-sm px-8 py-4">
              Voir le catalogue
              <ArrowRight size={16} />
            </Link>
            <Link href="/#techniques" className="btn-outline text-sm px-8 py-4">
              Nos techniques
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { icon: Zap, label: "Livraison rapide", sub: "Délais maîtrisés" },
              { icon: Shield, label: "Qualité garantie", sub: "Produits B&C" },
              { icon: Award, label: "Depuis 2018", sub: "Alsace, France" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[#c9a96e11] border border-[#c9a96e22] flex items-center justify-center">
                  <Icon size={18} className="text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#f5f5f5]">{label}</p>
                  <p className="text-[10px] text-[#555555]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: "linear-gradient(to top, #0a0a0a, transparent)",
        }}
      />
    </section>
  );
}
