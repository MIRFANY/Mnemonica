import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* PWA and optimization config */
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        {
          key: "Cache-Control",
          value: "no-cache, must-revalidate",
        },
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },
    {
      source: "/manifest.json",
      headers: [
        {
          key: "Content-Type",
          value: "application/manifest+json",
        },
      ],
    },
  ],
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
