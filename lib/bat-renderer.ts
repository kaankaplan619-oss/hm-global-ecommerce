/**
 * bat-renderer.ts — Rendu BAT haute résolution côté serveur (Sharp).
 *
 * Reconstruit le compositing vêtement + logo à partir :
 *   - de l'image vêtement HD (fichier local public/mockups/hm/textile/…)
 *   - du logo client (URL Supabase ou data URL)
 *   - des coordonnées Fabric.js normalisées en fractions
 *
 * Ce module ne touche pas à MockupViewer, StudioCanvas, ni aux zones Fabric.js.
 * Il reproduit la même logique de placement que le canvas 2D de StudioCanvas.exportComposed(),
 * mais à la résolution cible (défaut 2000×2000 px).
 */

import sharp from "sharp";
import { readFile } from "fs/promises";
import path from "path";

// Zones calibrées — la source de vérité unique vit dans @/lib/textile-zones.
// Les valeurs sont identiques côté client (MockupViewer, BatPreviewStudio, StudioCanvas)
// et côté serveur (ici) pour garantir que le BAT haute résolution reproduit
// fidèlement le placement studio.
// ZONES_BY_CATEGORY est importé (et non re-déclaré ici) pour éviter toute dérive.

export interface LogoTransform {
  left:       number;
  top:        number;
  scaleX:     number;
  scaleY:     number;
  width:      number;  // dimensions naturelles du logo en px dans Fabric
  height:     number;
  angle:      number;  // degrés
  canvasSize: number;  // taille du canvas Fabric au moment du placement (544 px)
}

export interface BatRenderInput {
  /** Chemin relatif depuis public/mockups/ — ex. "hm/textile/gildan-18000/noir/front.webp" */
  garmentRelativePath: string;
  /** URL publique Supabase ou data URL du logo */
  logoUrl: string;
  /** "coeur" | "dos" */
  placement: "coeur" | "dos";
  /** "front" | "back" */
  face: "front" | "back";
  /** Clé dans ZONES_BY_CATEGORY — ex. "hoodies" */
  productCategory: string;
  /** Transform Fabric.js tel que stocké dans logoPlacementTransform */
  transform: LogoTransform;
  /** Résolution carrée du rendu final (px). Défaut 2000. */
  outputSize?: number;
}

export interface BatRenderResult {
  buffer:   Buffer;
  width:    number;
  height:   number;
  sizeBytes: number;
}

// ── Chargement logo ────────────────────────────────────────────────────────────

// Plafond mémoire pour le logo (anti-amplification / anti-abus).
const MAX_LOGO_BYTES = 15 * 1024 * 1024;

/**
 * Hôtes autorisés pour un logoUrl distant. Le logo client vient TOUJOURS du
 * Storage Supabase du projet (buckets customer-logos / studio-exports). On
 * refuse toute autre origine pour fermer le SSRF (metadata cloud 169.254.x,
 * réseau interne, open-fetch). Les data: URLs (studio) restent gérées en amont.
 */
function isAllowedLogoHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h.endsWith(".supabase.co") || h.endsWith(".supabase.in")) return true;
  try {
    const envHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname.toLowerCase();
    if (envHost && h === envHost) return true;
  } catch {
    /* env absente/invalide → on s'en tient au suffixe supabase */
  }
  return false;
}

async function fetchLogoBuffer(logoUrl: string): Promise<Buffer> {
  // data: URL (studio) — décodage local, aucune requête réseau.
  if (logoUrl.startsWith("data:")) {
    const [, b64] = logoUrl.split(",");
    const buf = Buffer.from(b64 ?? "", "base64");
    if (buf.byteLength > MAX_LOGO_BYTES) throw new Error("Logo trop volumineux");
    return buf;
  }

  // ── Garde anti-SSRF (même politique que app/api/image-proxy) ───────────────
  let target: URL;
  try {
    target = new URL(logoUrl);
  } catch {
    throw new Error("logoUrl invalide");
  }
  if (target.protocol !== "https:") {
    throw new Error("logoUrl : HTTPS uniquement");
  }
  if (!isAllowedLogoHost(target.hostname)) {
    throw new Error(`logoUrl : hôte non autorisé (${target.hostname})`);
  }

  const res = await fetch(target.toString(), {
    cache: "no-store",
    // Refuser les redirections : un fichier qui redirige pourrait sinon faire
    // pointer le serveur vers le réseau interne / les endpoints de metadata.
    redirect: "manual",
  });
  if (res.status >= 300 && res.status < 400) {
    throw new Error("logoUrl : redirection refusée");
  }
  if (!res.ok) throw new Error(`Logo fetch failed: ${res.status} ${logoUrl}`);

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType && !contentType.startsWith("image/")) {
    throw new Error(`logoUrl : type non-image (${contentType})`);
  }
  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared > MAX_LOGO_BYTES) throw new Error("Logo trop volumineux");

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > MAX_LOGO_BYTES) throw new Error("Logo trop volumineux");
  return buf;
}

// ── Calcul de position ─────────────────────────────────────────────────────────

