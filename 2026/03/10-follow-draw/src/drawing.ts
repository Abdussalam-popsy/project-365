import type { Point } from "./types";

export const STROKE_COLOR = "#1a1a1a";
export const STROKE_WIDTH = 3;

export function setStrokeStyle(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = STROKE_COLOR;
  ctx.lineWidth = STROKE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 1;
}

export function drawStrokeFull(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

// Draw a partial stroke with width/opacity taper on the trailing tip
export function drawStrokeWithTaper(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  endIndex: number,
  endFrac: number,
  lengths: number[],
  currentDistance: number,
  baseWidth: number
) {
  if (points.length < 2 || endIndex < 0) return;

  const actualEnd = Math.min(endIndex, points.length - 1);
  const taperZone = currentDistance * 0.06;
  const taperStart = currentDistance - taperZone;

  ctx.save();
  ctx.lineWidth = baseWidth;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  let taperBeginIdx = actualEnd + 1;
  for (let i = 1; i <= actualEnd; i++) {
    if (lengths[i] >= taperStart && taperBeginIdx > actualEnd) {
      taperBeginIdx = i;
    }
    ctx.lineTo(points[i].x, points[i].y);
  }

  if (endFrac > 0 && actualEnd + 1 < points.length) {
    const nx = points[actualEnd].x + (points[actualEnd + 1].x - points[actualEnd].x) * endFrac;
    const ny = points[actualEnd].y + (points[actualEnd + 1].y - points[actualEnd].y) * endFrac;
    ctx.lineTo(nx, ny);
  }

  ctx.stroke();

  // Overdraw taper zone with decreasing width + opacity
  if (taperZone > 2 && taperBeginIdx <= actualEnd) {
    const startPt = Math.max(0, taperBeginIdx - 1);
    const endPt = endFrac > 0 && actualEnd + 1 < points.length ? actualEnd + 1 : actualEnd;
    const taperPoints: { x: number; y: number; dist: number }[] = [];

    for (let i = startPt; i <= Math.min(endPt, actualEnd); i++) {
      taperPoints.push({ x: points[i].x, y: points[i].y, dist: lengths[i] });
    }

    if (endFrac > 0 && actualEnd + 1 < points.length) {
      const nx = points[actualEnd].x + (points[actualEnd + 1].x - points[actualEnd].x) * endFrac;
      const ny = points[actualEnd].y + (points[actualEnd + 1].y - points[actualEnd].y) * endFrac;
      const nd = lengths[actualEnd] + (lengths[Math.min(actualEnd + 1, lengths.length - 1)] - lengths[actualEnd]) * endFrac;
      taperPoints.push({ x: nx, y: ny, dist: nd });
    }

    if (taperPoints.length >= 2) {
      for (let i = 0; i < taperPoints.length - 1; i++) {
        const d0 = taperPoints[i].dist;
        const d1 = taperPoints[i + 1].dist;
        const midDist = (d0 + d1) / 2;

        if (midDist < taperStart) continue;

        const progress = Math.min(1, (midDist - taperStart) / taperZone);
        ctx.lineWidth = baseWidth * (1 - progress * 0.6);
        ctx.globalAlpha = 1 - progress * 0.3;
        ctx.beginPath();
        ctx.moveTo(taperPoints[i].x, taperPoints[i].y);
        ctx.lineTo(taperPoints[i + 1].x, taperPoints[i + 1].y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  ctx.lineWidth = baseWidth;
  ctx.restore();
}
