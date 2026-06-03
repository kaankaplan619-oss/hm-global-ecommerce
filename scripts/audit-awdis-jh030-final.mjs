#!/usr/bin/env node
/**
 * scripts/audit-awdis-jh030-final.mjs
 *
 * Audit final AWDis JH030 (Printify blueprint #95) pour GO/NO-GO sur la bascule
 * en remplacement du Cotton Heritage M2480 (Printful).
 *
 * Opérations :
 *   1. GET blueprint #95 (titre, marque, description)
 *   2. GET print_providers → confirmer Textildruck DE (id 26)
 *   3. GET variants pour provider 26 → catalogue exhaustif couleurs
 *   4. Mapping couleurs HM (noir/blanc/marine/gris-chine/sand)
 *   5. Création 1 draft test avec variants L des couleurs HM matchées
 *   6. Téléchargement mockups front/back/folded
 *   7. (best-effort) Shipping FR 67460 pour 1/10/25 pcs
 *   8. DELETE draft (cleanup)
 *   9. Sauvegarde audit dans tmp/awdis-jh030-final.json
 *
 * Budget API : 25 max
 * Aucun fichier catalogue / pricing / site / Stripe modifié.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const cwd = process.cwd();
const SHOP_ID = 27566098;
const PRINTIFY_BASE = "https://api.printify.com/v1";
const BLUEPRINT_ID = 95;
const PROVIDER_ID = 26; // Textildruck Europa DE
const OUT_DIR = path.join(cwd, "tmp", "awdis-jh030-final");
const OUT_JSON = path.join(cwd, "tmp", "awdis-jh030-final.json");

// PNG 400×400 transparent (base64) — copié depuis refresh-printify-mockups.mjs
const TRANSPARENT_PNG_400_B64 = "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAsUlEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXHmAAGc8f2nAAAAAElFTkSuQmCC";

let TOKEN = "";
let API_CALLS = 0;
const API_LOG = [];

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
  API_CALLS++;
  const res = await fetch(`${PRINTIFY_BASE}${p}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "HMGlobal/1.0 (audit-awdis-jh030-final)",
      ...(options.headers ?? {}),
    },
  });
  const body = await res.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { parsed = body; }
  API_LOG.push({ call: API_CALLS, method: options.method ?? "GET", path: p, status: res.status });
  if (!res.ok) {
    throw new Error(`Printify ${options.method ?? "GET"} ${p} → ${res.status}: ${(typeof parsed === "string" ? parsed : JSON.stringify(parsed)).slice(0, 300)}`);
  }
  return { status: res.status, data: parsed };
}

async function downloadFile(url, destPath) {
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
  const stat = await fs.stat(destPath);
  return { sizeKB: Math.round(stat.size / 1024) };
}

// ─── Couleur match heuristique ───────────────────────────────────────────────

const HM_COLOR_TARGETS = [
  {
    hm: "noir",
    priority: 1,
    candidates: ["jet black", "pure black", "deep black", "black"],
    excludes: ["heather", "smoke"],
  },
  {
    hm: "blanc",
    priority: 1,
    candidates: ["arctic white", "white"],
    excludes: ["off white", "vintage white", "natural"],
  },
  {
    hm: "marine",
    priority: 1,
    candidates: ["french navy", "oxford navy", "new french navy", "navy"],
    excludes: ["light navy"],
  },
  {
    hm: "gris",
    priority: 1,
    candidates: ["heather grey", "heather gray", "sport grey", "charcoal", "grey marl"],
    excludes: ["light heather", "dark heather"],
  },
  {
    hm: "sand",
    priority: 2,
    candidates: ["sand", "natural", "stone", "khaki", "desert sand"],
    excludes: [],
  },
];

function pickBestColorMatch(target, variants) {
  // variants: [{ id, title, options:{ color, size }, color_hex, is_enabled }]
  const sizeL = (v) => /(^|\W)l(\W|$)/i.test(v.options?.size ?? v.title ?? "");
  const lower = (s) => (s ?? "").toLowerCase();
  for (const cand of target.candidates) {
    const matches = variants.filter((v) => {
      const colorName = lower(v.options?.color ?? "");
      if (target.excludes.some((ex) => colorName.includes(ex))) return false;
      return colorName === cand || colorName.includes(cand);
    });
    // Prefer L size
    const lVariant = matches.find(sizeL);
    if (lVariant) return { variant: lVariant, matchedKeyword: cand };
    if (matches.length > 0) return { variant: matches[0], matchedKeyword: cand, sizeFallback: true };
  }
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  Audit final AWDis JH030 (bp #95) — Textildruck Europa DE  ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  TOKEN = await loadToken();
  console.log("  ✅ Token chargé\n");

  const audit = {
    generatedAt: new Date().toISOString(),
    blueprintId: BLUEPRINT_ID,
    providerId: PROVIDER_ID,
    blueprint: null,
    providers: null,
    providerConfirmed: false,
    variants: null,
    variantsCount: 0,
    sizesAvailable: [],
    placementsAvailable: [],
    colorsAvailable: [],
    hmMatch: {},
    draft: { id: null, deleted: false },
    mockups: { byColor: {}, downloaded: [] },
    shipping: { attempted: false, byPostal: null, error: null },
    cost: { variantLAvg: null, byColor: {} },
    errors: [],
  };

  // 1. Blueprint
  console.log("1. GET blueprint…");
  const bpRes = await pf(`/catalog/blueprints/${BLUEPRINT_ID}.json`);
  audit.blueprint = {
    id: bpRes.data.id,
    title: bpRes.data.title,
    brand: bpRes.data.brand,
    model: bpRes.data.model,
    description: bpRes.data.description?.slice(0, 1500),
  };
  console.log(`   Title: ${bpRes.data.title}`);
  console.log(`   Brand: ${bpRes.data.brand} | Model: ${bpRes.data.model}`);

  // 2. Providers
  console.log("2. GET print providers…");
  const provRes = await pf(`/catalog/blueprints/${BLUEPRINT_ID}/print_providers.json`);
  audit.providers = provRes.data.map((p) => ({ id: p.id, title: p.title }));
  audit.providerConfirmed = provRes.data.some((p) => p.id === PROVIDER_ID);
  console.log(`   Providers (${provRes.data.length}): ${provRes.data.map((p) => `${p.id}=${p.title}`).join(", ")}`);
  console.log(`   Textildruck DE (26) présent : ${audit.providerConfirmed ? "OUI" : "NON"}`);
  if (!audit.providerConfirmed) {
    audit.errors.push("Textildruck DE absent du blueprint");
    await saveAndExit(audit);
    return;
  }

  // 3. Variants
  console.log("3. GET variants pour Textildruck DE…");
  const varRes = await pf(`/catalog/blueprints/${BLUEPRINT_ID}/print_providers/${PROVIDER_ID}/variants.json`);
  const variants = varRes.data.variants ?? [];
  audit.variantsCount = variants.length;
  console.log(`   ${variants.length} variants au total`);

  // Extraire dimensions disponibles
  const sizeSet = new Set();
  const colorMap = new Map(); // colorName -> { hex, variants: [{id,size}] }
  for (const v of variants) {
    const color = v.options?.color ?? "";
    const size = v.options?.size ?? "";
    if (size) sizeSet.add(size);
    if (color) {
      if (!colorMap.has(color)) {
        colorMap.set(color, { hex: v.options?.color_code ?? null, variants: [] });
      }
      colorMap.get(color).variants.push({ id: v.id, size, title: v.title });
    }
  }
  audit.sizesAvailable = [...sizeSet];
  audit.colorsAvailable = [...colorMap.entries()].map(([name, info]) => ({
    name,
    hex: info.hex,
    variantCount: info.variants.length,
    sizes: info.variants.map((vv) => vv.size),
  }));
  console.log(`   Couleurs : ${audit.colorsAvailable.length} | Tailles : ${audit.sizesAvailable.join(",")}`);

  // 4. Mapping HM
  console.log("\n4. Mapping couleurs HM…");
  for (const target of HM_COLOR_TARGETS) {
    const match = pickBestColorMatch(target, variants);
    if (match) {
      audit.hmMatch[target.hm] = {
        priority: target.priority,
        matched: true,
        printifyColor: match.variant.options?.color,
        hex: match.variant.options?.color_code,
        variantId: match.variant.id,
        variantTitle: match.variant.title,
        size: match.variant.options?.size,
        matchedKeyword: match.matchedKeyword,
        sizeFallback: match.sizeFallback ?? false,
      };
      console.log(`   ✅ HM "${target.hm}" → ${match.variant.options?.color} (variant ${match.variant.id} L)${match.sizeFallback ? " [FALLBACK SIZE]" : ""}`);
    } else {
      audit.hmMatch[target.hm] = { priority: target.priority, matched: false };
      console.log(`   ❌ HM "${target.hm}" → NON DISPO`);
    }
  }

  // 5. Sélection variants pour draft (max 5, taille L)
  const draftVariantIds = Object.values(audit.hmMatch)
    .filter((m) => m.matched)
    .map((m) => m.variantId)
    .slice(0, 5);
  console.log(`\n5. Draft test avec ${draftVariantIds.length} variants…`);

  if (draftVariantIds.length === 0) {
    audit.errors.push("Aucun variant HM matché — draft skip");
    await saveAndExit(audit);
    return;
  }

  // Upload PNG
  console.log("   Upload PNG transparent…");
  const upRes = await pf("/uploads/images.json", {
    method: "POST",
    body: JSON.stringify({ file_name: "hm-audit-jh030.png", contents: TRANSPARENT_PNG_400_B64 }),
  });
  const imageId = upRes.data.id;

  // Création draft
  console.log("   Création draft…");
  const draftRes = await pf(`/shops/${SHOP_ID}/products.json`, {
    method: "POST",
    body: JSON.stringify({
      title: `HM AUDIT-FINAL AWDIS JH030 — DELETE AFTER USE`,
      description: "Draft auto-généré pour audit final AWDis JH030",
      blueprint_id: BLUEPRINT_ID,
      print_provider_id: PROVIDER_ID,
      variants: draftVariantIds.map((id) => ({ id, price: 5000, is_enabled: true })),
      print_areas: [{
        variant_ids: draftVariantIds,
        placeholders: [{
          position: "front",
          images: [{ id: imageId, x: 0.5, y: 0.5, scale: 1.0, angle: 0 }],
        }],
      }],
    }),
  });
  audit.draft.id = draftRes.data.id;
  console.log(`   Draft créé : ${draftRes.data.id}`);
  console.log(`   Images générés à la création : ${draftRes.data.images?.length ?? 0}`);

  // 6. Mockups
  // Extraire costs depuis le draft (Printify renvoie cost dans variants quand draft créé)
  for (const v of draftRes.data.variants ?? []) {
    const cost = (v.cost ?? 0) / 100;
    const hm = Object.entries(audit.hmMatch).find(([_, m]) => m.variantId === v.id)?.[0];
    if (hm) {
      audit.cost.byColor[hm] = {
        variantId: v.id,
        cost,
        printifyColor: audit.hmMatch[hm].printifyColor,
      };
    }
  }
  const costs = Object.values(audit.cost.byColor).map((c) => c.cost).filter((c) => c > 0);
  audit.cost.variantLAvg = costs.length > 0 ? Number((costs.reduce((s, c) => s + c, 0) / costs.length).toFixed(2)) : null;
  console.log(`   Cost L moyen : ${audit.cost.variantLAvg} €`);

  // Si images vide → retry GET draft après 5s
  let draftImages = draftRes.data.images ?? [];
  if (draftImages.length === 0) {
    console.log("   Images vides, retry après 5s…");
    await new Promise((r) => setTimeout(r, 5000));
    const retryRes = await pf(`/shops/${SHOP_ID}/products/${draftRes.data.id}.json`);
    draftImages = retryRes.data.images ?? [];
    console.log(`   Retry : ${draftImages.length} images`);
  }

  // Identifier vues camera_label par variant_id, mais Printify nous renvoie souvent
  // toutes les images avec variant_ids[] sur chaque image
  const KEEP_LABELS = new Set(["front", "back", "folded", "back-2"]);

  for (const [hm, m] of Object.entries(audit.hmMatch)) {
    if (!m.matched) continue;
    const views = {};
    for (const img of draftImages) {
      const url = new URL(img.src);
      const camLabel = url.searchParams.get("camera_label") ?? "";
      if (!KEEP_LABELS.has(camLabel)) continue;
      // Check si cette image cible bien notre variant
      const targetsVariant = Array.isArray(img.variant_ids)
        ? img.variant_ids.includes(m.variantId)
        : url.pathname.includes(`/${m.variantId}/`);
      if (!targetsVariant) continue;
      if (!views[camLabel]) views[camLabel] = img.src;
    }
    audit.mockups.byColor[hm] = Object.keys(views);
    for (const [view, url] of Object.entries(views)) {
      const fname = `${hm}-${view}.jpg`;
      const dest = path.join(OUT_DIR, fname);
      try {
        const { sizeKB } = await downloadFile(url, dest);
        console.log(`   💾 ${fname} (${sizeKB} Ko)`);
        audit.mockups.downloaded.push({ hm, view, file: fname, sizeKB });
      } catch (err) {
        console.warn(`   ⚠️  ${fname} : ${err.message}`);
      }
    }
  }

  // 7. Shipping (best-effort)
  console.log("\n7. Shipping FR 67460 (best-effort)…");
  try {
    // L'endpoint shipping est /shops/{shop_id}/orders/shipping.json (preview)
    // ou /shops/{shop_id}/products/{id}/shipping_info.json
    const shipRes = await pf(`/shops/${SHOP_ID}/products/${draftRes.data.id}/shipping_info.json`).catch(() => null);
    if (shipRes && shipRes.data) {
      audit.shipping.attempted = true;
      audit.shipping.byPostal = shipRes.data;
      console.log(`   Shipping info récupéré (raw)`);
    } else {
      // Try POST /orders/shipping.json
      const variantForShip = draftVariantIds[0];
      const shipPost = await pf(`/shops/${SHOP_ID}/orders/shipping.json`, {
        method: "POST",
        body: JSON.stringify({
          line_items: [{
            product_id: draftRes.data.id,
            variant_id: variantForShip,
            quantity: 1,
          }],
          address_to: {
            first_name: "HM",
            last_name: "Global",
            email: "audit@example.com",
            phone: "+33388000000",
            country: "FR",
            region: "",
            address1: "1 rue de l'audit",
            address2: "",
            city: "Strasbourg",
            zip: "67460",
          },
        }),
      }).catch((e) => { audit.shipping.error = e.message; return null; });

      if (shipPost) {
        audit.shipping.byPostal = { qty1: shipPost.data };
        // Try qty 10
        const shipPost10 = await pf(`/shops/${SHOP_ID}/orders/shipping.json`, {
          method: "POST",
          body: JSON.stringify({
            line_items: [{
              product_id: draftRes.data.id,
              variant_id: variantForShip,
              quantity: 10,
            }],
            address_to: {
              first_name: "HM", last_name: "Global", email: "audit@example.com",
              phone: "+33388000000", country: "FR", region: "",
              address1: "1 rue de l'audit", address2: "",
              city: "Strasbourg", zip: "67460",
            },
          }),
        }).catch((e) => null);
        if (shipPost10) audit.shipping.byPostal.qty10 = shipPost10.data;
        audit.shipping.attempted = true;
        console.log("   Shipping OK");
      } else {
        console.log(`   Shipping skip : ${audit.shipping.error}`);
      }
    }
  } catch (err) {
    audit.shipping.error = err.message;
    console.warn(`   Shipping erreur : ${err.message}`);
  }

  // 8. DELETE draft
  console.log("\n8. Cleanup draft…");
  try {
    const delRes = await pf(`/shops/${SHOP_ID}/products/${draftRes.data.id}.json`, { method: "DELETE" });
    audit.draft.deleted = true;
    audit.draft.deleteStatus = delRes.status;
    console.log(`   ✅ Draft supprimé (status ${delRes.status})`);
  } catch (err) {
    audit.draft.deleteError = err.message;
    console.error(`   ❌ Erreur delete : ${err.message}`);
  }

  await saveAndExit(audit);
}

async function saveAndExit(audit) {
  audit.apiCallsTotal = API_CALLS;
  audit.apiLog = API_LOG;
  await fs.writeFile(OUT_JSON, JSON.stringify(audit, null, 2));
  console.log(`\n📁 Audit sauvegardé : ${OUT_JSON}`);
  console.log(`📊 API calls : ${API_CALLS}/25`);
}

main().catch(async (err) => {
  console.error("\n❌ Erreur fatale :", err.message);
  console.error(err.stack);
  process.exit(1);
});
