import PageHeader from "@/components/hermes/PageHeader";
import InboxClient from "@/components/hermes/InboxClient";
import { MOCK_REPORTS } from "@/lib/hermes/mock-data";

export const metadata = {
  title: "Inbox",
};

export default function HermesInboxPage() {
  return (
    <>
      <PageHeader
        eyebrow="Rapports IA"
        title="Inbox"
        description="Traite rapidement les rapports IA : source, résumé court, statut et actions. Le contenu complet reste masqué."
      />
      <InboxClient reports={MOCK_REPORTS} />
    </>
  );
}
