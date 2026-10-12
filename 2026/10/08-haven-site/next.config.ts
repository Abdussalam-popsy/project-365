import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_BASE_PATH ?? "",
  images: { unoptimized: true },
  // Export each page as folder/index.html, so /agents/leasing/ works on GitHub Pages and
  // client-side navigation back to the homepage finds its data (index.txt) instead of a 404.
  trailingSlash: true,
  // Hide Next's floating "N" dev badge; the other dev overlays toggle with the ` key (src/lib/devTools.ts).
  devIndicators: false,
};

export default nextConfig;
