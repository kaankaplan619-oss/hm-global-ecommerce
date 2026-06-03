#!/usr/bin/env node
/**
 * V3 - confirmation finale : fetch /v3/products/{productUid} pour un produit
 * de chaque famille pour confirmer absence d'images au niveau produit.
 *
 * Budget restant : 8 calls (15 - 7 v1 - 7 v2 = ... 1 mais on a appelé 7 en v1 et 7 en v2 → 14 total).
 * Budget total 15 → 1 appel restant.
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

async function gFetch(url) {
  const res = await fetch(url, {
    headers: {
      "X-API-KEY":   API_KEY,
      Accept:        "application/json",
      "User-Agent":  "HMGlobal-audit/1.0",
    },
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

const productUid = "cards_pf_bb_pt_110-lb-cover-uncoated_cl_4-4_hor";
const res = await gFetch(`${PRODUCT_BASE}/v3/products/${encodeURIComponent(productUid)}`);
console.log("Status:", res.status);
console.log("Top keys:", Object.keys(res.json));
console.log("Full JSON (1500c):", JSON.stringify(res.json).slice(0, 1500));
fs.writeFileSync(path.join(ROOT, "tmp/gelato-product-detail-sample.json"), JSON.stringify(res.json, null, 2));
