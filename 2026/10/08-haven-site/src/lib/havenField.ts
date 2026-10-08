export type HavenFieldParams = Readonly<{
  glowColor: string;
  accentColor: string;
  lineColor: string;
  lineOpacity: number;
  glowIntensity: number;
  gridDensity: number;
  horizon: number;
  signalCount: number;
  phase: number;
}>;

export const defaultHavenFieldParams: HavenFieldParams = {
  glowColor: "#5740ef",
  accentColor: "#c9c1ff",
  lineColor: "#8b7bff",
  lineOpacity: 0.35,
  glowIntensity: 0.55,
  gridDensity: 22,
  horizon: 0.58,
  signalCount: 9,
  phase: 0,
};

const TAU = Math.PI * 2;

function rgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value.slice(0, 6);
  const n = Number.parseInt(full, 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function seeded(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function drawHavenField(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: HavenFieldParams,
): void {
  drawHavenGlow(ctx, width, height, params);
  drawHavenLines(ctx, width, height, params);
}

/**
 * Soft background glow only. It has no hard edges, so callers can render it into a
 * small offscreen canvas and scale it up: full-screen gradient fills are the bulk of the raster cost.
 */
export function drawHavenGlow(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: HavenFieldParams,
): void {
  const t = ((params.phase % 1) + 1) % 1;
  const horizonY = height * params.horizon;
  const unit = Math.min(width, height);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const blobs = [
    { x: 0.5, y: params.horizon - 0.08, r: 0.75, k: 0 },
    { x: 0.22, y: params.horizon - 0.25, r: 0.5, k: 1 },
    { x: 0.8, y: params.horizon - 0.2, r: 0.55, k: 2 },
  ];
  for (const blob of blobs) {
    const angle = TAU * t + blob.k * 2.1;
    const bx = width * (blob.x + 0.05 * Math.cos(angle));
    const by = height * (blob.y + 0.04 * Math.sin(angle * 2));
    const radius = unit * blob.r;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
    const color = blob.k === 0 ? params.glowColor : params.lineColor;
    g.addColorStop(0, rgba(color, 0.55 * params.glowIntensity));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  const glowTop = horizonY - unit * 0.16;
  const glowSpan = unit * 0.26;
  const horizonGlow = ctx.createLinearGradient(0, glowTop, 0, glowTop + glowSpan);
  horizonGlow.addColorStop(0, rgba(params.accentColor, 0));
  horizonGlow.addColorStop(0.62, rgba(params.accentColor, 0.2 * params.glowIntensity));
  horizonGlow.addColorStop(1, rgba(params.accentColor, 0));
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, glowTop, width, glowSpan);
  ctx.restore();
}

/** Grid, signals and dust: the crisp layer that needs full resolution. */
export function drawHavenLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: HavenFieldParams,
): void {
  const t = ((params.phase % 1) + 1) % 1;
  const horizonY = height * params.horizon;
  const cx = width / 2;
  const unit = Math.min(width, height);

  ctx.save();
  const floorHeight = height - horizonY;
  const lanes = Math.max(4, Math.round(params.gridDensity));
  const spread = width * 1.6;
  ctx.lineWidth = Math.max(1, unit / 900);

  for (let i = 0; i <= lanes; i += 1) {
    const u = i / lanes - 0.5;
    const edge = Math.abs(u) * 2;
    ctx.strokeStyle = rgba(params.lineColor, params.lineOpacity * (1 - edge * 0.6));
    ctx.beginPath();
    ctx.moveTo(cx + u * width * 0.08, horizonY);
    ctx.lineTo(cx + u * spread, height);
    ctx.stroke();
  }

  const rows = Math.max(4, Math.round(params.gridDensity * 0.6));
  for (let j = 0; j < rows; j += 1) {
    const depth = (j + t) / rows;
    const z = depth * depth;
    const y = horizonY + floorHeight * z;
    const halfWidth = (width * 0.04 + (spread / 2) * z);
    ctx.strokeStyle = rgba(params.lineColor, params.lineOpacity * Math.min(1, z * 2.5));
    ctx.beginPath();
    ctx.moveTo(cx - halfWidth, y);
    ctx.lineTo(cx + halfWidth, y);
    ctx.stroke();
  }

  const signals = Math.max(0, Math.round(params.signalCount));
  for (let s = 0; s < signals; s += 1) {
    const u = (s + 0.2 + 0.6 * seeded(s, 1)) / signals - 0.5;
    const depth = 0.25 + 0.7 * seeded(s, 2);
    const z = depth * depth;
    const px = cx + u * (width * 0.08 + spread * z);
    const py = horizonY + floorHeight * z;
    const scale = 0.25 + z;
    const life = (t + seeded(s, 3)) % 1;

    for (let ring = 0; ring < 2; ring += 1) {
      const p = (life + ring * 0.5) % 1;
      const rx = unit * 0.16 * scale * p;
      ctx.strokeStyle = rgba(params.accentColor, (1 - p) * 0.7);
      ctx.lineWidth = Math.max(1, unit / 700) * (1 - p * 0.5);
      ctx.beginPath();
      ctx.ellipse(px, py, rx, rx * 0.32, 0, 0, TAU);
      ctx.stroke();
    }

    const pulse = 0.6 + 0.4 * Math.sin(TAU * (life * 2));
    const dot = ctx.createRadialGradient(px, py, 0, px, py, unit * 0.025 * scale);
    dot.addColorStop(0, rgba("#ffffff", 0.95 * pulse));
    dot.addColorStop(0.3, rgba(params.accentColor, 0.8 * pulse));
    dot.addColorStop(1, rgba(params.accentColor, 0));
    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(px, py, unit * 0.025 * scale, 0, TAU);
    ctx.fill();

    const beam = ctx.createLinearGradient(px, py, px, py - unit * 0.2 * scale);
    beam.addColorStop(0, rgba(params.accentColor, 0.35 * pulse));
    beam.addColorStop(1, rgba(params.accentColor, 0));
    ctx.fillStyle = beam;
    ctx.fillRect(px - 0.75, py - unit * 0.2 * scale, 1.5, unit * 0.2 * scale);
  }

  const dust = 60;
  for (let d = 0; d < dust; d += 1) {
    const x = seeded(d, 7) * width;
    const y = seeded(d, 8) * horizonY * 0.95;
    const twinkle = 0.5 + 0.5 * Math.sin(TAU * (t * 2 + seeded(d, 9)));
    ctx.fillStyle = rgba(params.accentColor, 0.5 * twinkle * seeded(d, 10));
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  ctx.restore();
}
