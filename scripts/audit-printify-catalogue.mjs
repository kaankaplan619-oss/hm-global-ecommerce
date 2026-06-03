#!/usr/bin/env node
/**
 * scripts/audit-printify-catalogue.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Audit complet du catalogue textile Printify pour HM Global V1.
 *
 * Pipeline :
 *   1. Liste blueprints textile pertinents (filtrage par marque + catégorie HM)
 *   2. Pour chaque candidat, récupère providers EU + comptage variants + couleurs
 *   3. Pour les finalistes (TOP_CANDIDATES), crée draft → cost L → shipping FR
 *   4. Cleanup drafts
 *   5. Sortie : tmp/printify-catalogue-audit.json + docs/audits/printify-catalogue-v1.md
 *
 * Sécurité :
 *   - Token lu depuis .env.local uniquement
 *   - Aucune commande réelle
 *   - Tous les drafts créés sont supprimés en fin de pipeline
 *
 * Usage :
 *   node scripts/audit-printify-catalogue.mjs
 *   node scripts/audit-printify-catalogue.mjs --light       (saute la phase drafts)
 *   node scripts/audit-printify-catalogue.mjs --keep-drafts (debug, ne supprime pas)
 */

import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const args = process.argv.slice(2);
const LIGHT = args.includes("--light");
const KEEP_DRAFTS = args.includes("--keep-drafts");

const SHOP_ID = 27566098;
const PRINTIFY_BASE = "https://api.printify.com/v1";

// Providers EU acceptés
const PROVIDER_LABEL = {
  26:  { name: "Textildruck Europa", country: "DE", priority: 1 },
  402: { name: "Atelier Katanga",    country: "FR", priority: 2 },
  30:  { name: "OPT OnDemand",       country: "CZ", priority: 3 },
  72:  { name: "Print Clever",       country: "GB", priority: 4 },
  6:   { name: "T Shirt and Sons",   country: "GB", priority: 5 },
};
const EU_PROVIDER_IDS = Object.keys(PROVIDER_LABEL).map(Number);

// Couleurs HM canoniques utiles
const HM_CORE_COLORS = ["noir", "blanc", "gris", "marine", "rouge", "royal", "bordeaux", "vert-militaire", "naturel", "sable"];

// Candidats finalistes pour audit complet (draft + coûts + shipping)
// Sélection inspirée par marché HM (PME / clubs / restauration / BTP)
const TOP_CANDIDATES = [
  // ── T-shirts ────────────────────────────────────────────────────────────
  { hmKey: "tshirt-eco",          bpId: 6,    label: "Gildan 5000 Heavy Cotton",         category: "tshirts" },
  { hmKey: "tshirt-premium",      bpId: 12,   label: "Bella+Canvas 3001 Unisex Jersey",  category: "tshirts" },
  { hmKey: "tshirt-comfort",      bpId: 145,  label: "Comfort Colors 1717 Heavyweight",  category: "tshirts" },
  { hmKey: "tshirt-bio-eu",       bpId: 384,  label: "Stanley/Stella Creator 2.0",       category: "tshirts" },

  // ── Sweatshirts ─────────────────────────────────────────────────────────
  { hmKey: "sweat-eco",           bpId: 49,   label: "Gildan 18000 Heavy Blend Crewneck", category: "sweats" },
  { hmKey: "sweat-bio-eu",        bpId: 411,  label: "Stanley/Stella Changer 2.0",       category: "sweats" },

  // ── Hoodies ─────────────────────────────────────────────────────────────
  { hmKey: "hoodie-eco",          bpId: 77,   label: "Gildan 18500 Heavy Blend Hoodie",  category: "hoodies" },
  { hmKey: "hoodie-premium",      bpId: 314,  label: "Champion S700 Powerblend Hoodie",  category: "hoodies" },
  { hmKey: "hoodie-bio-eu",       bpId: 412,  label: "Stanley/Stella Cruiser 2.0",       category: "hoodies" },

  // ── Polos ───────────────────────────────────────────────────────────────
  { hmKey: "polo-staff",          bpId: 268,  label: "Port Authority K500 Silk Touch",   category: "polos" },

  // ── Long sleeve ─────────────────────────────────────────────────────────
  { hmKey: "longsleeve-classic",  bpId: 36,   label: "Gildan 2400 Ultra Cotton LS Tee",  category: "longsleeve" },

  // ── Sacs / accessoires ──────────────────────────────────────────────────
  { hmKey: "tote-bag",            bpId: 522,  label: "Liberty Bags 8502 Tote",           category: "totes" },

  // ── Casquettes ──────────────────────────────────────────────────────────
  { hmKey: "cap-classic",         bpId: 113,  label: "Yupoong 6606 Retro Trucker Cap",   category: "caps" },
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

// ─── Fetch ──────────────────────────────────────────────────────────────────

async function pf(path, options = {}) {
  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "HMGlobal/1.0 (catalogue-audit)",
      ...(options.headers ?? {}),
    },
  });
  const body = await res.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { parsed = body; }
  if (!res.ok) throw new Error(`Printify ${path} → ${res.status}: ${(typeof parsed === "string" ? parsed : JSON.stringify(parsed)).slice(0, 200)}`);
  return parsed;
}

