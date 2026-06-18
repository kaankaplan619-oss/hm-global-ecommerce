/**
 * ProductJsonLd.tsx
 *
 * Données structurées schema.org "Product" + "Offer" pour les fiches produit.
 * → Google peut afficher le PRIX (et la disponibilité) directement dans les
 *   résultats de recherche, ce qui augmente le taux de clic.
 *
 * Le prix injecté = exactement le prix « à partir de » affiché sur la carte
 * (getProductCardPrice = prix unitaire le plus bas dès 10 pièces, TTC) →
 * cohérent avec ce que voit l'internaute, donc honnête (pas de risque DGCCRF).
 *
 * ⚠️ Pas d'AggregateRating (étoiles) ici : tant que les avis Google réels ne
 * sont pas branchés (clé GOOGLE_PLACES_API_KEY), afficher une note serait non
 * sourcé → interdit. Les étoiles s'ajouteront automatiquement une fois les
 * avis connectés.
 */
import type { Product } from "@/types";
import { getProductCardPrice } from "@/data/pricing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr";

function toAbsolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function ProductJsonLd({ product }: { product: Product }) {
  const { price } = getProductCardPrice(product);
  const images = (product.images ?? []).filter(Boolean).map(toAbsolute);
  const productUrl = `${SITE_URL}/produits/${product.slug}`;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description,
    sku: product.reference,
    category: product.category,
    brand: { "@type": "Brand", name: "HM Global Agence" },
    ...(images.length ? { image: images } : {}),
  };

  // Offre uniquement si un prix réel est calculable (sinon Google rejette l'offre).
  if (price > 0) {
    data.offers = {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: price.toFixed(2),
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "HM Global Agence" },
    };
  }

  return (
    <script
      type="application/ld+json"
      // JSON maîtrisé (données produit internes) → injection sûre.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
