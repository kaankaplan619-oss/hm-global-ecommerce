import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");
const BUCKET = "email-assets";
const FILES = [
  ["/Users/kaankaplan/HM GLOBAL AGENCE site web/_email-relance.html", "relance.html"],
  ["/Users/kaankaplan/HM GLOBAL AGENCE site web/_email-offre.html", "offre.html"],
];

function parseEnv(content) {
  const env = {};
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[line.slice(0, i).trim()] = v;
  }
  return env;
}

async function main() {
  const env = parseEnv(await fs.readFile(ENV_FILE, "utf8"));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase URL/service role manquant");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) throw new Error(`listBuckets: ${listErr.message}`);
  if (!buckets.some((b) => b.name === BUCKET)) {
    const { error: cErr } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (cErr) throw new Error(`createBucket: ${cErr.message}`);
    console.error(`bucket "${BUCKET}" créé`);
  }

  for (const [file, dest] of FILES) {
    const body = await fs.readFile(file);
    const { error } = await supabase.storage.from(BUCKET).upload(dest, body, {
      contentType: "text/html; charset=utf-8",
      upsert: true,
    });
    if (error) throw new Error(`upload ${dest}: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(dest);
    console.log(data.publicUrl);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
