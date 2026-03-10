import { useState, useEffect, useCallback, useRef } from "react";
import opentype from "opentype.js";

// ─────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────

type Phase = "idle" | "signing" | "accepted";

interface SampledPoint {
  x: number;
  y: number;
}

interface GlyphStroke {
  points: SampledPoint[];
  lengths: number[]; // cumulative distance at each point
  totalLength: number;
}

const FONT_SIZE = 80;
const PAD = 16;
const STROKE_COLOR = "#ede8e0";
const STROKE_WIDTH = 2.2;
const MIN_STROKE_DUR = 400;
const MAX_STROKE_DUR = 1400;
const LETTER_PAUSE = 100; // ms between letters
const CONTOUR_PAUSE = 40; // ms between contours within a letter

// ─────────────────────────────────────────────────────────────────
// Math
// ─────────────────────────────────────────────────────────────────

/** cubic-bezier(0, 0, 0, 1) — slow build, accelerates to finish */
function cubicBezierEase(t: number): number {
  const x1 = 0, y1 = 0, x2 = 0, y2 = 1;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const xu =
      3 * x1 * (1 - u) * (1 - u) * u +
      3 * x2 * (1 - u) * u * u +
      u * u * u;
    const dxu =
      3 * x1 * (1 - u) * (1 - u) -
      6 * x1 * (1 - u) * u +
      6 * x2 * (1 - u) * u -
      3 * x2 * u * u +
      3 * u * u;
    if (Math.abs(dxu) < 1e-6) break;
    u -= (xu - t) / dxu;
    u = Math.max(0, Math.min(1, u));
  }
  return (
    3 * y1 * (1 - u) * (1 - u) * u +
    3 * y2 * (1 - u) * u * u +
    u * u * u
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

// ─────────────────────────────────────────────────────────────────
// Path sampling — convert SVG path to point arrays
// ─────────────────────────────────────────────────────────────────

const _svgNs = "http://www.w3.org/2000/svg";
let _measureSvg: SVGSVGElement | null = null;
let _measurePath: SVGPathElement | null = null;

function ensureMeasureElements() {
  if (!_measureSvg) {
    _measureSvg = document.createElementNS(_svgNs, "svg");
    _measurePath = document.createElementNS(_svgNs, "path");
    _measureSvg.appendChild(_measurePath);
    _measureSvg.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none";
    document.body.appendChild(_measureSvg);
  }
}

/** Split an SVG path `d` into individual subpaths (M...M) */
function splitContours(d: string): string[] {
  return d
    .split(/(?=M)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
}

/** Sample evenly-spaced points along an SVG path */
function samplePath(d: string, spacing = 1.5): SampledPoint[] {
  ensureMeasureElements();
  _measurePath!.setAttribute("d", d);
  const totalLen = _measurePath!.getTotalLength();
  if (totalLen < 1) return [];

  const count = Math.max(2, Math.ceil(totalLen / spacing));
  const points: SampledPoint[] = [];
  for (let i = 0; i <= count; i++) {
    const pt = _measurePath!.getPointAtLength((i / count) * totalLen);
    points.push({ x: pt.x, y: pt.y });
  }
  return points;
}

/** Compute cumulative lengths for a point array */
function computeLengths(points: SampledPoint[]): {
  lengths: number[];
  totalLength: number;
} {
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

/** Binary search for point index at a given distance */
function findPointAtDistance(
  lengths: number[],
  distance: number
): { index: number; frac: number } {
  if (distance <= 0) return { index: 0, frac: 0 };
  if (distance >= lengths[lengths.length - 1])
    return { index: lengths.length - 1, frac: 0 };

  let lo = 0,
    hi = lengths.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (lengths[mid] <= distance) lo = mid;
    else hi = mid;
  }
  const segLen = lengths[hi] - lengths[lo];
  const frac = segLen > 0 ? (distance - lengths[lo]) / segLen : 0;
  return { index: lo, frac };
}

// ─────────────────────────────────────────────────────────────────
// Canvas drawing
// ─────────────────────────────────────────────────────────────────

function drawStrokeFull(
  ctx: CanvasRenderingContext2D,
  points: SampledPoint[]
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function drawStrokePartialWithTaper(
  ctx: CanvasRenderingContext2D,
  points: SampledPoint[],
  endIndex: number,
  endFrac: number,
  lengths: number[],
  currentDistance: number,
  baseWidth: number
) {
  if (points.length < 2 || endIndex < 0) return;
  const actualEnd = Math.min(endIndex, points.length - 1);
  const taperZone = currentDistance * 0.08;
  const taperStart = currentDistance - taperZone;

  // Main body
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
    const nx =
      points[actualEnd].x +
      (points[actualEnd + 1].x - points[actualEnd].x) * endFrac;
    const ny =
      points[actualEnd].y +
      (points[actualEnd + 1].y - points[actualEnd].y) * endFrac;
    ctx.lineTo(nx, ny);
  }
  ctx.stroke();

  // Taper overdraw
  if (taperZone > 1 && taperBeginIdx <= actualEnd) {
    const startPt = Math.max(0, taperBeginIdx - 1);
    const taperPts: { x: number; y: number; dist: number }[] = [];

    for (let i = startPt; i <= Math.min(actualEnd, points.length - 1); i++) {
      taperPts.push({ x: points[i].x, y: points[i].y, dist: lengths[i] });
    }
    if (endFrac > 0 && actualEnd + 1 < points.length) {
      const nx =
        points[actualEnd].x +
        (points[actualEnd + 1].x - points[actualEnd].x) * endFrac;
      const ny =
        points[actualEnd].y +
        (points[actualEnd + 1].y - points[actualEnd].y) * endFrac;
      const nd =
        lengths[actualEnd] +
        (lengths[Math.min(actualEnd + 1, lengths.length - 1)] -
          lengths[actualEnd]) *
          endFrac;
      taperPts.push({ x: nx, y: ny, dist: nd });
    }

    if (taperPts.length >= 2) {
      for (let i = 0; i < taperPts.length - 1; i++) {
        const midDist = (taperPts[i].dist + taperPts[i + 1].dist) / 2;
        if (midDist < taperStart) continue;
        const progress = Math.min(1, (midDist - taperStart) / taperZone);
        ctx.lineWidth = baseWidth * (1 - progress * 0.5);
        ctx.globalAlpha = 1 - progress * 0.35;
        ctx.beginPath();
        ctx.moveTo(taperPts[i].x, taperPts[i].y);
        ctx.lineTo(taperPts[i + 1].x, taperPts[i + 1].y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  ctx.lineWidth = baseWidth;
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────
// Glyph processing — build strokes from font glyphs
// ─────────────────────────────────────────────────────────────────

interface LetterGroup {
  strokes: GlyphStroke[];
}

function buildLetterGroups(
  font: opentype.Font,
  text: string
): { groups: LetterGroup[]; width: number; height: number; ascender: number } {
  const scale = FONT_SIZE / font.unitsPerEm;
  const ascender = font.ascender * scale;
  const descender = Math.abs(font.descender * scale);
  const height = ascender + descender;

  const glyphs = font.stringToGlyphs(text.trim());
  const groups: LetterGroup[] = [];
  let x = 0;

  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    const path = glyph.getPath(x, ascender, FONT_SIZE);
    const d = path.toPathData(2);
    const strokes: GlyphStroke[] = [];

    if (d && d.length > 5) {
      for (const contour of splitContours(d)) {
        const points = samplePath(contour, 1.5);
        if (points.length >= 2) {
          const { lengths, totalLength } = computeLengths(points);
          if (totalLength > 1) {
            strokes.push({ points, lengths, totalLength });
          }
        }
      }
    }

    if (strokes.length > 0) {
      groups.push({ strokes });
    }

    const advance = (glyph.advanceWidth || 0) * scale;
    const kern =
      i < glyphs.length - 1
        ? font.getKerningValue(glyph, glyphs[i + 1]) * scale
        : 0;
    x += advance + kern;
  }

  return { groups, width: x, height, ascender };
}

// ─────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function CheckIcon({ animated = false }: { animated?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline
        points="20 6 9 17 4 12"
        {...(animated
          ? {
              style: {
                strokeDasharray: 25,
                strokeDashoffset: 25,
                animation: "draw-check 500ms ease-out 300ms forwards",
              },
            }
          : {})}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export default function SignatureWriter() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [font, setFont] = useState<opentype.Font | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const letterGroupsRef = useRef<LetterGroup[]>([]);
  const canvasDimsRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0, scale: 1 });

  // ── Load font ────────────────────────────────────────────────
  useEffect(() => {
    opentype.load("/fonts/Sacramento-Regular.ttf").then((f) => {
      setFont(f);
      setFontLoaded(true);
    });
  }, []);

  // ── Setup canvas for retina ──────────────────────────────────
  const setupCanvas = useCallback(
    (
      width: number,
      height: number
    ) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Scale glyph coordinate system to fit the container
      const scaleX = (containerWidth - PAD * 2) / width;
      const scaleY = (containerHeight - PAD * 2) / height;
      const scale = Math.min(scaleX, scaleY);

      const drawW = width * scale;
      const drawH = height * scale;
      const offsetX = (containerWidth - drawW) / 2;
      const offsetY = (containerHeight - drawH) / 2;

      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      canvasDimsRef.current = { w: containerWidth, h: containerHeight, offsetX, offsetY, scale };
    },
    []
  );

  // ── Get configured context ───────────────────────────────────
  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 1;
    return ctx;
  }, []);

  // ── Animation ────────────────────────────────────────────────
  const playAnimation = useCallback(() => {
    const groups = letterGroupsRef.current;
    if (groups.length === 0) return;

    const ctx = getCtx();
    if (!ctx) return;
    const { w, h, offsetX, offsetY, scale } = canvasDimsRef.current;
    const scaledWidth = STROKE_WIDTH / scale;

    // Build timeline: each stroke gets its own entry
    interface TimelineEntry {
      groupIdx: number;
      strokeIdx: number;
      stroke: GlyphStroke;
      startTime: number;
      duration: number;
    }

    const timeline: TimelineEntry[] = [];
    let t = 0;

    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      for (let s = 0; s < group.strokes.length; s++) {
        const stroke = group.strokes[s];
        const dur = clamp(
          (stroke.totalLength / 150) * 600,
          MIN_STROKE_DUR,
          MAX_STROKE_DUR
        );
        timeline.push({
          groupIdx: g,
          strokeIdx: s,
          stroke,
          startTime: t,
          duration: dur,
        });
        // Pause: bigger between letters, smaller between contours of same letter
        const isLastStrokeInGroup = s === group.strokes.length - 1;
        t += dur + (isLastStrokeInGroup ? LETTER_PAUSE : CONTOUR_PAUSE);
      }
    }

    const totalDuration = t - LETTER_PAUSE; // trim trailing pause
    const startTime = performance.now();

    const frame = () => {
      const elapsed = performance.now() - startTime;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.strokeStyle = STROKE_COLOR;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = scaledWidth;
      ctx.globalAlpha = 1;

      for (const entry of timeline) {
        const localElapsed = elapsed - entry.startTime;

        if (localElapsed <= 0) continue;

        if (localElapsed >= entry.duration) {
          drawStrokeFull(ctx, entry.stroke.points);
          continue;
        }

        // In progress
        const rawT = localElapsed / entry.duration;
        const easedT = cubicBezierEase(rawT);
        const dist = easedT * entry.stroke.totalLength;
        const { index, frac } = findPointAtDistance(entry.stroke.lengths, dist);

        drawStrokePartialWithTaper(
          ctx,
          entry.stroke.points,
          index,
          frac,
          entry.stroke.lengths,
          dist,
          scaledWidth
        );
      }

      ctx.restore();

      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // Final clean frame
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = scaledWidth;
        for (const group of groups) {
          for (const stroke of group.strokes) {
            drawStrokeFull(ctx, stroke.points);
          }
        }
        ctx.restore();
        setTimeout(() => setPhase("accepted"), 400);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [getCtx]);

  // ── Sign handler ─────────────────────────────────────────────
  const handleSign = useCallback(() => {
    if (!font || !name.trim()) return;

    const { groups, width, height } = buildLetterGroups(font, name);
    letterGroupsRef.current = groups;

    setPhase("signing");

    // Wait one frame for the canvas to mount, then setup + animate
    requestAnimationFrame(() => {
      setupCanvas(width, height);
      playAnimation();
    });
  }, [font, name, setupCanvas, playAnimation]);

  // ── Reset ────────────────────────────────────────────────────
  const handleReset = () => {
    cancelAnimationFrame(rafRef.current);
    letterGroupsRef.current = [];
    setPhase("idle");
    setName("");
  };

  // Clean up on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const canSign = name.trim().length > 0 && fontLoaded;

  return (
    <div className="min-h-screen grid place-items-center bg-[#141414] p-6 font-body antialiased selection:bg-white/10">
      <div className="w-full max-w-[420px]">
        <div
          className={`
            bg-[#1c1c1c] border rounded-2xl p-7 flex flex-col gap-6
            shadow-2xl shadow-black/50 transition-colors duration-700
            ${phase === "accepted" ? "border-emerald-500/10" : "border-white/[0.06]"}
          `}
        >
          {/* ── Icon Badge ──────────────────────────────────── */}
          <div
            className={`
              size-10 rounded-full grid place-items-center border
              transition-all duration-700
              ${
                phase === "accepted"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-white/[0.03] border-white/[0.06] text-white/40"
              }
            `}
          >
            {phase === "accepted" ? <CheckIcon animated /> : <PencilIcon />}
          </div>

          {/* ── Title & Description ─────────────────────────── */}
          <div className="space-y-3">
            <h2 className="text-[22px] font-heading text-white/90 tracking-[-0.01em] leading-tight">
              {phase === "accepted" ? "Contract Signed" : "Sign the Contract"}
            </h2>
            <p className="text-[13px] text-white/35 leading-[1.65] font-body">
              {phase === "accepted" ? (
                "Your signature has been recorded. The contract is now in effect."
              ) : (
                <>
                  Since you've read the fine lines, type your name to confirm
                  you agree with{" "}
                  <span className="text-white/55">the terms</span>.
                </>
              )}
            </p>
          </div>

          {/* ── Signature Pad ───────────────────────────────── */}
          <div className="relative bg-[#111] border border-white/[0.04] rounded-xl overflow-hidden">
            <div
              ref={containerRef}
              className="px-5 pt-5 pb-3 min-h-[96px] flex items-center justify-center"
            >
              {/* Input (idle) */}
              {phase === "idle" && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && canSign && handleSign()
                  }
                  placeholder="Your full name"
                  disabled={!fontLoaded}
                  autoFocus
                  className="w-full bg-transparent text-[#ede8e0] text-[34px] font-signature text-center outline-none placeholder:text-white/[0.12] disabled:opacity-30 leading-none"
                />
              )}

              {/* Canvas-based animated signature */}
              {(phase === "signing" || phase === "accepted") && (
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                  style={{ animation: "fade-in 200ms ease both" }}
                />
              )}
            </div>

            {/* Signature line */}
            <div className="mx-5 h-px bg-white/[0.06]" />

            {/* Label */}
            <p className="text-center text-[9px] text-white/[0.15] uppercase tracking-[0.25em] py-2.5 font-body select-none">
              Signature
            </p>
          </div>

          {/* ── Button ──────────────────────────────────────── */}
          {phase === "accepted" ? (
            <button
              onClick={handleReset}
              className="
                w-full h-11 rounded-xl text-[13px] font-medium font-body
                bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/15
                cursor-pointer hover:bg-emerald-500/[0.12]
                active:scale-[0.98] transition-all duration-200
              "
            >
              Accepted
            </button>
          ) : (
            <button
              onClick={handleSign}
              disabled={!canSign || phase === "signing"}
              className="
                w-full h-11 rounded-xl text-[13px] font-medium font-body
                bg-white text-[#111] cursor-pointer
                hover:bg-white/90 active:scale-[0.98]
                disabled:opacity-20 disabled:cursor-not-allowed disabled:active:scale-100
                transition-all duration-200
              "
            >
              {phase === "signing" ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="size-1.5 rounded-full bg-current"
                    style={{ animation: "pulse-dot 1.2s ease infinite" }}
                  />
                  Signing
                </span>
              ) : (
                "Sign & Accept"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
