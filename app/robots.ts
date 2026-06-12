import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr";

/**
 * robots.txt — autorise l'indexation du site public, bloque les espaces privés
 * (admin, compte, panier/checkout, API) qui n'ont aucun intérêt SEO.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/mon-compte", "/checkout", "/panier", "/commande-confirmee"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
