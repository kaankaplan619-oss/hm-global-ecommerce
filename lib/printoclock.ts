/**
 * lib/printoclock.ts
 *
 * Client API PrintoClock Business — SERVER SIDE ONLY.
 * Ne jamais importer depuis des composants client.
 *
 * Variables d'environnement requises (Vercel / .env.local) :
 *   PRINTOCLOCK_USERNAME   — Identifiant compte PrintoClock (communiqué par le chargé de compte)
 *   PRINTOCLOCK_PASSWORD   — Mot de passe compte PrintoClock
 *   PRINTOCLOCK_API_BASE   — (optionnel) défaut : https://api.printoclock.com
 *   PRINTOCLOCK_API_VERSION — (optionnel) défaut : 1
 *
 * Documentation : https://api.printoclock.com (Swagger UI)
 * Contact PrintoClock : 01 83 35 30 45
 */

const BASE    = process.env.PRINTOCLOCK_API_BASE    ?? "https://api.printoclock.com";
const VERSION = process.env.PRINTOCLOCK_API_VERSION ?? "1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface POCTokenResponse {
  token:         string;
  refresh_token: string;
  expires:       string; // ISO date
}

export interface POCAddress {
  hash?:         string;
  email?:        string;
  vatNumber?:    string;
  firstName:     string;
  lastName:      string;
  phoneNumber?:  string;
  company?:      string;
  countryCode:   string;   // "FR"
  provinceCode?: string;
  provinceName?: string;
  street:        string;
  city:          string;
  postcode:      string;
}

export interface POCDocument {
  id:          number;
  hash:        string;
  type:        string;
  path:        string;
  mimeType:    string;
  name:        string;
  uploadState: string;
  paoAllowed:  boolean;
  archived:    boolean;
}

export interface POCProductOptionValue {
  code:   string;
  option: { code: string; name: string };
  value:  string;
}

export interface POCProductVariant {
  code:                     string;
  name:                     string;
  finalPrice:               number;
  professionalShippingPrice?: number;
  extraShippingPrice?:      number;
  estimatedDeliveryDate?:   string;
  optionValues:             POCProductOptionValue[];
}

export interface POCProductStepOption {
  option:      { code: string; name: string };
  hide?:       boolean;
  userInput?:  string;
  name?:       string;
  title?:      string;
  description?: string;
  validations?: { value: string; type: string }[];
}

export interface POCProduct {
  id:          number;
  code:        string;
  name:        string;
  slug:        string;
  apiDescription?: string;
  images:      { path: string }[];
  attributes:  { attribute: unknown; localeCode: string; value: string }[];
  stepsOptions: POCProductStepOption[];
  delays:      POCProductOptionValue[];
  supplier?:   {
    name: string;
    code: string;
    autoAccept: boolean;
    id: number;
  };
}

export interface POCOrderItem {
  id:                  number;
  number:              string;
  productCode:         string;
  variantCode:         string;
  productName:         string;
  variantName:         string;
  quantity:            number;
  totalQuantity:       number;
  itemQuantity:        number;
  documentState:       string;
  manufacturingState:  string;
  externalReference?:  string;
  estimatedDeliveryDate?: string;
  estimatedShippedDate?:  string;
  carrier?:            { name: string; code: string; id: number };
  delay?:              number;
  options:             POCProductOptionValue[];
  userInputs:          unknown[];
}

export interface POCOrder {
  id:                 number;
  number:             string;
  state:              string;
  paymentState:       string;
  shippingState:      string;
  currencyCode:       string;
  total:              number;   // centimes
  subtotal:           number;   // centimes
  externalReference?: string;
  checkoutCompletedAt?: string;
  estimatedDeliveryDate?: string;
  customer?:          { id: number; email: string; externalCustomerId?: string };
  billingAddress?:    POCAddress & { id?: number };
  shipments:          {
    id:          number;
    state:       string;
    tracking:    string;
    estimatedDeliveryDate?: string;
    packages:    { id: number; tracking: string; trackingUrl: string; weight: number }[];
    carrier:     string;
    orderItems:  POCOrderItem[];
  }[];
  items: POCOrderItem[];
}

