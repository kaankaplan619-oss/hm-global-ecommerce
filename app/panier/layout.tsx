import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon panier",
  description:
    "Votre sélection de textiles personnalisés. Vérifiez vos articles, ajustez les quantités et passez commande.",
  robots: { index: false, follow: false },
};

export default function PanierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
