/**
 * app/api/image-proxy/route.ts
 *
 * Proxy serveur pour les images CDN externes qui bloquent les requêtes
 * CORS directes depuis le navigateur (Printful CDN, TopTex CDN).
 *
 * Cas d'usage principal : Fabric.js charge les images avec `new Image()` depuis
 * le navigateur — le CDN Printful ne renvoie pas de header Access-Control-Allow-Origin
 * ce qui bloque le canvas. Ce proxy télécharge l'image côté serveur (pas de CORS)
 * et la renvoie avec les headers appropriés.
 *
 * Sécurité :
 *   - Whitelist de hostnames — refuse toute URL externe non listée (pas d'open proxy)
 *   - HTTPS uniquement
 *   - Pas de forwarding de cookies ou headers d'auth
 */

import { NextRequest, NextResponse } from "next/server";

// Seuls ces hostnames peuvent être proxifiés — liste fermée
const ALLOWED_HOSTNAMES = new Set([
  "files.cdn.printful.com",
  "cdn.toptex.com",
  "media.europeancatalog.com",
]);

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(urlParam);
  } catch {
    return new NextResponse("Invalid url parameter", { status: 400 });
  }

  // Sécurité : HTTPS uniquement
  if (targetUrl.protocol !== "https:") {
    return new NextResponse("Only HTTPS URLs are allowed", { status: 400 });
  }

  // Sécurité : whitelist des hostnames autorisés
  if (!ALLOWED_HOSTNAMES.has(targetUrl.hostname)) {
    return new NextResponse("URL not allowed", { status: 403 });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: {
        // En-têtes minimaux — pas de cookie ni de credential
        "User-Agent": "HMGlobal-ImageProxy/1.0",
      },
      // Sécurité SSRF : NE PAS suivre les redirections. Un hôte whitelisté qui
      // redirige (open redirect, contenu uploadé) pourrait sinon faire pointer
      // le serveur vers le réseau interne / endpoints de metadata cloud.
      redirect: "manual",
    });

    // Une 3xx (redirection) est refusée explicitement.
    if (upstream.status >= 300 && upstream.status < 400) {
      return new NextResponse("Redirects are not allowed", { status: 502 });
    }

    if (!upstream.ok) {
      return new NextResponse("Upstream error", { status: upstream.status });
    }

    // On ne proxifie QUE des images (pas de HTML/JSON internes exfiltrés).
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return new NextResponse("Not an image", { status: 415 });
    }

    // Plafond de taille (15 Mo) pour éviter l'abus mémoire/bande passante.
    const MAX_BYTES = 15 * 1024 * 1024;
    const declared = Number(upstream.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) {
      return new NextResponse("Image too large", { status: 413 });
    }
    const body = await upstream.arrayBuffer();
    if (body.byteLength > MAX_BYTES) {
      return new NextResponse("Image too large", { status: 413 });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache côté CDN Vercel + navigateur : 24h, stale-while-revalidate 7j
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[image-proxy] fetch error:", (err as Error).message);
    return new NextResponse("Proxy fetch failed", { status: 502 });
  }
}