export interface POCCreateOrderPayload {
  /** SKU format : PRODUCTCODE_OPTIONCODE1_OPTIONCODE2_... ex: "TSHIRT-GD5000_BLANC_L_DTF" */
  productVariantCode:   string;
  /** Hash(es) du ou des fichiers uploadés via uploadDocument() */
  documents:            string[];
  shippingAddress:      POCAddress;
  billingAddress?:      Omit<POCAddress, "email">;
  /** Référence commande HM Global (pour retrouver la commande) */
  externalReference?:   string;
  /** ID client HM Global (Supabase user id) */
  externalCustomerId?:  string;
  customerEmail?:       string;
  /** Code méthode de paiement — obtenu via listPaymentMethods() */
  paymentMethod?:       string;
  /** Inputs utilisateur libres (ex: texte à imprimer) */
  userInputs?:          string[];
  professionalShipping?: boolean;
}

export interface POCPaymentMethod {
  code:         string;
  name:         string;
  description?: string;
}

// ─── Token cache (in-memory, process-level) ───────────────────────────────────

let _token: string | null = null;
let _refreshToken: string | null = null;
let _expiresAt: number = 0; // timestamp ms

function isTokenValid(): boolean {
  return !!_token && Date.now() < _expiresAt - 60_000; // 1 min marge
}

/** Authentifie via username/password et met en cache le JWT. */
async function authenticate(): Promise<string> {
  const username = process.env.PRINTOCLOCK_USERNAME;
  const password = process.env.PRINTOCLOCK_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "[PrintoClock] Variables d'environnement manquantes : PRINTOCLOCK_USERNAME et/ou PRINTOCLOCK_PASSWORD.\n" +
      "Appelez PrintoClock au 01 83 35 30 45 pour obtenir vos credentials."
    );
  }

  const res = await fetch(`${BASE}/login_check`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`[PrintoClock] Login échoué (${res.status}): ${text}`);
  }

  const data: POCTokenResponse = await res.json();
  _token        = data.token;
  _refreshToken = data.refresh_token;
  _expiresAt    = data.expires ? new Date(data.expires).getTime() : Date.now() + 3600_000;

  return _token;
}

/** Rafraîchit le JWT via le refresh_token. */
async function refreshJwt(): Promise<string> {
  if (!_refreshToken) return authenticate();

  const res = await fetch(`${BASE}/token/refresh`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ refresh_token: _refreshToken }),
  });

  if (!res.ok) {
    // Si le refresh échoue, on ré-authentifie complètement
    return authenticate();
  }

  const data: POCTokenResponse = await res.json();
  _token        = data.token;
  _refreshToken = data.refresh_token;
  _expiresAt    = data.expires ? new Date(data.expires).getTime() : Date.now() + 3600_000;

  return _token;
}

/** Retourne un JWT valide (authentifie ou rafraîchit si nécessaire). */
async function getToken(): Promise<string> {
  if (isTokenValid()) return _token!;
  if (_refreshToken)  return refreshJwt();
  return authenticate();
}

// ─── Requête HTTP générique ───────────────────────────────────────────────────

async function pocFetch<T>(
  path:    string,
  options: RequestInit & { formData?: Record<string, string | string[]> } = {}
): Promise<T> {
  const token = await getToken();

  const url = `${BASE}/v${VERSION}${path}`;

  // Gestion form-data (application/x-www-form-urlencoded) pour POST /orders
  let body: BodyInit | undefined = options.body ?? undefined;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (options.formData) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(options.formData)) {
      if (Array.isArray(val)) {
        val.forEach((v) => params.append(key, v));
      } else {
        params.append(key, val);
      }
    }
    body = params.toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else if (!options.formData && options.method === "POST" && !body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    body,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`[PrintoClock] ${options.method ?? "GET"} ${path} → ${res.status}: ${text}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Upload de fichier (multipart/form-data) ─────────────────────────────────

/**
 * Upload un fichier de conception (PNG / PDF) vers PrintoClock.
 * Retourne le hash du document à utiliser lors de la création de commande.
 *
 * @param fileBuffer  Buffer du fichier
 * @param fileName    Nom du fichier (ex: "logo-client.png")
 * @param mimeType    MIME type (ex: "image/png")
 */
export async function uploadDocument(
  fileBuffer: Buffer,
  fileName:   string,
  mimeType:   string = "image/png"
): Promise<POCDocument> {
  const token = await getToken();

  const formData = new FormData();
  const uint8 = new Uint8Array(fileBuffer);
  const blob = new Blob([uint8], { type: mimeType });
  formData.append("file", blob, fileName);

  const res = await fetch(`${BASE}/v${VERSION}/documents`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}` },
    body:    formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`[PrintoClock] Upload document échoué (${res.status}): ${text}`);
  }

  return res.json() as Promise<POCDocument>;
}

