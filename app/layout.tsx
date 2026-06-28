import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

// Police display de marque (titres) — chargée et auto-hébergée par next/font.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import QuoteAssistant from "@/components/assistant/QuoteAssistant";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import CookieConsent from "@/components/layout/CookieConsent";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import AuthSync from "@/components/auth/AuthSync";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: {
    default: "HM Global — Agence de communication visuelle à Strasbourg",
    template: "%s | HM Global Agence",
  },
  description:
    "Textile personnalisé, impression, enseignes et signalétique pour les entreprises à Strasbourg et en Alsace. Atelier local et BAT avant production.",
  keywords: [
    "textile personnalisé",
    "t-shirt personnalisé",
    "broderie",
    "DTF",
    "impression textile",
    "vêtement entreprise",
    "enseigne Strasbourg",
    "signalétique Alsace",
    "impression professionnelle",
    "agence communication visuelle",
    "Alsace",
    "Souffelweyersheim",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr"
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
    title: "HM Global — Agence de communication visuelle à Strasbourg",
    description:
      "Textile personnalisé, impression, enseignes et signalétique pour les entreprises en Alsace.",
    images: [
      {
        url: "/images/home/hm-hero-atelier-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Atelier HM Global à Souffelweyersheim",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HM Global — Agence de communication visuelle à Strasbourg",
    description: "Textile personnalisé, impression, enseignes et signalétique en Alsace.",
    images: ["/images/home/hm-hero-atelier-v2.jpg"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={bricolage.variable}>
      <body className="bg-white text-[var(--hm-text)] antialiased">
        <I18nProvider initialLocale={locale}>
          <AuthSync />
          <LocalBusinessJsonLd />
          <Header />
          <CartDrawer />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <QuoteAssistant />
          <WhatsAppButton />
          <CookieConsent />
          <AnalyticsTracker />
          <GoogleAnalytics />
        </I18nProvider>
      </body>
    </html>
  );
}
