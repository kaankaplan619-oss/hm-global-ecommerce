// Prix Gelato LECTURE SEULE pour invitations : carte carrée + carte pliée.
import { readFileSync } from "node:fs";
function loadKey() {
  if (process.env.GELATO_API_KEY) return process.env.GELATO_API_KEY;
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  return env.match(/^GELATO_API_KEY\s*=\s*(.+)$/m)[1].replace(/^["']|["']$/g, "").trim();
}
const KEY = loadKey();
const BASE = "https://product.gelatoapis.com";
const g = async (p, opts = {}) => {
  const r = await fetch(BASE + p, {
    ...opts,
    headers: { "X-API-KEY": KEY, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!r.ok) throw new Error(`${r.status} ${p} :: ${(await r.text()).slice(0,160)}`);
  return r.json();
};
const QTYS = [50, 100, 250];

const run = async () => {
  // 1) Catalogues cartes / pliées
  const cats = (await g("/v3/catalogs")).data ?? [];
  const cardCats = cats.filter((c) => /card/i.test(`${c.catalogUid} ${c.title ?? ""}`));
  console.log("== Catalogues cartes ==");
  for (const c of cardCats) console.log(`  ${c.catalogUid} — ${c.title ?? ""}`);

  // 2) Attributs (formats) de chaque catalogue cartes
  for (const c of cardCats) {
    const cat = await g(`/v3/catalogs/${c.catalogUid}`);
    const fmtAttr = (cat.productAttributes ?? []).find((a) => /format/i.test(a.productAttributeUid ?? a.uid ?? ""));
    const raw = Array.isArray(fmtAttr?.values) ? fmtAttr.values : (fmtAttr?.productAttributeValues ?? []);
    const vals = (raw || []).map((v) => typeof v === "string" ? v : (v.productAttributeValueUid ?? v.value));
    console.log(`\n  [${c.catalogUid}] formats: ${vals.join(", ")}`);
  }

  // 3) Pour chaque cible, on cherche un UID via recherche filtrée puis on price.
  const targets = [
    { label: "Carte carrée 14x14", catalog: "cards", filters: { PaperFormat: ["SQ140x140", "SQ", "140x140-mm"], PaperType: ["350-gsm-coated-silk"], ColorType: ["4-4"] } },
    { label: "Carte pliée A6",     catalog: "folded-cards", filters: { PaperFormat: ["A6"], ColorType: ["4-4"] } },
  ];
  for (const tgt of targets) {
    try {
      const res = await g(`/v3/catalogs/${tgt.catalog}/products:search`, {
        method: "POST", body: JSON.stringify({ attributeFilters: tgt.filters, limit: 20 }),
      });
      const items = (res.products ?? res.data ?? []).sort((a, b) => a.productUid.length - b.productUid.length);
      if (!items.length) { console.log(`\n${tgt.label}: aucun UID (filtres: ${JSON.stringify(tgt.filters)})`); continue; }
      const uid = items[0].productUid;
      const prices = (await g(`/v3/products/${encodeURIComponent(uid)}/prices?country=FR&currency=EUR`)).data ?? [];
      const byQty = new Map(prices.map((r) => [r.quantity, r.price]));
      console.log(`\n${tgt.label}`);
      console.log(`  UID: ${uid}`);
      console.log(`  ` + QTYS.map((q) => `${q}:${byQty.has(q) ? byQty.get(q).toFixed(2) : "—"}`).join("  "));
    } catch (e) {
      console.log(`\n${tgt.label}: ERREUR ${e.message}`);
    }
  }
};
run().catch((e) => { console.error(e.message); process.exit(1); });
