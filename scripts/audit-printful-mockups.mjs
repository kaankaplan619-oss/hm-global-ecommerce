import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const productsFile = path.join(cwd, "data", "products.ts");
const mockupsRoot = path.join(cwd, "public", "mockups");

const PRODUCTS = [
  { exportName: "PRODUCT_GILDAN_5000", dir: "gildan-5000" },
  { exportName: "PRODUCT_BELLA_3001", dir: "bella-3001" },
  { exportName: "PRODUCT_GILDAN_18000", dir: "gildan-18000" },
  { exportName: "PRODUCT_GILDAN_18500", dir: "gildan-18500" },
  { exportName: "PRODUCT_GILDAN_64800", dir: "gildan-64800" },
  { exportName: "PRODUCT_COTTON_HERITAGE_M2480", dir: "cotton-heritage-m2480" },
];

const COLOR_EQUIVALENTS = {
  "gris-sport": ["gris"],
  "cendré": ["blanc"],
  "heather-sport": ["marine"],
};

function normalizeMatches(colorId) {
  return [colorId, ...(COLOR_EQUIVALENTS[colorId] ?? [])];
}

function extractProductBlock(source, exportName) {
  const marker = `export const ${exportName}: Product = {`;
  const start = source.indexOf(marker);
  if (start === -1) return null;

  const afterStart = start + marker.length;
  const nextProductIndex = source.indexOf("\nexport const PRODUCT_", afterStart);
  const end = nextProductIndex === -1 ? source.length : nextProductIndex;
  return source.slice(afterStart, end);
}

function extractColors(block) {
  return [...block.matchAll(/\{ id: "([^"]+)",\s+label: "([^"]+)"/g)].map((match) => ({
    id: match[1],
    label: match[2],
  }));
}

async function getAvailableViews(dirName) {
  const dir = path.join(mockupsRoot, dirName);
  const names = await fs.readdir(dir);

  const fronts = new Set();
  const backs = new Set();
  const details = new Set();

  for (const name of names) {
    if (name.startsWith(".")) continue;
    if (name.includes("-front.")) fronts.add(name.split("-front.")[0]);
    if (name.includes("-back.")) backs.add(name.split("-back.")[0]);
    if (name.includes("-detail.")) details.add(name.split("-detail.")[0]);
  }

  return { fronts, backs, details };
}

function hasAny(set, colorId) {
  return normalizeMatches(colorId).some((candidate) => set.has(candidate));
}

const source = await fs.readFile(productsFile, "utf8");

for (const product of PRODUCTS) {
  const block = extractProductBlock(source, product.exportName);
  if (!block) continue;

  const colors = extractColors(block);
  const views = await getAvailableViews(product.dir);

  const missingFront = colors.filter((color) => !hasAny(views.fronts, color.id));
  const missingBack = colors.filter((color) => !hasAny(views.backs, color.id));
  const missingDetail = colors.filter((color) => !hasAny(views.details, color.id));

  console.log(`\n${product.dir}`);
  console.log(`  colors: ${colors.length}`);
  console.log(`  fronts: ${views.fronts.size} | missing: ${missingFront.length}`);
  if (missingFront.length) console.log(`    ${missingFront.map((c) => c.id).join(", ")}`);
  console.log(`  backs: ${views.backs.size} | missing: ${missingBack.length}`);
  if (missingBack.length) console.log(`    ${missingBack.map((c) => c.id).join(", ")}`);
  console.log(`  details: ${views.details.size} | missing: ${missingDetail.length}`);
  if (missingDetail.length) console.log(`    ${missingDetail.map((c) => c.id).join(", ")}`);
}
