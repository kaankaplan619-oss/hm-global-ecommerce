/**
 * lib/proxy-cdn-url.ts
 *
 * Convertit une URL CDN externe en URL proxifiée via /api/image-proxy.
 *
 * Utilisé par Fabric.js (MockupViewer) qui charge les images directement
 * depuis le navigateur — les CDN Printful/TopTex bloquent ces requêtes CORS.
 * Le proxy Next.js télécharge l'image côté serveur, contournant le problème.
 *
 * Les URLs locales (/mockups/...) et les hostnames non listés sont retournés
 * inchangés.
 */

/** Hostnames dont les images nécessitent un proxy côté serveur. */
const NEEDS_PROXY = new Set([
  "files.cdn.printful.com",
  "cdn.toptex.com",
  "media.europeancatalog.com",
]);

/**
 * Retourne l'URL proxifiée si l'hostname est dans la liste NEEDS_PROXY,
 * sinon retourne l'URL d'origine. Retourne null si l'entrée est nulle/vide.
 */
export function proxyCdnUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Les chemins locaux (/mockups/...) n'ont jamais besoin de proxy
  if (url.startsWith("/")) return url;

  try {
    const { hostname } = new URL(url);
    if (NEEDS_PROXY.has(hostname)) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {
    // URL malformée — retourner telle quelle
  }

  return url;
}
