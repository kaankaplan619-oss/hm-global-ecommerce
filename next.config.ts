import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stripe packages access `location` / `window` at module init time.
  // Marking them as serverExternalPackages prevents Turbopack from bundling
  // them into shared SSR chunks (_0sobcok._.js) — they are never require()'d
  // server-side because the payment component is loaded with ssr:false.
  serverExternalPackages: ["@stripe/stripe-js", "@stripe/react-stripe-js"],

  // Images — add your CDN / storage domains here
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        // Toptex CDN — /packshots/ (packshots couleur) + /pictures/ (visuels éditoriaux)
        protocol: "https",
        hostname: "cdn.toptex.com",
        pathname: "/**",
      },
      {
        // Toptex media authentifié (fallback)
        protocol: "https",
        hostname: "media.europeancatalog.com",
      },
      {
        // Printful CDN — images catalogue produits (variants couleur)
        protocol: "https",
        hostname: "files.cdn.printful.com",
        pathname: "/products/**",
      },
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Stripe webhook must receive raw body — exclude from body parsers
        source: "/api/stripe/webhook",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
    ];
  },

  // Redirect admin to login if not authenticated (handled client-side for V1)
  // Can be replaced with middleware auth in V2

  // Environment variables to expose to client
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://hmglobalagence.fr",
  },
};

export default nextConfig;
