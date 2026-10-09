/**
 * Pure Canvas 2D renderer for the "agent grid" hero (v3): a framed cell grid around the hero copy,
 * with property icons that light up and send request packets along the grid lines into the copy panel.
 * No React and no DOM reads, so it can be reused by a Toolcraft tuning app.
 */

import { HAVEN_ICONS } from "./havenIcons";

export type Rect = { x: number; y: number; w: number; h: number };

export type GridLayout = {
  width: number;
  height: number;
  cell: number;
  cols: number;
  rows: number;
  x0: number;
  y0: number;
  /** Cell range kept empty for the hero copy: columns [c0, c1), rows [r0, r1). */
  panel: { c0: number; c1: number; r0: number; r1: number };
  /** Icon kind per cell, or -1 for an empty cell with a centre dot, or -2 for a reserved blank cell. */
  icons: Int8Array;
  labels: { col: number; row: number; text: string }[];
  /** Flickering dot-matrix blocks beside the panel, and a sparse dot cloud under it. */
  fields: { rect: Rect; denseSide: "left" | "right" }[];
  cloud: Rect | null;
};

export type Packet = { path: number[]; length: number; progress: number };

export type GridState = {
  /** Seconds; frozen when motion is reduced. */
  time: number;
  pointer: { x: number; y: number } | null;
  hover: number;
  /** 0–1 glow per cell; decays after a cell is activated. */
  activity: Float32Array;
  packets: Packet[];
  arrivals: { x: number; y: number; vertical: boolean; age: number }[];
  resolved: number;
};

export const RESOLVED_LABEL = "{resolved}";

const LILAC = [201, 193, 255] as const;
const LILAC_RGB = LILAC.join(",");
const VIOLET = "139,123,255";
const ICONS = (["wrench", "key", "phone", "message", "check", "home", "calendar"] as const).map((n) => HAVEN_ICONS[n]);
export const ICON_KINDS = ICONS.length;

let iconPaths: Path2D[] | null = null;
const icons = () => (iconPaths ??= ICONS.map((d) => new Path2D(d)));

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Deterministic 0–1 hash of three integers. */
export function hash(a: number, b: number, c = 0) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Lays out the grid so the panel snaps outward around `copy` (the hero text box). */
export function layoutHavenGrid(width: number, height: number, top: number, copy: Rect | null): GridLayout {
  const margin = width < 640 ? 12 : 16;
  const frameW = Math.min(width - margin * 2, 1180);
  const cols = width < 640 ? 6 : width < 1024 ? 10 : 12;
  const cell = frameW / cols;
  const x0 = (width - frameW) / 2;
  const y0 = top;
  const rows = Math.max(1, Math.ceil((height - y0) / cell));

  let c0 = 2;
  let c1 = cols - 2;
  let r0 = 1;
  let r1 = rows - 1;
  if (copy) {
    c0 = clamp(Math.floor((copy.x - 8 - x0) / cell), 0, cols);
    c1 = clamp(Math.ceil((copy.x + copy.w + 8 - x0) / cell), 0, cols);
    const side = Math.min(c0, cols - c1);
    c0 = side;
    c1 = cols - side;
    r0 = clamp(Math.floor((copy.y - 12 - y0) / cell), 0, rows);
    r1 = clamp(Math.ceil((copy.y + copy.h + 12 - y0) / cell), r0 + 1, rows);
  }
  const inPanel = (c: number, r: number) => c >= c0 && c < c1 && r >= r0 && r < r1;

  const lastRow = Math.max(0, Math.floor((height - y0) / cell) - 1);
  const labels = [
    { col: 0, row: 0, text: "[ 2 AGENTS ]" },
    { col: cols - 1, row: 0, text: "[ ON CALL ]" },
    { col: 0, row: lastRow, text: "[ WO-4821 ]" },
    { col: cols - 1, row: lastRow, text: RESOLVED_LABEL },
  ].filter((l) => !inPanel(l.col, l.row));

  const icons = new Int8Array(cols * rows).fill(-1);
  for (const l of labels) {
    icons[l.row * cols + l.col] = -2;
    icons[l.row * cols + (l.col === 0 ? 1 : cols - 2)] = -2;
  }

  const fields: GridLayout["fields"] = [];
  if (c0 > 0 && r1 - r0 >= 2) {
    const fy = y0 + (r1 - 2) * cell;
    fields.push({ rect: { x: x0 + (c0 - 1) * cell, y: fy, w: cell, h: cell * 2 }, denseSide: "right" });
    fields.push({ rect: { x: x0 + c1 * cell, y: fy, w: cell, h: cell * 2 }, denseSide: "left" });
    for (let r = r1 - 2; r < r1; r++) {
      icons[r * cols + c0 - 1] = -2;
      icons[r * cols + c1] = -2;
    }
  }
  const cloud = r1 < rows ? { x: x0 + c0 * cell, y: y0 + r1 * cell, w: (c1 - c0) * cell, h: cell * 1.3 } : null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (inPanel(c, r)) icons[i] = -2;
      else if (icons[i] === -1 && hash(c, r, 7) < 0.3) icons[i] = Math.floor(hash(c, r, 11) * ICON_KINDS);
    }
  }

  return { width, height, cell, cols, rows, x0, y0, panel: { c0, c1, r0, r1 }, icons, labels, fields, cloud };
}

