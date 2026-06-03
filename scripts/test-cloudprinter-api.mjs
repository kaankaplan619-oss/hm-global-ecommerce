#!/usr/bin/env node
/**
 * Cloudprinter API qualification script (READ-ONLY)
 *
 * Purpose: audit Cloudprinter as a candidate for HM Global EU paper print fulfilment.
 * - If CLOUDPRINTER_API_KEY is present in .env.local: performs live read-only calls
 *   (catalogue, product details, price quotes for FR 67460, shipping). Never creates orders.
 * - If absent: prints instructions to obtain a key and exits gracefully with code 0.
 *
 * Outputs:
 *   - tmp/cloudprinter-audit.json (raw responses, redacted of any API key)
 *
 * Constraints:
 *   - No order creation.
 *   - No mutating endpoint.
 *   - API key never logged or persisted.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.local');
const OUT_PATH = path.join(ROOT, 'tmp', 'cloudprinter-audit.json');

const BASE = 'https://api.cloudprinter.com/cloudcore/1.0';

/** ---------- env loading (no dependency) ---------- */
function loadEnvLocal() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const txt = fs.readFileSync(ENV_PATH, 'utf8');
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnvLocal();
const API_KEY = env.CLOUDPRINTER_API_KEY || process.env.CLOUDPRINTER_API_KEY || '';

const audit = {
  generatedAt: new Date().toISOString(),
  hasApiKey: Boolean(API_KEY),
  baseUrl: BASE,
  callsMade: 0,
  results: {},
  notes: [],
  imageFieldScan: { matches: [], scannedKeys: 0 },
};

function note(msg) {
  audit.notes.push(msg);
  console.log(`[note] ${msg}`);
}

async function call(endpoint, body, label) {
  audit.callsMade += 1;
  const url = `${BASE}${endpoint}`;
  const payload = { ...body };
  if (API_KEY) payload.apikey = API_KEY;
  const safePayload = { ...payload, apikey: payload.apikey ? '***REDACTED***' : undefined };
  const started = Date.now();
  let res, data, errorText;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    try { data = JSON.parse(text); }
    catch { data = { _raw: text.slice(0, 2000) }; }
  } catch (err) {
    errorText = String(err);
  }
  const entry = {
    label,
    endpoint,
    requestBody: safePayload,
    status: res?.status ?? null,
    ok: res?.ok ?? false,
    elapsedMs: Date.now() - started,
    error: errorText ?? null,
    response: data ?? null,
  };
  audit.results[label] = entry;
  const summary = errorText
    ? `ERR ${errorText.slice(0, 120)}`
    : `${res.status} ${res.ok ? 'OK' : 'FAIL'} (${entry.elapsedMs}ms)`;
  console.log(`[call] ${label.padEnd(28)} ${endpoint.padEnd(28)} -> ${summary}`);
  return entry;
}

/** Scan any JSON value recursively for keys that look like image/preview/mockup fields. */
const IMAGE_KEY_RE = /(image|imageurl|mockup|preview|previewurl|proof|thumbnail|thumb|render|cover|visual)/i;
function scanForImageFields(value, pathArr = []) {
  if (value == null) return;
  audit.imageFieldScan.scannedKeys += 1;
  if (Array.isArray(value)) {
    value.slice(0, 5).forEach((v, i) => scanForImageFields(v, pathArr.concat(`[${i}]`)));
    return;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (IMAGE_KEY_RE.test(k)) {
        audit.imageFieldScan.matches.push({
          path: pathArr.concat(k).join('.'),
          sampleType: typeof v,
          sampleValue:
            typeof v === 'string'
              ? v.length > 200
                ? `${v.slice(0, 200)}...[truncated]`
                : v
              : Array.isArray(v)
              ? `[Array len=${v.length}]`
              : typeof v === 'object'
              ? '[Object]'
              : String(v),
        });
      }
      scanForImageFields(v, pathArr.concat(k));
    }
  }
}

