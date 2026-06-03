/**
 * app/api/cloudprinter/options-audit/route.ts
 *
 * Audit options produit Cloudprinter — Étape 5 de qualification.
 *
 * Objectif :
 *   1. Récupérer /products/info brut pour 3 produits validés
 *   2. Décoder la structure réelle des options (format / papier / finition...)
 *   3. Proposer une configuration "standard HM" par produit
 *   4. Tester /prices/lookup avec options explicites vs défaut
 *   5. Tester /orders/quote idem
 *   6. Comparer les prix
 *
 * ⚠️  SERVER ONLY — aucune création de commande, aucun upload fichier.
 *
 * Usage :
 *   curl http://localhost:3000/api/cloudprinter/options-audit | jq
 *   curl 'http://localhost:3000/api/cloudprinter/options-audit?dump=raw' | jq
 *     → mode dump : retourne aussi la réponse brute /products/info pour debug
 */

import { NextResponse } from "next/server";
import {
  getProductInfo,
  isCloudprinterConfigured,
  lookupPrice,
  quoteOrder,
} from "@/lib/suppliers/cloudprinter/adapter";
import { CloudprinterError, cpFetch } from "@/lib/suppliers/cloudprinter/client";
import type {
  CloudprinterOption,
  CloudprinterProductInfo,
  CloudprinterQuoteAddress,
} from "@/lib/suppliers/cloudprinter/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Produits à auditer ─────────────────────────────────────────────────────

interface ProductSpec {
  family: "businessCard" | "flyer" | "poster";
  label: string;
  reference: string;
  /** Quantité unique testée pour la comparaison défaut/explicit */
  testQuantity: number;
}

const PRODUCTS: ProductSpec[] = [
  {
    family: "businessCard",
    label: "Business card 85×55 mm",
    reference: "businesscard_ss_int_bc_fc",
    testQuantity: 250,
  },
  {
    family: "flyer",
    label: "Flyer A5",
    reference: "flyer_ss_a5_fc",
    testQuantity: 250,
  },
  {
    family: "poster",
    label: "Poster A3",
    reference: "poster_a3_fc",
    testQuantity: 10,
  },
];

const TEST_ADDRESS: CloudprinterQuoteAddress = {
  country: "FR",
  zip: "67460",
  city: "Souffelweyersheim",
  street1: "1 rue de la République",
};

// ─── Cibles "standard HM" par famille — patterns sur la note humaine ────────
//
// Cloudprinter renvoie chaque option avec `{type, reference, note, default}`.
// Plutôt que de hardcoder une référence (qui peut changer), on cherche par
// patterns (regex) dans `note` pour trouver la valeur qui correspond au
// standard HM recherché. Si rien ne matche, on tombera sur la valeur
// `default: 1` (= défaut Cloudprinter).
//
// Format payload `options` validé en live = tableau d'objets :
//   options: [{ type: "type_product_material", reference: "paper_300off" }, ...]

interface HmTarget {
  /** Famille de type Cloudprinter à matcher (substring du `type`) */
  typeContains: string;
  /** Pattern sur le `note` humain pour identifier la bonne valeur */
  notePattern: RegExp;
  /** Label HM affiché dans le rapport */
  hmLabel: string;
}

const HM_STANDARD_TARGETS: Record<ProductSpec["family"], HmTarget[]> = {
  businessCard: [
    {
      typeContains: "material",
      notePattern: /350\s*gsm.*(?:uncoated|offset|matt?)/i,
      hmLabel: "Papier 350gsm mat",
    },
    {
      typeContains: "finish",
      notePattern: /matt?\s*(?:lam|finish)?/i,
      hmLabel: "Finition mat",
    },
  ],
  flyer: [
    {
      typeContains: "material",
      notePattern: /170\s*gsm.*(?:coated|gloss|glossy)/i,
      hmLabel: "Papier 170gsm couché brillant",
    },
    {
      typeContains: "finish",
      notePattern: /gloss/i,
      hmLabel: "Finition brillante",
    },
  ],
  poster: [
    {
      typeContains: "paper",
      notePattern: /200\s*gsm.*(?:satin|silk|matt?)/i,
      hmLabel: "Papier 200gsm mat/satin",
    },
    {
      typeContains: "finish",
      notePattern: /matt?/i,
      hmLabel: "Finition mat",
    },
  ],
};

