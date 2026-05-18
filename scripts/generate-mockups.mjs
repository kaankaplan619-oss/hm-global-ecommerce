#!/usr/bin/env node
/**
 * scripts/generate-mockups.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Génère des mockups ghost fond blanc via Printful Mockup Generator API.
 * Sauvegarde dans /public/mockups/{slug}/{color}-{view}.png
 *
 * Usage :
 *   node scripts/generate-mockups.mjs
 *   node scripts/generate-mockups.mjs --product gildan-5000
 *   node scripts/generate-mockups.mjs --dry-run
 *
 * IDs Printful confirmés via API :
 *   bella-3001  → 71
 *   gildan-5000 → 438
 *   gildan-18000 → 145
 *   gildan-18500 → 146
 */

import fs   from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

// ─── Config ───────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    slug:       "bella-3001",
    printfulId: 71,
    label:      "Bella+Canvas 3001",
    colors: [
      { hmId: "blanc",            printfulName: "White"            },
      { hmId: "noir",             printfulName: "Black"            },
      { hmId: "marine",           printfulName: "Navy"             },
      { hmId: "dark-heather",     printfulName: "Dark Grey"        },
      { hmId: "heather-navy",     printfulName: "Heather Navy"     },
      { hmId: "asphalt",          printfulName: "Asphalt"          },
      { hmId: "athletic-heather", printfulName: "Athletic Heather" },
      { hmId: "true-royal",       printfulName: "True Royal"       },
    ],
  },
  {
    slug:       "gildan-5000",
    printfulId: 438,
    label:      "Gildan 5000 Heavy Cotton",
    colors: [
      { hmId: "blanc",      printfulName: "White"      },
      { hmId: "noir",       printfulName: "Black"      },
      { hmId: "gris-sport", printfulName: "Sport Grey" },
      { hmId: "marine",     printfulName: "Navy"       },
    ],
  },
  {
    slug:       "gildan-18000",
    printfulId: 145,
    label:      "Gildan 18000 Sweatshirt",
    colors: [
      { hmId: "blanc",      printfulName: "White"      },
      { hmId: "noir",       printfulName: "Black"      },
      { hmId: "gris-sport", printfulName: "Sport Grey" },
      { hmId: "marine",     printfulName: "Navy"       },
    ],
  },
  {
    slug:       "gildan-18500",
    printfulId: 146,
    label:      "Gildan 18500 Hoodie",
    colors: [
      { hmId: "blanc",      printfulName: "White"      },
      { hmId: "noir",       printfulName: "Black"      },
      { hmId: "gris-sport", printfulName: "Sport Grey" },
      { hmId: "marine",     printfulName: "Navy"       },
    ],
  },
];

// Vues à générer : placement Printful → suffixe fichier HM
const VIEWS = [
  { placement: "front",  hmSuffix: "front"  },
  { placement: "back",   hmSuffix: "back"   },
];

// Produits à rafraîchir en front uniquement depuis les templates Printful propres.
// Objectif : éviter les visuels variant.image et privilégier les ghost/whitebg/flat.
const CLEAN_FRONT_TEMPLATE_PRODUCTS = new Set([
  "gildan-18500",
  "gildan-18000",
  "gildan-5000",
  "bella-3001",
]);

const FRONT_TEMPLATE_OVERRIDES = {
  // Template confirmé : image_url contient "ghost" et "whitebg".
  "gildan-18500": 149880,
};

const CLEAN_TEMPLATE_KEYWORDS = ["ghost", "whitebg", "flat"];

const PRINTFUL_BASE  = "https://api.printful.com";
const POLL_INTERVAL  = 4_000;   // ms
const POLL_TIMEOUT   = 180_000; // 3 min max par tâche
const cwd            = process.cwd();

// ─── Flags CLI ────────────────────────────────────────────────────────────────

const args        = process.argv.slice(2);
const DRY_RUN     = args.includes("--dry-run");
const ONLY        = args.includes("--product") ? args[args.indexOf("--product") + 1] : null;

// ─── Parse .env.local ─────────────────────────────────────────────────────────

