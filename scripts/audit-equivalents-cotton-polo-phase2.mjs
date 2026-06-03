#!/usr/bin/env node
/**
 * scripts/audit-equivalents-cotton-polo-phase2.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 2 ciblée — fait après scripts/audit-equivalents-cotton-polo.mjs.
 *
 * Objectif :
 *   - Vérifier providers EU pour blueprints supplémentaires non couverts
 *     par le 1er run (caps Yupoong, mug EU bp 441, beanies, polos restants
 *     non explorés)
 *   - Générer mockups pilots pour les 2-3 meilleurs finalistes
 *   - Cleanup obligatoire
 *
 * Budget : 25 appels API max (complémentaire au 1er run).
 * Sécurité : token redacted, drafts supprimés.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const cwd = process.cwd();
const SHOP_ID = 27566098;
const PRINTIFY_BASE = "https://api.printify.com/v1";

const args = process.argv.slice(2);
const KEEP_DRAFTS = args.includes("--keep-drafts");

const API_BUDGET = 25;
let apiCalls = 0;

const KNOWN_EU_PROVIDERS = {
  26:  { name: "Textildruck Europa", country: "DE", priority: 1 },
  402: { name: "Atelier Katanga",    country: "FR", priority: 2 },
  30:  { name: "OPT OnDemand",       country: "CZ", priority: 3 },
  72:  { name: "Print Clever",       country: "GB", priority: 4 },
};

const TRANSPARENT_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAsUlEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXHmAAGc8f2nAAAAAElFTkSuQmCC";

// Blueprints supplémentaires à vérifier (pas encore qualifiés)
const EXTRA_TO_QUALIFY = [
  // Polos non encore vérifiés (au cas où l'un d'eux ait un EU provider)
  { id: 1402, hint: "Jerzees Pique Polo" },
  { id: 1730, hint: "Port Authority Polo" },
  // Caps Yupoong/Flexfit
  { id: 1446, hint: "Yupoong Snapback Trucker" },
  { id: 1447, hint: "Yupoong Classic Dad Cap" },
  { id: 1744, hint: "Flexfit Closed-Back Structured" },
  // Mug EU
  { id: 441,  hint: "Generic Ceramic Mug (EU)" },
  // Beanies
  { id: 1108, hint: "OTTO Cap Low Profile (sanity)" }, // pas un beanie mais cap pour sanity
];

// Finalistes connus (du 1er run) pour mockups
const FINALISTS_FOR_MOCKUPS = [
  {
    slug: "sweat-awdis-jh030-bp95",
    blueprintId: 95,
    title: "AWDis Unisex Sweatshirt (JH030)",
    providerId: 26,
    variantIdsByColor: {
      noir:   36126,
      blanc:  36121,
      marine: 36128,
    },
  },
  {
    slug: "sweat-gildan18000-bp49",
    blueprintId: 49,
    title: "Gildan Heavy Blend Crewneck (18000)",
    providerId: 26,
    variantIdsByColor: {
      noir:   25459,
      blanc:  25458,
      marine: 25450,
    },
  },
];

// ─── Token ──────────────────────────────────────────────────────────────────

let TOKEN = "";
async function loadToken() {
  const raw = await fs.readFile(path.join(cwd, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (t.startsWith("PRINTIFY_API_TOKEN=")) {
      return t.slice("PRINTIFY_API_TOKEN=".length).trim().replace(/^['"]|['"]$/g, "");
    }
  }
  throw new Error("PRINTIFY_API_TOKEN manquant dans .env.local");
}

async function pf(p, options = {}) {
  if (apiCalls >= API_BUDGET) {
    throw new Error(`Phase2 budget dépassé (${API_BUDGET})`);
  }
  apiCalls += 1;
  const res = await fetch(`${PRINTIFY_BASE}${p}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "HMGlobal/1.0 (audit-equiv-p2)",
      ...(options.headers ?? {}),
    },
  });
  const body = await res.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { parsed = body; }
  if (!res.ok) {
    throw new Error(`Printify ${p} → ${res.status}: ${(typeof parsed === "string" ? parsed : JSON.stringify(parsed)).slice(0, 200)}`);
  }
  return parsed;
}

async function downloadFile(url, destPath) {
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║  Phase 2 — qualification extras + mockups finalistes                ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");
  TOKEN = await loadToken();
  console.log("  ✅ Token chargé (***REDACTED***)\n");

  // Phase A : qualifier les extras
  console.log("━━━ Phase A : qualification extras EU ━━━");
  const extras = [];
  for (const ex of EXTRA_TO_QUALIFY) {
    if (apiCalls >= API_BUDGET - 6) {
      console.log(`  ⚠️  skip ${ex.id} (budget save for mockups)`);
      break;
    }
    try {
      const provs = await pf(`/catalog/blueprints/${ex.id}/print_providers.json`);
      const eu = (provs ?? []).filter((p) => KNOWN_EU_PROVIDERS[p.id]);
      extras.push({
        id: ex.id,
        hint: ex.hint,
        allProviders: (provs ?? []).map((p) => ({ id: p.id, title: p.title })),
        euProviders: eu.map((p) => ({ id: p.id, title: p.title, ...KNOWN_EU_PROVIDERS[p.id] })),
        hasEU: eu.length > 0,
      });
      console.log(`  bp=${ex.id} ${ex.hint}`);
      console.log(`     all: ${(provs ?? []).map((p) => p.id + "/" + p.title).join(", ")}`);
      console.log(`     EU : ${eu.length ? eu.map((p) => p.id + "/" + p.title).join(", ") : "AUCUN"}`);
    } catch (err) {
      extras.push({ id: ex.id, hint: ex.hint, error: err.message });
      console.log(`  bp=${ex.id} → ❌ ${err.message}`);
    }
  }

  // Phase B : mockups pour finalistes (2 max)
  console.log(`\n━━━ Phase B : mockups pilots (api restants ${API_BUDGET - apiCalls}) ━━━`);
  const draftsCreated = [];
  const mockupResults = [];
  const samplesDir = path.join(cwd, "tmp", "printify-equivalents-samples");
  await fs.mkdir(samplesDir, { recursive: true });

  for (const f of FINALISTS_FOR_MOCKUPS) {
    if (apiCalls >= API_BUDGET - 3) {
      console.log(`  ⚠️  skip mockup ${f.slug} (budget)`);
      mockupResults.push({ slug: f.slug, skipped: true });
      continue;
    }
    console.log(`  ▸ ${f.slug} (bp=${f.blueprintId}, provider=${f.providerId})`);
    try {
      // Upload PNG
      const up = await pf("/uploads/images.json", {
        method: "POST",
        body: JSON.stringify({ file_name: `${f.slug}-blank.png`, contents: TRANSPARENT_PNG }),
      });
      const imageId = up.id;

      const variantIds = Object.values(f.variantIdsByColor);
      const draft = await pf(`/shops/${SHOP_ID}/products.json`, {
        method: "POST",
        body: JSON.stringify({
          title: `AUDIT-${f.slug}-DELETE`,
          description: "Audit HM Global — sera supprimé",
          blueprint_id: f.blueprintId,
          print_provider_id: f.providerId,
          variants: variantIds.map((id) => ({ id, price: 3000, is_enabled: true })),
          print_areas: [{
            variant_ids: variantIds,
            placeholders: [{
              position: "front",
              images: [{ id: imageId, x: 0.5, y: 0.5, scale: 1.0, angle: 0 }],
            }],
          }],
        }),
      });
      draftsCreated.push({ id: draft.id, slug: f.slug });
      let images = draft.images ?? [];
      console.log(`     draft ${draft.id} | images initial=${images.length}`);

      if (!images.length) {
        await new Promise((r) => setTimeout(r, 5000));
        const refreshed = await pf(`/shops/${SHOP_ID}/products/${draft.id}.json`);
        images = refreshed.images ?? [];
        console.log(`     after 5s retry, images=${images.length}`);
      }

      // Récupérer cost variant L noir
      const variantCost = (draft.variants ?? [])[0];
      const costEUR = variantCost ? (variantCost.cost ?? 0) / 100 : null;

      // Download 3 mockups max
      const samples = [];
      let downloaded = 0;
      for (const img of images) {
        if (downloaded >= 3) break;
        let camLabel = "front";
        try {
          camLabel = new URL(img.src).searchParams.get("camera_label") ?? "front";
        } catch {}
        const fname = `${f.slug}-${samples.length + 1}-${camLabel}.jpg`;
        const dest = path.join(samplesDir, fname);
        try {
          await downloadFile(img.src, dest);
          const stat = await fs.stat(dest);
          samples.push({ camLabel, fname, sizeKo: Math.round(stat.size / 1024) });
          downloaded += 1;
        } catch (err) {
          samples.push({ camLabel, fname, error: err.message });
        }
      }
      mockupResults.push({
        slug: f.slug,
        blueprintId: f.blueprintId,
        providerId: f.providerId,
        draftId: draft.id,
        costEUR,
        imagesCount: images.length,
        samples,
        deferred: images.length === 0,
      });
      console.log(`     samples downloaded: ${samples.filter((s) => !s.error).length}, costL=${costEUR}€`);
    } catch (err) {
      mockupResults.push({ slug: f.slug, error: err.message });
      console.log(`     ❌ ${err.message}`);
    }
  }

  // Cleanup
  console.log("\n━━━ Phase C : cleanup drafts ━━━");
  const deletedDrafts = [];
  if (!KEEP_DRAFTS) {
    for (const d of draftsCreated) {
      try {
        await pf(`/shops/${SHOP_ID}/products/${d.id}.json`, { method: "DELETE" });
        deletedDrafts.push({ id: d.id, slug: d.slug, status: "deleted" });
        console.log(`  ✅ deleted ${d.id} (${d.slug})`);
      } catch (err) {
        deletedDrafts.push({ id: d.id, slug: d.slug, status: `error: ${err.message}` });
        console.log(`  ❌ delete fail ${d.id}: ${err.message}`);
      }
    }
  }

  // Persist
  const outPath = path.join(cwd, "tmp", "audit-equivalents-phase2.json");
  await fs.writeFile(outPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    shopId: SHOP_ID,
    apiCalls,
    extras,
    mockupResults,
    draftsCreated,
    deletedDrafts,
  }, null, 2));

  console.log(`\n  API calls : ${apiCalls}/${API_BUDGET}`);
  console.log(`  Drafts créés : ${draftsCreated.length} | supprimés : ${deletedDrafts.filter((d) => d.status === "deleted").length}`);
  console.log(`  JSON : ${outPath}`);
}

main().catch((err) => {
  console.error("\n❌ Fatal :", err.message);
  process.exit(1);
});
