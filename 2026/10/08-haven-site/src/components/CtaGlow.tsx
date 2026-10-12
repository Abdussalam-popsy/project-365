import { ctaGlow, glowBackground, type GlowValues } from "@/content/ctaGlow";

/**
 * The closing section's background glow. Values come from src/content/ctaGlow.ts; the tool at
 * /tools/cta-glow/ passes its own live values to preview changes.
 */
export function CtaGlow({ values = ctaGlow }: { values?: GlowValues }) {
  return (
    <div
      className="absolute inset-0"
      aria-hidden
      style={{ backgroundColor: values.background, backgroundImage: glowBackground(values) }}
    />
  );
}
