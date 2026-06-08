import { ALL_PRODUCTS_ADMIN } from "@/data/products";
import { getProductCatalogImage } from "@/lib/product-image-utils";
import { getV1PrintifyImage } from "@/lib/suppliers/printify/v1-image";

/**
 * Résout l'image catalogue d'un article de commande à partir de son product_id
 * et de sa couleur. Même logique que la carte catalogue (ProductCard) :
 *   1. Produits Printify V1 → image /mockups/printify/...
 *   2. Sinon → getProductCatalogImage (hmMockupImages, packshots, etc.)
 * Retourne null si rien d'exploitable (la page affichera l'icône colis).
 */
export function getOrderItemImage(
  productId?: string,
  colorId?: string,
): string | null {
  if (!productId) return null;
  const product = ALL_PRODUCTS_ADMIN.find((p) => p.id === productId);
  if (!product) return null;
  const v1 = getV1PrintifyImage(productId, colorId, "front");
  if (v1) return v1;
  return getProductCatalogImage(product, colorId) || null;
}
