import type { NextConfig } from "next";

// `*.dev.tsx` files (e.g. the /components showcase page) exist only outside production builds.
const pageExtensions =
  process.env.NODE_ENV === "production"
    ? ["tsx", "ts"]
    : ["tsx", "ts", "dev.tsx"];

const nextConfig: NextConfig = {
  pageExtensions,
  /* config options here */
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