// ─── Décodage tolérant de la structure options ───────────────────────────────
//
// Cloudprinter retourne info.options[] comme un tableau plat où CHAQUE entrée
// est UNE valeur possible avec un `type` (famille) + `reference` (valeur) +
// `note` (description humaine) + `default: 1|0` + `availability`.
//
// Le décodeur :
//   1. Garde chaque entrée individuelle avec sa classification HM
//   2. Groupe les entrées par `type` pour reconstituer les FAMILLES d'options

interface OptionValue {
  type?: string;
  reference?: string;
  note?: string;
  typeName?: string;
  isDefault: boolean;
  availability?: string;
  hmCategory: string;
}

interface OptionFamily {
  type: string;
  typeName?: string;
  hmCategory: string;
  values: OptionValue[];
  defaultReference?: string;
}

function classifyType(rawType: string | undefined): string {
  if (!rawType) return "other";
  const t = rawType.toLowerCase();
  if (t.includes("paper") || t.includes("material")) return "paper";
  if (t.includes("finish") || t.includes("laminate")) return "finish";
  if (t.includes("side")) return "sides";
  if (t.includes("color") || t.includes("colour") || t.includes("ink")) return "color";
  if (t.includes("size") || t.includes("format")) return "size";
  if (t.includes("orient")) return "orientation";
  if (t.includes("page")) return "pages";
  if (t.includes("cover")) return "cover";
  if (t.includes("bind")) return "binding";
  if (t.includes("corner")) return "corners";
  if (t.includes("bleed") || t.includes("margin")) return "bleed_margin";
  return "other";
}

function decodeOptionValues(info: CloudprinterProductInfo): OptionValue[] {
  if (!Array.isArray(info.options)) return [];
  return info.options.map((opt) => {
    const obj = (opt ?? {}) as Record<string, unknown>;
    const rawType = typeof obj.type === "string" ? obj.type : undefined;
    const defaultRaw = obj.default;
    const isDefault =
      defaultRaw === 1 ||
      defaultRaw === "1" ||
      defaultRaw === true;
    return {
      type: rawType,
      reference: typeof obj.reference === "string" ? obj.reference : undefined,
      note: typeof obj.note === "string" ? obj.note : undefined,
      typeName: typeof obj.type_name === "string" ? obj.type_name : undefined,
      isDefault,
      availability: typeof obj.availability === "string" ? obj.availability : undefined,
      hmCategory: classifyType(rawType),
    };
  });
}

function groupByType(values: OptionValue[]): OptionFamily[] {
  const map = new Map<string, OptionFamily>();
  for (const v of values) {
    if (!v.type) continue;
    let family = map.get(v.type);
    if (!family) {
      family = {
        type: v.type,
        typeName: v.typeName,
        hmCategory: v.hmCategory,
        values: [],
      };
      map.set(v.type, family);
    }
    family.values.push(v);
    if (v.isDefault) family.defaultReference = v.reference;
  }
  return Array.from(map.values()).sort((a, b) => a.type.localeCompare(b.type));
}

// ─── Construction des options "standard HM" sur un produit ──────────────────

interface BuiltOption {
  type: string;
  reference: string;
  hmLabel: string;
  noteFromCloudprinter?: string;
  matchSource: "hm-pattern" | "fallback-default" | "skipped";
}

