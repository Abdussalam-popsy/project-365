"use client";

import { useTuning, type TuningSpecs } from "@/lib/tuning";

/** Sliders for the closing section's glow (Tune panel, dev or ?tune). Defaults are what visitors see. */
const glowTuning = {
  x: { label: "Glow centre, left/right (%)", min: 0, max: 100, step: 1, value: 50 },
  y: { label: "Glow centre, up/down (%)", min: 0, max: 120, step: 1, value: 55 },
  width: { label: "Glow width (%)", min: 20, max: 140, step: 1, value: 60 },
  height: { label: "Glow height (%)", min: 20, max: 140, step: 1, value: 55 },
  plum: { label: "Plum strength", min: 0, max: 1, step: 0.01, value: 0.95 },
  lilac: { label: "Lilac strength", min: 0, max: 0.6, step: 0.01, value: 0.1 },
  lilacSize: { label: "Lilac size (% of glow)", min: 10, max: 100, step: 1, value: 58 },
} satisfies TuningSpecs;

/**
 * The closing section's background glow: a plum radial gradient with a smaller lilac one on top.
 * Plum is #43234f (67,35,79) and lilac #c9b5da (201,181,218), the brand's own family.
 */
export function CtaGlow() {
  const t = useTuning("cta-glow", "Closing section glow", glowTuning);
  const lilacW = (t.width * t.lilacSize) / 100;
  const lilacH = (t.height * t.lilacSize) / 100;
  return (
    <div
      className="absolute inset-0"
      aria-hidden
      style={{
        backgroundImage: [
          `radial-gradient(${t.width}% ${t.height}% at ${t.x}% ${t.y}%, rgba(67,35,79,${t.plum}), transparent)`,
          `radial-gradient(${lilacW}% ${lilacH}% at ${t.x}% ${t.y + 5}%, rgba(201,181,218,${t.lilac}), transparent)`,
        ].join(", "),
      }}
    />
  );
}
