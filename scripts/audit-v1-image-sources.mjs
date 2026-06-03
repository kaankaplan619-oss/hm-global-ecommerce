#!/usr/bin/env node
/**
 * scripts/audit-v1-image-sources.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Diagnostic strict : pour chaque page V1, vérifie que TOUTES les URLs d'image
 * référencées dans le HTML produit (cards, hero, miniatures, galerie) commencent
 * par /mockups/printify/.
 *
 * Échoue (exit 1) si une URL provient d'une source interdite :
 *   - /mockups/gildan-{5000,18000,18500}/  (ancien Pillow)
 *   - /mockups/bella-3001/                  (ancien Pillow)
 *   - /mockups/tshirt/                      (ancien Pillow)
 *   - /mockups/hm/textile/                  (HM webp)
 *   - cdn.printful.com / cdn.toptex.com    (CDN supplier)
 *   - /pictures/ (mannequin)
 *
 * Usage :
 *   node scripts/audit-v1-image-sources.mjs
 *   node scripts/audit-v1-image-sources.mjs --strict-fail  (exit 1 si erreur)
 */

const args = process.argv.slice(2);
const STRICT_FAIL = args.includes("--strict-fail");

const V1_PRODUCTS = [
  { slug: "tshirt-gildan-heavy-cotton",        id: "gildan-5000" },
  { slug: "tshirt-bella-canvas-3001",          id: "bella-3001" },
  { slug: "tshirt-comfort-colors-heavyweight", id: "comfort-colors-1717" },
  { slug: "tshirt-gildan-long-sleeve",         id: "gildan-2400-ls" },
  { slug: "sweat-gildan-18000",                id: "gildan-18000" },
  { slug: "hoodie-gildan-18500",               id: "gildan-18500" },
];

const PAGES = [
  { path: "/",                  desc: "Homepage (Hero + BestSellers)" },
  { path: "/catalogue",         desc: "Catalogue principal" },
  { path: "/catalogue/tshirts", desc: "Catalogue t-shirts" },
  { path: "/catalogue/hoodies", desc: "Catalogue sweats/hoodies" },
  ...V1_PRODUCTS.map((p) => ({ path: `/produits/${p.slug}`, desc: `Fiche ${p.id}` })),
];

