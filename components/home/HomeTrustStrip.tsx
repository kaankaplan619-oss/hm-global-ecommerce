import { ShieldCheck, MapPin, Layers, FileText } from "lucide-react";

/**
 * HomeTrustStrip — Bandeau confiance, 4 items courts.
 *
 * Phase polish P1 :
 *   - Compactage vertical (py-10 au lieu de py-14)
 *   - Cyan dominant sur les pictos (rappel logo HM)
 *   - Magenta uniquement sur 1 picto (variation)
 *   - Lisibilité renforcée (titre plus contrasté, descriptif plus lisible)
 */

const TRUST_ITEMS = [
  {
    icon:  ShieldCheck,
    title: "BAT validé avant production",
    desc:  "Aucun lancement sans votre accord écrit sur le rendu final.",
    tone:  "cyan",
  },
  {
    icon:  MapPin,
    title: "Depuis 2018 à Souffelweyersheim",
    desc:  "Un vrai atelier alsacien — et 410 élèves accueillis via Erasmus.",
    tone:  "cyan",
  },
  {
    icon:  Layers,
    title: "Textile + print + signalétique",
    desc:  "Tous les supports gérés en interne, cohérence garantie.",
    tone:  "magenta",
  },
  {
    icon:  FileText,
    title: "Devis rapide pour volumes",
    desc:  "Réponse sous 24h ouvrées avec tarifs dégressifs.",
    tone:  "cyan",
  },
] as const;

const TONE_BG: Record<"cyan" | "magenta", string> = {
  cyan:
    "linear-gradient(135deg, rgba(84,182,210,0.18) 0%, rgba(84,182,210,0.06) 100%)",
  magenta:
    "linear-gradient(135deg, rgba(193,60,138,0.16) 0%, rgba(193,60,138,0.06) 100%)",
};

const TONE_COLOR: Record<"cyan" | "magenta", string> = {
  cyan:    "var(--hm-cyan)",
  magenta: "var(--hm-magenta)",
};

export default function HomeTrustStrip() {
  return (
    <section
      className="py-10 sm:py-14"
      style={{ background: "#ffffff" }}
    >
      <div className="container">
        <div className="mb-8 max-w-2xl">
          <p
            className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--hm-cyan)" }}
          >
            Pourquoi nous choisir
          </p>
          <h2
            className="font-semibold leading-[1.1] tracking-[-0.02em]"
            style={{
              fontSize: "clamp(1.4rem, 2.2vw + 0.4rem, 2rem)",
              color: "var(--hm-text-main)",
            }}
          >
            Une promesse simple, tenue à chaque commande.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc, tone }) => (
            <div
              key={title}
              className="rounded-[1.2rem] bg-white p-5 transition duration-200 hover:-translate-y-0.5"
              style={{
                border: "1px solid rgba(45,35,64,0.08)",
                boxShadow: "0 6px 18px rgba(45,35,64,0.04)",
              }}
            >
              <div
                className="mb-3.5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: TONE_BG[tone],
                  color: TONE_COLOR[tone],
                }}
              >
                <Icon size={20} strokeWidth={1.7} />
              </div>
              <h3
                className="text-[14.5px] font-semibold leading-snug tracking-[-0.01em]"
                style={{ color: "var(--hm-text-main)" }}
              >
                {title}
              </h3>
              <p
                className="mt-1.5 text-[12.5px] leading-[1.55]"
                style={{ color: "var(--hm-text-muted-2)" }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