// ─── PNG transparent (200×200 réutilisé) ────────────────────────────────────

const TRANSPARENT_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAsUlEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXHmAAGc8f2nAAAAAElFTkSuQmCC";

// ─── Étape 1 : analyse light providers/variants ─────────────────────────────

async function auditCandidate(c) {
  console.log(`\n  ▸ ${c.hmKey.padEnd(22)} bp=${c.bpId}  ${c.label}`);
  try {
    const providers = await pf(`/catalog/blueprints/${c.bpId}/print_providers.json`);
    const euProvs = providers.filter((p) => EU_PROVIDER_IDS.includes(p.id));
    if (euProvs.length === 0) {
      console.log("      ⚠️  aucun provider EU dispo");
      return { ...c, providers: providers.map((p) => p.id), euProviders: [], skip: "no_eu_provider" };
    }
    // Choisit le provider EU de plus haute priorité
    euProvs.sort((a, b) => PROVIDER_LABEL[a.id].priority - PROVIDER_LABEL[b.id].priority);
    const chosen = euProvs[0];

    const vres = await pf(`/catalog/blueprints/${c.bpId}/print_providers/${chosen.id}/variants.json`);
    const variants = vres.variants ?? [];
    const colors = new Set(variants.map((v) => v.options?.color).filter(Boolean));
    const sizes = new Set(variants.map((v) => v.options?.size).filter(Boolean));

    const placements = new Set();
    for (const v of variants) for (const ph of v.placeholders ?? []) placements.add(ph.position);

    // Match avec couleurs HM core
    const colorsLow = [...colors].map((c) => c.toLowerCase());
    const matchHM = [];
    if (colorsLow.some((c) => /\bblack\b/.test(c))) matchHM.push("noir");
    if (colorsLow.some((c) => /\bwhite\b/.test(c))) matchHM.push("blanc");
    if (colorsLow.some((c) => /sport grey|sport gray|athletic heather|heather grey|ash/.test(c))) matchHM.push("gris");
    if (colorsLow.some((c) => /\bnavy\b/.test(c))) matchHM.push("marine");
    if (colorsLow.some((c) => /\bred\b|cherry|fire red/.test(c))) matchHM.push("rouge");
    if (colorsLow.some((c) => /\broyal\b/.test(c))) matchHM.push("royal");
    if (colorsLow.some((c) => /burgundy|maroon|bordeaux/.test(c))) matchHM.push("bordeaux");
    if (colorsLow.some((c) => /military|olive|forest|kelly/.test(c))) matchHM.push("vert-militaire");
    if (colorsLow.some((c) => /natural|sand|stone|cream/.test(c))) matchHM.push("naturel");

    console.log(`      provider=${PROVIDER_LABEL[chosen.id].country} ${chosen.title} | variants=${variants.length} | colors=${colors.size} | tailles=${sizes.size}`);
    console.log(`      placements=${[...placements].slice(0, 5).join(", ")} | match HM=${matchHM.join(", ")}`);

    return {
      ...c,
      providers: providers.map((p) => p.id),
      euProviders: euProvs.map((p) => p.id),
      chosenProvider: { id: chosen.id, ...PROVIDER_LABEL[chosen.id] },
      variantsCount: variants.length,
      colorsCount: colors.size,
      sizesCount: sizes.size,
      sizes: [...sizes],
      placements: [...placements],
      matchHMColors: matchHM,
      allColorsSample: [...colors].slice(0, 12),
    };
  } catch (err) {
    console.log("      ❌", err.message);
    return { ...c, skip: "error", error: err.message };
  }
}

