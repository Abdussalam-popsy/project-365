// Background glows on the dark sections. Tune them live with the Glow editor (dev tools, § or `) on the real
// page, then paste the copied values here.

export interface GlowValues {
  /** Section background behind the glow. */
  background: string;
  /** Centre of the glow, as % of the section's width and height. */
  x: number;
  y: number;
  /** Size of the main glow, as % of the section's width and height. */
  width: number;
  height: number;
  /** Main glow colour and opacity (0–1). */
  color: string;
  strength: number;
  /** Second, smaller glow on top (the lilac sheen). */
  accent: string;
  accentStrength: number;
  /** Accent size, as % of the main glow. */
  accentSize: number;
  /** How far below the main centre the accent sits, in % of the section's height. */
  accentOffsetY: number;
}

export type GlowId = "closing" | "voice" | "outcomes" | "zoom";

export const glows: Record<GlowId, GlowValues> = {
  /** The closing call to action, faded out before the footer. */
  closing: {
    background: "#0e0b10",
    x: 47,
    y: -20,
    width: 160,
    height: 73,
    color: "#43234f",
    strength: 1,
    accent: "#c9b5da",
    accentStrength: 0,
    accentSize: 58,
    accentOffsetY: 21,
  },
  /** The voice demo: a plum glow over the heading. */
  voice: {
    background: "#0e0b10",
    x: 50,
    y: -1,
    width: 77,
    height: 72,
    color: "#43234f",
    strength: 1,
    accent: "#c9b5da",
    accentStrength: 0,
    accentSize: 58,
    accentOffsetY: 21,
  },
  /** Outcomes: a plum glow rising from the bottom, behind the calendar. */
  outcomes: {
    background: "#0e0b10",
    x: 50,
    y: 103,
    width: 122,
    height: 49,
    color: "#43234f",
    strength: 1,
    accent: "#c9b5da",
    accentStrength: 0,
    accentSize: 58,
    accentOffsetY: 21,
  },
  /** The logo zoom under the hero: a plum glow behind the H, fading out as it zooms. */
  zoom: {
    background: "#0e0b10",
    x: 50,
    y: 50,
    width: 40,
    height: 55,
    color: "#43234f",
    strength: 1,
    accent: "#c9b5da",
    accentStrength: 0,
    accentSize: 58,
    accentOffsetY: 21,
  },
};

/** Which section each glow belongs to (its element id), and the name the editor shows. */
export const glowSections: Record<GlowId, { sectionId: string; label: string; jumpTo?: ScrollLogicalPosition }> = {
  closing: { sectionId: "book-a-demo", label: "Closing CTA" },
  voice: { sectionId: "voice-demo", label: "Voice demo" },
  outcomes: { sectionId: "outcomes", label: "Outcomes" },
  // Jump to the top of the zoom: further down, the glow has already faded out.
  zoom: { sectionId: "home-zoom", label: "Logo zoom", jumpTo: "start" },
};

/** "#43234f" + 0.95 → "rgba(67,35,79,0.95)". */
export function hexToRgba(hex: string, alpha: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** The CSS background-image for a set of glow values. The main glow is listed first, so it paints on top of the accent. */
export function glowBackground(g: GlowValues) {
  const accentW = (g.width * g.accentSize) / 100;
  const accentH = (g.height * g.accentSize) / 100;
  return [
    `radial-gradient(${g.width}% ${g.height}% at ${g.x}% ${g.y}%, ${hexToRgba(g.color, g.strength)}, transparent)`,
    `radial-gradient(${accentW}% ${accentH}% at ${g.x}% ${g.y + g.accentOffsetY}%, ${hexToRgba(g.accent, g.accentStrength)}, transparent)`,
  ].join(", ");
}
