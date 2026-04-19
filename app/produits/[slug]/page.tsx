import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";
import ProductConfigurator from "@/components/product/ProductConfigurator";
import ProductCard from "@/components/product/ProductCard";
import ProductGallery from "@/components/product/ProductGallery";
import { getProductBySlug, ALL_PRODUCTS } from "@/data/products";
import { formatPrice } from "@/data/pricing";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export async function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  // Related products (same category, excluding current)
  const related = ALL_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const minPrice = Math.min(product.pricing.dtf, product.pricing.flex);
  const useCases =
    product.category === "tshirts"
      ? ["Équipes événementielles", "Staff commerce & restauration", "Associations et opérations terrain"]
      : product.category === "hoodies"
      ? ["Tenues staff en mi-saison", "Uniformes casual d'équipe", "Merchandising et image de marque"]
      : ["Équipes terrain", "Commerciaux & techniciens", "Tenues premium extérieures"];

  const strengths =
    product.category === "tshirts"
      ? ["Coupe polyvalente", "Support idéal pour DTF, flex ou broderie", "Excellent rapport qualité/prix"]
      : product.category === "hoodies"
      ? ["Bonne tenue dans le temps", "Look plus premium pour les équipes", "Excellent rendu sur poitrine ou dos"]
      : ["Aspect premium immédiat", "Très bon support pour broderie", "Parfait pour un usage professionnel extérieur"];

  const recommendation =
    product.category === "softshells"
      ? "Pour les softshells, la broderie reste la finition la plus cohérente pour un rendu durable et professionnel."
      : product.category === "hoodies"
      ? "Sur hoodie et sweat, la broderie apporte une vraie montée en gamme tandis que le DTF reste très efficace pour les visuels plus complexes."
      : "Sur t-shirt, le DTF est souvent le meilleur compromis entre précision, souplesse visuelle et rendu des couleurs.";

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        <nav className="flex items-center gap-2 text-xs text-[var(--hm-text-soft)] mb-8">
          <Link href="/" className="hover:text-[var(--hm-rose)]">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-[var(--hm-rose)]">Catalogue</Link>
          <span>/</span>
          <Link href={`/catalogue/${product.category}`} className="hover:text-[var(--hm-rose)] capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[var(--hm-text)]">{product.shortName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <ProductGallery
              name={product.name}
              images={product.images}
              badge={product.badge}
            />

            <div className="p-6 bg-white border border-[var(--hm-line)] rounded-[28px] shadow-[0_18px_48px_rgba(63,45,88,0.06)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-[var(--hm-text-soft)] uppercase tracking-wider font-semibold mb-1">Référence</p>
                  <p className="text-sm font-mono text-[var(--hm-text)]">{product.reference}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--hm-text-soft)] uppercase tracking-wider font-semibold mb-1">Composition</p>
                  <p className="text-sm text-[var(--hm-text-soft)]">{product.composition}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--hm-text-soft)] uppercase tracking-wider font-semibold mb-1">Grammage</p>
                  <p className="text-sm text-[var(--hm-text-soft)]">{product.weight}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--hm-text-soft)] uppercase tracking-wider font-semibold mb-1">Prix dès</p>
                  <p className="text-sm font-bold text-[var(--hm-rose)]">{formatPrice(minPrice)} TTC</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--hm-line)]">
                <p className="text-xs text-[var(--hm-text-soft)] leading-relaxed">{product.description}</p>
              </div>
            </div>

            {product.category === "softshells" && (
              <div className="flex items-start gap-3 p-4 bg-[var(--hm-accent-soft-purple)] border border-[var(--hm-line)] rounded-2xl">
                <Info size={14} className="text-[var(--hm-purple)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--hm-purple)]">
                  La broderie est recommandée pour ce type de vêtement premium. DTF et flex sont disponibles mais à utiliser avec prudence selon le visuel.
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="mb-6">
              <p className="text-[10px] font-mono text-[var(--hm-text-soft)] mb-1">{product.reference}</p>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--hm-text)] mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-[var(--hm-text-soft)] mb-1">{product.composition} · {product.weight}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--hm-rose)]">
                  {formatPrice(minPrice)}
                </span>
                <span className="text-sm text-[var(--hm-text-soft)]">TTC</span>
                <span className="text-xs text-[var(--hm-text-soft)]">({formatPrice(minPrice / 1.2)} HT)</span>
              </div>
            </div>

            <ProductConfigurator product={product} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          <section className="card p-6">
            <h2 className="text-lg font-black text-[var(--hm-text)] mb-4">
              Idéal pour
            </h2>
            <div className="space-y-3">
              {useCases.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-[var(--hm-rose)] mt-0.5 shrink-0" />
                  <p className="text-sm text-[var(--hm-text-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-black text-[var(--hm-text)] mb-4">
              Pourquoi ce modèle
            </h2>
            <div className="space-y-3">
              {strengths.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-[var(--hm-purple)] mt-0.5 shrink-0" />
                  <p className="text-sm text-[var(--hm-text-soft)]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-6 bg-[var(--hm-accent-soft-blue)]">
            <h2 className="text-lg font-black text-[var(--hm-text)] mb-4">
              Conseil HM Global
            </h2>
            <p className="text-sm text-[var(--hm-text-soft)] leading-relaxed">
              {recommendation}
            </p>
          </section>
        </div>

        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-bold text-[var(--hm-text)]">Produits similaires</h2>
              <div className="h-[1px] flex-1 bg-[var(--hm-line)]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
