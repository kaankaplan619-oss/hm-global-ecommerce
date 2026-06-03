import PageHeader from "@/components/hermes/PageHeader";
import Card from "@/components/hermes/Card";
import CopyButton from "@/components/hermes/CopyButton";
import { MOCK_MEMORY } from "@/lib/hermes/mock-data";
import { MEMORY_SECTION_LABELS, type MemorySection } from "@/lib/hermes/types";

export const metadata = {
  title: "Base de connaissance",
};

const SECTION_ORDER: MemorySection[] = [
  "regles-design",
  "regles-techniques",
  "process",
  "decisions",
  "prompts",
];

export default function HermesMemoryPage() {
  const bySection: Record<MemorySection, typeof MOCK_MEMORY> = {
    "regles-design":     [],
    "regles-techniques": [],
    "prompts":           [],
    "process":           [],
    "decisions":         [],
  };
  for (const entry of MOCK_MEMORY) {
    bySection[entry.section].push(entry);
  }

  return (
    <>
      <PageHeader
        eyebrow="Source de vérité"
        title="Base de connaissance"
        description="Règles design, règles techniques, process, décisions validées. Chaque entrée est copiable pour usage dans une mission Claude Code ou un brief ChatGPT."
      />

      <div className="space-y-10">
        {SECTION_ORDER.map((section) => {
          const entries = bySection[section];
          if (entries.length === 0) return null;
          return (
            <section key={section}>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="inline-block h-[2px] w-8 rounded-full"
                  style={{ background: "rgba(177,63,116,0.55)" }}
                />
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.20em] text-white/75">
                  {MEMORY_SECTION_LABELS[section]}
                </h2>
                <span className="text-[11px] tabular-nums text-white/35">
                  {entries.length} entrée(s)
                </span>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {entries.map((entry) => (
                  <Card key={entry.id}>
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-[13.5px] font-semibold text-white leading-snug">
                          {entry.title}
                        </h3>
                        <CopyButton text={`${entry.title}\n\n${entry.body}`} size="sm" />
                      </div>
                      <p className="text-[12.5px] text-white/65 leading-6 whitespace-pre-wrap">
                        {entry.body}
                      </p>
                      <p className="mt-3 text-[10.5px] text-white/35">
                        Maj {new Date(entry.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-12 text-[11.5px] text-white/35 text-center">
        En V2 : édition inline + recherche full-text + liens entrée ↔ projet.
      </p>
    </>
  );
}