async function loadEnv() {
  const raw = await fs.readFile(path.join(cwd, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return env;
}

// ─── Printful API ─────────────────────────────────────────────────────────────

async function pfFetch(url, apiKey, options = {}) {
  const res = await fetch(`${PRINTFUL_BASE}${url}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
      ...(options.headers ?? {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`[Printful] ${url} → ${res.status}: ${json?.error?.message ?? json?.result ?? "erreur"}`);
  }
  return json.result ?? json;
}

async function pollTask(taskKey, apiKey) {
  const deadline = Date.now() + POLL_TIMEOUT;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const result = await pfFetch(`/mockup-generator/task?task_key=${encodeURIComponent(taskKey)}`, apiKey);
    if (result.status === "completed") return result;
    if (result.status === "failed")    throw new Error(`[Printful] Task échouée: ${result.error ?? "raison inconnue"}`);
    process.stdout.write("·");
  }
  throw new Error("[Printful] Timeout tâche dépassé");
}

// (upload Supabase non nécessaire — stratégie directe sans mockup generator)

// ─── Téléchargement fichier ───────────────────────────────────────────────────

async function downloadFile(url, destPath) {
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

function isCleanTemplate(t) {
  const url = (t?.image_url ?? "").toLowerCase();
  return CLEAN_TEMPLATE_KEYWORDS.some((keyword) => url.includes(keyword));
}

function resolveCleanFrontTemplate(product, variant, templates, tmplIndex, vmIndex) {
  const overrideId = FRONT_TEMPLATE_OVERRIDES[product.slug];
  if (overrideId) {
    const override = tmplIndex[overrideId];
    const url = (override?.image_url ?? "").toLowerCase();
    if (!override || !url.includes("ghost") || !url.includes("whitebg")) {
      throw new Error(`template_id ${overrideId} invalide ou sans ghost/whitebg`);
    }
    return override;
  }

  const varTemplates = vmIndex[variant.id] ?? {};
  const mappedFront = tmplIndex[varTemplates.front];
  if (mappedFront && isCleanTemplate(mappedFront)) return mappedFront;

  const cleanFronts = templates.filter((t) => {
    if (!isCleanTemplate(t)) return false;
    if (t.is_template_on_front === false) return false;
    return true;
  });

  const variantColor = (variant.color_code ?? "").toLowerCase();
  const colorMatch = cleanFronts.find(
    (t) => (t.background_color ?? "").toLowerCase() === variantColor
  );
  return colorMatch ?? cleanFronts[0] ?? null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║     Printful Mockup Generator — HM Global Agence     ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  if (DRY_RUN) console.log("  ⚠️  DRY-RUN : aucun fichier téléchargé\n");

  // 1. Charger les clés
  const env    = await loadEnv();
  const apiKey = env.PRINTFUL_API_KEY;

  if (!apiKey) { console.error("❌ PRINTFUL_API_KEY manquante dans .env.local"); process.exit(1); }
  console.log("  ✅ Clés chargées\n");
  console.log("  Stratégie :");
  console.log("    FRONT  → variant.image Printful CDN (couleur réelle, direct)");
  console.log("    BACK   → template ghost fond blanc (image Printful CDN, direct)\n");

  // 3. Filtrer les produits si --product
  const products = ONLY ? PRODUCTS.filter(p => p.slug === ONLY) : PRODUCTS;
  if (ONLY && !products.length) {
    console.error(`❌ Produit "${ONLY}" inconnu. Slugs valides : ${PRODUCTS.map(p => p.slug).join(", ")}`);
    process.exit(1);
  }

  const report = {};

  // 4. Boucle produits
  for (const product of products) {
    console.log(`\n${"─".repeat(56)}`);
    console.log(`📦  ${product.label}  (ID Printful: ${product.printfulId})`);
    console.log("─".repeat(56));

    report[product.slug] = { downloaded: 0, skipped: 0, errors: [], files: [] };

    // 4a. Récupérer les variants (pour trouver l'ID par couleur)
    let allVariants;
    try {
      const productData = await pfFetch(`/products/${product.printfulId}`, apiKey);
      allVariants = productData.variants ?? [];
      console.log(`  Variants disponibles : ${allVariants.length}`);
    } catch (err) {
      console.error(`  ❌ Impossible de charger le produit : ${err.message}`);
      report[product.slug].errors.push(err.message);
      continue;
    }

    // 4b. Récupérer les templates mockup
    let templateData;
    try {
      templateData = await pfFetch(`/mockup-generator/templates/${product.printfulId}`, apiKey);
    } catch (err) {
      console.error(`  ❌ Impossible de charger les templates : ${err.message}`);
      report[product.slug].errors.push(err.message);
      continue;
    }

    const templates      = templateData.templates ?? [];
    const variantMapping = templateData.variant_mapping ?? [];

    // Index : template_id → image_url (pour fallback direct sans tâche)
    const tmplIndex = {};
    for (const t of templates) tmplIndex[t.template_id] = t;

    // Index : variant_id → { placement → template_id }
    const vmIndex = {};
    for (const vm of variantMapping) {
      vmIndex[vm.variant_id] = {};
      for (const t of vm.templates ?? []) {
        vmIndex[vm.variant_id][t.placement] = t.template_id;
      }
    }

    // 4c. Boucle couleurs
    for (const colorDef of product.colors) {
      // Trouver le variant Printful correspondant (taille M ou L de préférence)
      const matchingVariants = allVariants.filter(v => {
        const c = (v.color ?? "").toLowerCase();
        const s = colorDef.printfulName.toLowerCase();
        return c === s || c.replace(/\s+/g, " ") === s;
      });

      if (!matchingVariants.length) {
        console.log(`  ⚠️  "${colorDef.printfulName}" introuvable → ignorée`);
        report[product.slug].skipped++;
        continue;
      }

      // Préférer taille M ou L (peu importe pour le visuel)
      const variant = matchingVariants.find(v => /^[ML]$/.test(v.size ?? ""))
        ?? matchingVariants[0];

      console.log(`\n  🎨 ${colorDef.hmId} (variant ${variant.id} · ${variant.color} · ${variant.size})`);

      const views = CLEAN_FRONT_TEMPLATE_PRODUCTS.has(product.slug)
        ? VIEWS.filter((view) => view.placement === "front")
        : VIEWS;

      // 4d. Téléchargement des vues
      for (const view of views) {
        const destFile   = `${colorDef.hmId}-${view.hmSuffix}.png`;
        const destDir    = path.join(cwd, "public", "mockups", product.slug);
        const destPath   = path.join(destDir, destFile);
        const publicPath = `/mockups/${product.slug}/${destFile}`;

        if (DRY_RUN) {
          console.log(`     [DRY-RUN] → ${publicPath}`);
          report[product.slug].downloaded++;
          continue;
        }

        let imageUrl;

        if (view.placement === "front") {
          if (CLEAN_FRONT_TEMPLATE_PRODUCTS.has(product.slug)) {
            const tmpl = resolveCleanFrontTemplate(product, variant, templates, tmplIndex, vmIndex);
            imageUrl = tmpl?.image_url ?? null;
            if (!imageUrl) {
              console.error(`     ❌ Pas de template front propre pour ce variant`);
              report[product.slug].errors.push(`${destFile}: template front propre manquant`);
              continue;
            }
          } else {
            // FRONT : image couleur-spécifique directement depuis Printful CDN
            imageUrl = variant.image;
            if (!imageUrl) {
              console.error(`     ❌ Pas d'image front pour ce variant`);
              report[product.slug].errors.push(`${destFile}: image manquante`);
              continue;
            }
          }
        } else {
          // BACK : template ghost fond blanc (même image pour toutes les couleurs)
          const varTemplates = vmIndex[variant.id] ?? {};
          const templateId   = varTemplates[view.placement];
          const tmpl         = templateId ? tmplIndex[templateId] : null;
          imageUrl = tmpl?.image_url ?? null;

          if (!imageUrl) {
            // Chercher n'importe quel template "back" si pas de mapping direct
            const backTmpl = templates.find(t =>
              (t.image_url ?? "").toLowerCase().includes(`/ghost/back/`)
            );
            imageUrl = backTmpl?.image_url ?? null;
          }

          if (!imageUrl) {
            console.warn(`     ⚠️  Pas de template back trouvé — ignoré`);
            report[product.slug].skipped++;
            continue;
          }
        }

        try {
          await downloadFile(imageUrl, destPath);
          const stat = await fs.stat(destPath);
          const note = view.placement === "back" ? " [ghost base]" : "";
          console.log(`     💾 ${publicPath}  (${Math.round(stat.size / 1024)} Ko)${note}`);
          report[product.slug].downloaded++;
          report[product.slug].files.push(publicPath);
        } catch (err) {
          console.error(`     ❌ ${destFile} : ${err.message}`);
          report[product.slug].errors.push(`${destFile}: ${err.message}`);
        }
      } // fin vues
    } // fin couleurs
  } // fin produits

  // 5. Rapport final
  console.log(`\n${"═".repeat(56)}`);
  console.log("RAPPORT FINAL");
  console.log("═".repeat(56));
  let totalDL = 0, totalErr = 0;
  for (const [slug, stats] of Object.entries(report)) {
    const label = DRY_RUN ? "à générer" : "téléchargées";
    console.log(`  ${slug.padEnd(20)} ✅ ${stats.downloaded} images ${label}  |  ⚠️  ${stats.skipped} ignorées  |  ❌ ${stats.errors.length} erreurs`);
    if (stats.files.length) {
      for (const f of stats.files) console.log(`     ├─ ${f}`);
    }
    for (const e of stats.errors) console.log(`     └─ ${e}`);
    totalDL  += stats.downloaded;
    totalErr += stats.errors.length;
  }
  console.log("─".repeat(56));
  console.log(`  TOTAL : ${totalDL} images${DRY_RUN ? " (dry-run)" : ""}  |  ${totalErr} erreurs`);
  if (!DRY_RUN && totalDL > 0) {
    console.log(`\n  Pense à mettre à jour hmMockupImages dans data/products.ts :`);
    console.log(`  → node scripts/generate-mockup-maps.mjs\n`);
  }
  console.log("═".repeat(56));
}

main().catch(err => {
  console.error("\n❌ Erreur fatale :", err.message);
  process.exit(1);
});
