import type { MetadataRoute } from "next";
import { ALL_PRODUCTS } from "@/data/products";
import { ALL_PRINT_PRODUCTS, printConfigHref } from "@/data/print-catalogue";
import { LOCAL_SERVICE_PAGES } from "@/data/local-seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr";

// Catégories textile réellement proposées (cf. catalogue).
const PUBLIC_CATEGORIES = [
  "tshirts", "polos", "hoodies", "softshells", "casquettes", "sacs", "goodies",
];

/**
 * sitemap.xml — pages publiques indexables (accueil, catalogue, catégories,
 * fiches produit visibles, impression, pages légales). Exclut admin/compte/API.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"),                  changeFrequency: "weekly",  priority: 1.0 },
    { url: url("/catalogue"),         changeFrequency: "weekly",  priority: 0.9 },
    { url: url("/impression"),        changeFrequency: "weekly",  priority: 0.9 },
    { url: url("/a-propos"),          changeFrequency: "monthly", priority: 0.6 },
    { url: url("/realisations"),      changeFrequency: "weekly",  priority: 0.7 },
    { url: url("/entreprises"),       changeFrequency: "monthly", priority: 0.6 },
    { url: url("/engagements"),       changeFrequency: "monthly", priority: 0.5 },
    { url: url("/techniques"),        changeFrequency: "monthly", priority: 0.6 },
    { url: url("/devis-rapide"),      changeFrequency: "monthly", priority: 0.6 },
    { url: url("/faq"),               changeFrequency: "monthly", priority: 0.5 },
    { url: url("/contact"),           changeFrequency: "yearly",  priority: 0.4 },
    { url: url("/cgv"),               changeFrequency: "yearly",  priority: 0.2 },
    { url: url("/confidentialite"),   changeFrequency: "yearly",  priority: 0.2 },
    { url: url("/mentions-legales"),  changeFrequency: "yearly",  priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = PUBLIC_CATEGORIES.map((c) => ({
    url: url(`/catalogue/${c}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Pages SEO locales (« <service> Strasbourg ») — cf. data/local-seo.ts.
  const localPages: MetadataRoute.Sitemap = LOCAL_SERVICE_PAGES.map((p) => ({
    url: url(`/${p.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Fiches produit visibles (exclut produits masqués + catégories non proposées).
  const hidden = new Set(["polaires", "enfants"]);
  const productPages: MetadataRoute.Sitemap = ALL_PRODUCTS
    .filter((p) => p.visible !== false && !hidden.has(p.category))
    .map((p) => ({
      url: url(`/produits/${p.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  // Configurateurs print (cartes 85×55 partagent /impression/cartes-de-visite).
  const printHrefs = new Set(ALL_PRINT_PRODUCTS.map((p) => printConfigHref(p.id)));
  const printPages: MetadataRoute.Sitemap = [...printHrefs].map((href) => ({
    url: url(href),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...localPages, ...categoryPages, ...printPages, ...productPages];
}
