import DOMPurify from "isomorphic-dompurify";

/**
 * lib/security/fileValidation.ts
 *
 * Validation serveur des fichiers uploadés (studio / logo), indépendante du type
 * MIME déclaré par le navigateur (spoofable) :
 *  - `sniffImageKind` lit les magic bytes réels (PNG / JPEG) ou détecte un SVG.
 *  - `sanitizeSvg` neutralise le SVG (scripts, handlers, liens javascript:) via
 *    DOMPurify avant stockage — condition d'un SVG public sans XSS stocké.
 */

export type ImageKind = "png" | "jpeg" | "svg";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

function startsWith(bytes: Uint8Array, sig: number[]): boolean {
  if (bytes.length < sig.length) return false;
  return sig.every((b, i) => bytes[i] === b);
}

/**
 * Détermine le vrai type d'un fichier image à partir de son contenu.
 * Renvoie null si ce n'est pas un PNG, un JPEG ou un SVG reconnaissable.
 */
export function sniffImageKind(bytes: Uint8Array): ImageKind | null {
  if (startsWith(bytes, PNG_SIGNATURE)) return "png";
  if (startsWith(bytes, JPEG_SIGNATURE)) return "jpeg";

  // SVG = texte XML. On inspecte le début du fichier.
  const head = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.subarray(0, 1024))
    .replace(/^﻿/, "")
    .trimStart();
  if (/^<\?xml[\s\S]*?<svg[\s>]/i.test(head) || /^<svg[\s>]/i.test(head)) {
    return "svg";
  }
  return null;
}

/** Type MIME déclaré → famille de contenu attendue. */
export function kindFromMime(mime: string): ImageKind | null {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpeg";
  if (mime === "image/svg+xml") return "svg";
  return null;
}

/**
 * Sanitise un SVG (supprime scripts, attributs d'événement, liens javascript:,
 * foreignObject, etc.). Renvoie le SVG nettoyé, ou null si le résultat ne
 * contient plus de balise <svg> valide.
 */
export function sanitizeSvg(bytes: Uint8Array): string | null {
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const clean = DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "foreignObject"],
    FORBID_ATTR: ["onload", "onerror", "onclick"],
  });
  if (!/<svg[\s>]/i.test(clean)) return null;
  return clean;
}
