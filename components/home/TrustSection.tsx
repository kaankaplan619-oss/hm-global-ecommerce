import { BadgeCheck, Clock3, FileCheck2, Headset, ShieldCheck, Sparkles, TimerReset } from "lucide-react";

const REASSURANCE_ITEMS = [
  {
    icon: FileCheck2,
    title: "Contrôle fichier avant production",
    description:
      "Chaque visuel est vérifié avant lancement. Si un logo ou un fichier pose problème, nous revenons vers vous avant toute mise en fabrication.",
  },
  {
    icon: Headset,
    title: "Accompagnement humain",
    description:
      "Vous n'êtes pas laissé seul face à un configurateur. HM Global vous guide sur le support, la technique et la préparation du visuel quand c'est nécessaire.",
  },
  {
    icon: BadgeCheck,
    title: "Production suivie et lisible",
    description:
      "La commande avance par étapes claires : paiement, vérification, validation, production, expédition. Le suivi est pensé pour rester simple et compréhensible.",
  },
  {
    icon: Clock3,
    title: "Délais annoncés clairement",
    description:
      "Nous ne promettons pas du flou. Une fois la commande validée et le fichier conforme, le projet part avec un délai annoncé de manière précise.",
  },
  {
    icon: ShieldCheck,
    title: "Paiement sécurisé",
    description:
      "Le règlement en ligne passe par Stripe. Carte bancaire, Apple Pay et Google Pay sont intégrés avec un parcours sécurisé et familier pour le client.",
  },
  {
    icon: Sparkles,
    title: "Réponse rapide pour les projets sur mesure",
    description:
      "Pour un besoin plus large qu'une simple commande textile, HM Global peut répondre sur le design, le marquage, la préparation de fichier et la communication visuelle.",
  },
];

const PROCESS_POINTS = [
  "Validation du fichier avant lancement",
  "Conseil technique si le support l'exige",
  "Suivi clair entre commande et expédition",
  "Interlocuteur identifiable pour les demandes spécifiques",
];

const MICRO_PROOFS = [
  {
    value: "Avant",
    label: "Contrôle du fichier",
  },
  {
    value: "Pendant",
    label: "Production suivie",
  },
  {
    value: "Après",
    label: "Commande traçable",
  },
];

export default function TrustSection() {
  return (
    <section className="section bg-[var(--hm-surface)]" id="a-propos">
      <div className="container">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-12 items-start mb-12">
          <div>
            <p className="section-tag">Réassurance</p>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--hm-text)] mb-4 leading-tight">
              Une commande claire,
              <br />
              <span className="text-gradient-gold">un accompagnement réel</span>
            </h2>
            <p className="text-sm md:text-base text-[var(--hm-text-soft)] leading-relaxed max-w-xl mb-6">
              HM Global ne se limite pas à encaisser une commande. Le projet est vérifié, cadré et suivi pour éviter les erreurs évitables, clarifier les délais et produire un résultat cohérent avec l'image de votre entreprise.
            </p>

            <div className="rounded-[28px] border border-[var(--hm-line)] bg-white p-6 shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] flex items-center justify-center">
                  <TimerReset size={18} className="text-[var(--hm-purple)]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--hm-text-soft)] font-semibold mb-1">
                    Ce que l'on sécurise
                  </p>
                  <p className="text-lg font-black text-[var(--hm-text)]">
                    Moins d'incertitude, plus de lisibilité
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {PROCESS_POINTS.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <BadgeCheck size={16} className="text-[var(--hm-rose)] mt-0.5 shrink-0" />
                    <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {MICRO_PROOFS.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[var(--hm-line)] bg-[var(--hm-surface)] px-3 py-4 text-center"
                  >
                    <p className="text-sm font-black text-[var(--hm-rose)] mb-1">{item.value}</p>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--hm-text-soft)] font-semibold">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {REASSURANCE_ITEMS.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-[24px] border border-[var(--hm-line)] bg-white p-5 shadow-[0_14px_34px_rgba(63,45,88,0.05)]"
              >
                <div className="w-11 h-11 rounded-full bg-[var(--hm-accent-soft-blue)] border border-[var(--hm-line)] flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[var(--hm-rose)]" />
                </div>
                <h3 className="text-base font-black text-[var(--hm-text)] mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
