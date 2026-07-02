#!/usr/bin/env node
/**
 * compose-logo-on-mockup.mjs — Pose un logo sur un mockup produit (sharp).
 *
 * Outil réutilisable pour la pub / les emails : prend un mockup propre +
 * un logo PNG transparent et compose le logo dans la zone du produit
 * (cœur ou dos), aux mêmes fractions que le Studio (lib/textile-zones.ts).
 * Les mockups sortent ainsi "habillés" sans repasser par le Studio.
 *
 * Usage :
 *   node scripts/compose-logo-on-mockup.mjs --mockup mockups/tshirt/blanc-front.webp --out /tmp/tee.png
 *   node scripts/compose-logo-on-mockup.mjs --mockup <path> --product polos --placement coeur --logo logo/hm-global-symbol.png --scale 1 --out out.png
 *   node scripts/compose-logo-on-mockup.mjs --mockup <path> --zone 0.55,0.27,0.13,0.13 --out out.png
 *
 * Options :
 *   --mockup   (requis) chemin du mockup. Résolu depuis ./, ./public, ./public/mockups
 *   --logo     logo PNG transparent (défaut: logo/hm-global-symbol.png)
 *   --product  tshirts | hoodies | softshells | polos | casquettes | sacs (défaut: tshirts)
 *   --placement coeur | dos (défaut: coeur)
 *   --zone     x,y,w,h en fractions (surcharge --product/--placement)
 *   --scale    facteur d'échelle du logo dans la zone (défaut: 1)
 *   --out      fichier de sortie PNG (défaut: ./compose-output.png)
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

// Zones de placement [x, y, w, h] en fractions — copiées de lib/textile-zones.ts
const ZONES = {
  tshirts: { coeur: [0.55, 0.27, 0.13, 0.13], dos: [0.33, 0.22, 0.34, 0.42] },
  hoodies: { coeur: [0.55, 0.29, 0.13, 0.13], dos: [0.34, 0.24, 0.33, 0.39] },
  softshells: { coeur: [0.53, 0.28, 0.13, 0.13], dos: [0.36, 0.25, 0.28, 0.32] },
  polos: { coeur: [0.54, 0.27, 0.11, 0.11], dos: [0.345, 0.305, 0.31, 0.19] },
  casquettes: { coeur: [0.42, 0.44, 0.16, 0.1] },
  sacs: { coeur: [0.4, 0.5, 0.2, 0.2] },
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function resolveInput(p, ...bases) {
  if (path.isAbsolute(p)) return fs.existsSync(p) ? p : null;
  for (const b of [ROOT, PUBLIC, ...bases]) {
    const c = path.resolve(b, p);
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.mockup || args.mockup === true) {
    console.log(fs.readFileSync(new URL(import.meta.url)).toString().split("\n").slice(1, 30).join("\n").replace(/^ \*/gm, ""));
    process.exit(args.mockup ? 0 : 1);
  }

  const mockupPath = resolveInput(args.mockup, path.join(PUBLIC, "mockups"));
  if (!mockupPath) fail(`Mockup introuvable : ${args.mockup}`);

  const logoArg = typeof args.logo === "string" ? args.logo : "logo/hm-global-symbol.png";
  const logoPath = resolveInput(logoArg, path.join(PUBLIC, "logo"));
  if (!logoPath) fail(`Logo introuvable : ${logoArg}`);

  // Zone : --zone prioritaire, sinon table produit/placement
  let zone;
  if (typeof args.zone === "string") {
    zone = args.zone.split(",").map(Number);
    if (zone.length !== 4 || zone.some((n) => Number.isNaN(n))) fail("--zone doit être x,y,w,h (fractions)");
  } else {
    const product = typeof args.product === "string" ? args.product : "tshirts";
    const placement = typeof args.placement === "string" ? args.placement : "coeur";
    const pz = ZONES[product];
    if (!pz) fail(`Produit inconnu: ${product}. Choix : ${Object.keys(ZONES).join(", ")}`);
    if (!pz[placement]) fail(`Placement "${placement}" indisponible pour ${product}`);
    zone = pz[placement];
  }

  const scale = args.scale ? Number(args.scale) : 1;
  const out = typeof args.out === "string" ? args.out : path.join(ROOT, "compose-output.png");

  const base = sharp(mockupPath);
  const meta = await base.metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  if (!W || !H) fail("Impossible de lire les dimensions du mockup.");

  // Boîte de la zone (en pixels) + cible du logo (zone × scale)
  const zx = Math.round(zone[0] * W);
  const zy = Math.round(zone[1] * H);
  const zw = Math.round(zone[2] * W);
  const zh = Math.round(zone[3] * H);
  const targetW = Math.max(1, Math.round(zw * scale));
  const targetH = Math.max(1, Math.round(zh * scale));

  const logo = await sharp(logoPath).resize(targetW, targetH, { fit: "inside" }).png().toBuffer();
  const lmeta = await sharp(logo).metadata();
  const lw = lmeta.width ?? targetW;
  const lh = lmeta.height ?? targetH;

  // Centre le logo dans la zone
  const left = Math.max(0, zx + Math.round((zw - lw) / 2));
  const top = Math.max(0, zy + Math.round((zh - lh) / 2));

  await base.composite([{ input: logo, left, top }]).png().toFile(out);

  console.log(`✅ ${out}`);
  console.log(`   mockup ${W}×${H} · zone [${zone.join(", ")}] · logo posé ${lw}×${lh} @ (${left}, ${top})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
