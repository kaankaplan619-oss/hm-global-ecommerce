/**
 * app/api/cloudprinter/quote-audit/route.ts
 *
 * Audit /orders/quote Cloudprinter — coût total (impression + shipping)
 * pour 3 produits validés à plusieurs quantités, vers une adresse France.
 *
 * Étape 3 d'audit Cloudprinter — succède à /api/cloudprinter/price-audit
 * (qui ne testait que l'impression, sans shipping).
 *
 * ⚠️  SERVER ONLY — aucune création de commande, aucun upload fichier.
 *     /orders/quote est en lecture pure (aucune écriture côté Cloudprinter).
 *
 * Usage :
 *   curl http://localhost:3000/api/cloudprinter/quote-audit
 *   curl http://localhost:3000/api/cloudprinter/quote-audit | jq
 */

import { NextResponse } from "next/server";
import {
  isCloudprinterConfigured,
  quoteOrder,
} from "@/lib/suppliers/cloudprinter/adapter";
import { CloudprinterError } from "@/lib/suppliers/cloudprinter/client";
import type {
  CloudprinterQuoteAddress,
  CloudprinterQuoteItem,
  CloudprinterQuoteResponse,
} from "@/lib/suppliers/cloudprinter/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Adresse France test (Souffelweyersheim 67460) ──────────────────────────
// Adresse de QUARTIER fictive, code postal réel — utilisée uniquement pour
// que Cloudprinter calcule le shipping. Aucune commande n'est créée donc
// aucun colis ne sera envoyé à cette adresse.
const TEST_ADDRESS: CloudprinterQuoteAddress = {
  country: "FR",
  zip: "67460",
  city: "Souffelweyersheim",
  street1: "1 rue de la République",
};

// ─── Produits à tester (références validées par /price-audit) ───────────────
interface TestProduct {
  family: "businessCard" | "flyer" | "poster";
  label: string;
  productReference: string;
  quantities: number[];
}

