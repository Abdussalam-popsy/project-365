import type { Metadata } from "next";
import { GlowTool } from "@/components/tools/GlowTool";

// A design tool, not a page for visitors: kept out of search results.
export const metadata: Metadata = { title: "Glow tool | Haven", robots: { index: false, follow: false } };

export default function CtaGlowToolPage() {
  return <GlowTool />;
}
