import { ShieldCheck, Truck, RotateCcw, HeadphonesIcon, Award, Clock } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Paiement 100% sécurisé",
    description: "Stripe — la référence mondiale du paiement en ligne. CB, Apple Pay, Google Pay.",
  },
  {
    icon: Truck,
    title: "Livraison offerte dès 10 pièces",
    description: "Commandez en volume et profitez de la livraison gratuite pour votre équipe.",
  },
  {
    icon: RotateCcw,
    title: "Annulation 30 minutes",
    description: "Vous avez 30 minutes après votre commande pour l'annuler si besoin.",
  },
  {
    icon: HeadphonesIcon,
    title: "Suivi personnalisé",
    description: "Notre équipe vérifie votre fichier et vous tient informé à chaque étape.",
  },
  {
    icon: Award,
    title: "Produits B&C Select",
    description: "Gamme professionnelle éprouvée, utilisée par les meilleures entreprises d'Europe.",
  },
  {
    icon: Clock,
    title: "Délais maîtrisés",
    description: "Nous vous communiquons un délai précis à la validation de votre commande.",
  },
];

const STATS = [
  { value: "2018", label: "Fondée en" },
  { value: "1 000+", label: "Commandes livrées" },
  { value: "100%", label: "Traçabilité" },
  { value: "67", label: "Alsace, France" },
];

export default function TrustSection() {
  return (
    <section className="section bg-[#080808]" id="a-propos">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-tag justify-center">Pourquoi nous choisir</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-4">
            Une agence sérieuse,<br />
            <span className="text-gradient-gold">un résultat professionnel</span>
          </h2>
        </div>

        {/* Trust items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 p-5 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl hover:border-[#2a2a2a] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#c9a96e11] border border-[#c9a96e22] flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} className="text-[#c9a96e]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f5f5f5] mb-1">{title}</h3>
                <p className="text-xs text-[#555555] leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="divider-gold mb-16" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-gradient-gold mb-1">
                {value}
              </div>
              <div className="text-xs text-[#555555] uppercase tracking-wider font-semibold">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
