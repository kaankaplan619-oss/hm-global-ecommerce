import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