/**
 * Upload un fichier de conception depuis une URL publique.
 * Télécharge d'abord le fichier, puis l'envoie à PrintoClock.
 */
export async function uploadDocumentFromUrl(
  url:      string,
  fileName?: string
): Promise<POCDocument> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`[PrintoClock] Téléchargement du fichier source échoué : ${url}`);
  }

  const mimeType  = res.headers.get("content-type") ?? "image/png";
  const buffer    = Buffer.from(await res.arrayBuffer());
  const name      = fileName ?? url.split("/").pop() ?? "design.png";

  return uploadDocument(buffer, name, mimeType);
}

// ─── Produits ─────────────────────────────────────────────────────────────────

/** Liste tous les produits du catalogue PrintoClock. */
export async function listProducts(filters?: {
  code?:           string;
  name?:           string;
  apiDescription?: string;
}): Promise<POCProduct[]> {
  const params = new URLSearchParams();
  if (filters?.code)           params.set("filter[code]", filters.code);
  if (filters?.name)           params.set("filter[name]", filters.name);
  if (filters?.apiDescription) params.set("filter[apiDescription]", filters.apiDescription);

  const qs = params.toString() ? `?${params.toString()}` : "";
  return pocFetch<POCProduct[]>(`/products${qs}`);
}

/** Récupère un produit PrintoClock par son code. */
export async function getProduct(code: string): Promise<POCProduct> {
  return pocFetch<POCProduct>(`/products/${code}`);
}

/**
 * Liste les variantes d'un produit (couleurs × tailles × options).
 * Chaque variante a un `finalPrice` (TTC) et un `code` (SKU).
 */
export async function getProductVariants(productCode: string): Promise<POCProductVariant[]> {
  return pocFetch<POCProductVariant[]>(`/products/${productCode}/variants`);
}

/** Récupère une variante par son code SKU complet. */
export async function getVariantByCode(variantCode: string): Promise<POCProductVariant> {
  return pocFetch<POCProductVariant>(`/variants/${variantCode}`);
}

/** Liste les catégories (taxons) disponibles. */
export async function listTaxons(): Promise<unknown[]> {
  return pocFetch<unknown[]>(`/taxa`);
}

// ─── Commandes ────────────────────────────────────────────────────────────────

/**
 * Crée une commande PrintoClock.
 *
 * Workflow recommandé HM Global :
 * 1. uploadDocumentFromUrl(logoUrl) → récupère le hash
 * 2. createOrder({ productVariantCode, documents: [hash], shippingAddress, externalReference: orderId })
 * 3. Sauvegarder poc_order_id dans Supabase orders
 *
 * ⚠️  La commande est directement envoyée en production si le compte a autoAccept=true.
 *     Vérifier la configuration avec le chargé de compte PrintoClock.
 */