interface CompositeParams {
  logoW:  number;  // dimensions logo redimensionné (px dans outputSize)
  logoH:  number;
  left:   number;  // coin supérieur gauche dans outputSize
  top:    number;
  angle:  number;  // degrés
}

function computeCompositeParams(
  transform: LogoTransform,
  outputSize: number,
): CompositeParams {
  const { left, top, scaleX, scaleY, width, height, angle, canvasSize } = transform;

  // Dimensions effectives du logo dans le canvas Fabric (px)
  const logoWFabric = width  * scaleX;
  const logoHFabric = height * scaleY;

  // Centre du logo en fractions du canvas source
  const cxFrac = (left + logoWFabric / 2) / canvasSize;
  const cyFrac = (top  + logoHFabric / 2) / canvasSize;

  // Fractions → coordonnées dans outputSize
  const logoW = Math.round(logoWFabric / canvasSize * outputSize);
  const logoH = Math.round(logoHFabric / canvasSize * outputSize);
  const cx    = Math.round(cxFrac * outputSize);
  const cy    = Math.round(cyFrac * outputSize);

  return {
    logoW,
    logoH,
    left:  cx - Math.round(logoW / 2),
    top:   cy - Math.round(logoH / 2),
    angle,
  };
}

// ── Rendu principal ────────────────────────────────────────────────────────────

export async function renderBat(input: BatRenderInput): Promise<BatRenderResult> {
  const {
    garmentRelativePath,
    logoUrl,
    placement,
    face,
    productCategory,
    transform,
    outputSize = 2000,
  } = input;

  // ── 1. Charger le vêtement ────────────────────────────────────────────────
  const garmentAbsPath = path.join(
    process.cwd(),
    "public",
    "mockups",
    garmentRelativePath,
  );
  let garmentBuffer: Buffer;
  try {
    garmentBuffer = await readFile(garmentAbsPath);
  } catch {
    throw new Error(`Garment image not found: public/mockups/${garmentRelativePath}`);
  }

  // ── 2. Charger le logo ─────────────────────────────────────────────────────
  const logoRawBuffer = await fetchLogoBuffer(logoUrl);

  // ── 3. Vêtement → outputSize avec contain (pas de recadrage) ───────────────
  const garmentResized = await sharp(garmentBuffer)
    .resize(outputSize, outputSize, {
      fit:        "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  // ── 4. Vérification cohérence placement / face ─────────────────────────────
  // En mode "coeur-dos", la route reçoit une face par appel.
  // En mode "dos", le rendu attendu est la face "back".
  // Si incohérent (dos sur front), on continue quand même — c'est à l'appelant de passer la bonne combinaison.
  // productCategory reste dans l'API publique pour cohérence avec MockupViewer (logging futur ou
  // routing serveur). La géométrie courante vient entièrement de `transform`.
  void placement;
  void face;
  void productCategory;

  // ── 5. Calcul position logo ────────────────────────────────────────────────
  const params = computeCompositeParams(transform, outputSize);

  // ── 6. Redimensionner le logo + rotation ──────────────────────────────────
  let logoSharp = sharp(logoRawBuffer)
    .resize(params.logoW, params.logoH, {
      fit:        "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

  if (params.angle !== 0) {
    logoSharp = logoSharp.rotate(params.angle, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  const logoFinalBuffer = await logoSharp.png().toBuffer();

  // ── 7. Composite logo sur vêtement ────────────────────────────────────────
  const { data: resultBuffer, info } = await sharp(garmentResized)
    .composite([
      {
        input:  logoFinalBuffer,
        left:   Math.max(0, params.left),
        top:    Math.max(0, params.top),
        blend:  "over",
      },
    ])
    .png({ compressionLevel: 8 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer:    resultBuffer,
    width:     info.width,
    height:    info.height,
    sizeBytes: info.size,
  };
}

// ── Validation chemin garment ─────────────────────────────────────────────────

/**
 * Valide et normalise le chemin relatif du vêtement.
 * Autorise uniquement les chemins sous public/mockups/hm/textile/.
 * Refuse tout path traversal ("../", "%2e%2e", etc.).
 */
export function validateGarmentPath(raw: string): string {
  // Décoder les éventuels encodages URL avant analyse
  const decoded = decodeURIComponent(raw);

  if (decoded.includes("..") || decoded.includes("\0")) {
    throw new Error("Invalid garment path: path traversal detected");
  }

  // Normaliser les séparateurs et rejeter les chemins absolus
  const normalized = decoded.replace(/\\/g, "/").replace(/^\/+/, "");

  if (!normalized.startsWith("hm/textile/")) {
    throw new Error(
      `Invalid garment path: must start with hm/textile/ (got: ${normalized})`,
    );
  }

  // Vérifier l'extension — seuls les formats image sont autorisés
  const ext = path.extname(normalized).toLowerCase();
  if (![".webp", ".jpg", ".jpeg", ".png"].includes(ext)) {
    throw new Error(`Invalid garment path: unsupported extension ${ext}`);
  }

  return normalized;
}
