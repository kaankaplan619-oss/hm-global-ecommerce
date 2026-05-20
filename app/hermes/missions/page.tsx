import PageHeader from "@/components/hermes/PageHeader";
import MissionsClient from "@/components/hermes/MissionsClient";
import { MOCK_AGENTS, MOCK_PROJECTS } from "@/lib/hermes/mock-data";

export const metadata = {
  title: "Missions IA",
};

export default function HermesMissionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Centre de commande"
        title="Missions IA"
        description="Prépare un brief clair pour Claude Code, Claude Navigation, ChatGPT ou un agent spécialisé."
      />
      <MissionsClient agents={MOCK_AGENTS} projects={MOCK_PROJECTS} />
    </>
  );
}