/** ---------- main ---------- */
async function main() {
  console.log('Cloudprinter API qualification audit');
  console.log('-----------------------------------');
  console.log(`Workdir: ${ROOT}`);
  console.log(`API key present: ${audit.hasApiKey ? 'YES' : 'NO'}`);
  console.log();

  if (!audit.hasApiKey) {
    note(
      'CLOUDPRINTER_API_KEY not found in .env.local. To obtain a key: ' +
        '1) create a free account at https://account.cloudprinter.com/register ' +
        '2) confirm email & complete profile ' +
        '3) in dashboard, go to "API Interfaces" and create a new interface (Sandbox mode for tests) ' +
        '4) copy the apikey value and add CLOUDPRINTER_API_KEY=... to .env.local'
    );
    note(
      'Doc-only audit performed. Confirmed via WebFetch on docs.cloudprinter.com: ' +
        'base URL https://api.cloudprinter.com/cloudcore/1.0/, auth via "apikey" field in JSON body, ' +
        'all endpoints POST, sandbox mode available with free test orders.'
    );
    note(
      'Endpoints discovered in docs: /products, /products/info, /orders, /orders/info, /orders/add, ' +
        '/orders/cancel, /orders/log, /orders/quote, /prices/lookup, /shipping/levels, ' +
        '/shipping/countries, /shipping/states. NO endpoints for /preview, /mockup, /proof, /thumbnail. ' +
        'NO file upload endpoint: PDFs are referenced by external URLs in order payloads.'
    );
  } else {
    note('API key detected. Running read-only live audit.');

    // 1) Catalogue produits
    await call('/products', {}, 'products_list');

    // 2) Shipping countries (small endpoint, sanity check)
    await call('/shipping/countries', {}, 'shipping_countries');

    // 3) Shipping levels for France
    await call('/shipping/levels', { country: 'FR' }, 'shipping_levels_FR');

    // 4) Try to find a business-card-like product reference in the catalogue
    const products = audit.results.products_list?.response;
    const productList = Array.isArray(products)
      ? products
      : Array.isArray(products?.products)
      ? products.products
      : [];

    const bcGuess = productList.find((p) => {
      const s = JSON.stringify(p).toLowerCase();
      return s.includes('business') && (s.includes('card') || s.includes('85x55') || s.includes('85_55'));
    });
    const flyerGuess = productList.find((p) => JSON.stringify(p).toLowerCase().includes('flyer'));
    const posterGuess = productList.find((p) => JSON.stringify(p).toLowerCase().includes('poster'));

    audit.detected = {
      productCount: productList.length,
      businessCardRef: bcGuess?.reference ?? bcGuess?.product ?? null,
      flyerRef: flyerGuess?.reference ?? flyerGuess?.product ?? null,
      posterRef: posterGuess?.reference ?? posterGuess?.product ?? null,
    };

    // 5) Product details for business card (if found)
    if (audit.detected.businessCardRef) {
      await call(
        '/products/info',
        { reference: audit.detected.businessCardRef },
        'product_info_business_card'
      );
    } else {
      note('No business card reference auto-detected in catalogue; trying conventional ref "businesscards_pp_85x55_4_4".');
      await call(
        '/products/info',
        { reference: 'businesscards_pp_85x55_4_4' },
        'product_info_business_card_guess'
      );
    }

    // 6) Price quote: 1 / 10 / 25 business cards shipped to FR 67460
    for (const qty of [1, 10, 25]) {
      const ref = audit.detected.businessCardRef || 'businesscards_pp_85x55_4_4';
      await call(
        '/prices/lookup',
        {
          country: 'FR',
          currency: 'EUR',
          items: [
            {
              reference: `qty_${qty}`,
              product: ref,
              count: String(qty),
              options: [],
            },
          ],
        },
        `price_lookup_business_card_x${qty}`
      );
    }
  }

  // 7) Scan all collected responses for image-like fields
  scanForImageFields(audit.results);

  // Write JSON output
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(audit, null, 2));
  console.log();
  console.log(`Wrote ${OUT_PATH}`);
  console.log(`Total API calls made: ${audit.callsMade}`);
  console.log(
    `Image-like field matches: ${audit.imageFieldScan.matches.length} (over ${audit.imageFieldScan.scannedKeys} keys scanned)`
  );
  if (audit.imageFieldScan.matches.length) {
    console.log('Sample matches:');
    audit.imageFieldScan.matches.slice(0, 10).forEach((m) => {
      console.log(`  - ${m.path}: ${m.sampleValue}`);
    });
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  // Still write whatever was collected
  try {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify({ ...audit, fatal: String(err) }, null, 2));
  } catch {}
  process.exit(0); // never panic — this is a qualification probe
});
