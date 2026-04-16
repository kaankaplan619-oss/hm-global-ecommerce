const STEPS = [
  {
    number: "01",
    title: "Choisissez votre produit",
    description:
      "Parcourez notre catalogue : T-shirts, hoodies, softshells. Sélectionnez la couleur, la taille et la quantité.",
  },
  {
    number: "02",
    title: "Configurez votre marquage",
    description:
      "Choisissez votre technique (DTF, Flex, Broderie), l'emplacement (cœur, dos, ou les deux) et uploadez votre logo.",
  },
  {
    number: "03",
    title: "Réglez en ligne",
    description:
      "Paiement sécurisé par Stripe : carte bancaire, Apple Pay ou Google Pay. Votre commande est enregistrée immédiatement.",
  },
  {
    number: "04",
    title: "On s'occupe du reste",
    description:
      "Notre équipe vérifie votre fichier, valide la commande et lance la production. Vous êtes informé à chaque étape.",
  },
];

export default function ProcessSection() {
  return (
    <section className="section" id="comment-ca-marche">
      <div className="container">
        <div className="text-center mb-14">
          <p className="section-tag justify-center">Comment ça marche</p>
          <h2 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-4">
            Commandez en 4 étapes,<br />
            <span className="text-gradient-gold">livré chez vous</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-6 h-[1px] bg-[#2a2a2a] z-10" />
              )}

              <div className="p-6 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl hover:border-[#2a2a2a] transition-colors">
                {/* Number */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-[#1e1e1e]">{step.number}</span>
                  <div className="h-[1px] flex-1 bg-[#c9a96e33]" />
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-[#f5f5f5] mb-2">{step.title}</h3>
                <p className="text-xs text-[#555555] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
