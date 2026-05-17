// ─── Pixel data parsed from designer SVGs ────────────────────────────────────
// viewBox: 0 0 24 24. Each pixel is a 2×2 unit block.
// Rects: { type: 'rect', x, y } — top-left corner of the 2×2 block.
// Paths: { type: 'path', d, cx, cy } — triangular diagonal cuts; cx/cy is
//   the centroid used for center-out stagger ordering.

export type PixelRect = { type: "rect"; x: number; y: number };
export type PixelPath = { type: "path"; d: string; cx: number; cy: number };
export type Pixel = PixelRect | PixelPath;

const r = (x: number, y: number): PixelRect => ({ type: "rect", x, y });
const p = (d: string, cx: number, cy: number): PixelPath => ({
  type: "path",
  d,
  cx,
  cy,
});

// ─── Frontline Receptionist (phone handset silhouette) ────────────────────────
export const FRONTLINE_PIXELS: Pixel[] = [
  // top bar
  r(6, 4), r(8, 4), r(10, 4), r(12, 4), r(14, 4), r(16, 4),
  // left/right sides
  r(6, 6),  r(16, 6),
  r(6, 8),  r(16, 8),
  r(6, 10), r(16, 10),
  r(6, 12), r(16, 12),
  r(6, 14), r(16, 14),
  r(6, 16), r(16, 16),
  // bottom bar
  r(6, 18), r(8, 18), r(10, 18), r(12, 18), r(14, 18), r(16, 18),
  // diagonal handset cuts (triangles)
  p("M8 16V18H10L8 16Z",   8.67, 17.33),
  p("M12 16H10V18L12 16Z", 11.33, 16.67),
  p("M12 16H14V18L12 16Z", 13.33, 16.67),
  p("M16 16V18H14L16 16Z", 15.33, 17.33),
];

// ─── Maintenance Coordinator (wrench silhouette) ──────────────────────────────
export const MAINTENANCE_PIXELS: Pixel[] = [
  // handle tip
  r(14, 2), r(16, 2),
  r(12, 4), r(14, 4),
  // diagonal shaft
  r(10, 6), r(12, 6), r(20, 6),
  r(10, 8), r(12, 8), r(18, 8), r(20, 8),
  // crossbar / body
  r(10, 10), r(12, 10), r(14, 10), r(16, 10), r(18, 10),
  r(8,  12), r(10, 12), r(12, 12), r(14, 12), r(16, 12),
  r(6,  14), r(8,  14), r(10, 14),
  r(4,  16), r(6,  16), r(8,  16),
  r(2,  18), r(4,  18), r(6,  18),
  r(2,  20), r(4,  20),
];

// ─── Leasing Agent (house + arrow key silhouette) ─────────────────────────────
export const LEASING_PIXELS: Pixel[] = [
  // house roof/base
  r(2, 8), r(4, 8), r(6, 8),
  r(2, 10), r(6, 10), r(8, 10), r(10, 10), r(12, 10), r(14, 10), r(16, 10), r(18, 10),
  r(2, 12), r(6, 12),
  r(2, 14), r(4, 14), r(6, 14),
  // arrow tip (triangle pointing right)
  p("M20 10V12H22L20 10Z", 20.67, 11.33),
  // chevron cuts in the arrow shaft
  p("M8 12H10L8 14V12Z",   8.67,  12.67),
  p("M10 12H12V14L10 12Z", 11.33, 12.67),
  p("M12 12H14L12 14V12Z", 12.67, 12.67),
  p("M14 12H16V14L14 12Z", 15.33, 12.67),
  p("M16 12H18L16 14V12Z", 16.67, 12.67),
  p("M18 12H20V14L18 12Z", 19.33, 12.67),
  p("M20 12H22L20 14V12Z", 20.67, 12.67),
];

// ─── Color per agent ──────────────────────────────────────────────────────────
export type AgentId = "frontline" | "maintenance" | "leasing";

export const AGENT_PIXELS: Record<AgentId, Pixel[]> = {
  frontline:   FRONTLINE_PIXELS,
  maintenance: MAINTENANCE_PIXELS,
  leasing:     LEASING_PIXELS,
};

export const AGENT_COLOR: Record<AgentId, string> = {
  frontline:   "#1E4D7B", // deep blue
  maintenance: "#C05A2A", // warm orange-red
  leasing:     "#2D6B4A", // forest green
};

// ─── Center-out stagger helpers ───────────────────────────────────────────────
const ICON_CENTER = 12; // midpoint of 24×24 viewBox

/** Returns the 24-unit-space center of a pixel (for stagger ordering). */
export function pixelCenter(pixel: Pixel): [number, number] {
  if (pixel.type === "rect") return [pixel.x + 1, pixel.y + 1];
  return [pixel.cx, pixel.cy];
}

/** Euclidean distance from icon center (12,12). */
export function distFromCenter(pixel: Pixel): number {
  const [cx, cy] = pixelCenter(pixel);
  return Math.sqrt((cx - ICON_CENTER) ** 2 + (cy - ICON_CENTER) ** 2);
}
