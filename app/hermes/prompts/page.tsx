import PageHeader from "@/components/hermes/PageHeader";
import PromptsClient from "@/components/hermes/PromptsClient";
import { MOCK_PROMPTS } from "@/lib/hermes/mock-data";

export const metadata = {
  title: "Prompts",
};

export default function HermesPromptsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Bibliothèque"
        title="Prompts"
        description="Prompts prêts à copier, classés par agent. Le contenu complet reste masqué pour garder la bibliothèque lisible."
      />
      <PromptsClient prompts={MOCK_PROMPTS} />
    </>
  );
}
