// Prix Gelato LECTURE SEULE flyers : on demande à Gelato les vrais UID
// (recherche filtrée), puis on price aux quantités vendues. Aucune commande.
import { readFileSync } from "node:fs";
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
if (!KEY) { console.error("clé absente"); process.exit(1); }
const BASE = "https://product.gelatoapis.com";
const g = async (p, opts = {}) => {
  const r = await fetch(BASE + p, {
    ...opts,
    headers: { "X-API-KEY": KEY, "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!r.ok) throw new Error(`${r.status} ${p} :: ${await r.text()}`);
  return r.json();
};

const QTYS = [50, 100, 250, 500, 1000];

// Cherche le UID minimal pour (format, faces) en 170 g couché silk, orientation ver.
async function findUid(format, colorType) {
  const body = {
    attributeFilters: {
      PaperFormat: [format],
      PaperType: ["170-gsm-coated-silk"],
      ColorType: [colorType],
      Orientation: ["ver"],
      CoatingType: ["none"],
      ProtectionType: ["none"],
    },
    limit: 20,
  };
  const res = await g(`/v3/catalogs/flyers/products:search`, { method: "POST", body: JSON.stringify(body) });
  const items = res.products ?? res.data ?? [];
  // Prend le UID le plus court (le moins d'attributs superflus).
  items.sort((a, b) => a.productUid.length - b.productUid.length);
  return items[0]?.productUid ?? null;
}

const run = async () => {
  const targets = [
    ["A6", "4-0", "A6 recto"], ["A6", "4-4", "A6 recto-verso"],
    ["A5", "4-0", "A5 recto"], ["A5", "4-4", "A5 recto-verso"],
    ["A4", "4-0", "A4 recto"], ["A4", "4-4", "A4 recto-verso"],
  ];
  for (const [fmt, cl, label] of targets) {
    try {
      const uid = await findUid(fmt, cl);
      if (!uid) { console.log(`${label.padEnd(16)} | aucun UID`); continue; }
      const data = await g(`/v3/products/${encodeURIComponent(uid)}/prices?country=FR&currency=EUR`);
      const rows = data.data ?? data;
      const byQty = new Map(rows.map((r) => [r.quantity, r.price]));
      const line = QTYS.map((q) => `${q}:${byQty.has(q) ? byQty.get(q).toFixed(2) : "—"}`).join("  ");
      console.log(`${label.padEnd(16)} | ${line}`);
      console.log(`${"".padEnd(16)} | ${uid}`);
    } catch (e) {
      console.log(`${label.padEnd(16)} | ERREUR ${e.message.slice(0, 120)}`);
    }
  }
  console.log("\n(coût Gelato HT €/lot · port en sus · ×2,2 → prix TTC client)");
};
run().catch((e) => { console.error(e.message); process.exit(1); });