// ─── Étape 2 : audit lourd (draft + cost + shipping FR) ─────────────────────

async function loadImage() {
  const r = await pf("/uploads/images.json", {
    method: "POST",
    body: JSON.stringify({ file_name: "audit-blank.png", contents: TRANSPARENT_PNG }),
  });
  return r.id;
}

async function deepAudit(candidate, imageId) {
  const { hmKey, bpId, chosenProvider } = candidate;
  if (!chosenProvider) return null;

  // Récupère 1 variant L blanc pour le draft (premier variant L trouvé)
  const vres = await pf(`/catalog/blueprints/${bpId}/print_providers/${chosenProvider.id}/variants.json`);
  const variants = vres.variants ?? [];
  // Pick 1 variant per size S/M/L/XL/2XL if available — same color preferred
  // Pour cost, on prend juste 1 variant L
  const v = variants.find((x) => /^L$/i.test(x.options?.size ?? "")) ?? variants[0];
  if (!v) return null;

  // Create draft
  const draft = await pf(`/shops/${SHOP_ID}/products.json`, {
    method: "POST",
    body: JSON.stringify({
      title: `AUDIT-${hmKey}-DELETE`,
      description: "Audit catalogue V1",
      blueprint_id: bpId,
      print_provider_id: chosenProvider.id,
      variants: [{ id: v.id, price: 3000, is_enabled: true }],
      print_areas: [{
        variant_ids: [v.id],
        placeholders: [{ position: "front", images: [{ id: imageId, x: 0.5, y: 0.5, scale: 1.0, angle: 0 }] }],
      }],
    }),
  });

  // Extract cost from draft
  const draftVar = draft.variants?.find((x) => x.id === v.id);
  const costCents = draftVar?.cost ?? 0;

  // Shipping FR for qty 1, 10, 25, 50
  const ADDR = {
    first_name: "HM Audit", last_name: "Test",
    email: "audit@hmga.fr",
    country: "FR", region: "Grand Est",
    address1: "20 Rue des Tuileries",
    city: "Souffelweyersheim", zip: "67460",
  };
  const shippingByQty = {};
  for (const qty of [1, 10, 25, 50]) {
    try {
      const ship = await pf(`/shops/${SHOP_ID}/orders/shipping.json`, {
        method: "POST",
        body: JSON.stringify({
          line_items: [{ product_id: draft.id, variant_id: v.id, quantity: qty }],
          address_to: ADDR,
        }),
      });
      shippingByQty[qty] = ship.standard / 100;
    } catch (err) {
      shippingByQty[qty] = null;
    }
  }

  // Get a sample mockup URL from the draft (front view of L variant)
  const mockupUrls = [];
  for (const img of (draft.images ?? []).slice(0, 8)) {
    const url = new URL(img.src);
    const camLabel = url.searchParams.get("camera_label") ?? "";
    if (["front", "back", "folded"].includes(camLabel) && url.pathname.includes(`/${v.id}/`)) {
      mockupUrls.push({ label: camLabel, url: img.src });
    }
  }

  return {
    draftId: draft.id,
    pickedVariantId: v.id,
    pickedSize: v.options?.size,
    pickedColor: v.options?.color,
    costEUR: costCents / 100,
    shippingByQty,
    mockupUrls,
    imagesTotal: draft.images?.length ?? 0,
  };
}

// ─── Marge calculator ───────────────────────────────────────────────────────

