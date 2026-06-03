#!/usr/bin/env node
/**
 * V2 - inspecte la structure brute des réponses Gelato + tente d'extraire
 * des champs image, puis télécharge si possible.
 *
 * Budget appels restant : on alloue jusqu'à 8 calls supplémentaires.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, "..");

function loadEnv() {
  const raw = fs.readFileSync(path.join(ROOT, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
loadEnv();

const API_KEY = process.env.GELATO_API_KEY;
const PRODUCT_BASE = process.env.GELATO_PRODUCT_BASE || "https://product.gelatoapis.com";

let callCount = 0;
const MAX_CALLS = 8;

async function gFetch(url, init = {}) {
  if (callCount >= MAX_CALLS) throw new Error(`Budget dépassé ${MAX_CALLS}`);
  callCount += 1;
  const res = await fetch(url, {
    ...init,
    headers: {
      "X-API-KEY":   API_KEY,
      "Content-Type":"application/json",
      Accept:        "application/json",
      "User-Agent":  "HMGlobal-audit/1.0",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, ok: res.ok, json, rawLen: text.length };
}

const IMG_KEYS = ["image","imageurl","thumbnail","preview","mockup","productimage","productimages","displayimage","assets","previewurl","productpreview","placeholder","coverimage","icon","iconurl","picture","pictureurl","previewfileurl","previewfile","previewurls"];

function findImageFields(obj, prefix = "$", out = [], depth = 0) {
  if (depth > 8 || obj == null) return out;
  if (Array.isArray(obj)) {
    obj.slice(0, 5).forEach((v, i) => findImageFields(v, `${prefix}[${i}]`, out, depth + 1));
    return out;
  }
  if (typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    const lk = k.toLowerCase();
    if (IMG_KEYS.some(ik => lk === ik || lk.includes(ik))) {
      out.push({ path: `${prefix}.${k}`, sample: Array.isArray(v) ? v.slice(0,2) : (typeof v === "string" ? v.slice(0,200) : v) });
    }
    if (v && typeof v === "object") findImageFields(v, `${prefix}.${k}`, out, depth + 1);
  }
  return out;
}

const families = ["business-cards","flyers","posters","canvas","framed-posters","hanging-posters"];

async function run() {
  const out = { generatedAt: new Date().toISOString(), tests: [], families: {} };

  // 1) Inspect catalog detail (attributes obligatoires) pour business-cards
  const det = await gFetch(`${PRODUCT_BASE}/v3/catalogs/business-cards`);
  out.tests.push({ endpoint: "/v3/catalogs/business-cards", status: det.status, topKeys: Object.keys(det.json || {}), imageFields: findImageFields(det.json) });

  // 2) Pour chaque famille faire un search avec body vide complet
  for (const fam of families) {
    if (callCount + 1 > MAX_CALLS) break;
    const res = await gFetch(`${PRODUCT_BASE}/v3/catalogs/${fam}/products:search`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const json = res.json;
    out.families[fam] = {
      status: res.status,
      topKeys: Object.keys(json || {}),
      // dump shallow keys of first item under common collection names
      firstItemKeys: (Array.isArray(json?.products) ? Object.keys(json.products[0]||{}) :
                       Array.isArray(json?.data) ? Object.keys(json.data[0]||{}) :
                       Array.isArray(json?.items) ? Object.keys(json.items[0]||{}) : null),
      pagination: json?.pagination ?? null,
      hits: json?.hits ?? null,
      imageFields: findImageFields(json),
      rawPreview: JSON.stringify(json).slice(0, 800),
    };
  }

  fs.writeFileSync(path.join(ROOT, "tmp/gelato-audit-raw-v2.json"), JSON.stringify(out, null, 2));
  console.log(`Appels: ${callCount}/${MAX_CALLS}`);
  for (const [fam, info] of Object.entries(out.families)) {
    console.log(`- ${fam}: status=${info.status} topKeys=${JSON.stringify(info.topKeys)} imageFields=${info.imageFields.length}`);
  }
  console.log("Catalog detail topKeys:", out.tests[0].topKeys);
  console.log("Catalog detail imageFields:", out.tests[0].imageFields.length);
}
run().catch(e => { console.error(e); process.exit(1); });
