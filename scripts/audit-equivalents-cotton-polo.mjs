#!/usr/bin/env node
/**
 * scripts/audit-equivalents-cotton-polo.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Audit EU élargi — recherche d'équivalents Printify EU pour :
 *   A) Cotton Heritage M2480 (sweat premium)  — provider EU
 *   B) Polo Gildan 64800                       — provider EU
 *   C) 5-10 produits additionnels EU (zip hoodie, tote, casquette, tablier,
 *      mug, gourde, bonnet, long-sleeve, softshell)
 *
 * Pipeline :
 *   1. GET /catalog/blueprints.json (paginé) → toutes les pages
 *   2. Filtrage par mots-clés (brand + titre) → candidats par catégorie
 *   3. Pour chaque candidat : /print_providers.json → ne garder que ceux
 *      avec >=1 provider EU (26 Textildruck DE / 402 Atelier Katanga FR /
 *      30 OPT OnDemand CZ / 72 Print Clever GB) + détection auto autres EU.
 *   4. Pour candidats EU-compatibles : variants.json + audit couleurs/tailles
 *   5. Mockups pilot : 3 finalistes max → draft → images → cleanup obligatoire
 *
 * Sécurité :
 *   - Token JAMAIS imprimé (***REDACTED***)
 *   - Tous drafts créés sont supprimés (compte affiché en fin)
 *   - Aucun produit publié
 *
 * Budget : 60 appels API max (compteur global affiché).
 *
 * Usage :
 *   node scripts/audit-equivalents-cotton-polo.mjs
 *   node scripts/audit-equivalents-cotton-polo.mjs --keep-drafts (debug)
 *   node scripts/audit-equivalents-cotton-polo.mjs --no-mockups   (skip phase 5)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

// ─── Config ──────────────────────────────────────────────────────────────────

const cwd = process.cwd();
const SHOP_ID = 27566098;
const PRINTIFY_BASE = "https://api.printify.com/v1";

const args = process.argv.slice(2);
const KEEP_DRAFTS = args.includes("--keep-drafts");
const NO_MOCKUPS = args.includes("--no-mockups");

const API_BUDGET = 60;
let apiCalls = 0;

// Providers EU connus (avec priorité)
const KNOWN_EU_PROVIDERS = {
  26:  { name: "Textildruck Europa", country: "DE", priority: 1 },
  402: { name: "Atelier Katanga",    country: "FR", priority: 2 },
  30:  { name: "OPT OnDemand",       country: "CZ", priority: 3 },
  72:  { name: "Print Clever",       country: "GB", priority: 4 },
};
const EU_COUNTRIES = ["DE", "FR", "CZ", "GB", "NL", "ES", "IT", "PL", "PT", "BE", "AT", "DK", "SE", "FI", "IE", "LV", "LT"];

// PNG 200×200 transparent
const TRANSPARENT_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAsUlEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXHmAAGc8f2nAAAAAElFTkSuQmCC";

// Catégories cibles et critères de matching (brand + titre)
const CATEGORIES = [
  {
    key: "sweatshirt_premium",
    label: "Sweat premium (équivalent Cotton Heritage M2480)",
    matchTitle: (t, brand) => {
      const T = t.toLowerCase();
      const B = (brand ?? "").toLowerCase();
      // sweat / crewneck / sweatshirt — exclu hoodie/cardigan
      const looksSweat = /\b(sweatshirt|crewneck|crew sweat|sweat\b|premium crew)\b/i.test(T);
      const notHoodie = !/hoodie|hooded|cardigan|kids|baby|toddler|tank|tee\b|t-shirt|polo|pant|jogger|short|long sleeve|long-sleeve/i.test(T);
      const goodBrand = /stanley|b&c|sol|awdis|russell|mantis|continental|premium|heavy|organic|comet|jh030/i.test(B + " " + T);
      return looksSweat && notHoodie && goodBrand;
    },
  },
  {
    key: "polo",
    label: "Polo (équivalent Gildan 64800)",
    matchTitle: (t, brand) => {
      const T = t.toLowerCase();
      const B = (brand ?? "").toLowerCase();
      return /\bpolo\b/i.test(T) && !/kids|baby|toddler|long sleeve|long-sleeve|women|ladies/i.test(T);
    },
  },
  {
    key: "zip_hoodie",
    label: "Zip hoodie",
    matchTitle: (t) => /\bzip\b/i.test(t) && /hoodie|hooded/i.test(t) && !/kids|baby|toddler/i.test(t),
  },
  {
    key: "tote_bag",
    label: "Tote bag",
    matchTitle: (t) => /\btote\b/i.test(t) && /bag/i.test(t),
  },
  {
    key: "cap",
    label: "Casquette brodée",
    matchTitle: (t, brand) => {
      const T = t.toLowerCase();
      return (/\b(cap|hat|trucker|snapback|dad hat|beanie)\b/i.test(T) && !/beanie|winter|knit hat|knitted/i.test(T)) === true;
    },
  },
  {
    key: "beanie",
    label: "Bonnet hiver",
    matchTitle: (t) => /\b(beanie|knit hat|knitted hat|winter hat)\b/i.test(t),
  },
  {
    key: "apron",
    label: "Tablier",
    matchTitle: (t) => /\bapron\b/i.test(t),
  },
  {
    key: "mug",
    label: "Mug céramique",
    matchTitle: (t) => /\bmug\b/i.test(t) && !/travel|magic|color/i.test(t),
  },
  {
    key: "water_bottle",
    label: "Gourde",
    matchTitle: (t) => /\b(water bottle|stainless bottle|bottle\b|thermo|tumbler)\b/i.test(t) && !/baby|kids/i.test(t),
  },
  {
    key: "long_sleeve",
    label: "T-shirt manches longues",
    matchTitle: (t) => /\b(long sleeve|long-sleeve|longsleeve)\b/i.test(t) && /\b(tee|t-shirt|shirt)\b/i.test(t) && !/kids|baby|polo|sweat|hoodie/i.test(t),
  },
];

// Couleurs HM cibles (matcher minimal couleurs)
const HM_COLOR_TARGETS = [
  { hmColorId: "noir",   match: (c) => /\bblack\b/i.test(c) },
  { hmColorId: "blanc",  match: (c) => /\bwhite\b/i.test(c) },
  { hmColorId: "marine", match: (c) => /\bnavy\b/i.test(c) },
  { hmColorId: "gris",   match: (c) => /sport grey|sport gray|^grey$|^gray$|charcoal|heather grey|athletic heather/i.test(c) },
  { hmColorId: "rouge",  match: (c) => /\bred\b|cherry|fire red/i.test(c) },
  { hmColorId: "royal",  match: (c) => /\broyal\b/i.test(c) },
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

// ─── HTTP ──────────────────────────────────────────────────────────────────

async function pf(p, options = {}) {
  if (apiCalls >= API_BUDGET) {
    throw new Error(`API budget dépassé (${API_BUDGET})`);
  }
  apiCalls += 1;
  const res = await fetch(`${PRINTIFY_BASE}${p}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "HMGlobal/1.0 (audit-equiv)",
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

function pickColor(v) { return v.options?.color ?? v.options?.colors ?? ""; }
function pickSize(v)  { return v.options?.size ?? ""; }

function matchHMColors(variants) {
  const matched = {};
  for (const t of HM_COLOR_TARGETS) {
    const cands = variants.filter((v) => t.match((pickColor(v) ?? "").toString()));
    if (!cands.length) continue;
    const L = cands.find((v) => /^L$/i.test(pickSize(v))) ?? cands[0];
    matched[t.hmColorId] = {
      variantId: L.id,
      size: pickSize(L),
      printifyColor: pickColor(L),
      is_available: L.is_available ?? true,
    };
  }
  return matched;
}

// ─── Phase 1 — Catalog scan ─────────────────────────────────────────────────

async function fetchAllBlueprints() {
  // /catalog/blueprints.json — pas vraiment paginé dans cette API (retourne tout)
  // Mais on prend l'objet "data" si présent.
  const data = await pf("/catalog/blueprints.json");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function classifyBlueprints(blueprints) {
  const byCategory = {};
  for (const cat of CATEGORIES) byCategory[cat.key] = [];
  for (const bp of blueprints) {
    for (const cat of CATEGORIES) {
      if (cat.matchTitle(bp.title ?? "", bp.brand ?? "")) {
        byCategory[cat.key].push({
          id: bp.id,
          title: bp.title,
          brand: bp.brand,
          model: bp.model,
        });
      }
    }
  }
  return byCategory;
}

// ─── Phase 2 — Provider qualification ────────────────────────────────────────

async function qualifyBlueprint(bp) {
  const out = {
    id: bp.id, title: bp.title, brand: bp.brand, model: bp.model,
    providers: [], euProviders: [], hasEU: false, error: null,
  };
  try {
    const provs = await pf(`/catalog/blueprints/${bp.id}/print_providers.json`);
    out.providers = (provs ?? []).map((p) => ({ id: p.id, title: p.title }));
    // Filtrage EU :
    // - id ∈ KNOWN_EU_PROVIDERS  → certain
    // - location.country ∈ EU_COUNTRIES → détection auto (peut nécessiter blueprint detail)
    out.euProviders = out.providers.filter((p) => {
      if (KNOWN_EU_PROVIDERS[p.id]) return true;
      // Some responses don't include location; we keep ID-known-EU only here.
      return false;
    });
    out.hasEU = out.euProviders.length > 0;
  } catch (err) {
    out.error = err.message;
  }
  return out;
}

async function fetchProviderVariants(bpId, providerId) {
  try {
    const vres = await pf(`/catalog/blueprints/${bpId}/print_providers/${providerId}/variants.json`);
    const variants = vres.variants ?? [];
    return { ok: true, variants };
  } catch (err) {
    return { ok: false, error: err.message, variants: [] };
  }
}

function summariseVariants(variants) {
  const colors = new Set(variants.map(pickColor).filter(Boolean));
  const sizes = new Set(variants.map(pickSize).filter(Boolean));
  const placements = new Set();
  for (const v of variants) for (const ph of v.placeholders ?? []) placements.add(ph.position);
  return {
    variantsCount: variants.length,
    colorsCount: colors.size,
    sizesCount: sizes.size,
    colorsSample: [...colors].slice(0, 20),
    sizes: [...sizes],
    placements: [...placements],
    hmMatches: matchHMColors(variants),
  };
}

// ─── Phase 3 — Mockups pilot ────────────────────────────────────────────────

async function createDraftAndCapture(bp, providerId, hmMatches, slug) {
  const variantIds = Object.values(hmMatches).map((m) => m.variantId).slice(0, 4); // max 4 variants pour limiter
  if (!variantIds.length) {
    return { error: "no_variant_to_test" };
  }
  // Upload PNG
  const up = await pf("/uploads/images.json", {
    method: "POST",
    body: JSON.stringify({ file_name: `${slug}-blank.png`, contents: TRANSPARENT_PNG }),
  });
  const imageId = up.id;

  // Create draft
  const draft = await pf(`/shops/${SHOP_ID}/products.json`, {
    method: "POST",
    body: JSON.stringify({
      title: `AUDIT-${slug}-DELETE`,
      description: "Audit HM Global — draft à supprimer",
      blueprint_id: bp.id,
      print_provider_id: providerId,
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

  let images = draft.images ?? [];
  // Si images vides, retry après 5s
  if (!images.length) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const refreshed = await pf(`/shops/${SHOP_ID}/products/${draft.id}.json`);
      images = refreshed.images ?? [];
    } catch {}
  }

  // Stocker quelques infos cost
  const variantCost = (draft.variants ?? [])[0];

  // Tenter de télécharger 2 mockups (front si dispo)
  const samples = [];
  const samplesDir = path.join(cwd, "tmp", "printify-equivalents-samples");
  await fs.mkdir(samplesDir, { recursive: true });
  let downloaded = 0;
  for (const img of images) {
    if (downloaded >= 3) break;
    let camLabel = "";
    try {
      const url = new URL(img.src);
      camLabel = url.searchParams.get("camera_label") ?? "front";
    } catch {}
    const fname = `${slug}-${samples.length + 1}-${camLabel || "view"}.jpg`;
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

  return {
    draftId: draft.id,
    imagesCount: images.length,
    samples,
    variantCost: variantCost ? { id: variantCost.id, costCents: variantCost.cost, costEUR: (variantCost.cost ?? 0) / 100 } : null,
    deferred: images.length === 0,
  };
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║  Audit Printify EU — Équivalents Cotton M2480 + Polo 64800 + élargi ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");
  console.log(`  Token : ***REDACTED***`);
  console.log(`  Shop  : ${SHOP_ID}`);
  console.log(`  Budget API : ${API_BUDGET} calls`);
  console.log(`  Mode  : ${KEEP_DRAFTS ? "KEEP_DRAFTS" : "cleanup auto"} | ${NO_MOCKUPS ? "NO_MOCKUPS" : "with mockups"}`);

  TOKEN = await loadToken();
  console.log("  ✅ Token chargé\n");

  // Phase 1 — Catalog
  console.log("━━━ Phase 1 : scan catalogue ━━━");
  const blueprints = await fetchAllBlueprints();
  console.log(`  ${blueprints.length} blueprints retournés (api calls=${apiCalls})`);

  const byCategory = classifyBlueprints(blueprints);
  for (const cat of CATEGORIES) {
    console.log(`  • ${cat.key.padEnd(20)} : ${byCategory[cat.key].length} candidat(s)`);
  }

  // Phase 2 — Qualification (filter EU)
  console.log("\n━━━ Phase 2 : qualification providers EU ━━━");
  const qualifiedByCat = {};
  for (const cat of CATEGORIES) {
    qualifiedByCat[cat.key] = [];
    const cands = byCategory[cat.key].slice(0, 8); // cap dur à 8 candidats / catégorie
    for (const bp of cands) {
      if (apiCalls >= API_BUDGET - 5) break; // garder du budget pour la suite
      const q = await qualifyBlueprint(bp);
      if (q.hasEU) {
        qualifiedByCat[cat.key].push(q);
        console.log(`  [${cat.key}] ✓ bp=${bp.id} "${bp.title}" (${bp.brand}) — EU providers: ${q.euProviders.map((p) => `${p.id}/${p.title}`).join(", ")}`);
      }
    }
    console.log(`  → ${cat.key}: ${qualifiedByCat[cat.key].length} candidat(s) EU-compatible(s)`);
  }
  console.log(`  api calls=${apiCalls}`);

  // Phase 3 — Variants detail pour candidats EU (top 1-2 par catégorie)
  console.log("\n━━━ Phase 3 : détail variants & couleurs ━━━");
  const detailedCandidates = [];
  for (const cat of CATEGORIES) {
    const winners = qualifiedByCat[cat.key].slice(0, 2);
    for (const w of winners) {
      if (apiCalls >= API_BUDGET - 3) break;
      const provs = w.euProviders.sort((a, b) =>
        (KNOWN_EU_PROVIDERS[a.id]?.priority ?? 99) - (KNOWN_EU_PROVIDERS[b.id]?.priority ?? 99)
      );
      const chosenProv = provs[0];
      const { ok, variants, error } = await fetchProviderVariants(w.id, chosenProv.id);
      if (!ok) {
        detailedCandidates.push({ category: cat.key, ...w, chosenProv, error });
        continue;
      }
      const summary = summariseVariants(variants);
      detailedCandidates.push({
        category: cat.key,
        categoryLabel: cat.label,
        ...w,
        chosenProv: { ...chosenProv, ...KNOWN_EU_PROVIDERS[chosenProv.id] },
        ...summary,
      });
      console.log(`  [${cat.key}] bp=${w.id} provider=${chosenProv.id}/${chosenProv.title} → ${summary.variantsCount} variants | colors=${summary.colorsCount} | sizes=${summary.sizes.length} | HM matched=${Object.keys(summary.hmMatches).length}`);
    }
  }
  console.log(`  api calls=${apiCalls}`);

  // Phase 4 — Mockups pour 3 finalistes (sweat premium, polo, +1)
  console.log("\n━━━ Phase 4 : mockups pilots (3 finalistes max) ━━━");
  const finalists = [];
  // Prendre meilleur sweat + meilleur polo + meilleur "autre"
  const sweat = detailedCandidates.find((c) => c.category === "sweatshirt_premium" && Object.keys(c.hmMatches ?? {}).length > 0);
  const polo  = detailedCandidates.find((c) => c.category === "polo" && Object.keys(c.hmMatches ?? {}).length > 0);
  // "autre" = premier additionnel non-sweat-non-polo avec ≥3 matches HM
  const other = detailedCandidates.find((c) =>
    !["sweatshirt_premium", "polo"].includes(c.category) &&
    Object.keys(c.hmMatches ?? {}).length >= 1
  );
  for (const f of [sweat, polo, other]) {
    if (!f) continue;
    finalists.push(f);
  }

  const draftsCreated = [];
  if (!NO_MOCKUPS && finalists.length) {
    for (const f of finalists) {
      if (apiCalls >= API_BUDGET - 3) {
        console.log(`  ⚠️  Budget épuisé, skip mockups pour ${f.id}`);
        break;
      }
      const slug = `${f.category}-bp${f.id}`;
      console.log(`  → finalist bp=${f.id} ${f.title} provider=${f.chosenProv.id}/${f.chosenProv.country}`);
      try {
        const r = await createDraftAndCapture(f, f.chosenProv.id, f.hmMatches, slug);
        f.mockupResult = r;
        if (r.draftId) draftsCreated.push({ id: r.draftId, slug });
        console.log(`     draft=${r.draftId} | images=${r.imagesCount} | samples=${r.samples?.length ?? 0} | deferred=${r.deferred}`);
      } catch (err) {
        f.mockupResult = { error: err.message };
        console.log(`     ❌ ${err.message}`);
      }
    }
  }

  // Phase 5 — Cleanup
  console.log("\n━━━ Phase 5 : cleanup drafts ━━━");
  const deletedDrafts = [];
  if (!KEEP_DRAFTS) {
    for (const d of draftsCreated) {
      try {
        await pf(`/shops/${SHOP_ID}/products/${d.id}.json`, { method: "DELETE" });
        deletedDrafts.push({ id: d.id, slug: d.slug, status: "deleted" });
        console.log(`  ✅ deleted draft ${d.id} (${d.slug})`);
      } catch (err) {
        deletedDrafts.push({ id: d.id, slug: d.slug, status: `error: ${err.message}` });
        console.log(`  ❌ delete fail ${d.id}: ${err.message}`);
      }
    }
  }

  // Output JSON
  const out = {
    generatedAt: new Date().toISOString(),
    shopId: SHOP_ID,
    apiCalls,
    apiBudget: API_BUDGET,
    blueprintsScanned: blueprints.length,
    candidatesByCategory: Object.fromEntries(
      Object.entries(byCategory).map(([k, v]) => [k, v.slice(0, 20).map((bp) => ({ id: bp.id, title: bp.title, brand: bp.brand }))])
    ),
    qualifiedEUByCategory: Object.fromEntries(
      Object.entries(qualifiedByCat).map(([k, v]) => [k, v.map((q) => ({
        id: q.id, title: q.title, brand: q.brand,
        euProviders: q.euProviders.map((p) => ({ id: p.id, title: p.title, ...KNOWN_EU_PROVIDERS[p.id] })),
      }))])
    ),
    detailedCandidates,
    finalists: finalists.map((f) => ({
      bpId: f.id, title: f.title, brand: f.brand, category: f.category,
      chosenProv: f.chosenProv,
      hmMatchedCount: Object.keys(f.hmMatches ?? {}).length,
      mockupResult: f.mockupResult,
    })),
    draftsCreated,
    deletedDrafts,
    deleteSuccessCount: deletedDrafts.filter((d) => d.status === "deleted").length,
  };
  const outPath = path.join(cwd, "tmp", "audit-equivalents.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2));

  console.log(`\n${"═".repeat(70)}`);
  console.log("RÉCAP FINAL");
  console.log("═".repeat(70));
  console.log(`  API calls utilisés : ${apiCalls}/${API_BUDGET}`);
  console.log(`  Blueprints scannés : ${blueprints.length}`);
  console.log(`  Candidats EU qualifiés total : ${Object.values(qualifiedByCat).reduce((s, v) => s + v.length, 0)}`);
  console.log(`  Finalistes : ${finalists.length}`);
  console.log(`  Drafts créés : ${draftsCreated.length} | Drafts supprimés : ${deletedDrafts.filter((d) => d.status === "deleted").length}`);
  console.log(`  JSON  : ${outPath}`);
  console.log(`  Samples : tmp/printify-equivalents-samples/`);
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale :", err.message);
  console.error(err.stack);
  process.exit(1);
});
