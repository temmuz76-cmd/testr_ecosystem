import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backend}/uploads/:path*` },
    ];
  },
  async redirects() {
    // Keep links from the old WordPress site working.
    return [
      {
        source: "/proje-yonetimi-ve-saha-koordinasyonu",
        destination: "/hizmetlerimiz/proje-yonetimi-ve-saha-koordinasyonu",
        permanent: true,
      },
      { source: "/:y(\\d{4})/:m(\\d{2})/:d(\\d{2})/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/services/:slug", destination: "/hizmetlerimiz", permanent: true },
    ];
  },
};

export default nextConfig;
