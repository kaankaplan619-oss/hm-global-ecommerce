import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const mockupsRoot = path.join(cwd, "public", "mockups");
const onlyProductId = process.argv[2] ?? null;

const VIEW_ORDER = ["front", "back", "detail"];
const VIEW_SUFFIXES = new Set(VIEW_ORDER);

function sortEntries(entries) {
  return [...entries].sort(([a], [b]) => a.localeCompare(b, "fr"));
}

function formatRecord(name, entries) {
  if (entries.length === 0) return `${name}: {},`;

  const lines = entries.map(([key, value]) => `    "${key}": "${value}",`);
  return `${name}: {\n${lines.join("\n")}\n  },`;
}

function formatGallery(name, entries) {
  if (entries.length === 0) return `${name}: {},`;

  const lines = entries.map(([key, values]) => {
    const rendered = values.map((value) => `"${value}"`).join(", ");
    return `    "${key}": [${rendered}],`;
  });

  return `${name}: {\n${lines.join("\n")}\n  },`;
}

function parseMockupFilename(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return null;

  const baseName = path.basename(fileName, ext);
  const lastDash = baseName.lastIndexOf("-");
  if (lastDash === -1) return null;

  const colorId = baseName.slice(0, lastDash);
  const view = baseName.slice(lastDash + 1);
  if (!colorId || !VIEW_SUFFIXES.has(view)) return null;

  return { colorId, view };
}

async function readMockupDir(productId) {
  const productDir = path.join(mockupsRoot, productId);
  let fileNames;

  try {
    fileNames = await fs.readdir(productDir);
  } catch {
    return null;
  }

  const byColor = new Map();

  for (const fileName of fileNames) {
    const parsed = parseMockupFilename(fileName);
    if (!parsed) continue;

    const viewMap = byColor.get(parsed.colorId) ?? {};
    viewMap[parsed.view] = `/mockups/${productId}/${fileName}`;
    byColor.set(parsed.colorId, viewMap);
  }

  if (byColor.size === 0) return null;

  const frontEntries = [];
  const backEntries = [];
  const galleryEntries = [];

  for (const [colorId, views] of sortEntries([...byColor.entries()])) {
    if (views.front) frontEntries.push([colorId, views.front]);
    if (views.back) backEntries.push([colorId, views.back]);

    const gallery = VIEW_ORDER.map((view) => views[view]).filter(Boolean);
    if (gallery.length > 0) {
      galleryEntries.push([colorId, gallery]);
    }
  }

  return {
    productId,
    frontEntries,
    backEntries,
    galleryEntries,
  };
}

async function main() {
  const rootEntries = await fs.readdir(mockupsRoot, { withFileTypes: true });
  const productIds = rootEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => (onlyProductId ? name === onlyProductId : true))
    .sort((a, b) => a.localeCompare(b, "fr"));

  if (productIds.length === 0) {
    console.error(
      onlyProductId
        ? `Aucun dossier mockup trouvé pour "${onlyProductId}".`
        : "Aucun dossier mockup trouvé."
    );
    process.exitCode = 1;
    return;
  }

  const sections = [];

  for (const productId of productIds) {
    const result = await readMockupDir(productId);
    if (!result) continue;

    sections.push(
      `// ${productId}\n${formatRecord("hmMockupImages", result.frontEntries)}\n${formatRecord("hmMockupImagesBack", result.backEntries)}\n${formatGallery("hmMockupGallery", result.galleryEntries)}`
    );
  }

  if (sections.length === 0) {
    console.error("Aucun mockup exploitable trouvé.");
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`${sections.join("\n\n")}\n`);
}

await main();
