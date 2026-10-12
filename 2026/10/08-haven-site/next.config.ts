import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_BASE_PATH ?? "",
  images: { unoptimized: true },
  // Hide Next's floating "N" dev badge; the other dev overlays toggle with the ` key (src/lib/devTools.ts).
  devIndicators: false,
};

export default nextConfig;