export async function createOrder(payload: POCCreateOrderPayload): Promise<POCOrder> {
  const formData: Record<string, string | string[]> = {
    productVariantCode: payload.productVariantCode,
    "documents[]":      payload.documents,
  };

  if (payload.externalReference)  formData.externalReference  = payload.externalReference;
  if (payload.externalCustomerId) formData.externalCustomerId  = payload.externalCustomerId;
  if (payload.customerEmail)       formData.customerEmail       = payload.customerEmail;
  if (payload.paymentMethod)       formData.paymentMethod       = payload.paymentMethod;
  if (payload.professionalShipping !== undefined) {
    formData.professionalShipping = String(payload.professionalShipping);
  }
  if (payload.userInputs?.length) formData["userInputs[]"] = payload.userInputs;

  // shippingAddress et billingAddress sont passés dans le body JSON en parallèle
  // L'API accepte un mix form-data + JSON body — on passe les adresses en JSON body séparé
  const token = await getToken();
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(formData)) {
    if (Array.isArray(val)) {
      val.forEach((v) => params.append(key, v));
    } else {
      params.append(key, val);
    }
  }

  // Combine form fields + JSON addresses via multipart approch :
  // L'API PrintoClock attend un POST application/x-www-form-urlencoded
  // avec shippingAddress comme JSON encodé en body — on suit la spec Swagger
  const res = await fetch(`${BASE}/v${VERSION}/orders`, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString() +
      `&shippingAddress=${encodeURIComponent(JSON.stringify(payload.shippingAddress))}` +
      (payload.billingAddress
        ? `&billingAddress=${encodeURIComponent(JSON.stringify(payload.billingAddress))}`
        : ""),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(`[PrintoClock] createOrder échoué (${res.status}): ${text}`);
  }

  return res.json() as Promise<POCOrder>;
}

/** Récupère le détail d'une commande PrintoClock. */
export async function getOrder(id: string | number): Promise<POCOrder> {
  return pocFetch<POCOrder>(`/orders/${id}`);
}

/** Liste toutes les commandes du compte. */
export async function listOrders(): Promise<POCOrder[]> {
  return pocFetch<POCOrder[]>("/orders");
}

/** Récupère un item de commande spécifique (suivi fabrication / expédition). */
export async function getOrderItem(id: string | number): Promise<POCOrderItem> {
  return pocFetch<POCOrderItem>(`/order-items/${id}`);
}

// ─── Méthodes de paiement ─────────────────────────────────────────────────────

/** Liste les modes de paiement disponibles sur le compte. */
export async function listPaymentMethods(): Promise<POCPaymentMethod[]> {
  return pocFetch<POCPaymentMethod[]>("/payment-methods");
}

// ─── RGPD ─────────────────────────────────────────────────────────────────────

/**
 * Anonymise les données d'un client PrintoClock (RGPD — droit à l'oubli).
 * À appeler lors d'une demande de suppression de compte.
 */
export async function anonymizeCustomer(params: {
  customerEmail?:      string;
  externalCustomerId?: string;
}): Promise<void> {
  await pocFetch("/customers/anonymize", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(params),
  });
}

// ─── Mapping HM Global → PrintoClock ─────────────────────────────────────────

/**
 * Convertit une adresse HM Global (format Supabase) vers le format POCAddress.
 * @param addr  Objet adresse HM Global (shipping_address de la commande)
 * @param email Email du client
 */
export function mapHMAddressToPOC(
  addr:  Record<string, string>,
  email?: string
): POCAddress {
  return {
    firstName:   addr.firstName ?? addr.prenom ?? "",
    lastName:    addr.lastName  ?? addr.nom     ?? "",
    street:      addr.street    ?? addr.adresse ?? "",
    city:        addr.city      ?? addr.ville   ?? "",
    postcode:    addr.postalCode ?? addr.codePostal ?? "",
    countryCode: addr.country === "France" ? "FR" : (addr.countryCode ?? addr.country ?? "FR"),
    phoneNumber: addr.phone ?? addr.telephone ?? undefined,
    company:     addr.company ?? addr.entreprise ?? undefined,
    email:       email ?? addr.email ?? undefined,
    vatNumber:   addr.vatNumber ?? undefined,
  };
}

/**
 * Vérifie si les credentials PrintoClock sont configurés.
 * Utile pour afficher un status dans le back-office.
 */
export function isPrintoclockConfigured(): boolean {
  return !!(process.env.PRINTOCLOCK_USERNAME && process.env.PRINTOCLOCK_PASSWORD);
}
