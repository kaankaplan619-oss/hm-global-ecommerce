/**
 * scripts/test-render-bat.ts
 *
 * Pipeline de test BAT — génère les 4 rendus standard pour un produit/coloris.
 * Lance avec : npm run test:bat
 *
 * Usage optionnel :
 *   npm run test:bat -- --product gildan-18000 --color noir --logo <url>
 *
 * Produit/coloris par défaut : gildan-18000 / noir
 * Logo par défaut : hm-global-logo.png dans customer-logos
 */

import { createClient } from "@supabase/supabase-js";
import { renderBat, validateGarmentPath } from "../lib/bat-renderer";

// ── Config ─────────────────────────────────────────────────────────────────────

const SUPABASE_URL          = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BAT_BUCKET            = "bat-renders";

const DEFAULT_PRODUCT  = "gildan-18000";
const DEFAULT_COLOR    = "noir";
const DEFAULT_LOGO_URL =
  "https://kbeeedbfkalovtusaden.supabase.co/storage/v1/object/public/customer-logos/cart/d0ccc279-88a3-4461-869b-df120ede6bf6/1777662120797-hm-global-logo.png";

// Zones hoodies (identiques à MockupViewer.tsx — ne jamais modifier ici)
// [left, top, width, height] en fractions du canvasSize
const ZONES_HOODIES = {
  coeur: [0.40, 0.32, 0.16, 0.16] as [number, number, number, number],
  dos:   [0.25, 0.22, 0.50, 0.42] as [number, number, number, number],
};

const CANVAS_SIZE = 544;

// Dimensions physiques de référence (cm) pour les zones hoodies
const CM_PER_PX_COEUR = 1 / 6.97;  // ~15cm de large pour la zone coeur
const CM_PER_PX_DOS   = 1 / 7.16;  // ~38cm de large pour la zone dos

// ── CLI args ───────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const getArg  = (flag: string, fallback: string) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};

const product  = getArg("--product", DEFAULT_PRODUCT);
const color    = getArg("--color",   DEFAULT_COLOR);
const logoUrl  = getArg("--logo",    DEFAULT_LOGO_URL);
const output   = parseInt(getArg("--output", "2000"), 10);

// ── Calcul des transforms ─────────────────────────────────────────────────────

interface RenderCase {
  label:     string;
  placement: "coeur" | "dos";
  face:      "front" | "back";
  logoSizeCm: number;
  garmentFace: "front" | "back";
  transform: {
    left: number; top: number;
    scaleX: number; scaleY: number;
    width: number; height: number;
    angle: number; canvasSize: number;
  };
}

async function buildCases(logoW: number, logoH: number): Promise<RenderCase[]> {
  function transform(
    zone:      [number, number, number, number],
    sizeCm:    number,
    pxPerCm:   number,
  ) {
    const [lf, tf, wf, hf] = zone;
    const cx = (lf + wf / 2) * CANVAS_SIZE;
    const cy = (tf + hf / 2) * CANVAS_SIZE;

    const logoWfab = sizeCm * pxPerCm;
    const scaleX   = logoWfab / logoW;
    const logoHfab = logoH * scaleX;

    return {
      left:   Math.round(cx - logoWfab / 2),
      top:    Math.round(cy - logoHfab / 2),
      scaleX: +scaleX.toFixed(4),
      scaleY: +scaleX.toFixed(4),
      width:  logoW,
      height: logoH,
      angle:  0,
      canvasSize: CANVAS_SIZE,
    };
  }

  return [
    {
      label: "coeur-8cm",  placement: "coeur", face: "front", garmentFace: "front", logoSizeCm: 8,
      transform: transform(ZONES_HOODIES.coeur, 8,  1 / CM_PER_PX_COEUR),
    },
    {
      label: "coeur-11cm", placement: "coeur", face: "front", garmentFace: "front", logoSizeCm: 11,
      transform: transform(ZONES_HOODIES.coeur, 11, 1 / CM_PER_PX_COEUR),
    },
    {
      label: "dos-21cm",   placement: "dos",   face: "back",  garmentFace: "back",  logoSizeCm: 21,
      transform: transform(ZONES_HOODIES.dos,   21, 1 / CM_PER_PX_DOS),
    },
    {
      label: "dos-28cm",   placement: "dos",   face: "back",  garmentFace: "back",  logoSizeCm: 28,
      transform: transform(ZONES_HOODIES.dos,   28, 1 / CM_PER_PX_DOS),
    },
  ];
}

