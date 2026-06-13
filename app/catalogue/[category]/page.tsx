import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackLink from "@/components/ui/BackLink";
import ProductCard from "@/components/product/ProductCard";
import { PRODUCTS_BY_CATEGORY } from "@/data/products";

const CATEGORY_META: Record<string, { label: string; short: string; description: string }> = {
  tshirts: {
    label: "T-shirts personnalisés",
    short: "T-shirts",
    description:
      "T-shirts personnalisés en DTF, flex ou broderie. Modèles homme, femme, unisexe — du coton léger au heavyweight premium. Livraison rapide.",
  },
  polos: {
    label: "Polos personnalisés",
    short: "Polos",
    description:
      "Polos personnalisés en flex ou broderie. Jersey entrée de gamme, manches longues, piqué classique. Parfait pour l'hôtellerie, la restauration et le commerce.",
  },
  hoodies: {
    label: "Hoodies & Sweats personnalisés",
    short: "Hoodies",
    description:
      "Hoodies et sweatshirts personnalisés. Intérieur molletonné doux, qualité professionnelle. À partir de 39,90 €.",
  },
  softshells: {
    label: "Softshells & Vestes personnalisées",
    short: "Softshells",
    description:
      "Vestes et softshells personnalisés. Broderie premium recommandée pour un rendu corporate durable.",
  },
  casquettes: {
    label: "Casquettes personnalisées",
    short: "Casquettes",
    description:
      "Casquettes brodées sur mesure. Coton épais, vintage, sandwich contrasté. Broderie uniquement pour un résultat premium durable.",
  },
  sacs: {
    label: "Sacs & Tote bags personnalisés",
    short: "Sacs",
    description:
      "Tote bags et sacs en coton bio personnalisés en DTF ou flex. Idéal pour les événements, associations et boutiques.",
  },
  goodies: {
    label: "Mugs & Goodies personnalisés",
    short: "Goodies",
    description:
      "Mugs et objets publicitaires personnalisés avec votre logo. Impression sublimation pleine couleur. Idéal pour les séminaires, cadeaux d'entreprise et événements.",
  },
};

// Ordre du sous-menu de navigation catégorie : essentiels → outdoor → accessoires.
// Les catégories Polaires & Doudounes et Vêtements enfants ne sont pas proposées
// (non fabriquées / marge insuffisante) → retirées du menu et des routes.
const PUBLIC_CATEGORY_IDS = [
  "tshirts",
  "polos",
  "hoodies",
  "softshells",
  "casquettes",
  "sacs",
  "goodies",
] as const;

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) return {};
  return {
    title: meta.label,
    description: meta.description,
  };
}

export async function generateStaticParams() {
  // Ne génère que les catégories proposées (exclut polaires / enfants).
  return Object.keys(PRODUCTS_BY_CATEGORY)
    .filter((category) => category in CATEGORY_META)
    .map((category) => ({ category }));
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const products = PRODUCTS_BY_CATEGORY[category as keyof typeof PRODUCTS_BY_CATEGORY];
  const meta = CATEGORY_META[category];

  if (!products || !meta) notFound();

  return (
    <div className="pt-24 pb-20">
      <div className="container">
        {/* Breadcrumb */}
        <BackLink href="/catalogue" label="Retour au catalogue" />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--hm-text)] mb-3">
            {meta.label}
          </h1>
          <p className="text-sm text-[var(--hm-text-soft)] max-w-lg">{meta.description}</p>
        </div>

        {/* Category nav */}
        <div className="flex flex-wrap gap-3 mb-10">
          {PUBLIC_CATEGORY_IDS.map((id) => {
            const m = CATEGORY_META[id];
            return (
              <Link
                key={id}
                href={`/catalogue/${id}`}
                className={`px-4 py-2 text-xs font-semibold border rounded-full transition-colors
                  ${id === category
                    ? "border-[var(--hm-primary)] text-[var(--hm-primary)]"
                    : "border-[var(--hm-line)] text-[var(--hm-text-soft)] hover:border-[var(--hm-primary)] hover:text-[var(--hm-primary)]"
                  }`}
              >
                {m.short}
              </Link>
            );
          })}
        </div>

        {/* Products — état vide propre si aucune fiche visible (ex: goodies V1) */}
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--hm-line)] px-6 py-16 text-center"
            style={{ background: "linear-gradient(180deg, #f8f6f2 0%, #f1eee8 100%)" }}
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--hm-primary)]">
              Bientôt disponible
            </p>
            <h2 className="mb-3 text-xl font-semibold text-[var(--hm-text)] sm:text-2xl">
              {category === "goodies"
                ? "Les goodies personnalisés arrivent bientôt"
                : `${meta.label} : sélection en préparation`}
            </h2>
            <p className="mb-6 max-w-md text-sm leading-6 text-[var(--hm-text-soft)]">
              {category === "goodies"
                ? "Mugs, gourdes, tote bags : nous préparons une sélection cohérente avec la qualité HM Global. Pour une demande urgente, demandez un devis."
                : "Notre sélection arrive prochainement. Pour une demande urgente, demandez un devis sur mesure."}
            </p>
            <Link
              href={`/contact?sujet=devis&support=${category}`}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-[12px]"
            >
              Demander un devis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
