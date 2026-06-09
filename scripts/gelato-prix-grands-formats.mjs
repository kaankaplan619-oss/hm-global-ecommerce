// Prix Gelato LECTURE SEULE — affiches A3/A2/40x60 + toile 60x90. Aucune commande.
import { readFileSync } from "node:fs";
function loadKey() {
  if (process.env.GELATO_API_KEY) return process.env.GELATO_API_KEY;
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  return env.match(/^GELATO_API_KEY\s*=\s*(.+)$/m)[1].replace(/^["']|["']$/g, "").trim();
}
const KEY = loadKey();
const BASE = "https://product.gelatoapis.com";
const g = async (p, o = {}) => {
  const r = await fetch(BASE + p, { ...o, headers: { "X-API-KEY": KEY, "Content-Type": "application/json", ...(o.headers || {}) } });
  if (!r.ok) throw new Error(`${r.status} ${p} :: ${(await r.text()).slice(0,140)}`);
  return r.json();
};
const prices = async (uid) => { const d = await g(`/v3/products/${encodeURIComponent(uid)}/prices?country=FR&currency=EUR`); return Array.isArray(d) ? d : (d.data ?? []); };
const unit = (rows) => { const m = rows.find((r) => r.quantity === 1); return m ? m.price : null; };

const search = async (catalog, filters) => {
  const res = await g(`/v3/catalogs/${catalog}/products:search`, { method: "POST", body: JSON.stringify({ attributeFilters: filters, limit: 30 }) });
  const items = (res.products ?? res.data ?? []).map((x) => x.productUid).sort((a, b) => a.length - b.length);
  return items;
};

const run = async () => {
  // formats dispo posters
  const pcat = await g(`/v3/catalogs/posters`);
  const fmt = (pcat.productAttributes ?? []).find((a) => /format/i.test(a.productAttributeUid ?? ""));
  const raw = Array.isArray(fmt?.values) ? fmt.values : (fmt?.productAttributeValues ?? []);
  console.log("posters formats:", (raw || []).map((v) => typeof v === "string" ? v : (v.productAttributeValueUid ?? v.value)).join(", "));

  const targets = [
    { label: "Affiche A3",     catalog: "posters", filters: { PaperFormat: ["A3"],     PaperType: ["170-gsm-coated-silk", "200-gsm-matt-coated"], ColorType: ["4-0"] } },
    { label: "Affiche A2",     catalog: "posters", filters: { PaperFormat: ["A2"],     PaperType: ["170-gsm-coated-silk", "200-gsm-matt-coated"], ColorType: ["4-0"] } },
    { label: "Affiche 40x60",  catalog: "posters", filters: { PaperFormat: ["400x600-mm", "SM"], ColorType: ["4-0"] } },
    { label: "Toile 60x90",    catalog: "canvas",  filters: { PaperFormat: ["600x900-mm", "LG"] } },
  ];
  for (const t of targets) {
    try {
      const uids = await search(t.catalog, t.filters);
      if (!uids.length) { console.log(`\n${t.label}: aucun UID (${JSON.stringify(t.filters)})`); continue; }
      const uid = uids[0];
      const u = unit(await prices(uid));
      console.log(`\n${t.label}\n  ${uid}\n  coût unité (qty1): ${u != null ? u.toFixed(2) : "—"} € → ×2,2 = ${u != null ? (u*2.2).toFixed(2) : "—"} €`);
    } catch (e) { console.log(`\n${t.label}: ERREUR ${e.message}`); }
  }
};
run().catch((e) => { console.error(e.message); process.exit(1); });
