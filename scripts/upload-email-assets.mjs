import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENV_FILE = path.join(ROOT, ".env.local");
const BUCKET = "mockups";
const S = "/private/tmp/claude-501/-Users-kaankaplan-HM-GLOBAL-AGENCE-site-web/734f8b6d-b95a-42b9-98a7-bdcda83b7cbf/scratchpad";

const ASSETS = [
  [`${S}/card-tee-v6-up.png`, "email/card-tee-v6.png"],
  [`${S}/card-sweat-v6-up.png`, "email/card-sweat-v6.png"],
  [`${S}/card-polo-v6-up.png`, "email/card-polo-v6.png"],
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

  for (const [file, dest] of ASSETS) {
    const body = await fs.readFile(file);
    const { error } = await supabase.storage.from(BUCKET).upload(dest, body, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) throw new Error(`Upload ${dest}: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(dest);
    console.log(data.publicUrl);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