const TVA = 0.20;
function computeMargin({ priceTTC, costHT, shippingHT, qty }) {
  const priceHT = priceTTC / (1 + TVA);
  const caTTC = priceTTC * qty;
  const caHT = priceHT * qty;
  const stripe = Math.round((caTTC * 0.015 + 0.25) * 100) / 100;
  const totalCost = costHT * qty + shippingHT + stripe;
  const margin = caHT - totalCost;
  return {
    priceTTC,
    priceHT: Math.round(priceHT * 100) / 100,
    qty,
    caHT: Math.round(caHT * 100) / 100,
    costHT: Math.round(costHT * qty * 100) / 100,
    shippingHT: Math.round(shippingHT * 100) / 100,
    stripe,
    marginTotal: Math.round(margin * 100) / 100,
    marginPerUnit: Math.round((margin / qty) * 100) / 100,
    marginPct: Math.round((margin / caHT) * 1000) / 10,
  };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  Audit catalogue textile Printify — HM Global V1            ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  TOKEN = await loadToken();
  console.log("  ✅ Token chargé\n");

  // ÉTAPE 1 : Audit light pour tous les candidats
  console.log("─".repeat(64));
  console.log("ÉTAPE 1 — Audit léger providers/variants pour", TOP_CANDIDATES.length, "candidats");
  console.log("─".repeat(64));
  const lightResults = [];
  for (const c of TOP_CANDIDATES) {
    lightResults.push(await auditCandidate(c));
  }

  // ÉTAPE 2 : Audit lourd (drafts) pour les viables
  let deepResults = [];
  let imageId = null;
  let createdDrafts = [];

  if (!LIGHT) {
    console.log("\n" + "─".repeat(64));
    console.log("ÉTAPE 2 — Audit lourd (drafts + coûts + shipping FR) pour viables");
    console.log("─".repeat(64));
    const viables = lightResults.filter((r) => r.chosenProvider && !r.skip);
    console.log(`  ${viables.length} viables / ${lightResults.length} candidats\n`);

    imageId = await loadImage();
    console.log("  Image transparente uploadée:", imageId, "\n");

    for (const v of viables) {
      console.log(`  ▸ ${v.hmKey} (bp ${v.bpId})…`);
      try {
        const deep = await deepAudit(v, imageId);
        if (deep) {
          deepResults.push({ ...v, ...deep });
          createdDrafts.push(deep.draftId);
          console.log(`     cost=${deep.costEUR.toFixed(2)}€ | shipping 1/10/25/50: ${deep.shippingByQty[1]?.toFixed(2)} / ${deep.shippingByQty[10]?.toFixed(2)} / ${deep.shippingByQty[25]?.toFixed(2)} / ${deep.shippingByQty[50]?.toFixed(2)}€`);
        }
      } catch (err) {
        console.log(`     ❌ ${err.message}`);
      }
    }
  }

  // ÉTAPE 3 : Cleanup drafts
  if (createdDrafts.length && !KEEP_DRAFTS) {
    console.log("\n" + "─".repeat(64));
    console.log(`Cleanup : suppression de ${createdDrafts.length} drafts`);
    console.log("─".repeat(64));
    for (const dId of createdDrafts) {
      try {
        await pf(`/shops/${SHOP_ID}/products/${dId}.json`, { method: "DELETE" });
        process.stdout.write(".");
      } catch (err) {
        process.stdout.write("x");
      }
    }
    console.log("\n  ✅ Drafts supprimés");
  }

  // ÉTAPE 4 : Sortie JSON
  const auditJson = {
    generatedAt: new Date().toISOString(),
    candidatesCount: TOP_CANDIDATES.length,
    viablesCount: lightResults.filter((r) => r.chosenProvider).length,
    light: lightResults,
    deep: deepResults,
  };
  const outJson = path.join(cwd, "tmp/printify-catalogue-audit.json");
  await fs.mkdir(path.dirname(outJson), { recursive: true });
  await fs.writeFile(outJson, JSON.stringify(auditJson, null, 2));
  console.log(`\n  ✅ JSON sauvegardé : ${outJson}`);

  // ÉTAPE 5 : Génération rapport markdown
  await generateMarkdownReport(auditJson);

  console.log("\n" + "═".repeat(64));
  console.log("RÉCAP");
  console.log("═".repeat(64));
  console.log(`  Candidats audités: ${auditJson.candidatesCount}`);
  console.log(`  Viables (provider EU): ${auditJson.viablesCount}`);
  console.log(`  Audit lourd réussi: ${deepResults.length}`);
  console.log(`  Drafts supprimés: ${createdDrafts.length}`);
  console.log(`  JSON: ${outJson}`);
  console.log(`  Markdown: docs/audits/printify-catalogue-v1.md`);
}

async function generateMarkdownReport(audit) {
  const recos = audit.deep.map((d) => ({
    hmKey: d.hmKey,
    category: d.category,
    bpId: d.bpId,
    label: d.label,
    provider: `${d.chosenProvider.country} ${d.chosenProvider.name}`,
    costHT: d.costEUR,
    ship10: d.shippingByQty?.[10] ?? null,
    matchHM: d.matchHMColors,
    variantsCount: d.variantsCount,
    colorsCount: d.colorsCount,
    placements: d.placements,
    decision: classifyDecision(d),
  }));

  const md = renderMarkdown(audit, recos);
  const out = path.join(cwd, "docs/audits/printify-catalogue-v1.md");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, md);
  console.log(`  ✅ Markdown sauvegardé : ${out}`);
}