/** Route from a cell's corner along grid lines to the nearest panel edge, as flat [x, y, x, y, …]. */
export function packetPath(L: GridLayout, index: number): number[] {
  const { cols, cell, x0, y0 } = L;
  const { c0, c1, r0, r1 } = L.panel;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const X = (c: number) => x0 + c * cell;
  const Y = (r: number) => y0 + r * cell;
  if (col < c0 || col >= c1) {
    const left = col < c0;
    const sx = left ? X(col) : X(col + 1);
    const ex = left ? X(c0) : X(c1);
    const ey = clamp(Y(row), Y(r0), Y(r1));
    const path = [sx, Y(row), ex, Y(row)];
    if (ey !== Y(row)) path.push(ex, ey);
    return path;
  }
  return row < r0 ? [X(col), Y(row), X(col), Y(r0)] : [X(col), Y(row + 1), X(col), Y(r1)];
}

export function pathLength(path: number[]) {
  let total = 0;
  for (let i = 2; i < path.length; i += 2) total += Math.hypot(path[i] - path[i - 2], path[i + 1] - path[i - 1]);
  return total;
}

function pointAt(path: number[], distance: number): [number, number] {
  let left = distance;
  for (let i = 2; i < path.length; i += 2) {
    const dx = path[i] - path[i - 2];
    const dy = path[i + 1] - path[i - 1];
    const len = Math.hypot(dx, dy);
    if (left <= len && len > 0) return [path[i - 2] + (dx * left) / len, path[i - 1] + (dy * left) / len];
    left -= len;
  }
  return [path[path.length - 2], path[path.length - 1]];
}

