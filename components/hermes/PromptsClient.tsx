"use client";

/**
 * components/hermes/PromptsClient.tsx — Bibliothèque de prompts filtrable.
 *
 * Filtre par catégorie côté client. Chaque prompt a un bouton "Copier" qui met
 * le contenu dans le presse-papier (CopyButton).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Send } from "lucide-react";
import type { HermesPrompt, PromptCategory } from "@/lib/hermes/types";
import { AGENT_LABELS, PROMPT_CATEGORY_LABELS } from "@/lib/hermes/types";
import Card from "@/components/hermes/Card";
import CopyButton from "@/components/hermes/CopyButton";

type CategoryFilter = "all" | PromptCategory;

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all",          label: "Tous" },
  { value: "claude-code",  label: "Claude Code" },
  { value: "claude-navigation", label: "Claude Navigation" },
  { value: "chatgpt",      label: "ChatGPT" },
  { value: "discord",      label: "Discord" },
  { value: "email",        label: "Email" },
  { value: "devis",        label: "Devis" },
  { value: "design",       label: "Design / DA" },
  { value: "admin",        label: "Admin" },
  { value: "personnel",    label: "Personnel" },
];

export default function PromptsClient({ prompts }: { prompts: HermesPrompt[] }) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return prompts
      .filter((p) => filter === "all" || p.category === filter)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [prompts, filter]);

  const counts = useMemo(() => {
    const c: Record<CategoryFilter, number> = {
      all: prompts.length,
      "claude-code": 0, "claude-navigation": 0, chatgpt: 0, discord: 0,
      email: 0, devis: 0, design: 0, admin: 0, personnel: 0,
      prospection: 0, instagram: 0, erasmus: 0, textile: 0,
    };
    for (const p of prompts) c[p.category] += 1;
    return c;
  }, [prompts]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium transition"
              style={{
                background: active ? "rgba(84,182,210,0.16)" : "rgba(255,255,255,0.04)",
                border:     active
                  ? "1px solid rgba(84,182,210,0.40)"
                  : "1px solid rgba(255,255,255,0.08)",
                color:      active ? "#9ed7e8" : "rgba(232,230,240,0.78)",
              }}
            >
              <span>{f.label}</span>
              <span
                className="text-[10.5px] tabular-nums"
                style={{
                  color: active ? "rgba(158,215,232,0.7)" : "rgba(232,230,240,0.45)",
                }}
              >
                {counts[f.value]}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center text-[13px] text-white/45">
            Aucun prompt pour ce filtre.
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((p) => (
            <Card key={p.id}>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      {p.tag ?? PROMPT_CATEGORY_LABELS[p.category]}
                    </span>
                    <h3 className="text-[13.5px] font-semibold text-white leading-snug mt-1">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-white/48 line-clamp-1">
                      {p.usage ?? "Prompt réutilisable"}
                    </p>
                  </div>
                  <CopyButton text={p.body} size="sm" label="Copier" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    className="rounded-full px-2 py-0.5 text-white/65"
                    style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {PROMPT_CATEGORY_LABELS[p.category]}
                  </span>
                  {p.agentId && (
                    <span className="rounded-full px-2 py-0.5 text-white/65" style={{ background: "rgba(84,182,210,0.10)", border: "1px solid rgba(84,182,210,0.20)" }}>
                      {AGENT_LABELS[p.agentId]}
                    </span>
                  )}
                </div>

                <div
                  className={`${openId === p.id ? "" : "line-clamp-3"} mt-3 rounded-lg p-3 text-[12px] leading-6 text-white/72 whitespace-pre-wrap`}
                  style={{ background: "rgba(0,0,0,0.30)", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                >
                  {p.body}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === p.id ? null : p.id)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium text-white/60 transition hover:text-white"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Eye size={12} />
                    {openId === p.id ? "Masquer" : "Voir prompt"}
                  </button>
                  <Link
                    href={`/hermes/missions?prompt=${p.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11.5px] font-medium text-white/60 transition hover:text-white"
                    style={{ background: "rgba(84,182,210,0.08)", border: "1px solid rgba(84,182,210,0.18)" }}
                  >
                    <Send size={12} />
                    Utiliser dans Mission IA
                  </Link>
                </div>

                {p.notes && (
                  <p className="mt-3 text-[11.5px] text-white/55 leading-5">
                    <span className="text-white/40">Note : </span>
                    {p.notes}
                  </p>
                )}
                <p className="mt-3 text-[10.5px] text-white/35">
                  Maj {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
