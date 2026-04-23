import type { Point } from "./types";

// cubic-bezier(0.22, 1, 0.36, 1) via Newton-Raphson
export function cubicBezierEase(t: number): number {
  const x1 = 0, y1 = 0, x2 = 0, y2 = 1;

  let u = t;
  for (let i = 0; i < 8; i++) {
    const xu = 3 * x1 * (1 - u) * (1 - u) * u + 3 * x2 * (1 - u) * u * u + u * u * u;
    const dxu = 3 * x1 * (1 - u) * (1 - u) - 6 * x1 * (1 - u) * u + 6 * x2 * (1 - u) * u - 3 * x2 * u * u + 3 * u * u;
    if (Math.abs(dxu) < 1e-6) break;
    u -= (xu - t) / dxu;
    u = Math.max(0, Math.min(1, u));
  }

  return 3 * y1 * (1 - u) * (1 - u) * u + 3 * y2 * (1 - u) * u * u + u * u * u;
}

// Catmull-Rom spline point
function catmullRomPoint(
  p0: Point, p1: Point, p2: Point, p3: Point, t: number
): { x: number; y: number } {
  const t2 = t * t;
  const t3 = t2 * t;

  const x = 0.5 * (
    (2 * p1.x) +
    (-p0.x + p2.x) * t +
    (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
    (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
  );
  const y = 0.5 * (
    (2 * p1.y) +
    (-p0.y + p2.y) * t +
    (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
    (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
  );

  return { x, y };
}

// Interpolate raw points with Catmull-Rom for smooth curves
export function interpolateStroke(rawPoints: Point[], subdivisions = 4): Point[] {
  if (rawPoints.length < 2) return [...rawPoints];

  const result: Point[] = [rawPoints[0]];

  for (let i = 0; i < rawPoints.length - 1; i++) {
    const p0 = rawPoints[Math.max(0, i - 1)];
    const p1 = rawPoints[i];
    const p2 = rawPoints[Math.min(rawPoints.length - 1, i + 1)];
    const p3 = rawPoints[Math.min(rawPoints.length - 1, i + 2)];

    for (let s = 1; s <= subdivisions; s++) {
      const t = s / subdivisions;
      const pt = catmullRomPoint(p0, p1, p2, p3, t);
      const timestamp = p1.timestamp + (p2.timestamp - p1.timestamp) * t;
      result.push({ x: pt.x, y: pt.y, timestamp });
    }
  }

  return result;
}

// Compute cumulative distances along a set of points
export function computeLengths(points: Point[]): { lengths: number[]; totalLength: number } {
  const lengths: number[] = [0];
  let total = 0;

  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
    lengths.push(total);
  }

  return { lengths, totalLength: total };
}

// Binary search for the point index at a given distance along the stroke
export function findPointAtDistance(
  lengths: number[],
  distance: number
): { index: number; frac: number } {
  if (distance <= 0) return { index: 0, frac: 0 };
  if (distance >= lengths[lengths.length - 1]) return { index: lengths.length - 1, frac: 0 };

  let lo = 0, hi = lengths.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (lengths[mid] <= distance) lo = mid;
    else hi = mid;
  }

  const segLen = lengths[hi] - lengths[lo];
  const frac = segLen > 0 ? (distance - lengths[lo]) / segLen : 0;
  return { index: lo, frac };
}