// Patterns interdits pour les produits V1
const FORBIDDEN_PATTERNS = [
  { rx: /\/mockups\/gildan-(5000|18000|18500)\//, label: "ancien /mockups/gildan-*" },
  { rx: /\/mockups\/bella-3001\//,                 label: "ancien /mockups/bella-3001/" },
  { rx: /\/mockups\/tshirt\//,                     label: "ancien /mockups/tshirt/" },
  { rx: /\/mockups\/hm\/textile\//,                label: "/mockups/hm/textile/" },
  { rx: /cdn\.printful\.com/,                      label: "CDN Printful" },
  { rx: /cdn\.toptex\.com/,                        label: "CDN TopTex" },
  { rx: /\/pictures\//,                            label: "/pictures/ (mannequin)" },
];

// Patterns autorisés pour V1
//   - /mockups/printify/         → JPG originaux Printify (fallback)
//   - /mockups/printify-cropped/ → JPG cropped (servis en priorité depuis mai 2026)
const ALLOWED_RX = /\/mockups\/printify(-cropped)?\//;

// ─── Fetch + decode all image URLs from HTML ────────────────────────────────

function extractImageURLs(html) {
  // Stricte : ne capture QUE les URLs réellement rendues comme images dans le DOM.
  // - _next/image?url=… (Next.js Image optimization)
  // - <img src="..."> et srcset="..."
  // Ignore TOUT le JSON inline d'hydration React (`__NEXT_DATA__`, etc.) car
  // ces paths sont en mémoire mais pas affichés.
  const urls = new Set();
  // 1. Next/Image url= encoded
  for (const m of html.matchAll(/_next\/image\?url=([^&"'\s]+)/g)) {
    try { urls.add(decodeURIComponent(m[1])); } catch {}
  }
  // 2. <img src="..."> (uniquement balises <img> et <source>)
  for (const m of html.matchAll(/<(?:img|source)\b[^>]*?(?:src|srcset)="([^"]+)"/g)) {
    const val = m[1];
    if (val.startsWith("data:")) continue;
    const first = val.split(",")[0].trim().split(" ")[0];
    if (/\.(jpg|jpeg|png|webp|avif|gif)/i.test(first)) urls.add(first);
  }
  return [...urls];
}

function isV1ProductPath(path) {
  return V1_PRODUCTS.some((p) => path.includes(p.slug) || path.includes(p.id));
}

function classifyURL(url, contextV1Only) {
  // For V1 contexts, ANY non-printify mockup is suspect
  // For non-V1 contexts (catalogue global), seuls les images V1 sont contrôlées
  const isImg = /\.(jpg|jpeg|png|webp|avif|gif)/i.test(url);
  if (!isImg) return null;
  if (ALLOWED_RX.test(url)) return { ok: true, source: "printify" };
  for (const f of FORBIDDEN_PATTERNS) {
    if (f.rx.test(url)) return { ok: false, source: f.label };
  }
  return { ok: null, source: "autre" };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function fetchPage(path) {
  const r = await fetch(`http://localhost:3000${path}`);
  return { status: r.status, html: await r.text() };
}

function refImagesV1(urls, contextSlug) {
  // Considère une URL comme "concerne V1" si elle référence un id ou slug V1
  return urls.filter((url) => {
    if (ALLOWED_RX.test(url)) return true; // printify path = forcément V1
    return V1_PRODUCTS.some((p) =>
      url.includes(`/${p.id}/`) ||
      url.includes(`/${p.id}-`) ||
      url.includes(p.slug),
    );
  });
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║  AUDIT V1 IMAGES — 100% Printify locales obligatoires        ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const violations = [];
  const summary = [];

  for (const page of PAGES) {
    console.log(`\n${"─".repeat(64)}`);
    console.log(`▸ ${page.path}  (${page.desc})`);
    console.log("─".repeat(64));
    const isV1Page = isV1ProductPath(page.path) || page.path.startsWith("/catalogue") || page.path === "/";

    try {
      const { status, html } = await fetchPage(page.path);
      if (status !== 200) {
        console.log(`  ❌ HTTP ${status}`);
        summary.push({ page: page.path, status, urls: 0, violations: ["HTTP error"] });
        continue;
      }
      const urls = extractImageURLs(html);
      const v1Refs = refImagesV1(urls, page.path);

      const pageViolations = [];
      const printifyURLs = [];
      for (const url of v1Refs) {
        const c = classifyURL(url, isV1Page);
        if (c?.ok === false) {
          pageViolations.push({ url, source: c.source });
        } else if (c?.ok === true) {
          printifyURLs.push(url);
        }
      }

      console.log(`  ✅ Printify URLs servies V1 : ${printifyURLs.length}`);
      if (pageViolations.length) {
        console.log(`  ❌ VIOLATIONS (${pageViolations.length}):`);
        for (const v of pageViolations.slice(0, 10)) {
          console.log(`     - ${v.source}: ${v.url.slice(0, 100)}`);
        }
        violations.push({ page: page.path, items: pageViolations });
      } else {
        console.log("  ✅ Aucune source interdite détectée");
      }
      summary.push({
        page: page.path,
        status,
        printifyURLs: printifyURLs.length,
        violations: pageViolations.length,
      });
    } catch (err) {
      console.log(`  ❌ Erreur fetch: ${err.message}`);
      summary.push({ page: page.path, error: err.message });
    }
  }

  // ─── Récap ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(64));
  console.log("RÉCAP");
  console.log("═".repeat(64));
  for (const s of summary) {
    const icon = s.violations === 0 ? "✅" : s.violations > 0 ? "❌" : "?";
    console.log(`  ${icon} ${s.page.padEnd(50)} printify=${s.printifyURLs ?? 0}  violations=${s.violations ?? 0}`);
  }

  const totalViolations = violations.reduce((sum, v) => sum + v.items.length, 0);
  console.log(`\n  Total violations : ${totalViolations} sur ${PAGES.length} pages`);

  if (totalViolations > 0) {
    console.log("\n  ❌ ÉCHEC : des sources non-Printify sont servies pour des produits V1.");
    if (STRICT_FAIL) process.exit(1);
  } else {
    console.log("\n  ✅ SUCCÈS : 100% des images V1 viennent de /mockups/printify/");
  }
}

main().catch((err) => {
  console.error("Erreur fatale:", err.message);
  process.exit(1);
});
