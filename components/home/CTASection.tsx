import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="section">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl border border-[#c9a96e22] bg-[#0f0f0f] p-12 md:p-16 text-center">
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,169,110,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(#c9a96e 1px, transparent 1px), linear-gradient(90deg, #c9a96e 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="section-tag justify-center mb-6">Prêt à commander ?</p>

            <h2 className="text-3xl md:text-5xl font-black text-[#f5f5f5] mb-4">
              Habillons votre<br />
              <span className="text-gradient-gold">entreprise aujourd&rsquo;hui</span>
            </h2>

            <p className="text-sm text-[#8a8a8a] mb-10 max-w-md mx-auto leading-relaxed">
              Créez votre compte, choisissez vos produits, uploadez votre logo. Votre textile personnalisé est à quelques clics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/catalogue" className="btn-primary gap-3 text-sm px-8 py-4">
                Commencer ma commande
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-outline text-sm px-8 py-4">
                Nous contacter
              </Link>
            </div>

            {/* Micro-trust */}
            <p className="mt-8 text-xs text-[#3a3a3a]">
              Paiement sécurisé · Livraison offerte dès 10 pièces · Suivi commande inclus
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