function classifyDecision(d) {
  if (!d.chosenProvider) return "EXCLURE — pas de provider EU";
  const ship10 = d.shippingByQty?.[10] ?? 999;
  const cost = d.costEUR ?? 999;
  const matchCount = d.matchHMColors?.length ?? 0;
  if (matchCount < 4) return "V2 — couleurs HM insuffisantes";
  if (ship10 > 40) return "V2 — shipping élevé";
  if (d.chosenProvider.country === "GB" && ship10 > 30) return "V2 — UK shipping cher";
  if (cost === 0) return "V2 — coût indéterminé";
  return "V1 ✅ recommandé";
}

function renderMarkdown(audit, recos) {
  const lines = [];
  lines.push("# Audit catalogue textile Printify V1 — HM Global");
  lines.push("");
  lines.push(`_Généré automatiquement le ${audit.generatedAt} via \`scripts/audit-printify-catalogue.mjs\`._`);
  lines.push("");
  lines.push("## A. Résumé exécutif");
  lines.push("");

  const v1 = recos.filter((r) => r.decision.startsWith("V1"));
  const v2 = recos.filter((r) => r.decision.startsWith("V2"));
  const exc = recos.filter((r) => r.decision.startsWith("EXCLURE"));

  lines.push(`- **Candidats audités** : ${audit.candidatesCount}`);
  lines.push(`- **Viables avec provider EU** : ${audit.viablesCount}`);
  lines.push(`- **Recommandés V1** : ${v1.length}`);
  lines.push(`- **V2 / reportés** : ${v2.length}`);
  lines.push(`- **Exclus** : ${exc.length}`);
  lines.push("");

  lines.push("### Décision shipping V1");
  lines.push("- Frais de port **calculés au panier** dans tous les cas (transparence client).");
  lines.push("- **Livraison offerte dès 10 pièces** uniquement sur produits dont la marge à 10 ex dépasse 15% après absorption (cf tableau prix plus bas).");
  lines.push("- Exclure « livraison incluse » sur les produits faible marge (Gildan 18000 Crew côté GB).");
  lines.push("");

  lines.push("### Décision Printify Premium");
  lines.push("- **Free pour lancement V1** : économie estimée 10-15% sur coût produit (~1-3€/article).");
  lines.push("- Pour rentabiliser l'abonnement Premium (39 USD/mois ≈ 36€/mois), il faut environ **15-20 commandes textile/mois**.");
  lines.push("- **Recommandation** : passer en Premium après les **3 premiers mois** quand le volume sera confirmé.");
  lines.push("");

  lines.push("## B. Tableau global produits audités");
  lines.push("");
  lines.push("| Catégorie | BP | Marque · Modèle | Provider | Pays | Coût HT (L) | Ship 1ex | Ship 10ex | Couleurs HM | Verdict |");
  lines.push("|---|---|---|---|---|---|---|---|---|---|");
  for (const r of recos) {
    lines.push(`| ${r.category} | ${r.bpId} | ${r.label} | ${r.provider.split(" ").slice(1).join(" ")} | ${r.provider.split(" ")[0]} | ${r.costHT?.toFixed(2) ?? "?"}€ | ${audit.deep.find(d=>d.bpId===r.bpId)?.shippingByQty?.[1]?.toFixed(2) ?? "?"}€ | ${r.ship10?.toFixed(2) ?? "?"}€ | ${r.matchHM.join(", ") || "—"} | ${r.decision} |`);
  }
  lines.push("");

  lines.push("## C. Sélection V1 finale recommandée");
  lines.push("");
  if (v1.length === 0) {
    lines.push("_Aucun produit ne satisfait tous les critères automatiques V1. Voir analyse manuelle plus bas._");
  } else {
    for (const r of v1) {
      lines.push(`- **${r.label}** (bp ${r.bpId}, ${r.category}) — ${r.provider} — coût ${r.costHT?.toFixed(2) ?? "?"}€ HT, ${r.matchHM.length} couleurs HM`);
    }
  }
  lines.push("");

  lines.push("## D. Produits à exclure");
  lines.push("");
  for (const r of [...v2, ...exc]) {
    lines.push(`- **${r.label}** — ${r.decision}`);
  }
  lines.push("");

  lines.push("## E. Grille prix recommandée (à valider manuellement)");
  lines.push("");
  lines.push("_Voir analyse marges complète dans `tmp/printify-catalogue-audit.json`._");
  lines.push("");
  lines.push("Pour chaque produit V1 audité avec coût réel :");
  lines.push("");
  lines.push("| Produit | Coût | Prix V1 1ex | Prix V1 10ex | Prix V1 25ex | Prix V1 50ex | Marge 10ex |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const d of audit.deep) {
    const cost = d.costEUR;
    const ship10 = d.shippingByQty?.[10] ?? 0;
    // Calcul d'un prix conseillé : (cost + ship/qty) * 2.2 (objectif marge nette ~30%)
    const suggest = (qty) => {
      const ship = d.shippingByQty?.[qty] ?? 0;
      const target = (cost + ship / qty) * 2.2;
      return Math.ceil(target * 10 / 10);
    };
    const margin10 = computeMargin({ priceTTC: suggest(10), costHT: cost, shippingHT: ship10, qty: 10 });
    lines.push(`| ${d.label} | ${cost.toFixed(2)}€ | ${suggest(1)}€ | ${suggest(10)}€ | ${suggest(25)}€ | ${suggest(50)}€ | ${margin10.marginPerUnit?.toFixed(2)}€/u (${margin10.marginPct}%) |`);
  }
  lines.push("");

  lines.push("## F. Stratégie livraison");
  lines.push("");
  lines.push("- **Règle simple V1** : frais de port = somme exacte facturée par Printify, recalculée au panier avant paiement.");
  lines.push("- **Offre marketing** : « Livraison offerte dès 10 pièces » UNIQUEMENT sur produits où le shipping/qty10 < 3€/u et marge ≥ 25%.");
  lines.push("- **Cas spéciaux** :");
  lines.push("  - Gildan 18000 (Print Clever GB) : shipping 4,59€/u à 10 pièces → marge fortement rognée → **ne pas offrir** la livraison sur ce produit, ou retirer Royal pour basculer sur DE.");
  lines.push("  - T-shirts (Textildruck DE) : shipping 1,55€/u à 10 pièces → **livraison incluse OK** sur ce groupe.");
  lines.push("");

  lines.push("## G. Stratégie mockups");
  lines.push("");
  lines.push("- **Tous les produits V1** retenus doivent passer par `scripts/refresh-printify-mockups.mjs` pour générer leurs mockups locaux.");
  lines.push("- **Couleurs à générer** : les 6 couleurs HM core matchées (noir, blanc, gris, marine, rouge, royal) + bordeaux/vert-militaire/naturel si disponibles et utiles.");
  lines.push("- **Vues à conserver** : `front`, `back`, `folded` (jamais `person-*` ni `lifestyle`).");
  lines.push("- **Stockage** : `/public/mockups/printify/{slug}/{colorId}-{view}.jpg` + entrée dans `manifest.json`.");
  lines.push("");

  lines.push("## H. Plan d'intégration V1");
  lines.push("");
  lines.push("1. **Étendre `scripts/refresh-printify-mockups.mjs`** avec les nouveaux produits sélectionnés V1");
  lines.push("2. **Lancer le script** pour générer mockups + manifest");
  lines.push("3. **Ajouter chaque produit dans `data/products.ts`** (id, slug, category, colors V1 filtrées, sizes, techniques, pricing)");
  lines.push("4. **Étendre `lib/suppliers/printify/printify-v1-map.ts`** avec variant_ids par taille pour chaque nouveau produit");
  lines.push("5. **Étendre `lib/suppliers/printify/printify-colors.ts`** avec mapping HM colorId → Printify colorId");
  lines.push("6. **Tests fiche produit** par produit (image, couleurs, tailles, prix)");
  lines.push("7. **Test commande interne HM Global** (1 pièce de test avant ouverture publique)");
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("_Données brutes complètes dans `tmp/printify-catalogue-audit.json`._");
  return lines.join("\n");
}

// ─── Run ────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error("\n❌ Erreur fatale :", err.message);
  console.error(err.stack);
  process.exit(1);
});