const TEST_PRODUCTS: TestProduct[] = [
  {
    family: "businessCard",
    label: "Business card 85×55 mm",
    productReference: "businesscard_ss_int_bc_fc",
    quantities: [100, 250, 500],
  },
  {
    family: "flyer",
    label: "Flyer A5",
    productReference: "flyer_ss_a5_fc",
    quantities: [100, 250, 500],
  },
  {
    family: "poster",
    label: "Poster A3",
    productReference: "poster_a3_fc",
    quantities: [1, 10, 25],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Une option de livraison retournée par Cloudprinter (quote hash + service + prix) */
interface ShippingOption {
  quoteHash: string;
  service: string;
  priceHT: number | null;
  priceTTC: number | null;
  vat: number | null;
  totalWeight?: string;
}

interface QuoteAttempt {
  count: number;
  ok: boolean;
  productPriceHT?: number | null;
  vat?: number | null;
  vatRate?: number | null;
  /** Coût impression seul (sans shipping) */
  itemsHT?: number | null;
  /** Toutes les options de livraison retournées (Cloudprinter peut en proposer plusieurs) */
  shippingOptions?: ShippingOption[];
  /** Option de livraison la moins chère */
  cheapestShipping?: ShippingOption;
  /** Coût total HT (impression + shipping le moins cher) */
  totalHT?: number | null;
  /** Coût total TTC (impression + shipping le moins cher) */
  totalTTC?: number | null;
  /** Délai de production (production_sla_days) */
  productionSlaDays?: number | null;
  currency?: string;
  expireDate?: string;
  /** Brute response trimmée pour inspection */
  raw?: unknown;
  error?: string;
  errorStatus?: number;
}

interface FamilyResult {
  family: TestProduct["family"];
  label: string;
  productReference: string;
  attempts: QuoteAttempt[];
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function GET() {
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

  const results: FamilyResult[] = [];

  for (const product of TEST_PRODUCTS) {
    const family: FamilyResult = {
      family: product.family,
      label: product.label,
      productReference: product.productReference,
      attempts: [],
    };

    for (const count of product.quantities) {
      const item: CloudprinterQuoteItem = {
        reference: `audit-${product.family}-${count}`,
        productReference: product.productReference,
        count,
        options: [],
      };

      try {
        const quote: CloudprinterQuoteResponse = await quoteOrder({
          country: TEST_ADDRESS.country,
          currency: "EUR",
          items: [item],
          address: TEST_ADDRESS,
        });

        // ── Extraction tolérante ────────────────────────────────────────
        const raw = quote as Record<string, unknown>;
        const subtotals = raw.subtotals as Record<string, unknown> | undefined;

        const itemsHT = toNumber(subtotals?.items);
        const itemsPrice = toNumber(raw.price) ?? itemsHT; // prix items seul
        const vat = toNumber(raw.vat);
        const vatRate = toNumber(raw.vat_rate);
        const expireDate =
          (typeof raw.expire_date === "string" && raw.expire_date) || undefined;
        const currency =
          (typeof raw.currency === "string" && raw.currency) ||
          (typeof subtotals?.currency === "string" && (subtotals?.currency as string)) ||
          "EUR";
        const productionSlaDays = toNumber(raw.production_sla_days);

        // ── Shipments / quotes — structure live confirmée ──────────────
        //   shipments: [{ total_weight, items, quotes: [{quote, service, shipping_*}] }]
        const shippingOptions: ShippingOption[] = [];
        const shipments = Array.isArray(raw.shipments) ? raw.shipments : [];
        for (const shipment of shipments) {
          if (!shipment || typeof shipment !== "object") continue;
          const s = shipment as Record<string, unknown>;
          const totalWeight =
            typeof s.total_weight === "string" ? s.total_weight : undefined;
          const quotes = Array.isArray(s.quotes) ? s.quotes : [];
          for (const q of quotes) {
            if (!q || typeof q !== "object") continue;
            const qo = q as Record<string, unknown>;
            const hash = typeof qo.quote === "string" ? qo.quote : "";
            const service = typeof qo.service === "string" ? qo.service : "";
            // Cloudprinter peut nommer le prix shipping différemment selon version
            const sPriceHT =
              toNumber(qo.shipping_price) ??
              toNumber(qo.price) ??
              toNumber(qo.shipping_cost) ??
              toNumber(qo.cost) ??
              null;
            const sPriceTTC =
              toNumber(qo.shipping_price_ttc) ??
              toNumber(qo.price_ttc) ??
              (sPriceHT !== null && vatRate !== null
                ? sPriceHT * (1 + vatRate / 100)
                : null);
            const sVat =
              toNumber(qo.vat) ??
              (sPriceHT !== null && vatRate !== null
                ? sPriceHT * (vatRate / 100)
                : null);

            if (hash || service) {
              shippingOptions.push({
                quoteHash: hash,
                service,
                priceHT: sPriceHT,
                priceTTC: sPriceTTC,
                vat: sVat,
                totalWeight,
              });
            }
          }
        }

        // Option la moins chère (par priceHT, fallback sur l'ordre d'apparition)
        const cheapestShipping = shippingOptions
          .slice()
          .sort((a, b) => {
            const aP = a.priceHT ?? Number.POSITIVE_INFINITY;
            const bP = b.priceHT ?? Number.POSITIVE_INFINITY;
            return aP - bP;
          })[0];

        // Totaux globaux : items + cheapest shipping
        const cheapestShipHT = cheapestShipping?.priceHT ?? null;
        const totalHT =
          itemsPrice !== null && cheapestShipHT !== null
            ? itemsPrice + cheapestShipHT
            : itemsPrice;
        const totalTTC =
          totalHT !== null && vatRate !== null
            ? totalHT * (1 + vatRate / 100)
            : null;

        family.attempts.push({
          count,
          ok: true,
          productPriceHT: itemsPrice,
          vat,
          vatRate,
          itemsHT,
          shippingOptions,
          cheapestShipping,
          totalHT,
          totalTTC,
          productionSlaDays,
          currency,
          expireDate,
          raw: quote,
        });
      } catch (err) {
        if (err instanceof CloudprinterError) {
          family.attempts.push({
            count,
            ok: false,
            error: err.message,
            errorStatus: err.status,
            raw: err.body,
          });
        } else {
          family.attempts.push({
            count,
            ok: false,
            error: err instanceof Error ? err.message : "erreur inconnue",
          });
        }
      }
    }

    results.push(family);
  }

  // Synthèse
  const totalAttempts = results.reduce((acc, r) => acc + r.attempts.length, 0);
  const okAttempts = results.reduce(
    (acc, r) => acc + r.attempts.filter((a) => a.ok).length,
    0,
  );

  return NextResponse.json(
    {
      ok: true,
      tokenPresent: true,
      testAddress: TEST_ADDRESS,
      familiesTested: TEST_PRODUCTS.length,
      totalAttempts,
      okAttempts,
      results,
      methodology: {
        endpoint: "/orders/quote",
        currency: "EUR",
        country: "FR",
        optionStrategy: "défauts Cloudprinter (options: {})",
        note:
          "Aucune commande n'est créée. /orders/quote retourne un calcul de prix incluant shipping, mais l'ordre n'est pas persisté côté Cloudprinter tant que /orders/add n'est pas appelé.",
      },
    },
    { status: 200 },
  );
}
