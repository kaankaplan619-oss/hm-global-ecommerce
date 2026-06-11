import { MapPin, ShieldCheck, Award, Zap } from "lucide-react";

/**
 * HomeReassurance — Bandeau 4 blocs sous le hero (benchmark 2026-06-12 :
 * pattern n°1 du secteur, présent chez Mistertee, Main Gauche, Atelier du
 * Textile). Les 4 arguments différenciants HM Global, factuels et courts.
 */

const ITEMS = [
  {
    icon: MapPin,
    title: "Atelier à Souffelweyersheim",
    text: "La seule agence tout-en-un d'Alsace : textile, print et enseignes.",
  },
  {
    icon: ShieldCheck,
    title: "BAT validé avant production",
    text: "Rien ne part en fabrication sans votre accord. Zéro mauvaise surprise.",
  },
  {
    icon: Award,
    title: "200+ projets depuis 2018",
    text: "Restaurants, BTP, associations, PME — des clients qui reviennent.",
  },
  {
    icon: Zap,
    title: "Express possible",
    text: "Produit à l'atelier, pas à l'autre bout de l'Europe.",
  },
] as const;

export default function HomeReassurance() {
  return (
    <section className="border-y" style={{ borderColor: "rgba(45,35,64,0.07)", background: "#fbfafc" }}>
      <div className="container">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 py-7 lg:grid-cols-4 lg:py-8">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(84,182,210,0.12)" }}
              >
                <Icon size={16} style={{ color: "var(--hm-cyan)" }} strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[13px] font-bold leading-snug" style={{ color: "var(--hm-text-main)" }}>
                  {title}
                </p>
                <p className="mt-0.5 hidden text-[11.5px] leading-snug sm:block" style={{ color: "var(--hm-text-muted-2)" }}>
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
