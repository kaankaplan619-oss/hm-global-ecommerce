import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stripe packages access `location` / `window` at module init time.
  // Marking them as serverExternalPackages prevents Turbopack from bundling
  // them into shared SSR chunks (_0sobcok._.js) — they are never require()'d
  // server-side because the payment component is loaded with ssr:false.
  // sharp : librairie native (binaires @img/*) — charge depuis node_modules au
  // runtime serveur, evite de gonfler le bundle des fonctions qui l'utilisent.
  serverExternalPackages: ["@stripe/stripe-js", "@stripe/react-stripe-js", "sharp"],

  // Exclure du tracing de la fonction render-bat les dossiers mockups non lus.
  // La fonction lit uniquement public/mockups/hm/textile/** (force par
  // validateGarmentPath dans lib/bat-renderer.ts). Sans cet exclude, Next.js
  // trace tout public/mockups/ (~419 MB) dans le bundle de la function et
  // depasse la limite Vercel de 300 MB.
  outputFileTracingExcludes: {
    "/api/mockups/render-bat/route": [
      "./public/mockups/printify/**",
      "./public/mockups/printify-cropped/**",
      "./public/mockups/bella-3001/**",
      "./public/mockups/gildan-5000/**",
      "./public/mockups/gildan-18000/**",
      "./public/mockups/gildan-18500/**",
      "./public/mockups/gildan-64800/**",
      "./public/mockups/tshirt/**",
      "./public/mockups/cotton-heritage-m2480/**",
      "./public/mockups/print/**",
      "./public/images/**",
    ],
  },

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
          // Désactive par défaut les API sensibles du navigateur (rien n'en a besoin).
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // Force HTTPS pendant 1 an (sans preload pour rester réversible).
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
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

  async redirects() {
    return [
      {
        source: "/contactez-nous/:path*",
        destination: "/contact",
        permanent: true,
      },
    ];
  },

  // Redirect admin to login if not authenticated (handled client-side for V1)
  // Can be replaced with middleware auth in V2

  // Environment variables to expose to client
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hm-global.fr",
  },
};

export default nextConfig;
