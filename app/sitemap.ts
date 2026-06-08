import type { MetadataRoute } from "next";
import { ALL_PRODUCTS } from "@/data/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hmglobalagence.fr";

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
    { url: url("/impression/cartes-de-visite"), changeFrequency: "monthly", priority: 0.8 },
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

  // Fiches produit visibles (exclut produits masqués + catégories non proposées).
  const hidden = new Set(["polaires", "enfants"]);
  const productPages: MetadataRoute.Sitemap = ALL_PRODUCTS
    .filter((p) => p.visible !== false && !hidden.has(p.category))
    .map((p) => ({
      url: url(`/produits/${p.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...productPages];
}