/** Draws one frame. The canvas transform should already map CSS pixels. */
export function drawHavenGrid(ctx: CanvasRenderingContext2D, L: GridLayout, s: GridState) {
  const { cell, cols, rows, x0, y0, width, height } = L;
  const { c0, c1, r0, r1 } = L.panel;
  const px = x0 + c0 * cell;
  const py = y0 + r0 * cell;
  const pw = (c1 - c0) * cell;
  const ph = (r1 - r0) * cell;
  const right = x0 + cols * cell;
  ctx.clearRect(0, 0, width, height);

  // Everything except the copy panel.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.rect(px, py, pw, ph);
  ctx.clip("evenodd");

  for (let i = 0; i < s.activity.length; i++) {
    const a = s.activity[i];
    if (a < 0.01 && i !== s.hover) continue;
    const x = x0 + (i % cols) * cell;
    const y = y0 + Math.floor(i / cols) * cell;
    ctx.fillStyle = `rgba(${VIOLET},${0.05 + 0.16 * a + (i === s.hover ? 0.05 : 0)})`;
    ctx.fillRect(x, y, cell, cell);
  }

  const lines = () => {
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) {
      const x = Math.round(x0 + c * cell) + 0.5;
      ctx.moveTo(x, c === 0 || c === cols ? 0 : y0);
      ctx.lineTo(x, height);
    }
    for (let r = 0; r <= rows; r++) {
      const y = Math.round(y0 + r * cell) + 0.5;
      const full = r === 0 || r === r1;
      ctx.moveTo(full ? 0 : x0, y);
      ctx.lineTo(full ? width : right, y);
    }
    ctx.stroke();
  };
  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(${LILAC_RGB},0.085)`;
  lines();
  if (s.pointer) {
    const glow = ctx.createRadialGradient(s.pointer.x, s.pointer.y, 0, s.pointer.x, s.pointer.y, cell * 2.6);
    glow.addColorStop(0, `rgba(${LILAC_RGB},0.45)`);
    glow.addColorStop(1, `rgba(${LILAC_RGB},0)`);
    ctx.strokeStyle = glow;
    lines();
  }
  if (s.hover >= 0) {
    ctx.strokeStyle = `rgba(${LILAC_RGB},0.4)`;
    ctx.strokeRect(Math.round(x0 + (s.hover % cols) * cell) + 0.5, Math.round(y0 + Math.floor(s.hover / cols) * cell) + 0.5, cell, cell);
  }

  // Cell contents: a centre dot, or an icon that brightens towards lilac while active.
  const paths = icons();
  const scale = (cell * 0.2) / 24;
  for (let i = 0; i < L.icons.length; i++) {
    const kind = L.icons[i];
    if (kind === -2) continue;
    const cx = x0 + ((i % cols) + 0.5) * cell;
    const cy = y0 + (Math.floor(i / cols) + 0.5) * cell;
    if (cy - cell / 2 > height) continue;
    if (kind === -1) {
      ctx.fillStyle = `rgba(${LILAC_RGB},0.26)`;
      ctx.fillRect(cx - 0.75, cy - 0.75, 1.5, 1.5);
      continue;
    }
    const a = Math.max(s.activity[i] ?? 0, i === s.hover ? 0.7 : 0);
    const mix = (k: number) => Math.round(255 + (LILAC[k] - 255) * a);
    ctx.save();
    ctx.translate(cx - 12 * scale, cy - 12 * scale);
    ctx.scale(scale, scale);
    ctx.lineWidth = 1.4 / scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(${mix(0)},${mix(1)},${mix(2)},${0.45 + 0.55 * a})`;
    ctx.stroke(paths[kind]);
    ctx.restore();
  }

  ctx.font = "500 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  for (const l of L.labels) {
    const text = l.text === RESOLVED_LABEL ? `[ ${s.resolved} CLOSED ]` : l.text;
    const leftSide = l.col === 0;
    ctx.textAlign = leftSide ? "left" : "right";
    ctx.fillText(text, leftSide ? x0 + 7 : right - 7, y0 + l.row * cell + 7);
  }
  ctx.textAlign = "left";

  drawDots(ctx, L, s);
  ctx.restore();

  ctx.fillStyle = "rgba(30,15,38,0.35)";
  ctx.fillRect(px, py, pw, ph);

  for (const p of s.packets) drawPacket(ctx, p);
  for (const a of s.arrivals) {
    const len = cell * (0.4 + 0.8 * a.age);
    const alpha = 1 - a.age;
    const g = a.vertical
      ? ctx.createLinearGradient(a.x, a.y - len / 2, a.x, a.y + len / 2)
      : ctx.createLinearGradient(a.x - len / 2, a.y, a.x + len / 2, a.y);
    g.addColorStop(0, `rgba(${LILAC_RGB},0)`);
    g.addColorStop(0.5, `rgba(${LILAC_RGB},${0.9 * alpha})`);
    g.addColorStop(1, `rgba(${LILAC_RGB},0)`);
    ctx.fillStyle = g;
    if (a.vertical) ctx.fillRect(a.x - 0.75, a.y - len / 2, 1.5, len);
    else ctx.fillRect(a.x - len / 2, a.y - 0.75, len, 1.5);
  }

  // Corner badges on the panel and crosshairs on the frame.
  ctx.strokeStyle = `rgba(${LILAC_RGB},0.3)`;
  ctx.beginPath();
  for (const [x, y] of [
    [x0, y0],
    [right, y0],
    [px, py + ph],
    [px + pw, py + ph],
  ]) {
    ctx.moveTo(x - 5, y + 0.5);
    ctx.lineTo(x + 6, y + 0.5);
    ctx.moveTo(x + 0.5, y - 5);
    ctx.lineTo(x + 0.5, y + 6);
  }
  ctx.stroke();
  if (c0 > 0) {
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const x of [px, px + pw]) {
      ctx.fillStyle = "#26132f";
      ctx.fillRect(x - 12, py - 12, 24, 24);
      ctx.strokeRect(Math.round(x - 12) + 0.5, Math.round(py - 12) + 0.5, 24, 24);
      ctx.fillStyle = `rgba(${LILAC_RGB},0.85)`;
      ctx.fillText("✦", x, py + 0.5);
    }
    ctx.textAlign = "left";
  }
}

