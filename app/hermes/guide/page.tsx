import Link from "next/link";
import { ArrowRight, BookOpen, CheckSquare, Inbox, Send, Target } from "lucide-react";
import PageHeader from "@/components/hermes/PageHeader";
import Card from "@/components/hermes/Card";

export const metadata = {
  title: "Guide",
};

const STEPS = [
  {
    title: "Commencer par Aujourd'hui",
    text:  "Regarde les tâches urgentes, les rapports agents et les prospects chauds avant d'ouvrir une mission.",
    href:  "/hermes",
    icon:  CheckSquare,
  },
  {
    title: "Lire les rapports agents",
    text:  "Valide, refuse ou transforme un rapport en tâche. Le contenu long reste masqué par défaut.",
    href:  "/hermes/inbox",
    icon:  Inbox,
  },
  {
    title: "Lancer une mission",
    text:  "Décris le résultat voulu. Hermès prépare l'agent recommandé, le brief et les actions.",
    href:  "/hermes/missions",
    icon:  Send,
  },
  {
    title: "Suivre les prospects",
    text:  "Garde les appels, emails et relances commerciales dans un seul pipeline.",
    href:  "/hermes/vente",
    icon:  Target,
  },
];

export default function HermesGuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Mode d'emploi"
        title="Guide"
        description="Repères courts pour utiliser Hermès OS comme cockpit quotidien, sans entrer dans les détails techniques."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {STEPS.map(({ title, text, href, icon: Icon }) => (
          <Card key={title}>
            <div className="px-5 py-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#9ed7e8]" style={{ background: "rgba(84,182,210,0.10)" }}>
                <Icon size={16} />
              </div>
              <h2 className="text-[14px] font-semibold text-white">{title}</h2>
              <p className="mt-2 text-[12.5px] leading-6 text-white/58">{text}</p>
              <Link
                href={href}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11.5px] font-medium transition hover:text-white"
                style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(232,230,240,0.72)" }}
              >
                Ouvrir
                <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="accent" className="mt-6">
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <BookOpen size={17} className="mt-0.5 text-[#f9c9dd]" />
            <div>
              <h2 className="text-[14px] font-semibold text-white">Règle simple</h2>
              <p className="mt-2 text-[12.5px] leading-6 text-white/58">
                Si une information doit servir plus tard, elle va dans la Base de connaissance. Si elle demande une action, elle devient une tâche.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