function buildHmOptions(
  families: OptionFamily[],
  targets: HmTarget[],
): BuiltOption[] {
  const built: BuiltOption[] = [];
  for (const target of targets) {
    // Trouver la famille qui matche le typeContains
    const family = families.find((f) =>
      f.type.toLowerCase().includes(target.typeContains.toLowerCase()),
    );
    if (!family) {
      // Pas de famille — on skip silencieusement
      continue;
    }

    // Chercher une valeur dont la note matche le pattern HM
    const match = family.values.find((v) => v.note && target.notePattern.test(v.note));
    if (match && match.reference) {
      built.push({
        type: family.type,
        reference: match.reference,
        hmLabel: target.hmLabel,
        noteFromCloudprinter: match.note,
        matchSource: "hm-pattern",
      });
      continue;
    }

    // Sinon, prendre la valeur default
    if (family.defaultReference) {
      const def = family.values.find((v) => v.reference === family.defaultReference);
      built.push({
        type: family.type,
        reference: family.defaultReference,
        hmLabel: `${target.hmLabel} (fallback défaut Cloudprinter)`,
        noteFromCloudprinter: def?.note,
        matchSource: "fallback-default",
      });
    }
  }
  return built;
}

// ─── Helpers pricing ─────────────────────────────────────────────────────────

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

interface PriceResult {
  ok: boolean;
  priceHT?: number | null;
  vat?: number | null;
  currency?: string;
  expireDate?: string;
  error?: string;
}

async function testPriceLookup(
  reference: string,
  count: number,
  options: CloudprinterOption[],
): Promise<PriceResult> {
  try {
    const priced = await lookupPrice({
      reference,
      country: "FR",
      currency: "EUR",
      count,
      options: options.length > 0 ? options : undefined,
    });
    return {
      ok: true,
      priceHT: toNumber(priced.price),
      vat: toNumber(priced.vat),
      currency: typeof priced.currency === "string" ? priced.currency : "EUR",
      expireDate:
        typeof (priced as Record<string, unknown>).expire_date === "string"
          ? ((priced as Record<string, unknown>).expire_date as string)
          : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof CloudprinterError ? err.message : (err as Error).message,
    };
  }
}

interface QuoteResultLite {
  ok: boolean;
  itemsHT?: number | null;
  shippingHT?: number | null;
  totalHT?: number | null;
  totalTTC?: number | null;
  productionSlaDays?: number | null;
  error?: string;
}

async function testQuote(
  reference: string,
  count: number,
  options: CloudprinterOption[],
): Promise<QuoteResultLite> {
  try {
    const quote = await quoteOrder({
      country: TEST_ADDRESS.country,
      currency: "EUR",
      address: TEST_ADDRESS,
      items: [
        {
          reference: "audit-options-item-1",
          productReference: reference,
          count,
          options: options.length > 0 ? options : undefined,
        },
      ],
    });
    const raw = quote as Record<string, unknown>;
    const subtotals = raw.subtotals as Record<string, unknown> | undefined;
    const itemsHT = toNumber(subtotals?.items) ?? toNumber(raw.price);
    const vatRate = toNumber(raw.vat_rate);

    // Chercher le cheapest shipping dans shipments[].quotes[]
    let shippingHT: number | null = null;
    const shipments = Array.isArray(raw.shipments) ? raw.shipments : [];
    for (const s of shipments) {
      if (!s || typeof s !== "object") continue;
      const quotes = Array.isArray((s as Record<string, unknown>).quotes)
        ? ((s as Record<string, unknown>).quotes as unknown[])
        : [];
      for (const q of quotes) {
        if (!q || typeof q !== "object") continue;
        const cand =
          toNumber((q as Record<string, unknown>).shipping_price) ??
          toNumber((q as Record<string, unknown>).price);
        if (cand !== null && (shippingHT === null || cand < shippingHT)) {
          shippingHT = cand;
        }
      }
    }

    const totalHT =
      itemsHT !== null && shippingHT !== null ? itemsHT + shippingHT : itemsHT;
    const totalTTC =
      totalHT !== null && vatRate !== null
        ? totalHT * (1 + vatRate / 100)
        : null;

    return {
      ok: true,
      itemsHT,
      shippingHT,
      totalHT,
      totalTTC,
      productionSlaDays: toNumber(raw.production_sla_days),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof CloudprinterError ? err.message : (err as Error).message,
    };
  }
}

