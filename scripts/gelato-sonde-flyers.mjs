// Sonde LECTURE SEULE du catalogue Gelato pour les flyers.
// N'affiche jamais la clé. Aucune commande passée.
//   node scripts/gelato-sonde-flyers.mjs
import { readFileSync } from "node:fs";

// ── Charger GELATO_API_KEY depuis .env.local sans la révéler ──
function loadKey() {
  if (process.env.GELATO_API_KEY) return process.env.GELATO_API_KEY;
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const m = env.match(/^GELATO_API_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, "").trim();
  } catch {}
  return null;
}
const KEY = loadKey();
if (!KEY) { console.error("GELATO_API_KEY introuvable (.env.local)."); process.exit(1); }

const PRODUCT_BASE = "https://product.gelatoapis.com";
const COUNTRY = "FR", CURRENCY = "EUR";

async function g(path, opts = {}) {
  const res = await fetch(PRODUCT_BASE + path, {
    ...opts,
    headers: { "X-API-KEY": KEY, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${path}: ${await res.text()}`);
  return res.json();
}

const run = async () => {
  // 1) Trouver le catalogue flyers
  const catalogs = await g("/v3/catalogs");
  const list = catalogs.data ?? catalogs;
  const flyerCats = list.filter((c) =>
    /flyer|leaflet/i.test(`${c.catalogUid} ${c.title ?? ""}`));
  console.log("== Catalogues flyers candidats ==");
  for (const c of flyerCats) console.log(`  ${c.catalogUid}  —  ${c.title ?? ""}`);
  if (!flyerCats.length) {
    console.log("(aucun 'flyer' — liste complète des catalogues :)");
    for (const c of list) console.log(`  ${c.catalogUid}  —  ${c.title ?? ""}`);
    return;
  }

  const catUid = flyerCats[0].catalogUid;
  // 2) Attributs disponibles (format, papier, faces…)
  const cat = await g(`/v3/catalogs/${catUid}`);
  console.log(`\n== Attributs catalogue '${catUid}' ==`);
  for (const a of cat.productAttributes ?? []) {
    const raw = Array.isArray(a.values) ? a.values : (a.productAttributeValues ?? []);
    const vals = (Array.isArray(raw) ? raw : []).map((v) =>
      typeof v === "string" ? v : (v.productAttributeValueUid ?? v.value ?? JSON.stringify(v)));
    console.log(`  ${a.productAttributeUid ?? a.uid}: ${vals.join(", ")}`);
  }

  // 3) Quelques produits (UID variantes)
  const prods = await g(`/v3/catalogs/${catUid}/products:search`, {
    method: "POST",
    body: JSON.stringify({ limit: 60 }),
  });
  const items = prods.products ?? prods.data ?? [];
  console.log(`\n== ${items.length} variantes (échantillon) ==`);
  const sample = items.slice(0, 40);
  for (const p of sample) console.log(`  ${p.productUid}`);

  // 4) Prix d'un produit pour calibrer (1er de l'échantillon)
  if (sample[0]) {
    const uid = sample[0].productUid;
    const prices = await g(`/v3/products/${encodeURIComponent(uid)}/prices?country=${COUNTRY}&currency=${CURRENCY}`);
    console.log(`\n== Prix (${COUNTRY}/${CURRENCY}) pour ${uid} ==`);
    for (const pr of (prices.data ?? prices).slice?.(0, 12) ?? []) {
      console.log(`  qty ${pr.quantity}: ${pr.price} ${pr.currency}`);
    }
  }
};

run().catch((e) => { console.error("ERREUR:", e.message); process.exit(1); });
