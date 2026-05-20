import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Home, LayoutGrid, Shirt, Tag } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductFeaturesSection from "@/components/product/ProductFeaturesSection";
import DeliveryBadge from "@/components/shared/DeliveryBadge";
import EmbroideryNotice from "@/components/shared/EmbroideryNotice";
import { getProductBySlug, ALL_PRODUCTS } from "@/data/products";

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

  // ── Données par catégorie ─────────────────────────────────────────────────
  const USE_CASES: Record<string, string[]> = {
    tshirts:    ["Équipes événementielles", "Staff commerce & restauration", "Associations et opérations terrain"],
    hoodies:    ["Tenues staff en mi-saison", "Uniformes casual d'équipe", "Merchandising et image de marque"],
    softshells: ["Équipes terrain & commerciaux", "Personnel technique extérieur", "Image corporate premium"],
    polos:      ["Hôtellerie & restauration", "Commerce & accueil client", "Uniformes professionnels classiques"],
    polaires:   ["Équipes BTP & outdoor", "Personnel sécurité & technique", "Vêtements de travail hiver"],
    casquettes: ["Équipes sportives & clubs", "Événementiel & promotionnel", "Goodies corporate"],
    sacs:       ["Événements & salons professionnels", "Boutiques, associations & ONG", "Goodies clients & partenaires"],
    goodies:    ["Cadeaux clients & partenaires", "Bureaux et équipes", "Restaurants, cafés et événements"],
    enfants:    ["Événements familiaux & école", "Associations jeunesse & sport", "Tenues d'équipe enfants"],
  };

  const STRENGTHS: Record<string, string[]> = {
    tshirts:    ["Coupe polyvalente homme, femme et unisexe", "Support idéal pour DTF, flex ou broderie", "Excellent rapport qualité/prix"],
    hoodies:    ["Bonne tenue dans le temps", "Look plus premium pour les équipes", "Excellent rendu sur poitrine ou dos"],
    softshells: ["Aspect premium immédiat", "Très bon support pour broderie", "Parfait pour un usage professionnel extérieur"],
    polos:      ["Tissu respirant et professionnel", "Idéal pour le flex et la broderie", "Look soigné pour l'accueil client"],
    polaires:   ["Chaleur et légèreté combinées", "Broderie durable sur tissu polaire", "Parfait pour les équipes terrain hiver"],
    casquettes: ["Broderie haute définition garantie", "Finition premium longue durée", "Support idéal pour petits logos"],
    sacs:       ["Coton bio certifié", "Grande surface pour DTF et flex", "Impact positif sur l'image de marque"],
    goodies:    ["Format universel 11 oz, standard entreprise", "Impression couleur adaptée aux logos et visuels", "Simple à commander en quantité, dès 1 pièce"],
    enfants:    ["Matières douces certifiées Oeko-Tex", "Coupes adaptées de 3 à 12 ans", "Rendu DTF vibrant sur petites tailles"],
  };

  const useCases  = USE_CASES[product.category]  ?? USE_CASES.tshirts;
  const strengths = STRENGTHS[product.category] ?? STRENGTHS.tshirts;

  // Recommandation dynamique selon les techniques réellement disponibles
  const techs = product.techniques;
  const recommendation: string = (() => {
    // Goodies (mugs, objets) — wording non-textile
    if (product.category === "goodies") {
      return "Produit simple et efficace pour vos cadeaux clients, bureaux, événements ou packs de bienvenue. Notre équipe vérifie votre visuel avant impression pour garantir un rendu propre et professionnel.";
    }
    if (techs.length === 1 && techs[0] === "broderie") {
      return "La broderie est la seule technique disponible sur ce produit — et c'est aussi la plus adaptée : finition premium, durée de vie maximale et rendu professionnel garanti.";
    }
    if (techs.length === 1 && techs[0] === "dtf") {
      return "Le DTF est la technique disponible sur ce produit. Rendu vif, couleurs illimitées et excellente durée de vie sur tissu.";
    }
    if (!techs.includes("dtf")) {
      return "Le flex et la broderie sont les techniques disponibles sur ce produit. La broderie apporte la finition la plus premium et durable, le flex convient aux logos simples et aux typographies.";
    }
    if (product.category === "softshells") {
      return "Pour les softshells, la broderie reste la finition la plus cohérente pour un rendu durable et professionnel. DTF et flex sont disponibles mais à utiliser avec précaution sur tissu technique.";
    }
    if (product.category === "hoodies" || product.category === "enfants") {
      return "Sur ce type de textile, la broderie apporte une vraie montée en gamme tandis que le DTF reste très efficace pour les visuels complexes et les dégradés.";
    }
    return "Le DTF est souvent le meilleur compromis entre précision, souplesse visuelle et rendu des couleurs. Le flex convient aux logos simples, la broderie aux finitions premium.";
  })();

  return (
    <div className="pt-24 pb-20 md:pt-28">
      <div className="container">
        {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
        <nav aria-label="Fil d'Ariane" className="mb-10 flex flex-wrap items-center gap-1.5">
          {/* Accueil */}
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <Home size={11} className="transition group-hover:text-[var(--hm-rose)]" />
            Accueil
          </Link>

          {/* Separator */}
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>

          {/* Catalogue */}
          <Link
            href="/catalogue"
            className="group flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <LayoutGrid size={11} className="transition group-hover:text-[var(--hm-rose)]" />
            Catalogue
          </Link>

          {/* Separator */}
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>

          {/* Catégorie */}
          <Link
            href={`/catalogue/${product.category}`}
            className="group flex items-center gap-1.5 rounded-full border border-[var(--hm-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--hm-text-soft)] shadow-sm transition hover:border-[var(--hm-rose)]/40 hover:bg-[var(--hm-accent-soft-rose)] hover:text-[var(--hm-rose)]"
          >
            <Shirt size={11} className="transition group-hover:text-[var(--hm-rose)]" />
            {({
              tshirts:    "T-shirts",
              hoodies:    "Hoodies & Sweats",
              softshells: "Softshells",
              polos:      "Polos",
              polaires:   "Polaires",
              casquettes: "Casquettes",
              sacs:       "Sacs",
              goodies:    "Mugs & Goodies",
              enfants:    "Enfants",
            } as Record<string, string>)[product.category] ?? product.category}
          </Link>

          {/* Separator */}
          <svg className="h-3 w-3 text-[var(--hm-text-muted)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2l4 4-4 4" />
          </svg>

          {/* Produit courant — non cliquable */}
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--hm-primary)]/25 bg-[var(--hm-accent-soft-rose)] px-3 py-1.5 text-[11px] font-bold text-[var(--hm-primary)]">
            <Tag size={11} />
            {product.shortName}
          </span>
        </nav>

        {/* Bande délais — confiance B2B */}
        <div className="mb-6">
          <DeliveryBadge variant="block" />
        </div>

        <Suspense>
          <ProductDetailClient product={product} />
        </Suspense>

        <div className="mb-10 border-t border-[var(--hm-line)] pt-10 md:pt-12" />

        <ProductFeaturesSection product={product} />

        <div className="grid gap-6 mb-16 lg:grid-cols-3">
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

        {/* Notice broderie — affichée uniquement si la broderie est disponible */}
        {product.techniques.includes("broderie") && (
          <div className="mb-12">
            <EmbroideryNotice />
          </div>
        )}

        {related.length > 0 && (
          <div className="border-t border-[var(--hm-line)] pt-8 md:pt-10">
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