// ─── Route ───────────────────────────────────────────────────────────────────

/**
 * Probe pour identifier la bonne structure de payload `options`.
 * Cloudprinter renvoie des erreurs précises selon le format envoyé ; on teste
 * plusieurs variantes et on note laquelle est acceptée.
 */
interface ProbeResult {
  shape: string;
  payloadSample: Record<string, unknown>;
  ok: boolean;
  priceHT?: number | null;
  error?: string;
}

interface ProductOptionAudit {
  family: ProductSpec["family"];
  label: string;
  reference: string;
  testQuantity: number;
  productName?: string;
  category?: string;
  rawInfoSafe?: unknown;
  optionsCount: number;
  /** Familles d'options groupées par type (ex: type_product_material) */
  optionFamilies: OptionFamily[];
  /** Stats globales par catégorie HM (paper/finish/sides/etc.) */
  hmCategoryStats: Record<string, number>;
  /** Options HM construites pour ce produit (à envoyer en payload) */
  hmBuiltOptions: BuiltOption[];
  /** Options par défaut Cloudprinter (extraites de info pour visu) */
  cloudprinterDefaults: Array<{ type: string; reference?: string; note?: string }>;
  /** Probes : test de plusieurs formats de payload options[] */
  optionFormatProbes?: ProbeResult[];
  priceWithDefaults?: PriceResult;
  priceWithExplicit?: PriceResult;
  quoteWithDefaults?: QuoteResultLite;
  quoteWithExplicit?: QuoteResultLite;
  comparison?: {
    priceDeltaHT: number | null;
    quoteDeltaTTC: number | null;
    sameShippingService: boolean;
    note: string;
  };
  fetchError?: string;
}

// ─── Probe direct vers Cloudprinter avec plusieurs shapes ───────────────────
//
// On bypass l'adapter pour tester des formats exacts. Toutes les requêtes
// passent par cpFetch (auth automatique, jamais de leak token).

