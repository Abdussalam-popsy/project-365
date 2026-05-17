// SVG geometry from Figma — do not edit these values
// Paths are drawn hub → left edge; for inbound animation use progress 1 → 0

export const SYNC_VIEWBOX = { w: 438, h: 210 } as const;

// Hub centre in SVG coordinate space
export const HUB = { x: 240.5, y: 105 } as const;

// Inbound: start = hub (t=0), end = left edge (t=totalLength)
// Animate dots: progress 1.0 → 0.0  (left → hub)
export const PATH_IN_UPPER =
  "M240.5 105C160.5 98.4715 0.5 68.3316 0.5 0";
export const PATH_IN_LOWER =
  "M240.5 105C160.5 111.528 0.5 141.668 0.5 210";

// Centre line — decorative track only, not animated
export const PATH_CENTER = "M437.5 105.25L0.5 105.25";

// Outbound: hub → right edge
// Animate docs: progress 0.0 → 1.0  (hub → right)
export const PATH_OUT = "M240.5 105.25 L437.5 105.25";