const DOT_LEVELS = [0.16, 0.34, 0.7];

function drawDots(ctx: CanvasRenderingContext2D, L: GridLayout, s: GridState) {
  const buckets = DOT_LEVELS.map(() => new Path2D());
  const scanY = L.fields.length ? L.fields[0].rect.y + ((s.time * 36) % (L.fields[0].rect.h + 40)) - 20 : -1;

  for (const { rect, denseSide } of L.fields) {
    const pitch = 5;
    const nx = Math.floor(rect.w / pitch);
    const ny = Math.floor(rect.h / pitch);
    for (let ix = 0; ix < nx; ix++) {
      const toward = denseSide === "right" ? ix / nx : 1 - ix / nx;
      const density = 0.08 + 0.62 * toward ** 1.6;
      for (let iy = 0; iy < ny; iy++) {
        const gx = Math.round(rect.x / pitch) + ix;
        const tick = Math.floor(s.time * 5 + hash(gx, iy, 3) * 10);
        if (hash(gx, iy, tick) > density) continue;
        const y = rect.y + iy * pitch + 2;
        const level = Math.abs(y - scanY) < 7 ? 2 : hash(gx, iy, 5) < 0.3 ? 1 : 0;
        buckets[level].rect(rect.x + ix * pitch + 2, y, 1.6, 1.6);
      }
    }
  }

  if (L.cloud) {
    const { x, y, w, h } = L.cloud;
    const pitch = 7;
    for (let ix = 0; ix < w / pitch; ix++) {
      const fromCentre = Math.abs(ix * pitch - w / 2) / (w / 2);
      for (let iy = 0; iy < h / pitch; iy++) {
        const density = 0.3 * (1 - iy / (h / pitch)) ** 2 * (1 - fromCentre ** 2);
        if (hash(ix, iy, 21) > density) continue;
        const twinkle = hash(ix, iy, Math.floor(s.time * 2 + hash(ix, iy, 9) * 8));
        buckets[twinkle < 0.15 ? 2 : twinkle < 0.5 ? 1 : 0].rect(x + ix * pitch, y + iy * pitch + 4, 1.5, 1.5);
      }
    }
  }

  buckets.forEach((path, i) => {
    ctx.fillStyle = `rgba(${LILAC_RGB},${DOT_LEVELS[i]})`;
    ctx.fill(path);
  });
}

function drawPacket(ctx: CanvasRenderingContext2D, p: Packet) {
  const head = p.progress * p.length;
  const tail = Math.max(0, head - 80);
  const [hx, hy] = pointAt(p.path, head);
  const [tx, ty] = pointAt(p.path, tail);
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  let walked = 0;
  for (let i = 2; i < p.path.length; i += 2) {
    walked += Math.hypot(p.path[i] - p.path[i - 2], p.path[i + 1] - p.path[i - 1]);
    if (walked > tail && walked < head) ctx.lineTo(p.path[i], p.path[i + 1]);
  }
  ctx.lineTo(hx, hy);
  const trail = ctx.createLinearGradient(tx, ty, hx, hy);
  trail.addColorStop(0, `rgba(${VIOLET},0)`);
  trail.addColorStop(1, `rgba(${LILAC_RGB},0.9)`);
  ctx.strokeStyle = trail;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = `rgba(${VIOLET},0.3)`;
  ctx.beginPath();
  ctx.arc(hx, hy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(hx - 1.5, hy - 1.5, 3, 3);
}
