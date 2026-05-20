"use client";

/**
 * components/hermes/TasksKanban.tsx — Kanban 3 colonnes (À faire / En cours / Terminé).
 *
 * Boutons "Marquer en cours" / "Terminé" / "Réouvrir" permettent de déplacer
 * en local. Pas de drag-and-drop V1 (priorité simplicité mobile/iPad).
 */

import { useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { HermesProject, HermesTask, TaskStatus } from "@/lib/hermes/types";
import { AGENT_LABELS, TASK_STATUS_LABELS } from "@/lib/hermes/types";
import Card from "@/components/hermes/Card";

const COLUMNS: TaskStatus[] = ["todo", "doing", "waiting_agent", "done"];

export default function TasksKanban({
  tasks,
  projects,
}: {
  tasks: HermesTask[];
  projects: HermesProject[];
}) {
  const [localStatus, setLocalStatus] = useState<Record<string, TaskStatus>>({});
  const projectById = useMemo(() => {
    return Object.fromEntries(projects.map((project) => [project.id, project]));
  }, [projects]);

  const byColumn = useMemo(() => {
    const grouped: Record<TaskStatus, HermesTask[]> = {
      todo:          [],
      doing:         [],
      waiting_agent: [],
      done:          [],
    };
    for (const t of tasks) {
      const s = localStatus[t.id] ?? t.status;
      grouped[s].push({ ...t, status: s });
    }
    return grouped;
  }, [tasks, localStatus]);

  const move = (id: string, to: TaskStatus) => {
    setLocalStatus((s) => ({ ...s, [id]: to }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((col) => (
        <div key={col}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[12.5px] font-semibold uppercase tracking-[0.18em] text-white/55">
              {TASK_STATUS_LABELS[col]}
            </h3>
            <span className="text-[11px] tabular-nums text-white/35">
              {byColumn[col].length}
            </span>
          </div>

          <div className="space-y-2">
            {byColumn[col].length === 0 ? (
              <Card>
                <div className="py-8 text-center text-[12px] text-white/35">
                  Vide
                </div>
              </Card>
            ) : (
              byColumn[col].map((task) => (
                <Card key={task.id}>
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-2 mb-1.5">
                      {task.priority && (
                        <span
                          className="text-[10px] font-bold tracking-wider mt-0.5"
                          style={{
                            color:
                              task.priority === "P1" ? "#fca5a5" :
                              task.priority === "P2" ? "#fde68a" :
                              "rgba(232,230,240,0.55)",
                          }}
                        >
                          {task.priority}
                        </span>
                      )}
                      <span className="text-[13px] font-medium text-white leading-snug">
                        {task.title}
                      </span>
                    </div>
                    <div className="mb-2 flex flex-wrap gap-1.5 text-[10.5px] text-white/50">
                      {task.projectId && projectById[task.projectId] && (
                        <span className="rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          {projectById[task.projectId].name}
                        </span>
                      )}
                      {task.agentId && (
                        <span className="rounded-full px-2 py-0.5" style={{ background: "rgba(84,182,210,0.09)", border: "1px solid rgba(84,182,210,0.18)" }}>
                          {AGENT_LABELS[task.agentId]}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-[11.5px] text-white/55 leading-5 mb-2">
                      {task.nextAction ?? task.notes ?? "Ouvrir et décider la prochaine action."}
                    </p>
                    {task.dueAt && (
                      <p className="text-[10.5px] text-white/40 mb-2">
                        Échéance : {new Date(task.dueAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {col === "todo" && (
                        <MoveButton label="En cours" icon={<ArrowRight size={11} />} onClick={() => move(task.id, "doing")} />
                      )}
                      {col === "doing" && (
                        <>
                          <MoveButton label="Attente agent" icon={<ArrowRight size={11} />} onClick={() => move(task.id, "waiting_agent")} />
                          <MoveButton label="Terminer" icon={<ArrowRight size={11} />} onClick={() => move(task.id, "done")} />
                          <MoveButton label="Replanifier" icon={<RotateCcw size={11} />} onClick={() => move(task.id, "todo")} muted />
                        </>
                      )}
                      {col === "waiting_agent" && (
                        <>
                          <MoveButton label="Reprendre" icon={<ArrowRight size={11} />} onClick={() => move(task.id, "doing")} />
                          <MoveButton label="Terminer" icon={<ArrowRight size={11} />} onClick={() => move(task.id, "done")} muted />
                        </>
                      )}
                      {col === "done" && (
                        <MoveButton label="Réouvrir" icon={<RotateCcw size={11} />} onClick={() => move(task.id, "doing")} muted />
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MoveButton({
  label,
  icon,
  onClick,
  muted = false,
}: {
  label:   string;
  icon:    React.ReactNode;
  onClick: () => void;
  muted?:  boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition"
      style={{
        background: muted ? "rgba(255,255,255,0.04)" : "rgba(84,182,210,0.10)",
        border:     muted
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(84,182,210,0.28)",
        color:      muted ? "rgba(232,230,240,0.65)" : "#9ed7e8",
      }}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
}
