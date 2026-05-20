import { Palette, Type, Sparkles } from "lucide-react";

interface TechniqueRow {
  icon:       typeof Palette;
  name:       string;
  shortLabel: string;
  pitch:      string;
  bestFor:    string;
  avoid:      string;
  accent:     string;
}

const TECHNIQUES: TechniqueRow[] = [
  {
    icon:       Palette,
    name:       "DTF",
    shortLabel: "Direct-to-Film",
    pitch:      "Couleurs illimitées, dégradés et logos détaillés.",
    bestFor:    "Logos couleurs, photos, visuels complexes, équipes événementielles.",
    avoid:      "Petites typos très fines sur textile poil long.",
    accent:     "var(--hm-rose)",
  },
  {
    icon:       Type,
    name:       "Flex",
    shortLabel: "Vinyle thermocollé",
    pitch:      "1 à 2 couleurs unies — typo et logos simples.",
    bestFor:    "Numéros, prénoms, logos monochromes, sportifs et associations.",
    avoid:      "Dégradés et logos multi-couleurs.",
    accent:     "var(--hm-cyan)",
  },
  {
    icon:       Sparkles,
    name:       "Broderie",
    shortLabel: "Fil cousu",
    pitch:      "Finition premium durable — texture haute qualité.",
    bestFor:    "Polos, casquettes, softshells, image corporate haut de gamme.",
    avoid:      "Logos très petits, dégradés, fines typographies.",
    accent:     "var(--hm-purple)",
  },
];

/**
 * Comparatif visuel DTF / Flex / Broderie.
 * Utilisable sur fiche produit, page /techniques et landings usages.
 */
export default function TechniqueComparator() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TECHNIQUES.map((tech) => {
        const Icon = tech.icon;
        return (
          <div
            key={tech.name}
            className="card flex h-full flex-col p-5"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(177,63,116,0.10)",
                  color: tech.accent,
                }}
              >
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--hm-text)]">{tech.name}</p>
                <p className="text-[10px] text-[var(--hm-text-soft)]">{tech.shortLabel}</p>
              </div>
            </div>

            <p className="mb-3 text-[12.5px] font-semibold text-[var(--hm-text)]">
              {tech.pitch}
            </p>

            <div className="space-y-2 text-[11.5px] leading-relaxed">
              <div>
                <p className="font-semibold uppercase tracking-wider text-[9.5px] text-[var(--hm-text-soft)]">
                  Idéal pour
                </p>
                <p className="text-[var(--hm-text-soft)]">{tech.bestFor}</p>
              </div>
              <div>
                <p className="font-semibold uppercase tracking-wider text-[9.5px] text-[var(--hm-text-soft)]">
                  À éviter
                </p>
                <p className="text-[var(--hm-text-soft)]">{tech.avoid}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