async function probeOptionShapes(
  productReference: string,
  count: number,
  paperTypeFamily: string, // ex: "type_product_material"
  paperReference: string, // ex: "paper_300off"
): Promise<ProbeResult[]> {
  const shapes: Array<{ name: string; build: () => Record<string, unknown> }> = [
    {
      name: "{type, reference, count}",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-1",
            product_reference: productReference,
            count,
            options: [{ type: paperTypeFamily, reference: paperReference, count: 1 }],
          },
        ],
      }),
    },
    {
      name: "{option, option_value, count}",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-2",
            product_reference: productReference,
            count,
            options: [{ option: paperTypeFamily, option_value: paperReference, count: 1 }],
          },
        ],
      }),
    },
    {
      name: "{type, option, count}  (type=family, option=reference)",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-3",
            product_reference: productReference,
            count,
            options: [{ type: paperTypeFamily, option: paperReference, count: 1 }],
          },
        ],
      }),
    },
    {
      name: "{type_no_prefix, reference}",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-4",
            product_reference: productReference,
            count,
            options: [
              {
                type: paperTypeFamily.replace(/^type_/, ""),
                reference: paperReference,
                count: 1,
              },
            ],
          },
        ],
      }),
    },
    {
      name: "{option=family_no_prefix, value=reference}",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-5",
            product_reference: productReference,
            count,
            options: [
              {
                option: paperTypeFamily.replace(/^type_/, ""),
                value: paperReference,
                count: 1,
              },
            ],
          },
        ],
      }),
    },
    {
      // Indice : "option_reference is missing" suggère {option, option_reference}
      name: "{option=family_no_prefix, option_reference=ref}",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-6",
            product_reference: productReference,
            count,
            options: [
              {
                option: paperTypeFamily.replace(/^type_/, ""),
                option_reference: paperReference,
                count: 1,
              },
            ],
          },
        ],
      }),
    },
    {
      // Variante : option = juste "paper" (short label)
      name: "{option='paper', option_reference=ref}",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-7",
            product_reference: productReference,
            count,
            options: [
              { option: "paper", option_reference: paperReference, count: 1 },
            ],
          },
        ],
      }),
    },
    {
      // Variante : option_type au lieu de option
      name: "{option_type=family_no_prefix, option_reference=ref}",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-8",
            product_reference: productReference,
            count,
            options: [
              {
                option_type: paperTypeFamily.replace(/^type_/, ""),
                option_reference: paperReference,
                count: 1,
              },
            ],
          },
        ],
      }),
    },
    {
      // Variante : juste {type, option_reference} (mix)
      name: "{type=family, option_reference=ref}",
      build: () => ({
        country: "FR",
        currency: "EUR",
        items: [
          {
            reference: "probe-9",
            product_reference: productReference,
            count,
            options: [
              { type: paperTypeFamily, option_reference: paperReference, count: 1 },
            ],
          },
        ],
      }),
    },
  ];

  const out: ProbeResult[] = [];
  for (const shape of shapes) {
    const payload = shape.build();
    try {
      const res = await cpFetch<Record<string, unknown>>("/prices/lookup", payload);
      const price = res.price;
      out.push({
        shape: shape.name,
        payloadSample: (payload.items as unknown[])[0] as Record<string, unknown>,
        ok: true,
        priceHT: typeof price === "string" ? parseFloat(price) : (price as number | null),
      });
    } catch (err) {
      out.push({
        shape: shape.name,
        payloadSample: (payload.items as unknown[])[0] as Record<string, unknown>,
        ok: false,
        error:
          err instanceof CloudprinterError
            ? err.message.slice(0, 220)
            : err instanceof Error
              ? err.message.slice(0, 220)
              : "unknown",
      });
    }
  }
  return out;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dumpRaw = url.searchParams.get("dump") === "raw";

  if (!isCloudprinterConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        tokenPresent: false,
        reason: "CLOUDPRINTER_API_KEY absent du .env.local",
      },
      { status: 200 },
    );
  }

  const audits: ProductOptionAudit[] = [];

  for (const product of PRODUCTS) {
    const audit: ProductOptionAudit = {
      family: product.family,
      label: product.label,
      reference: product.reference,
      testQuantity: product.testQuantity,
      optionsCount: 0,
      optionFamilies: [],
      hmCategoryStats: {},
      hmBuiltOptions: [],
      cloudprinterDefaults: [],
    };

    // 1. /products/info
    let info: CloudprinterProductInfo;
    try {
      info = await getProductInfo(product.reference);
    } catch (err) {
      audit.fetchError = err instanceof Error ? err.message : "erreur inconnue";
      audits.push(audit);
      continue;
    }

    audit.productName = info.name;
    audit.category = info.category;

    // Décoder en valeurs puis grouper par type
    const values = decodeOptionValues(info);
    audit.optionsCount = values.length;
    const families = groupByType(values);
    audit.optionFamilies = families;

    // Stats par hmCategory (sur les valeurs, pas les familles)
    const stats: Record<string, number> = {};
    for (const v of values) {
      stats[v.hmCategory] = (stats[v.hmCategory] ?? 0) + 1;
    }
    audit.hmCategoryStats = stats;

    // Options par défaut Cloudprinter
    audit.cloudprinterDefaults = families
      .filter((f) => f.defaultReference)
      .map((f) => ({
        type: f.type,
        reference: f.defaultReference,
        note: f.values.find((v) => v.reference === f.defaultReference)?.note,
      }));

    // Construire les options HM via patterns
    const targets = HM_STANDARD_TARGETS[product.family] ?? [];
    const builtOptions = buildHmOptions(families, targets);
    audit.hmBuiltOptions = builtOptions;

    // ─── Probe formats options ─────────────────────────────────────────
    // On prend la première famille "paper" pour servir de cobaye
    const paperFamily = families.find((f) =>
      f.type.toLowerCase().includes("material") || f.type.toLowerCase().includes("paper"),
    );
    if (paperFamily && paperFamily.defaultReference) {
      audit.optionFormatProbes = await probeOptionShapes(
        product.reference,
        product.testQuantity,
        paperFamily.type,
        paperFamily.defaultReference,
      );
    }

    // Payload options[] — format validé live par probe :
    //   { option: <family sans prefix type_>, option_reference: <ref>, count: 1 }
    const hmOptionsPayload: CloudprinterOption[] = builtOptions.map((b) => ({
      option: b.type.replace(/^type_/, ""),
      option_reference: b.reference,
      count: 1,
    }));

    // Dump raw si demandé
    if (dumpRaw) {
      audit.rawInfoSafe = info;
    }

    // 2. Prix avec options par défaut
    audit.priceWithDefaults = await testPriceLookup(
      product.reference,
      product.testQuantity,
      [],
    );

    // 3. Prix avec options explicites HM
    audit.priceWithExplicit = await testPriceLookup(
      product.reference,
      product.testQuantity,
      hmOptionsPayload,
    );

    // 4. Quote avec défauts
    audit.quoteWithDefaults = await testQuote(
      product.reference,
      product.testQuantity,
      [],
    );

    // 5. Quote avec explicites
    audit.quoteWithExplicit = await testQuote(
      product.reference,
      product.testQuantity,
      hmOptionsPayload,
    );

    // 6. Comparaison
    const pd = audit.priceWithDefaults?.priceHT ?? null;
    const pe = audit.priceWithExplicit?.priceHT ?? null;
    const qd = audit.quoteWithDefaults?.totalTTC ?? null;
    const qe = audit.quoteWithExplicit?.totalTTC ?? null;

    const priceDeltaHT = pd !== null && pe !== null ? pe - pd : null;
    const quoteDeltaTTC = qd !== null && qe !== null ? qe - qd : null;

    let note = "Pas de comparaison possible (au moins un appel a échoué)";
    if (priceDeltaHT === null) {
      if (audit.priceWithExplicit && !audit.priceWithExplicit.ok) {
        note = `Options explicites refusées par Cloudprinter — clés non reconnues : ${(audit.priceWithExplicit.error ?? "").slice(0, 200)}`;
      }
    } else if (Math.abs(priceDeltaHT) < 0.001) {
      note = "Prix IDENTIQUE — Cloudprinter applique les mêmes défauts (les options HM n'ont rien changé)";
    } else if (priceDeltaHT > 0) {
      note = `Options HM plus CHÈRES de ${priceDeltaHT.toFixed(2)} € HT — papier/finition demandée plus haut de gamme que défaut`;
    } else {
      note = `Options HM moins chères de ${Math.abs(priceDeltaHT).toFixed(2)} € HT — défaut Cloudprinter probablement plus premium`;
    }

    audit.comparison = {
      priceDeltaHT,
      quoteDeltaTTC,
      sameShippingService: true, // On n'a qu'un service Ground - Tracked en sandbox
      note,
    };

    audits.push(audit);
  }

  // Synthèse globale
  const allHmCategories = new Set<string>();
  for (const a of audits) {
    for (const cat of Object.keys(a.hmCategoryStats)) allHmCategories.add(cat);
  }

  return NextResponse.json(
    {
      ok: true,
      tokenPresent: true,
      mode: dumpRaw ? "raw" : "decoded",
      productsAudited: audits.length,
      hmCategoriesFound: Array.from(allHmCategories).sort(),
      audits,
      methodology: {
        endpoint: "/products/info + /prices/lookup + /orders/quote",
        country: "FR",
        currency: "EUR",
        classificationRules:
          "rawType (case-insensitive) classifié dans : paper / finish / sides / color / size / orientation / pages / cover / binding / corners / bleed_margin / other",
        note:
          "Les configurations 'standard HM' sont des candidats — Cloudprinter peut les ignorer si les clés/valeurs ne correspondent pas à sa nomenclature interne.",
      },
    },
    { status: 200 },
  );
}
