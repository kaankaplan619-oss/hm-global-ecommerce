/**
 * Pennylane Integration — API v2
 *
 * Doc utilisée :
 * - Create company customer: https://pennylane.readme.io/reference/postcompanycustomer
 * - Create individual customer: https://pennylane.readme.io/reference/postindividualcustomer
 * - List customers: https://pennylane.readme.io/reference/getcustomers
 * - Create customer invoice: https://pennylane.readme.io/reference/postcustomerinvoices
 * - Mark invoice as paid: https://pennylane.readme.io/reference/markaspaidcustomerinvoice
 */

import type { Order } from "@/types";

// ─── Types Pennylane ──────────────────────────────────────────────────────────

interface PennylaneAddress {
  address: string;
  postal_code: string;
  city: string;
  country: string;
}

export interface PennylaneCustomer {
  id: string;
  name: string;
  emails: string[];
  phone?: string;
  external_reference?: string;
}

export interface PennylaneInvoiceLine {
  label: string;
  quantity: number;
  raw_currency_unit_price: string;
  vat_rate: string;
  unit: string;
  description?: string;
}

export interface PennylaneInvoice {
  id: string;
  invoice_number: string;
  status: "draft" | "unpaid" | "paid";
  url?: string;
  pdf_url?: string;
  public_url?: string;
  public_html_url?: string;
}

export interface PennylaneInvoiceSyncResult {
  customerId: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceStatus: string;
  invoiceUrl: string | null;
  invoiceGeneratedAt: string;
  invoiceSyncedAt: string;
}

type PennylaneApiCustomer = {
  id: number | string;
  name?: string;
  emails?: string[];
  phone?: string | null;
  external_reference?: string | null;
};

type PennylaneListResponse<T> = {
  items?: T[];
};

type PennylaneInvoicePayload = {
  customer_id: number;
  date: string;
  deadline: string;
  currency: "EUR";
  language: "fr_FR";
  external_reference: string;
  pdf_invoice_subject: string;
  pdf_description?: string;
  invoice_lines: PennylaneInvoiceLine[];
};

const PENNYLANE_BASE_URL = "https://app.pennylane.com/api/external/v2";
const PENNYLANE_DEFAULT_LANGUAGE = "fr_FR";
const PENNYLANE_DEFAULT_VAT_RATE = "FR_200";

function getPennylaneApiKey(): string {
  const apiKey = process.env.PENNYLANE_API_KEY;
  if (!apiKey) {
    throw new Error("PENNYLANE_API_KEY is not set");
  }

  return apiKey;
}

function getPennylaneHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getPennylaneApiKey()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function pennylaneFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(`${PENNYLANE_BASE_URL}${path}`);
  if (!url.searchParams.has("use_2026_api_changes")) {
    url.searchParams.set("use_2026_api_changes", "true");
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      ...getPennylaneHeaders(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[Pennylane] ${response.status} ${response.statusText}: ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function toPennylaneAddress(address: Order["billingAddress"] | Order["shippingAddress"]): PennylaneAddress {
  return {
    address: [address.street, address.complement].filter(Boolean).join(" "),
    postal_code: address.postalCode,
    city: address.city,
    country: address.country || "FR",
  };
}

function getCustomerExternalReference(order: Order): string {
  return `hm-global-user-${order.userId}`;
}

function getInvoiceExternalReference(order: Order): string {
  return `hm-global-order-${order.orderNumber}`;
}

function getInvoiceDate(order: Order): string {
  return (order.validatedAt ?? order.paidAt ?? new Date().toISOString()).slice(0, 10);
}

function getInvoiceDeadline(order: Order): string {
  return (order.paidAt ?? order.validatedAt ?? new Date().toISOString()).slice(0, 10);
}

function getInvoiceDescription(order: Order): string | undefined {
  if (!order.adminNote?.trim()) {
    return undefined;
  }

  return order.adminNote.trim();
}

function getRecipient(order: Order): string {
  return [order.user.firstName, order.user.lastName].filter(Boolean).join(" ").trim();
}

function getInvoiceUrl(invoice: PennylaneInvoice): string | null {
  return invoice.pdf_url ?? invoice.public_url ?? invoice.public_html_url ?? invoice.url ?? null;
}

function toPennylaneCustomer(customer: PennylaneApiCustomer): PennylaneCustomer {
  return {
    id: String(customer.id),
    name: customer.name ?? "",
    emails: customer.emails ?? [],
    phone: customer.phone ?? undefined,
    external_reference: customer.external_reference ?? undefined,
  };
}

function validateOrderForPennylane(order: Order) {
  if (!order.user.email) {
    throw new Error(`[Pennylane] Commande #${order.orderNumber}: email client manquant`);
  }

  if (!order.items.length) {
    throw new Error(`[Pennylane] Commande #${order.orderNumber}: aucun article à facturer`);
  }

  if (!order.billingAddress?.street || !order.billingAddress?.postalCode || !order.billingAddress?.city) {
    throw new Error(`[Pennylane] Commande #${order.orderNumber}: adresse de facturation incomplète`);
  }
}

// ─── Customer sync ────────────────────────────────────────────────────────────

export async function createOrGetPennylaneCustomer(
  order: Order
): Promise<PennylaneCustomer> {
  validateOrderForPennylane(order);

  const externalReference = getCustomerExternalReference(order);
  const filter = encodeURIComponent(JSON.stringify([
    { field: "external_reference", operator: "eq", value: externalReference },
  ]));

  const existing = await pennylaneFetch<PennylaneListResponse<PennylaneApiCustomer>>(
    `/customers?filter=${filter}&limit=1`
  );

  const existingCustomer = existing.items?.[0];
  if (existingCustomer) {
    return toPennylaneCustomer(existingCustomer);
  }

  const billingAddress = toPennylaneAddress(order.billingAddress);
  const deliveryAddress = toPennylaneAddress(order.shippingAddress);
  const commonPayload = {
    phone: order.user.phone || undefined,
    emails: [order.user.email],
    external_reference: externalReference,
    billing_language: PENNYLANE_DEFAULT_LANGUAGE,
    payment_conditions: "upon_receipt",
    recipient: getRecipient(order) || order.user.email,
    billing_address: billingAddress,
    delivery_address: deliveryAddress,
    reference: order.orderNumber,
  };

  if (order.user.type === "entreprise" && order.user.company) {
    const companyCustomer = await pennylaneFetch<PennylaneApiCustomer>("/company_customers", {
      method: "POST",
      body: JSON.stringify({
        ...commonPayload,
        name: order.user.company,
        vat_number: order.user.tvaIntracom || undefined,
        reg_no: order.user.siret || undefined,
      }),
    });

    return toPennylaneCustomer(companyCustomer);
  }

  const individualCustomer = await pennylaneFetch<PennylaneApiCustomer>("/individual_customers", {
    method: "POST",
    body: JSON.stringify({
      ...commonPayload,
      first_name: order.user.firstName || "Client",
      last_name: order.user.lastName || "HM Global",
    }),
  });

  return toPennylaneCustomer(individualCustomer);
}

/**
 * Génère une facture Pennylane pour la commande.
 * Appelé par l'admin APRÈS validation manuelle.
 */
export async function generateInvoice(
  order: Order,
  customerId?: string
): Promise<PennylaneInvoice> {
  validateOrderForPennylane(order);

  const payload: PennylaneInvoicePayload = {
    customer_id: Number(customerId ?? (await createOrGetPennylaneCustomer(order)).id),
    date: getInvoiceDate(order),
    deadline: getInvoiceDeadline(order),
    currency: "EUR",
    language: PENNYLANE_DEFAULT_LANGUAGE,
    external_reference: getInvoiceExternalReference(order),
    pdf_invoice_subject: `Commande ${order.orderNumber}`,
    pdf_description: getInvoiceDescription(order),
    invoice_lines: buildInvoiceLines(order),
  };

  const invoice = await pennylaneFetch<PennylaneInvoice>("/customer_invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (invoice.status === "draft") {
    throw new Error(
      `[Pennylane] Commande #${order.orderNumber}: la facture a été créée en brouillon alors qu'une facture finalisée était attendue`
    );
  }

  return invoice;
}

/**
 * Marque une facture comme payée dans Pennylane.
 */
export async function markInvoicePaid(invoiceId: string): Promise<PennylaneInvoice> {
  return pennylaneFetch<PennylaneInvoice>(`/customer_invoices/${invoiceId}/mark_as_paid`, {
    method: "PUT",
    body: JSON.stringify({}),
  });
}

/**
 * Construit les lignes de facture à partir d'une commande.
 */
export function buildInvoiceLines(order: Order): PennylaneInvoiceLine[] {
  const lines: PennylaneInvoiceLine[] = order.items.map((item) => ({
    label: `${item.product.shortName} — ${item.technique.toUpperCase()} ${item.placement} — Taille ${item.size} — ${item.color.label}`,
    quantity: item.quantity,
    raw_currency_unit_price: item.unitPriceHT.toFixed(2),
    vat_rate: PENNYLANE_DEFAULT_VAT_RATE,
    unit: "piece",
    description: item.logoFile?.name
      ? `Logo: ${item.logoFile.name}`
      : undefined,
  }));

  if (order.shipping > 0) {
    lines.push({
      label: "Frais de livraison",
      quantity: 1,
      raw_currency_unit_price: (Math.round((order.shipping / 1.2) * 100) / 100).toFixed(2),
      vat_rate: PENNYLANE_DEFAULT_VAT_RATE,
      unit: "forfait",
    });
  }

  return lines;
}

export async function syncPennylaneInvoice(order: Order): Promise<PennylaneInvoiceSyncResult> {
  const customer = await createOrGetPennylaneCustomer(order);
  let invoice = await generateInvoice(order, customer.id);

  if (order.stripePaymentStatus === "succeeded" && invoice.status !== "paid") {
    invoice = await markInvoicePaid(invoice.id);
  }

  const now = new Date().toISOString();

  return {
    customerId: customer.id,
    invoiceId: String(invoice.id),
    invoiceNumber: invoice.invoice_number,
    invoiceStatus: invoice.status,
    invoiceUrl: getInvoiceUrl(invoice),
    invoiceGeneratedAt: now,
    invoiceSyncedAt: now,
  };
}