// ── Logo metadata ──────────────────────────────────────────────────────────────

async function getLogoDimensions(url: string): Promise<{ w: number; h: number }> {
  const sharp = (await import("sharp")).default;
  const res   = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Logo fetch failed: ${res.status}`);
  const buf  = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  return { w: meta.width!, h: meta.height! };
}

// ── Upload Supabase ────────────────────────────────────────────────────────────

async function uploadBat(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: ReturnType<typeof createClient<any>>,
  buffer:   Buffer,
  productId: string,
  colorId:   string,
  label:     string,
): Promise<string> {
  const ts   = Date.now();
  const path = `textile/${productId}/${colorId}/${ts}-${label}.png`;

  const { error } = await supabase.storage
    .from(BAT_BUCKET)
    .upload(path, buffer, { contentType: "image/png", upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BAT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌  NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquants dans .env.local");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  console.log("\n🎽  HM Global — Test rendu BAT Sharp");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Produit  : ${product} / ${color}`);
  console.log(`Logo     : ${logoUrl.split("/").pop()}`);
  console.log(`Output   : ${output}×${output} px`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Dimensions réelles du logo
  process.stdout.write("Chargement logo… ");
  const { w: logoW, h: logoH } = await getLogoDimensions(logoUrl);
  console.log(`${logoW}×${logoH} px ✓`);

  const cases = await buildCases(logoW, logoH);

  const results: Array<{
    label: string; url: string; w: number; h: number; kb: number;
  }> = [];

  for (const c of cases) {
    const garmentRelPath = `hm/textile/${product}/${color}/${c.garmentFace}.webp`;

    // Validate path (same guard as the API route)
    try { validateGarmentPath(garmentRelPath); } catch (e) {
      console.error(`❌  ${c.label}: chemin invalide — ${(e as Error).message}`);
      continue;
    }

    process.stdout.write(`Rendu ${c.label.padEnd(12)}… `);
    const t0 = Date.now();

    let result: Awaited<ReturnType<typeof renderBat>>;
    try {
      result = await renderBat({
        garmentRelativePath: garmentRelPath,
        logoUrl,
        placement:       c.placement,
        face:            c.face,
        productCategory: "hoodies",
        transform:       c.transform,
        outputSize:      output,
      });
    } catch (e) {
      console.error(`\n❌  ${c.label}: ${(e as Error).message}`);
      continue;
    }

    const url = await uploadBat(supabase, result.buffer, product, color, c.label);
    const kb  = Math.round(result.sizeBytes / 1024);
    const ms  = Date.now() - t0;
    console.log(`${result.width}×${result.height}  ${kb} Ko  (${ms} ms)`);
    console.log(`   → ${url}`);

    results.push({ label: c.label, url, w: result.width, h: result.height, kb });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅  ${results.length}/4 rendus générés\n`);

  // Sauvegarder les URLs dans /tmp pour la page de review
  const reviewData = {
    generatedAt: new Date().toISOString(),
    product,
    color,
    outputSize: output,
    renders: results,
  };
  const { writeFileSync } = await import("fs");
  writeFileSync("/tmp/bat-review-latest.json", JSON.stringify(reviewData, null, 2));
  console.log("Preview JSON → /tmp/bat-review-latest.json");
  console.log("Review page  → http://localhost:3000/dev/mockup-review\n");
}

main().catch(err => {
  console.error("❌  Erreur fatale:", err.message);
  process.exit(1);
});
