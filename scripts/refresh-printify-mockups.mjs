#!/usr/bin/env node
/**
 * scripts/refresh-printify-mockups.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Pipeline de génération mockups Printify pour les 4 produits V1.
 *
 * Pour chaque produit V1 :
 *   1. Upload un PNG 400×400 entièrement transparent (design invisible)
 *   2. Crée un produit draft Printify avec :
 *      - blueprint_id + print_provider_id principal (Textildruck DE / fallback selon dispo)
 *      - 1 variant par couleur principale (taille L par défaut, le mockup
 *        est identique pour toutes les tailles)
 *   3. Récupère les mockups générés (camera_labels flat sans mannequin)
 *   4. Télécharge les images dans :
 *        /public/mockups/printify/{productSlug}/{colorId}-{view}.jpg
 *   5. Supprime le draft
 *   6. Met à jour /public/mockups/printify/manifest.json
 *
 * Usage :
 *   node scripts/refresh-printify-mockups.mjs
 *   node scripts/refresh-printify-mockups.mjs --product gildan-18500
 *   node scripts/refresh-printify-mockups.mjs --keep-drafts    (debug : ne supprime pas)
 *   node scripts/refresh-printify-mockups.mjs --dry-run        (lecture seule)
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

// Camera labels qu'on garde (flat sans mannequin)
const KEEP_LABELS = new Set([
  "front",
  "back",
  "back-2",
  "folded",
  "front-collar-closeup",
]);

// Provider EU principal (Textildruck DE) — fallback FR puis GB selon dispo
const PROVIDER_PRIORITY = [26, 402, 72];
const PROVIDER_LABEL = {
  26:  "Textildruck Europa DE",
  402: "Atelier Katanga FR",
  72:  "Print Clever GB",
};

// Mapping V1 (extrait de lib/suppliers/printify/printify-v1-map.ts) — variant L par défaut
// Format : { slug, blueprintId, label, colors: { hmColorId: { L: variantId, providers: [...] } } }
const V1_PRODUCTS = [
  {
    slug: "gildan-5000",
    blueprintId: 6,
    label: "Gildan 5000 Heavy Cotton Tee",
    colors: [
      { hmColorId: "noir",   variantIdL: 12124, providers: [26, 402, 72] },
      { hmColorId: "blanc",  variantIdL: 12100, providers: [26, 402, 72] },
      { hmColorId: "gris",   variantIdL: 12070, providers: [26, 402, 72] },
      { hmColorId: "marine", variantIdL: 11986, providers: [26, 402, 72] },
      { hmColorId: "rouge",  variantIdL: 12022, providers: [26, 402, 72] },
      { hmColorId: "royal",  variantIdL: 12028, providers: [26, 402, 72] },
    ],
  },
  {
    slug: "bella-3001",
    blueprintId: 12,
    label: "Bella+Canvas 3001 Unisex Tee",
    colors: [
      { hmColorId: "noir",   variantIdL: 18102, providers: [26, 72] },        // FR : pas dispo en L
      { hmColorId: "blanc",  variantIdL: 18542, providers: [26, 402, 72] },
      { hmColorId: "gris",   variantIdL: 18078, providers: [26, 402, 72] },
      { hmColorId: "marine", variantIdL: 18398, providers: [26, 402, 72] },
      { hmColorId: "rouge",  variantIdL: 18446, providers: [26, 402, 72] },
      { hmColorId: "royal",  variantIdL: 18518, providers: [26, 402, 72] },
    ],
  },
  {
    // V1 : 5 couleurs (Royal retiré pour rester chez Textildruck DE)
    slug: "gildan-18000",
    blueprintId: 49,
    label: "Gildan 18000 Heavy Blend Crewneck",
    colors: [
      { hmColorId: "noir",   variantIdL: 25459, providers: [26, 402, 72] },
      { hmColorId: "blanc",  variantIdL: 25458, providers: [26, 72] },
      { hmColorId: "gris",   variantIdL: 25457, providers: [26, 402, 72] },
      { hmColorId: "marine", variantIdL: 25450, providers: [26, 402, 72] },
      { hmColorId: "rouge",  variantIdL: 25453, providers: [26, 402, 72] },
    ],
  },
  {
    slug: "gildan-18500",
    blueprintId: 77,
    label: "Gildan 18500 Heavy Blend Hoodie",
    colors: [
      { hmColorId: "noir",   variantIdL: 32920, providers: [26, 72] },
      { hmColorId: "blanc",  variantIdL: 32912, providers: [26, 72] },
      { hmColorId: "gris",   variantIdL: 32904, providers: [26, 72] },
      { hmColorId: "marine", variantIdL: 32896, providers: [26, 72] },
      { hmColorId: "rouge",  variantIdL: 33387, providers: [26, 402, 72] },
      { hmColorId: "royal",  variantIdL: 33395, providers: [26, 72] },
    ],
  },
  {
    // NOUVEAU V1 — T-shirt heavyweight teint pièce, 9,09 € Textildruck DE
    slug: "comfort-colors-1717",
    blueprintId: 145,
    label: "Comfort Colors 1717 Heavyweight Tee",
    colors: [
      { hmColorId: "noir",    variantIdL: 38192, providers: [26] },
      { hmColorId: "blanc",   variantIdL: 38191, providers: [26] },
      { hmColorId: "gris",    variantIdL: 38190, providers: [26] }, // Sport Grey
      { hmColorId: "marine",  variantIdL: 38186, providers: [26] },
      { hmColorId: "rouge",   variantIdL: 38188, providers: [26] },
      { hmColorId: "naturel", variantIdL: 63303, providers: [26] }, // Natural (couleur signature Comfort Colors)
    ],
  },
  {
    // NOUVEAU V1 — Long sleeve, 11,72 € Textildruck DE
    slug: "gildan-2400-ls",
    blueprintId: 36,
    label: "Gildan 2400 Ultra Cotton Long Sleeve",
    colors: [
      { hmColorId: "noir",    variantIdL: 22089, providers: [26] },
      { hmColorId: "blanc",   variantIdL: 22073, providers: [26] },
      { hmColorId: "gris",    variantIdL: 22033, providers: [26] }, // Sport Grey
      { hmColorId: "marine",  variantIdL: 21929, providers: [26] },
      { hmColorId: "rouge",   variantIdL: 21977, providers: [26] },
      { hmColorId: "naturel", variantIdL: 22009, providers: [26] }, // Sand
    ],
  },
];

// ─── PNG 400×400 transparent (base64) ────────────────────────────────────────
// Généré via Pillow : Image.new('RGBA', (400, 400), (0,0,0,0))
const TRANSPARENT_PNG_400_B64 = "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAsUlEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0ZXHmAAGc8f2nAAAAAElFTkSuQmCC";

// ─── CLI flags ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN     = args.includes("--dry-run");
const KEEP_DRAFTS = args.includes("--keep-drafts");
const ONLY        = args.includes("--product") ? args[args.indexOf("--product") + 1] : null;

// ─── Token loader ────────────────────────────────────────────────────────────

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

// ─── Printify API ────────────────────────────────────────────────────────────

let TOKEN = "";

async function pf(path, options = {}) {
  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept:        "application/json",
      "User-Agent":   "HMGlobal/1.0 (refresh-mockups)",
      ...(options.headers ?? {}),
    },
  });
  const body = await res.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { parsed = body; }
  if (!res.ok) {
    throw new Error(`Printify ${path} → ${res.status}: ${(typeof parsed === "string" ? parsed : JSON.stringify(parsed)).slice(0, 300)}`);
  }
  return parsed;
}

// ─── Download helper ─────────────────────────────────────────────────────────

async function downloadFile(url, destPath) {
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

// ─── Workflow par produit ────────────────────────────────────────────────────

async function processProduct(product) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📦  ${product.label}  (blueprint ${product.blueprintId})`);
  console.log("─".repeat(60));

  // 1. Choisir le provider : Textildruck DE (26) en priorité, mais doit être
  //    disponible pour TOUTES les couleurs du produit. Sinon, basculer.
  let chosenProvider = null;
  for (const cand of PROVIDER_PRIORITY) {
    if (product.colors.every((c) => c.providers.includes(cand))) {
      chosenProvider = cand;
      break;
    }
  }
  // Si aucun provider ne couvre toutes les couleurs, on choisit Textildruck DE
  // et on filtre les couleurs indispos chez lui (gère le cas Gildan 18000 royal)
  if (!chosenProvider) chosenProvider = 26;

  const usableColors = product.colors.filter((c) => c.providers.includes(chosenProvider));
  const skippedColors = product.colors.filter((c) => !c.providers.includes(chosenProvider));

  console.log(`  Provider choisi : ${PROVIDER_LABEL[chosenProvider]} (id ${chosenProvider})`);
  console.log(`  Couleurs couvertes : ${usableColors.length} / ${product.colors.length}`);
  if (skippedColors.length) {
    console.log(`  ⚠️  Couleurs SKIPPÉES (indispo chez ${PROVIDER_LABEL[chosenProvider]}) : ${skippedColors.map((c) => c.hmColorId).join(", ")}`);
  }

  if (DRY_RUN) {
    console.log("  [DRY-RUN] aucun appel API effectué");
    return { product: product.slug, dry: true, colors: usableColors.map((c) => c.hmColorId), provider: chosenProvider };
  }

  // 2. Upload PNG transparent
  console.log("  Upload PNG transparent…");
  const up = await pf("/uploads/images.json", {
    method: "POST",
    body: JSON.stringify({ file_name: "hm-blank.png", contents: TRANSPARENT_PNG_400_B64 }),
  });
  const imageId = up.id;

  // 3. Créer produit draft
  const variantIds = usableColors.map((c) => c.variantIdL);
  console.log(`  Création draft (${variantIds.length} variants)…`);
  const draft = await pf(`/shops/${SHOP_ID}/products.json`, {
    method: "POST",
    body: JSON.stringify({
      title: `HM AUTO-MOCKUP — ${product.slug} — DELETE AFTER USE`,
      description: "Draft auto-généré pour récupération mockups",
      blueprint_id: product.blueprintId,
      print_provider_id: chosenProvider,
      variants: variantIds.map((id) => ({ id, price: 3000, is_enabled: true })),
      print_areas: [{
        variant_ids: variantIds,
        placeholders: [{
          position: "front",
          images: [{ id: imageId, x: 0.5, y: 0.5, scale: 1.0, angle: 0 }],
        }],
      }],
    }),
  });
  console.log(`  Draft créé : ${draft.id} | ${draft.images?.length ?? 0} mockups générés`);

  // 4. Filtrer et télécharger les mockups flat
  const downloaded = [];
  for (const colorDef of usableColors) {
    const colorViews = {};
    for (const img of draft.images ?? []) {
      const url = new URL(img.src);
      const camLabel = url.searchParams.get("camera_label") ?? "";
      if (!KEEP_LABELS.has(camLabel)) continue;
      if (!url.pathname.includes(`/${colorDef.variantIdL}/`)) continue;
      colorViews[camLabel] = img.src;
    }

    for (const [view, url] of Object.entries(colorViews)) {
      const fname = `${colorDef.hmColorId}-${view}.jpg`;
      const destPath = path.join(cwd, "public", "mockups", "printify", product.slug, fname);
      const publicPath = `/mockups/printify/${product.slug}/${fname}`;

      try {
        await downloadFile(url, destPath);
        const stat = await fs.stat(destPath);
        console.log(`     💾 ${publicPath}  (${Math.round(stat.size / 1024)} Ko)`);
        downloaded.push({
          slug: product.slug,
          colorId: colorDef.hmColorId,
          view,
          path: publicPath,
          sizeKB: Math.round(stat.size / 1024),
        });
      } catch (err) {
        console.error(`     ❌ ${fname} : ${err.message}`);
      }
    }
  }

  // 5. Supprimer le draft (sauf --keep-drafts)
  if (!KEEP_DRAFTS) {
    try {
      await pf(`/shops/${SHOP_ID}/products/${draft.id}.json`, { method: "DELETE" });
      console.log(`  Draft supprimé : ${draft.id}`);
    } catch (err) {
      console.warn(`  ⚠️  Suppression draft échouée : ${err.message}`);
    }
  } else {
    console.log(`  Draft conservé (--keep-drafts) : ${draft.id}`);
  }

  return {
    product: product.slug,
    blueprintId: product.blueprintId,
    providerId: chosenProvider,
    providerLabel: PROVIDER_LABEL[chosenProvider],
    draftId: draft.id,
    downloaded,
    skippedColors: skippedColors.map((c) => c.hmColorId),
  };
}

// ─── Manifest ────────────────────────────────────────────────────────────────

async function writeManifest(reports) {
  // MERGE avec le manifest existant pour ne pas écraser les autres produits
  // quand on lance avec --product. Seuls les slugs touchés cette exécution
  // sont mis à jour.
  const manifestPath = path.join(cwd, "public", "mockups", "printify", "manifest.json");
  let manifest = { generatedAt: new Date().toISOString(), products: {} };
  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    const existing = JSON.parse(raw);
    if (existing && typeof existing === "object" && existing.products) {
      manifest.products = { ...existing.products };
    }
  } catch {
    // Pas de manifest existant ou invalide — repart à zéro
  }
  manifest.generatedAt = new Date().toISOString();

  for (const r of reports) {
    if (r.dry) continue;
    manifest.products[r.product] = {
      blueprintId: r.blueprintId,
      providerId: r.providerId,
      providerLabel: r.providerLabel,
      skippedColors: r.skippedColors,
      mockups: {},
    };
    for (const dl of r.downloaded) {
      manifest.products[r.product].mockups[dl.colorId] ??= {};
      manifest.products[r.product].mockups[dl.colorId][dl.view] = dl.path;
    }
  }
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Manifest mis à jour (merge) : ${manifestPath}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   Refresh Printify Mockups — HM Global V1 pipeline       ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  if (DRY_RUN) console.log("  ⚠️  DRY-RUN : aucun appel API");
  if (KEEP_DRAFTS) console.log("  ⚠️  --keep-drafts : drafts non supprimés");

  TOKEN = await loadToken();
  console.log("  ✅ Token chargé");

  const products = ONLY ? V1_PRODUCTS.filter((p) => p.slug === ONLY) : V1_PRODUCTS;
  if (ONLY && products.length === 0) {
    console.error(`❌ Produit "${ONLY}" inconnu. Slugs : ${V1_PRODUCTS.map((p) => p.slug).join(", ")}`);
    process.exit(1);
  }

  const reports = [];
  for (const p of products) {
    try {
      reports.push(await processProduct(p));
    } catch (err) {
      console.error(`\n❌ ${p.slug} : ${err.message}`);
    }
  }

  if (!DRY_RUN) await writeManifest(reports);

  // Récap final
  console.log(`\n${"═".repeat(60)}`);
  console.log("RÉCAP FINAL");
  console.log("═".repeat(60));
  let totalImages = 0, totalKB = 0;
  for (const r of reports) {
    if (r.dry) continue;
    const n = r.downloaded.length;
    const kb = r.downloaded.reduce((s, x) => s + x.sizeKB, 0);
    totalImages += n;
    totalKB += kb;
    console.log(`  ${r.product.padEnd(15)} | ${String(n).padStart(2)} images | ${String(kb).padStart(5)} Ko | provider ${r.providerLabel}`);
    if (r.skippedColors.length) console.log(`                   skipped: ${r.skippedColors.join(", ")}`);
  }
  console.log("─".repeat(60));
  console.log(`  TOTAL : ${totalImages} images | ${(totalKB / 1024).toFixed(1)} Mo`);
}

main().catch((err) => {
  console.error("\n❌ Erreur fatale :", err.message);
  process.exit(1);
});
