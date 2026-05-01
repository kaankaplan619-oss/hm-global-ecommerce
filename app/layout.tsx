import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import QuoteAssistant from "@/components/assistant/QuoteAssistant";

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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo/hm-global-symbol.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "HM Global Agence",
    title: "HM Global Agence — Textile personnalisé professionnel",
    description:
      "Commandez votre textile personnalisé en quelques clics avec HM Global Agence.",
    images: [
      {
        url: "/logo/hm-global-logo.png",
        width: 1200,
        height: 630,
        alt: "HM Global Agence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HM Global Agence — Textile personnalisé professionnel",
    description: "Commandez votre textile personnalisé en quelques clics avec HM Global Agence.",
    images: ["/logo/hm-global-logo.png"],
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
      <body className="bg-white text-[var(--hm-text)] antialiased">
        <Header />
        <CartDrawer />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <QuoteAssistant />
      </body>
    </html>
  );
}
