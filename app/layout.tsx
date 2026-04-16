import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HM Global Agence — Textile personnalisé professionnel",
    template: "%s | HM Global Agence",
  },
  description:
    "Commandez votre textile personnalisé en quelques clics. T-shirts, hoodies, softshells brodés ou imprimés. Livraison rapide depuis Alsace.",
  keywords: [
    "textile personnalisé",
    "t-shirt personnalisé",
    "broderie",
    "DTF",
    "impression textile",
    "vêtement entreprise",
    "Alsace",
    "Souffelweyersheim",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://hmglobalagence.fr"
  ),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "HM Global Agence",
    title: "HM Global Agence — Textile personnalisé professionnel",
    description:
      "Commandez votre textile personnalisé en quelques clics avec HM Global Agence.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body className="bg-[#0a0a0a] text-[#f5f5f5] antialiased">
        <Header />
        <CartDrawer />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
