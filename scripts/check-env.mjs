#!/usr/bin/env node
/**
 * check-env.mjs — Compare `.env.local` à la liste de référence `.env.local.example`.
 *
 * Signale les variables MANQUANTES (présentes dans l'exemple, absentes en local)
 * et VIDES (présentes mais sans valeur). Purement informatif (n'échoue pas par défaut).
 *
 * Usage :
 *   node scripts/check-env.mjs            # rapport
 *   node scripts/check-env.mjs --strict   # code de sortie 1 s'il manque des variables
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EXAMPLE = path.join(ROOT, ".env.local.example");
const LOCAL = path.join(ROOT, ".env.local");
const strict = process.argv.includes("--strict");

/** Parse un fichier dotenv → Map<clé, valeur (string, éventuellement vide)>. */
function parseEnv(file) {
  const map = new Map();
  if (!fs.existsSync(file)) return null;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2];
    // retire un commentaire de fin de ligne et les guillemets
    val = val.replace(/\s+#.*$/, "").trim().replace(/^["']|["']$/g, "");
    map.set(m[1], val);
  }
  return map;
}

const ref = parseEnv(EXAMPLE);
if (!ref) {
  console.error("✗ .env.local.example introuvable — impossible de comparer.");
  process.exit(1);
}
const local = parseEnv(LOCAL);
if (!local) {
  console.error("✗ .env.local introuvable. Copie .env.local.example → .env.local puis remplis-le.");
  process.exit(strict ? 1 : 0);
}

const missing = []; // dans l'exemple, absent en local
const empty = []; // en local mais vide
for (const key of ref.keys()) {
  if (!local.has(key)) missing.push(key);
  else if (!local.get(key)) empty.push(key);
}
const extra = [...local.keys()].filter((k) => !ref.has(k)); // en local, pas documenté

console.log(`\n🔎 check-env — référence : ${ref.size} variables\n`);
if (missing.length) {
  console.log(`❌ MANQUANTES (${missing.length}) — à ajouter dans .env.local :`);
  for (const k of missing) console.log(`   - ${k}`);
  console.log("");
}
if (empty.length) {
  console.log(`⚠️  VIDES (${empty.length}) — présentes mais sans valeur :`);
  for (const k of empty) console.log(`   - ${k}`);
  console.log("");
}
if (extra.length) {
  console.log(`ℹ️  NON DOCUMENTÉES (${extra.length}) — dans .env.local mais pas dans l'exemple :`);
  for (const k of extra) console.log(`   - ${k}`);
  console.log("");
}
if (!missing.length && !empty.length) {
  console.log("✅ Toutes les variables de référence sont présentes et remplies.\n");
}

process.exit(strict && missing.length ? 1 : 0);
