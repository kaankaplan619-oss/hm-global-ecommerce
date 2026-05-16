/**
 * /dev/mockup-review — Page de review des derniers rendus BAT.
 * Accessible uniquement en développement local (guard NODE_ENV).
 * Lit les URLs depuis le bucket bat-renders Supabase.
 * Ne touche pas au studio, checkout, zones ni Stripe.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Mockup Review — Dev | HM Global" },
  robots: { index: false, follow: false },
};

// Transforme "1778886041310-coeur-8cm.png" → "Cœur 8 cm"
function formatLabel(filename: string): string {
  const slug = filename
    .replace(/^\d+-/, "")   // strip timestamp prefix
    .replace(/\.png$/, ""); // strip extension

  return slug
    .replace("coeur", "Cœur")
    .replace("dos",   "Dos")
    .replace(/-(\d+)cm$/, " $1 cm");
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day:    "2-digit",
    month:  "short",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

interface BatFile {
  name:      string;
  url:       string;
  sizeKo:    number;
  createdAt: string;
}

async function getLatestBatRenders(
  product: string,
  color:   string,
  limit    = 12,
): Promise<BatFile[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const prefix = `textile/${product}/${color}/`;
  const { data, error } = await supabase.storage
    .from("bat-renders")
    .list(prefix, { limit, sortBy: { column: "created_at", order: "desc" } });

  if (error || !data) return [];

  return data
    .filter(f => f.name.endsWith(".png"))
    .map(f => {
      const { data: urlData } = supabase.storage
        .from("bat-renders")
        .getPublicUrl(prefix + f.name);
      return {
        name:      f.name,
        url:       urlData.publicUrl,
        sizeKo:    Math.round((f.metadata?.size ?? 0) / 1024),
        createdAt: f.created_at ?? "",
      };
    });
}

export default async function MockupReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const params  = await searchParams;
  const product = params.product ?? "gildan-18000";
  const color   = params.color   ?? "noir";

  const allRenders = await getLatestBatRenders(product, color);

  // Séparer le dernier run (4 premières) des runs antérieurs
  const latestRun  = allRenders.slice(0, 4);
  const olderRuns  = allRenders.slice(4);

  return (
    <div className="min-h-screen bg-[#111] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Dev — HM Global
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Mockup Review — BAT renders
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {product} / {color}
          </p>
          <p className="mt-3 text-xs text-white/30">
            Générer de nouveaux rendus :{" "}
            <code className="rounded bg-white/8 px-2 py-0.5 font-mono text-white/60">
              npm run test:bat
            </code>
            {" "}puis recharger.
          </p>
        </div>

        {/* Switcher produit/couleur */}
        <form className="mb-10 flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Produit
            </label>
            <input
              name="product"
              defaultValue={product}
              className="rounded-lg bg-white/8 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Couleur
            </label>
            <input
              name="color"
              defaultValue={color}
              className="rounded-lg bg-white/8 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-lg bg-white/12 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Charger
            </button>
          </div>
        </form>

        {/* ── Dernier run ─────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Dernier run — {latestRun.length} rendu{latestRun.length !== 1 ? "s" : ""}
            </h2>
            {latestRun[0]?.createdAt && (
              <span className="text-[11px] text-white/30">
                {formatDate(latestRun[0].createdAt)}
              </span>
            )}
          </div>

          {latestRun.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/4 py-16 text-center text-sm text-white/40">
              Aucun rendu trouvé pour {product} / {color}.
              <br />
              <code className="mt-2 block font-mono text-white/60">npm run test:bat</code>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestRun.map(r => {
                const label  = formatLabel(r.name);
                const isBack = r.name.includes("dos");
                return (
                  <div
                    key={r.name}
                    className="group overflow-hidden rounded-2xl border border-white/8 bg-white/4 transition hover:border-white/20"
                  >
                    {/* Badge face/dos */}
                    <div className="relative aspect-square bg-[#1a1a1a]">
                      <div className="absolute left-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                        {isBack ? "DOS" : "FACE"}
                      </div>
                      <Image
                        src={r.url}
                        alt={label}
                        fill
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-contain p-2 transition group-hover:scale-[1.03]"
                        unoptimized
                      />
                    </div>
                    <div className="border-t border-white/8 px-4 py-3">
                      <p className="text-sm font-semibold text-white">
                        {label}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[11px] text-white/40">
                          2000×2000 px
                        </span>
                        {r.sizeKo > 0 && (
                          <>
                            <span className="text-white/20">·</span>
                            <span className="text-[11px] text-white/40">{r.sizeKo} Ko</span>
                          </>
                        )}
                      </div>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-[11px] text-white/40 underline underline-offset-2 transition hover:text-white"
                      >
                        Ouvrir pleine résolution →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Comparaison face / dos côte à côte ──────────────────────── */}
        {latestRun.length >= 2 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
              Comparaison directe — cœur vs dos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* cœur 11 cm vs dos 28 cm (les plus lisibles) */}
              {[latestRun.find(r => r.name.includes("coeur-11")), latestRun.find(r => r.name.includes("dos-28"))]
                .filter(Boolean)
                .map(r => {
                  if (!r) return null;
                  const label = formatLabel(r.name);
                  return (
                    <div key={"cmp-" + r.name} className="overflow-hidden rounded-2xl border border-white/8">
                      <div className="relative aspect-square bg-[#222]">
                        <Image
                          src={r.url}
                          alt={label}
                          fill
                          sizes="50vw"
                          className="object-contain p-6"
                          unoptimized
                        />
                      </div>
                      <div className="flex items-center justify-between border-t border-white/8 px-4 py-2">
                        <p className="text-sm font-semibold text-white">{label}</p>
                        {r.sizeKo > 0 && (
                          <span className="text-[11px] text-white/40">{r.sizeKo} Ko</span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* ── Runs antérieurs (repliés visuellement) ──────────────────── */}
        {olderRuns.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/30">
              Runs antérieurs — {olderRuns.length} rendu{olderRuns.length !== 1 ? "s" : ""}
            </h2>
            <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-6 opacity-50">
              {olderRuns.map(r => {
                const label = formatLabel(r.name);
                return (
                  <a
                    key={r.name}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-xl border border-white/6 bg-white/3"
                  >
                    <div className="relative aspect-square bg-[#1a1a1a]">
                      <Image
                        src={r.url}
                        alt={label}
                        fill
                        sizes="16vw"
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                    <p className="truncate px-2 py-1.5 text-[10px] text-white/40">
                      {label}
                    </p>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <p className="mt-12 text-center text-[10px] text-white/20">
          Page dev uniquement — non indexée, non accessible en production
        </p>
      </div>
    </div>
  );
}
