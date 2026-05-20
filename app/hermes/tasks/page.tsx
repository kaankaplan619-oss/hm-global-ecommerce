import PageHeader from "@/components/hermes/PageHeader";
import TasksKanban from "@/components/hermes/TasksKanban";
import { MOCK_PROJECTS, MOCK_TASKS } from "@/lib/hermes/mock-data";

export const metadata = {
  title: "Tâches",
};

export default function HermesTasksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Tâches"
        description="Pipeline simple : à faire, en cours, en attente retour agent, terminé. Chaque tâche affiche projet, agent et prochaine action."
      />
      <TasksKanban tasks={MOCK_TASKS} projects={MOCK_PROJECTS} />
    </>
  );
}
