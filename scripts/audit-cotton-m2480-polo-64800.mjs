#!/usr/bin/env node
/**
 * scripts/audit-cotton-m2480-polo-64800.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Audit pré-bascule Printify de 2 blueprints HM Global :
 *   - 795  Cotton Heritage M2480 Premium Crewneck Sweatshirt
 *   - 1750 Gildan 64800 Pique Polo Shirt (broderie uniquement)
 *
 * Pipeline (par blueprint) :
 *   1. GET /catalog/blueprints/{id}.json
 *   2. GET /catalog/blueprints/{id}/print_providers.json
 *   3. Pour chaque provider EU disponible, GET variants.json
 *   4. Choisit le provider EU de plus haute priorité (26 > 402 > 30 > 72)
 *   5. Crée 1 draft (1 variant taille L par couleur HM cible disponible)
 *   6. Récupère cost variant + shipping FR 67460 (qty 1/10/25)
 *   7. Inspecte les images du draft (camera_label)
 *   8. Télécharge quelques mockups samples
 *   9. DELETE le draft
 *
 * Sécurité :
 *   - Token lu depuis .env.local — JAMAIS imprimé (***REDACTED***)
 *   - Tous les drafts créés sont supprimés en fin de pipeline
 *   - Aucun produit publié
 *
 * Usage :
 *   node scripts/audit-cotton-m2480-polo-64800.mjs
 *   node scripts/audit-cotton-m2480-polo-64800.mjs --keep-drafts   (debug)
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

const PROVIDER_LABEL = {
  26:  { name: "Textildruck Europa", country: "DE", priority: 1 },
  402: { name: "Atelier Katanga",    country: "FR", priority: 2 },
  30:  { name: "OPT OnDemand",       country: "CZ", priority: 3 },
  72:  { name: "Print Clever",       country: "GB", priority: 4 },
};
const EU_PROVIDER_IDS = Object.keys(PROVIDER_LABEL).map(Number);

// Blueprints à auditer + couleurs HM cibles
const BLUEPRINTS = [
  {
    bpId: 795,
    hmSlug: "cotton-heritage-m2480",
    label: "Cotton Heritage M2480 Premium Crewneck",
    // couleurs HM actuelles dans data/products.ts : noir, blanc, marine, gris, beige
    // + rouge en bonus
    hmColorTargets: [
      { hmColorId: "noir",   match: (c) => /\bblack\b/.test(c) },
      { hmColorId: "blanc",  match: (c) => /\bwhite\b/.test(c) },
      { hmColorId: "marine", match: (c) => /\bnavy\b/.test(c) },
      { hmColorId: "gris",   match: (c) => /sport grey|sport gray|athletic heather|heather grey|^grey$|^gray$|charcoal/i.test(c) },
      { hmColorId: "beige",  match: (c) => /sand|natural|cream|bone|tan\b|stone/i.test(c) },
      { hmColorId: "rouge",  match: (c) => /\bred\b|cherry|fire red/.test(c) },
    ],
  },
  {
    bpId: 1750,
    hmSlug: "polo-gildan-64800",
    label: "Gildan 64800 Pique Polo Shirt",
    // couleurs HM actuelles : blanc, noir, marine, gris + sport grey, royal, rouge en bonus
    hmColorTargets: [
      { hmColorId: "noir",   match: (c) => /\bblack\b/.test(c) },
      { hmColorId: "blanc",  match: (c) => /\bwhite\b/.test(c) },
      { hmColorId: "marine", match: (c) => /\bnavy\b/.test(c) },
      { hmColorId: "gris",   match: (c) => /sport grey|sport gray|^grey$|^gray$/i.test(c) },
      { hmColorId: "royal",  match: (c) => /\broyal\b/.test(c) },
      { hmColorId: "rouge",  match: (c) => /\bred\b|cherry|fire red/.test(c) },
    ],
  },
];

// Samples à télécharger
const SAMPLES = [
  { bpId: 795,  hmColorId: "noir",  view: "front", fname: "cotton-m2480-noir-front.jpg" },
  { bpId: 795,  hmColorId: "beige", view: "front", fname: "cotton-m2480-sand-front.jpg" },
  { bpId: 1750, hmColorId: "noir",  view: "front", fname: "polo-64800-noir-front.jpg" },
  { bpId: 1750, hmColorId: "blanc", view: "front", fname: "polo-64800-blanc-front.jpg" },
];

// PNG 200×200 transparent (réutilisé)
const TRANSPARENT_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAsUlEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXHmAAGc8f2nAAAAAElFTkSuQmCC";

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
  const res = await fetch(`${PRINTIFY_BASE}${p}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "HMGlobal/1.0 (audit-cotton-polo)",
      ...(options.headers ?? {}),
    },
  });
  const body = await res.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { parsed = body; }
  if (!res.ok) {
    throw new Error(`Printify ${p} → ${res.status}: ${(typeof parsed === "string" ? parsed : JSON.stringify(parsed)).slice(0, 300)}`);
  }
  return parsed;
}

async function downloadFile(url, destPath) {
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pickPrimaryColor(variant) {
  const o = variant.options ?? {};
  return o.color ?? o.colors ?? "";
}

function pickSize(variant) {
  return variant.options?.size ?? "";
}

function matchHMColorTargets(targets, variants) {
  // Pour chaque cible HM, trouve le 1er variant qui matche en taille L (ou fallback)
  const matches = {};
  for (const t of targets) {
    // priorité L, sinon premier dispo
    const candidates = variants.filter((v) => {
      const c = (pickPrimaryColor(v) ?? "").toString();
      return t.match(c.toLowerCase());
    });
    if (!candidates.length) continue;
    const L = candidates.find((v) => /^L$/i.test(pickSize(v))) ?? candidates[0];
    matches[t.hmColorId] = {
      variantId: L.id,
      size: pickSize(L),
      printifyColor: pickPrimaryColor(L),
      isAvailable: L.is_available ?? true,
      sizesAvailable: [...new Set(candidates.map((v) => pickSize(v)))],
    };
  }
  return matches;
}

// ─── Audit d'un blueprint ────────────────────────────────────────────────────

async function auditBlueprint(bp) {
  console.log(`\n${"━".repeat(70)}`);
  console.log(`▸ Blueprint ${bp.bpId} — ${bp.label}`);
  console.log("━".repeat(70));

  const result = {
    bpId: bp.bpId,
    hmSlug: bp.hmSlug,
    label: bp.label,
    blueprint: null,
    allProviders: [],
    euProviders: [],
    providerAudit: {},
    chosenProvider: null,
    hmColorMatches: {},
    draftId: null,
    deleteStatus: null,
    variantCost: null,
    shippingByQty: {},
    images: [],
    error: null,
  };

  try {
    // 1. Blueprint info
    const blueprint = await pf(`/catalog/blueprints/${bp.bpId}.json`);
    result.blueprint = {
      id: blueprint.id,
      title: blueprint.title,
      brand: blueprint.brand,
      model: blueprint.model,
      description: (blueprint.description ?? "").slice(0, 200),
    };
    console.log(`  Title  : ${blueprint.title}`);
    console.log(`  Brand  : ${blueprint.brand} / ${blueprint.model ?? ""}`);

    // 2. Providers
    const providers = await pf(`/catalog/blueprints/${bp.bpId}/print_providers.json`);
    result.allProviders = providers.map((p) => ({ id: p.id, title: p.title }));
    const euProvs = providers.filter((p) => EU_PROVIDER_IDS.includes(p.id));
    result.euProviders = euProvs.map((p) => ({ id: p.id, title: p.title, ...PROVIDER_LABEL[p.id] }));
    console.log(`  Providers total: ${providers.length} | EU dispo: ${euProvs.length}`);
    for (const p of euProvs) {
      console.log(`     • ${p.id} ${PROVIDER_LABEL[p.id].country} ${PROVIDER_LABEL[p.id].name}`);
    }

    // Audit informatif des providers non-EU (pour traçabilité dans le rapport)
    result.nonEuProviderAudit = {};
    if (euProvs.length === 0) {
      console.log("  ⚠️  Aucun provider EU dispo — audit informatif des providers non-EU :");
      for (const p of providers) {
        try {
          const vres = await pf(`/catalog/blueprints/${bp.bpId}/print_providers/${p.id}/variants.json`);
          const variants = vres.variants ?? [];
          const colors = new Set(variants.map(pickPrimaryColor).filter(Boolean));
          const sizes = new Set(variants.map(pickSize).filter(Boolean));
          // Placements unique
          const placements = new Set();
          for (const v of variants) for (const ph of v.placeholders ?? []) placements.add(ph.position);
          // décoration : extraite depuis providers.json (champ location.decoration_methods n'est pas
          // toujours retourné par la liste — on prend ce qui est dispo)
          result.nonEuProviderAudit[p.id] = {
            id: p.id,
            title: p.title,
            decoration_methods: p.decoration_methods ?? null,
            variantsCount: variants.length,
            colorsCount: colors.size,
            colorsSample: [...colors],
            sizesCount: sizes.size,
            sizes: [...sizes],
            placements: [...placements],
            hmMatches: matchHMColorTargets(bp.hmColorTargets, variants),
          };
          console.log(`     [info] ${p.id} ${p.title} → ${variants.length} variants | ${colors.size} couleurs | placements: ${[...placements].join(", ")}`);
          console.log(`             couleurs: ${[...colors].slice(0, 12).join(", ")}`);
          console.log(`             HM matched: ${Object.keys(result.nonEuProviderAudit[p.id].hmMatches).join(", ") || "—"}`);
        } catch (err) {
          console.log(`     [info] ${p.id} → ❌ ${err.message}`);
        }
      }
      result.error = "no_eu_provider";
      console.log("  → blueprint NON RECOMMANDÉ V1 (aucun provider EU)");
      return result;
    }

    // 3. Audit léger de chaque provider EU
    for (const p of euProvs) {
      try {
        const vres = await pf(`/catalog/blueprints/${bp.bpId}/print_providers/${p.id}/variants.json`);
        const variants = vres.variants ?? [];
        const colors = new Set(variants.map(pickPrimaryColor).filter(Boolean));
        const sizes = new Set(variants.map(pickSize).filter(Boolean));
        result.providerAudit[p.id] = {
          id: p.id,
          name: PROVIDER_LABEL[p.id].name,
          country: PROVIDER_LABEL[p.id].country,
          variantsCount: variants.length,
          colorsCount: colors.size,
          sizesCount: sizes.size,
          colorsSample: [...colors].slice(0, 30),
          sizes: [...sizes],
          hmMatches: matchHMColorTargets(bp.hmColorTargets, variants),
          _variants: variants,
        };
        console.log(`     ${p.id} → ${variants.length} variants | ${colors.size} couleurs | ${sizes.size} tailles | HM matched=${Object.keys(result.providerAudit[p.id].hmMatches).length}`);
      } catch (err) {
        result.providerAudit[p.id] = { id: p.id, error: err.message };
        console.log(`     ${p.id} → ❌ ${err.message}`);
      }
    }

    // 4. Choix du provider EU prioritaire qui retourne au moins 3 couleurs HM matchées
    const ranked = euProvs
      .filter((p) => result.providerAudit[p.id] && !result.providerAudit[p.id].error)
      .map((p) => ({
        id: p.id,
        priority: PROVIDER_LABEL[p.id].priority,
        hmMatched: Object.keys(result.providerAudit[p.id].hmMatches).length,
      }))
      .sort((a, b) => {
        // priorité par : nb couleurs HM matchées DESC puis priority ASC
        if (b.hmMatched !== a.hmMatched) return b.hmMatched - a.hmMatched;
        return a.priority - b.priority;
      });

    if (!ranked.length) {
      result.error = "no_provider_with_variants";
      return result;
    }
    const chosen = ranked[0];
    result.chosenProvider = {
      id: chosen.id,
      ...PROVIDER_LABEL[chosen.id],
      hmMatched: chosen.hmMatched,
    };
    console.log(`  ★ Provider retenu pour draft : ${chosen.id} ${PROVIDER_LABEL[chosen.id].name} (${chosen.hmMatched} couleurs HM matched)`);

    const matches = result.providerAudit[chosen.id].hmMatches;
    result.hmColorMatches = matches;
    const variantIdsForDraft = Object.values(matches).map((m) => m.variantId);

    if (!variantIdsForDraft.length) {
      result.error = "no_hm_color_match_at_provider";
      return result;
    }

    // 5. Upload PNG transparent
    const up = await pf("/uploads/images.json", {
      method: "POST",
      body: JSON.stringify({ file_name: "audit-blank.png", contents: TRANSPARENT_PNG }),
    });
    const imageId = up.id;

    // 6. Create draft
    const draft = await pf(`/shops/${SHOP_ID}/products.json`, {
      method: "POST",
      body: JSON.stringify({
        title: `AUDIT-${bp.hmSlug}-DELETE`,
        description: "Audit pré-bascule HM Global — sera supprimé",
        blueprint_id: bp.bpId,
        print_provider_id: chosen.id,
        variants: variantIdsForDraft.map((id) => ({ id, price: 3000, is_enabled: true })),
        print_areas: [{
          variant_ids: variantIdsForDraft,
          placeholders: [{
            position: "front",
            images: [{ id: imageId, x: 0.5, y: 0.5, scale: 1.0, angle: 0 }],
          }],
        }],
      }),
    });
    result.draftId = draft.id;
    console.log(`  Draft créé : ${draft.id} | variants=${variantIdsForDraft.length} | images=${draft.images?.length ?? 0}`);

    // 7. Cost per variant (use the first variant L found)
    for (const dv of draft.variants ?? []) {
      const hmKey = Object.keys(matches).find((k) => matches[k].variantId === dv.id);
      if (hmKey) {
        matches[hmKey].costCents = dv.cost ?? null;
        matches[hmKey].priceCents = dv.price ?? null;
      }
    }
    // global cost = cost du 1er variant
    const firstDraftVar = (draft.variants ?? [])[0];
    result.variantCost = {
      variantId: firstDraftVar?.id,
      costCents: firstDraftVar?.cost,
      costEUR: (firstDraftVar?.cost ?? 0) / 100,
    };
    console.log(`  Cost L (1er variant) : ${(result.variantCost.costEUR).toFixed(2)} €`);

    // 8. Shipping FR 67460
    const ADDR = {
      first_name: "HM Audit", last_name: "Test",
      email: "audit@hmga.fr",
      country: "FR", region: "Grand Est",
      address1: "20 Rue des Tuileries",
      city: "Souffelweyersheim", zip: "67460",
    };
    for (const qty of [1, 10, 25]) {
      try {
        const ship = await pf(`/shops/${SHOP_ID}/orders/shipping.json`, {
          method: "POST",
          body: JSON.stringify({
            line_items: [{ product_id: draft.id, variant_id: firstDraftVar.id, quantity: qty }],
            address_to: ADDR,
          }),
        });
        result.shippingByQty[qty] = ship.standard / 100;
        console.log(`     shipping FR qty=${qty} : ${(ship.standard / 100).toFixed(2)} €`);
      } catch (err) {
        result.shippingByQty[qty] = null;
        console.log(`     shipping FR qty=${qty} : ❌ ${err.message}`);
      }
    }

    // 9. Inventaire camera_labels et stockage URLs par variant
    const imagesByCamera = {};
    const imagesByVariant = {};
    for (const img of draft.images ?? []) {
      let camLabel = "";
      try {
        const url = new URL(img.src);
        camLabel = url.searchParams.get("camera_label") ?? "";
        // Extraction variant id depuis le path
        const m = url.pathname.match(/\/(\d+)\//g);
        const variantInPath = m ? Number(m[m.length - 1].replace(/\//g, "")) : null;
        imagesByCamera[camLabel] = (imagesByCamera[camLabel] ?? 0) + 1;
        if (variantInPath) {
          imagesByVariant[variantInPath] ??= {};
          imagesByVariant[variantInPath][camLabel] = img.src;
        }
      } catch {}
      result.images.push({ camLabel, src: img.src, variant_ids: img.variant_ids ?? [] });
    }
    console.log(`  Caméras détectées : ${Object.entries(imagesByCamera).map(([k, v]) => `${k}=${v}`).join(", ")}`);

    // 10. Téléchargement des samples
    const samplesDir = path.join(cwd, "tmp", "printify-audit-samples");
    await fs.mkdir(samplesDir, { recursive: true });
    for (const s of SAMPLES.filter((x) => x.bpId === bp.bpId)) {
      const match = matches[s.hmColorId];
      if (!match) {
        console.log(`  [sample] ${s.fname} : couleur HM "${s.hmColorId}" non matchée → SKIP`);
        continue;
      }
      const imgs = imagesByVariant[match.variantId] ?? {};
      const url = imgs[s.view] ?? imgs.front ?? imgs.back;
      if (!url) {
        console.log(`  [sample] ${s.fname} : pas de mockup view="${s.view}" pour variant ${match.variantId} → SKIP`);
        continue;
      }
      try {
        const dest = path.join(samplesDir, s.fname);
        await downloadFile(url, dest);
        const stat = await fs.stat(dest);
        console.log(`  [sample] ${s.fname} → ${Math.round(stat.size / 1024)} Ko`);
      } catch (err) {
        console.log(`  [sample] ${s.fname} : ❌ ${err.message}`);
      }
    }

    // 11. DELETE draft
    if (!KEEP_DRAFTS) {
      try {
        await pf(`/shops/${SHOP_ID}/products/${draft.id}.json`, { method: "DELETE" });
        result.deleteStatus = "deleted";
        console.log(`  Draft ${draft.id} : ✅ supprimé`);
      } catch (err) {
        result.deleteStatus = `error: ${err.message}`;
        console.log(`  Draft ${draft.id} : ❌ delete fail (${err.message})`);
      }
    } else {
      result.deleteStatus = "kept (flag --keep-drafts)";
      console.log(`  Draft ${draft.id} : conservé (--keep-drafts)`);
    }

  } catch (err) {
    result.error = err.message;
    console.error(`  ❌ ${err.message}`);
    // Tentative cleanup si un draft a été créé
    if (result.draftId && !KEEP_DRAFTS) {
      try {
        await pf(`/shops/${SHOP_ID}/products/${result.draftId}.json`, { method: "DELETE" });
        result.deleteStatus = "deleted-after-error";
      } catch {}
    }
  }

  // On supprime _variants avant la sérialisation JSON (trop volumineux)
  for (const k of Object.keys(result.providerAudit)) {
    delete result.providerAudit[k]._variants;
  }
  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║  Audit Printify — Cotton Heritage M2480 + Polo Gildan 64800        ║");
  console.log("║  HM Global — pré-bascule, aucun produit publié                      ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");
  console.log(`  Token : ***REDACTED***`);
  console.log(`  Shop  : ${SHOP_ID}`);
  console.log(`  Mode  : ${KEEP_DRAFTS ? "KEEP_DRAFTS" : "cleanup auto"}`);

  TOKEN = await loadToken();
  console.log("  ✅ Token chargé");

  const results = [];
  for (const bp of BLUEPRINTS) {
    results.push(await auditBlueprint(bp));
  }

  // Sérialisation JSON
  const outJson = path.join(cwd, "tmp", "audit-cotton-polo.json");
  await fs.mkdir(path.dirname(outJson), { recursive: true });
  await fs.writeFile(outJson, JSON.stringify({
    generatedAt: new Date().toISOString(),
    shopId: SHOP_ID,
    blueprintsAudited: results.length,
    results,
  }, null, 2));

  console.log(`\n${"═".repeat(70)}`);
  console.log("RÉCAP FINAL");
  console.log("═".repeat(70));
  for (const r of results) {
    console.log(`  Blueprint ${r.bpId} — ${r.label}`);
    if (r.error) {
      console.log(`     ❌ ERREUR : ${r.error}`);
      continue;
    }
    console.log(`     EU providers : ${r.euProviders.map((p) => p.country).join(", ") || "AUCUN"}`);
    console.log(`     Provider retenu : ${r.chosenProvider ? r.chosenProvider.country + " " + r.chosenProvider.name : "—"}`);
    console.log(`     Couleurs HM matchées : ${Object.keys(r.hmColorMatches).join(", ")}`);
    console.log(`     Cost L : ${r.variantCost ? r.variantCost.costEUR.toFixed(2) + " €" : "?"} | Shipping FR 1/10/25 : ${[1, 10, 25].map((q) => (r.shippingByQty[q] ?? "?").toString().slice(0, 5)).join(" / ")}`);
    console.log(`     Draft : ${r.draftId} → ${r.deleteStatus ?? "n/a"}`);
  }
  console.log(`\n  ✅ JSON : ${outJson}`);
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale :", err.message);
  console.error(err.stack);
  process.exit(1);
});
