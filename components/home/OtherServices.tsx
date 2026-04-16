const SERVICES = [
  {
    emoji: "🪧",
    title: "Enseignes",
    description: "Panneaux, enseignes lumineuses et signalétique pour votre local commercial.",
  },
  {
    emoji: "🚗",
    title: "Marquage véhicule",
    description: "Covering partiel ou total, lettrage, stickers adhésifs pour votre flotte.",
  },
  {
    emoji: "📐",
    title: "Bâches publicitaires",
    description: "Bâches grand format pour vos événements, chantiers et façades.",
  },
  {
    emoji: "🎨",
    title: "Création graphique",
    description: "Design, PAO, mise en page et préparation des fichiers d'impression.",
  },
  {
    emoji: "💎",
    title: "Identité visuelle",
    description: "Création de logos, chartes graphiques et supports de communication.",
  },
];

export default function OtherServices() {
  return (
    <section className="section-sm" id="savoir-faire">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Left */}
          <div className="md:w-1/3 shrink-0">
            <p className="section-tag">Nos autres savoir-faire</p>
            <h2 className="text-2xl md:text-3xl font-black text-[#f5f5f5] mb-4">
              HM Global Agence,<br />
              <span className="text-gradient-gold">bien plus que du textile</span>
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed">
              Notre cœur de métier V1 est le textile. Mais notre agence accompagne les entreprises sur l&rsquo;ensemble de leur visibilité.
            </p>
          </div>

          {/* Services */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="flex items-start gap-4 p-4 rounded-lg bg-[#0f0f0f] border border-[#1e1e1e]"
              >
                <span className="text-2xl">{service.emoji}</span>
                <div>
                  <h3 className="text-sm font-semibold text-[#8a8a8a] mb-1">{service.title}</h3>
                  <p className="text-xs text-[#3a3a3a] leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
