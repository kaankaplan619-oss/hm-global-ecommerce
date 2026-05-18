import {
  FileSearch,
  Brush,
  CheckCheck,
  Truck,
  Sparkles,
} from "lucide-react";

/**
 * ProcessSection — refonte mai 2026.
 *
 * Avant : "Comment ça marche ?" générique avec 4 étapes neutres
 *          + 4 avantages SaaS (Qualité, 100% personnalisable, etc.).
 * Après : "Un vrai contrôle avant production" — argumentaire concret qui
 *          justifie le prix (19,90 € / 21,90 €) en explicitant le parcours
 *          fichier → BAT → validation → production → livraison.
 *
 * Ne touche pas aux routes, juste le markup et le contenu.
 */

const STEPS = [
  {
    number: "01",
    Icon: FileSearch,
    title: "Réception fichier & contrôle",
    description:
      "Votre logo est vérifié manuellement : résolution, vectorisation, couleurs, marges. On corrige les erreurs courantes avant production.",
    color: "#6EC1E4",
  },
  {
    number: "02",
    Icon: Brush,
    title: "Conseil technique : DTF / Flex / Broderie",
    description:
      "On choisit avec vous la bonne technique selon le tissu, le rendu visé et le nombre de couleurs. Pas de surprise sur le résultat final.",
    color: "#6A3FA0",
  },
  {
    number: "03",
    Icon: CheckCheck,
    title: "BAT validé avant lancement",
    description:
      "Bon-à-tirer envoyé avant toute production. Vous voyez le rendu exact sur le textile choisi, vous validez, puis seulement on lance.",
    color: "#C34A7E",
  },
  {
    number: "04",
    Icon: Truck,
    title: "Production & livraison suivie",
    description:
      "Production lancée après votre BAT. Livraison 7-10 jours, suivi de colis transmis. Devis volume sur demande dès 50 pièces.",
    color: "#A8366A",
  },
] as const;

export default function ProcessSection() {
  return (
    <section
      id="comment-ca-marche"
      className="py-20 lg:py-28"
      style={{ background: "linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 100%)" }}
    >
      <div className="container">
        {/* Header */}
        <div className="mb-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p
              className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "#6A3FA0" }}
            >
              Un vrai contrôle avant production
            </p>
            <h2 className="text-3xl md:text-[2.6rem] font-black leading-[1.05] tracking-tight text-[#0F1C2E]">
              Plus qu&apos;un textile imprimé&nbsp;:
              <br />
              <span style={{ color: "#C34A7E" }}>un rendu cadré avant fabrication.</span>
            </h2>
          </div>
          <p className="text-[13px] leading-7 text-[#475569] lg:max-w-md">
            Le prix d&apos;un t-shirt à 19,90&nbsp;€ TTC inclut bien plus que le textile&nbsp;:
            vérification du fichier, conseil technique, BAT validé avant lancement et
            suivi jusqu&apos;à la livraison. C&apos;est pour ça que nos commandes sortent propres
            du premier coup, sans réimpression coûteuse derrière.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Gradient progress line — desktop only */}
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
                <div className="bg-white rounded-2xl p-6 w-full flex flex-col items-center shadow-[0_4px_24px_rgba(15,28,46,0.07)] hover:shadow-[0_8px_40px_rgba(15,28,46,0.13)] transition-shadow duration-300">
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

        {/* Bandeau bas : "ce que vous payez vraiment" */}
        <div className="mt-14 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_8px_28px_rgba(15,28,46,0.06)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
            <div className="flex items-start gap-3 sm:max-w-xs">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(195,74,126,0.10)", color: "#C34A7E" }}
              >
                <Sparkles size={18} />
              </div>
              <p className="text-[13px] font-semibold leading-snug text-[#0F1C2E]">
                Ce qui est inclus dans chaque commande, sans option payante&nbsp;:
              </p>
            </div>
            <ul className="grid flex-1 grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-4">
              {[
                "Vérification fichier",
                "Conseil technique",
                "BAT avant production",
                "Livraison suivie",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[12px] font-medium text-[#475569]"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "#C34A7E" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
