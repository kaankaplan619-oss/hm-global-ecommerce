#!/usr/bin/env node
/**
 * scripts/audit-gelato-images.mjs
 *
 * Audit lecture seule de l'API Gelato pour identifier des champs image
 * exploitables comme mockups marketing.
 *
 * Lance :
 *   node scripts/audit-gelato-images.mjs
 *
 * - Lit GELATO_API_KEY depuis .env.local
 * - Pas de log de la clé
 * - Budget : 15 appels API max
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, "..");

// ─── Lecture .env.local ────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, k, v] = m;
    if (process.env[k] === undefined) {
      let val = v;
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[k] = val;
    }
  }
}
loadEnv();

const API_KEY = process.env.GELATO_API_KEY;
if (!API_KEY) {
  console.error("GELATO_API_KEY manquant.");
  process.exit(1);
}
const PRODUCT_BASE = process.env.GELATO_PRODUCT_BASE || "https://product.gelatoapis.com";

let callCount = 0;
const MAX_CALLS = 15;

async function gFetch(url, init = {}) {
  if (callCount >= MAX_CALLS) throw new Error(`Budget appels API dépassé (${MAX_CALLS})`);
  callCount += 1;
  const res = await fetch(url, {
    ...init,
    headers: {
      "X-API-KEY":    API_KEY,
      "Content-Type": "application/json",
      Accept:         "application/json",
      "User-Agent":   "HMGlobal-audit/1.0",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, ok: res.ok, json };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const IMG_KEYS = [
  "image", "imageUrl", "thumbnail", "preview", "mockup",
  "productImage", "productImages", "displayImage", "assets",
  "previewUrl", "productPreview", "placeholder", "coverImage",
  "icon", "iconUrl",
];

/** Cherche récursivement dans un objet les clés "image-like" et retourne les chemins+valeurs. */
function findImageFields(obj, prefix = "", out = [], depth = 0) {
  if (depth > 6 || obj == null) return out;
  if (Array.isArray(obj)) {
    obj.slice(0, 3).forEach((v, i) => findImageFields(v, `${prefix}[${i}]`, out, depth + 1));
    return out;
  }
  if (typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    const lk = k.toLowerCase();
    const matched = IMG_KEYS.some(ik => lk === ik.toLowerCase() || lk.includes(ik.toLowerCase()));
    if (matched) {
      out.push({ path: `${prefix}.${k}`, value: v });
    }
    if (v && typeof v === "object") {
      findImageFields(v, `${prefix}.${k}`, out, depth + 1);
    }
  }
  return out;
}

// ─── Plan ──────────────────────────────────────────────────────────────────

const FAMILIES = [
  "business-cards",
  "flyers",
  "posters",
  "canvas",
  "framed-posters",
  "hanging-posters",
];

const report = {
  generatedAt: new Date().toISOString(),
  endpointsTested: [],
  families: {},
  catalogs: null,
};

async function run() {
  // 1) Liste des catalogues (1 appel)
  const cat = await gFetch(`${PRODUCT_BASE}/v3/catalogs`);
  report.endpointsTested.push({ endpoint: "/v3/catalogs", status: cat.status });
  const catalogList = Array.isArray(cat.json?.data) ? cat.json.data : [];
  report.catalogs = {
    total: catalogList.length,
    uids: catalogList.map(c => c.catalogUid).slice(0, 60),
    imageFieldsTopLevel: findImageFields(catalogList[0] || {}),
  };

  // 2) Pour chaque famille : produit search (1 appel) + 1 produit détail (1 appel)
  for (const fam of FAMILIES) {
    if (callCount + 2 > MAX_CALLS) break;

    const search = await gFetch(`${PRODUCT_BASE}/v3/catalogs/${fam}/products:search`, {
      method: "POST",
      body: JSON.stringify({ offset: 0, limit: 5, attributeFilters: {} }),
    });
    report.endpointsTested.push({
      endpoint: `/v3/catalogs/${fam}/products:search`,
      status:   search.status,
      count:    Array.isArray(search.json?.data) ? search.json.data.length : 0,
      total:    search.json?.pagination?.total ?? null,
    });

    const products = Array.isArray(search.json?.data) ? search.json.data : [];
    const firstProductUid = products[0]?.productUid;

    const imageFieldsInSearch = findImageFields(search.json || {}, "search");

    let productDetail = null;
    let imageFieldsInDetail = [];
    if (firstProductUid && callCount < MAX_CALLS) {
      const det = await gFetch(`${PRODUCT_BASE}/v3/products/${encodeURIComponent(firstProductUid)}`);
      report.endpointsTested.push({
        endpoint: `/v3/products/${firstProductUid}`,
        status:   det.status,
      });
      productDetail = det.json;
      imageFieldsInDetail = findImageFields(det.json || {}, "product");
    }

    report.families[fam] = {
      searchStatus:        search.status,
      productCount:        products.length,
      paginationTotal:     search.json?.pagination?.total ?? null,
      sampleProductUid:    firstProductUid ?? null,
      imageFieldsInSearch,
      imageFieldsInDetail,
      // garde un échantillon brut court pour inspection humaine
      sampleSearchKeys:    products[0] ? Object.keys(products[0]) : [],
      sampleDetailKeys:    productDetail ? Object.keys(productDetail) : [],
      sampleDetail:        productDetail,
    };
  }

  // Sortie : on écrit un JSON brut audit
  const outDir = path.join(ROOT, "tmp");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "gelato-audit-raw.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");

  // Récap concis
  console.log(`Appels API utilisés : ${callCount}/${MAX_CALLS}`);
  console.log(`Catalogues retournés : ${report.catalogs.total}`);
  for (const [fam, info] of Object.entries(report.families)) {
    console.log(
      `- ${fam}: HTTP ${info.searchStatus}, products=${info.productCount}, ` +
      `imageFieldsSearch=${info.imageFieldsInSearch.length}, ` +
      `imageFieldsDetail=${info.imageFieldsInDetail.length}`
    );
  }
  console.log(`\nAudit brut écrit : ${outPath}`);
}

run().catch(e => {
  console.error("Erreur:", e.message);
  process.exit(1);
});
