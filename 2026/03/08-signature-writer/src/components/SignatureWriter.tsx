import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import opentype from "opentype.js";
import confetti from "canvas-confetti";

// ─────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────

type Phase = "idle" | "signing" | "accepted";

interface SampledPoint {
  x: number;
  y: number;
}

interface ContourStroke {
  points: SampledPoint[];
  lengths: number[];
  totalLength: number;
}

interface SignatureData {
  fullPath: opentype.Path; // for final filled render
  contours: ContourStroke[]; // individual contour strokes for animation
  width: number;
  height: number;
  ascender: number;
}

const FONT_SIZE = 80;
const FILL_COLOR = "#ede8e0";
const STROKE_W = 1; // stroke width in font units

// Per-contour timeline constants
const TOTAL_CAP = 1200; // hard cap: entire animation ≤ 1.2s
const PAUSE = 0;

// ─────────────────────────────────────────────────────────────────
// Math
// ─────────────────────────────────────────────────────────────────

/** cubic-bezier(0, 0, 0, 1) — slow build, accelerates to finish */
function cubicBezierEase(t: number): number {
  const x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 1;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const xu =
      3 * x1 * (1 - u) * (1 - u) * u + 3 * x2 * (1 - u) * u * u + u * u * u;
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
  return 3 * y1 * (1 - u) * (1 - u) * u + 3 * y2 * (1 - u) * u * u + u * u * u;
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
  distance: number,
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
// Glyph processing — build signature data with per-contour strokes
// ─────────────────────────────────────────────────────────────────

function buildSignatureData(font: opentype.Font, text: string): SignatureData {
  const trimmed = text.trim();
  const scale = FONT_SIZE / font.unitsPerEm;
  const ascender = font.ascender * scale;
  const descender = Math.abs(font.descender * scale);
  const height = ascender + descender;

  // Single combined filled path for the whole name (used at end)
  const fullPath = font.getPath(trimmed, 0, ascender, FONT_SIZE);
  const d = fullPath.toPathData(2);

  // Compute total width via glyph advances
  const glyphs = font.stringToGlyphs(trimmed);
  let totalWidth = 0;
  for (let i = 0; i < glyphs.length; i++) {
    const advance = (glyphs[i].advanceWidth || 0) * scale;
    const kern =
      i < glyphs.length - 1
        ? font.getKerningValue(glyphs[i], glyphs[i + 1]) * scale
        : 0;
    totalWidth += advance + kern;
  }

  // Sample contours into individual strokes, sorted left-to-right
  const contourStrings = splitContours(d);
  const contourData: { minX: number; stroke: ContourStroke }[] = [];

  for (const contour of contourStrings) {
    const points = samplePath(contour, 1.5);
    if (points.length >= 2) {
      const minX = Math.min(...points.map((p) => p.x));
      const { lengths, totalLength } = computeLengths(points);
      contourData.push({ minX, stroke: { points, lengths, totalLength } });
    }
  }

  contourData.sort((a, b) => a.minX - b.minX);

  return {
    fullPath,
    contours: contourData.map((c) => c.stroke),
    width: totalWidth,
    height,
    ascender,
  };
}

// ─────────────────────────────────────────────────────────────────
// Stroke drawing — ported from 10-follow-draw/src/drawing.ts
// ─────────────────────────────────────────────────────────────────

/** Draw a complete contour stroke */
function drawContourFull(
  ctx: CanvasRenderingContext2D,
  contour: ContourStroke,
) {
  if (contour.points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(contour.points[0].x, contour.points[0].y);
  for (let i = 1; i < contour.points.length; i++) {
    ctx.lineTo(contour.points[i].x, contour.points[i].y);
  }
  ctx.stroke();
}

/** Draw a partial contour stroke with trailing taper */
function drawContourWithTaper(
  ctx: CanvasRenderingContext2D,
  contour: ContourStroke,
  endIndex: number,
  endFrac: number,
  currentDistance: number,
  baseWidth: number,
) {
  const { points, lengths } = contour;
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

  // Interpolated fractional endpoint
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

  // Overdraw taper zone with decreasing width + opacity
  if (taperZone > 2 && taperBeginIdx <= actualEnd) {
    const startPt = Math.max(0, taperBeginIdx - 1);
    const endPt =
      endFrac > 0 && actualEnd + 1 < points.length ? actualEnd + 1 : actualEnd;
    const taperPoints: { x: number; y: number; dist: number }[] = [];

    for (let i = startPt; i <= Math.min(endPt, actualEnd); i++) {
      taperPoints.push({ x: points[i].x, y: points[i].y, dist: lengths[i] });
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

/** Trace an opentype.Path onto a canvas context without filling/stroking */
function tracePath(ctx: CanvasRenderingContext2D, path: opentype.Path) {
  ctx.beginPath();
  for (const cmd of path.commands) {
    switch (cmd.type) {
      case "M":
        ctx.moveTo(cmd.x, cmd.y);
        break;
      case "L":
        ctx.lineTo(cmd.x, cmd.y);
        break;
      case "Q":
        ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
        break;
      case "C":
        ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2!, cmd.y2!, cmd.x, cmd.y);
        break;
      case "Z":
        ctx.closePath();
        break;
    }
  }
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

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export default function SignatureWriter() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [closing, setClosing] = useState(false);
  const [font, setFont] = useState<opentype.Font | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const sigDataRef = useRef<SignatureData | null>(null);
  const canvasDimsRef = useRef({
    w: 0,
    h: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });

  // ── Load font ────────────────────────────────────────────────
  useEffect(() => {
    opentype.load("/fonts/Sacramento-Regular.ttf").then((f) => {
      setFont(f);
      setFontLoaded(true);
    });
  }, []);

  // ── Setup canvas for modal ──────────────────────────────────
  const setupCanvas = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Scale to fill ~85% of modal container width
    const maxDrawWidth = containerWidth * 0.85;
    const scale = Math.min(
      maxDrawWidth / width,
      (containerHeight * 0.6) / height,
    );

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

    canvasDimsRef.current = {
      w: containerWidth,
      h: containerHeight,
      offsetX,
      offsetY,
      scale,
    };
  }, []);

  // ── Draw filled text ────────────────────────────────────────
  const drawFilledText = useCallback(
    (ctx: CanvasRenderingContext2D, sigData: SignatureData) => {
      const { w, h, offsetX, offsetY, scale } = canvasDimsRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.fillStyle = FILL_COLOR;
      tracePath(ctx, sigData.fullPath);
      ctx.fill();
      ctx.restore();
    },
    [],
  );

  // ── Fire confetti ───────────────────────────────────────────
  const fireConfetti = useCallback(() => {
    const defaults = {
      colors: ["#34d399", "#6ee7b7", "#a7f3d0", "#ffffff", "#d1fae5"],
      disableForReducedMotion: true,
    };
    confetti({
      ...defaults,
      particleCount: 60,
      spread: 55,
      origin: { x: 0.4, y: 0.5 },
    });
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 40,
        spread: 65,
        origin: { x: 0.6, y: 0.5 },
      });
    }, 250);
  }, []);

  // ── Animation — per-contour timeline with taper ─────────────
  const playAnimation = useCallback(() => {
    const sigData = sigDataRef.current;
    if (!sigData || sigData.contours.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { offsetX, offsetY, scale } = canvasDimsRef.current;
    const dpr = window.devicePixelRatio || 1;
    const { contours } = sigData;

    // Build per-contour timeline, then scale to fit within TOTAL_CAP
    const totalPause = Math.max(0, (contours.length - 1) * PAUSE);
    const availableAnimTime = TOTAL_CAP - totalPause;

    // Distribute time proportionally by contour length
    const totalArcLen = contours.reduce((s, c) => s + c.totalLength, 0);
    const durations = contours.map((c) =>
      totalArcLen > 0
        ? (c.totalLength / totalArcLen) * availableAnimTime
        : availableAnimTime / contours.length,
    );

    const timeline: {
      contourIndex: number;
      startTime: number;
      duration: number;
    }[] = [];
    let t = 0;
    for (let i = 0; i < contours.length; i++) {
      timeline.push({ contourIndex: i, startTime: t, duration: durations[i] });
      t += durations[i] + PAUSE;
    }
    const totalDuration = TOTAL_CAP;

    const startTime = performance.now();

    const frame = () => {
      const elapsed = performance.now() - startTime;

      // Clear canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Set stroke style in transformed space
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.strokeStyle = FILL_COLOR;
      ctx.lineWidth = STROKE_W;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const entry of timeline) {
        const contour = contours[entry.contourIndex];
        const localElapsed = elapsed - entry.startTime;

        if (localElapsed <= 0) continue;

        if (localElapsed >= entry.duration) {
          // Completed — draw full stroke
          drawContourFull(ctx, contour);
          continue;
        }

        // In progress — draw partial with taper
        const rawT = localElapsed / entry.duration;
        const easedT = cubicBezierEase(rawT);
        const dist = easedT * contour.totalLength;
        const { index, frac } = findPointAtDistance(contour.lengths, dist);
        drawContourWithTaper(ctx, contour, index, frac, dist, STROKE_W);
      }

      ctx.restore();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // Final frame — transition to filled text
        drawFilledText(ctx, sigData);
        setPhase("accepted");
        fireConfetti();
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [drawFilledText, fireConfetti]);

  // ── Trigger animation when modal mounts in signing phase ────
  useEffect(() => {
    if (phase !== "signing") return;
    const sigData = sigDataRef.current;
    if (!sigData) return;

    // Wait one rAF for the modal portal to mount
    const id = requestAnimationFrame(() => {
      setupCanvas(sigData.width, sigData.height);
      playAnimation();
    });
    return () => cancelAnimationFrame(id);
  }, [phase, setupCanvas, playAnimation]);

  // ── Sign handler ─────────────────────────────────────────────
  const handleSign = useCallback(() => {
    if (!font || !name.trim()) return;
    sigDataRef.current = buildSignatureData(font, name);
    setPhase("signing");
  }, [font, name]);

  // ── Close modal with exit animation ─────────────────────────
  const handleClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      sigDataRef.current = null;
      setPhase("idle");
      setName("");
      setClosing(false);
    }, 300);
  }, [closing]);

  // ── Escape key handler ──────────────────────────────────────
  useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleClose]);

  // Clean up on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const canSign = name.trim().length > 0 && fontLoaded;
  const modalOpen = phase !== "idle";

  return (
    <div className="min-h-screen grid place-items-center bg-[#141414] p-6 font-body antialiased selection:bg-white/10">
      <div className="w-full max-w-[420px]">
        <div className="bg-[#1c1c1c] border border-white/[0.06] rounded-2xl p-7 flex flex-col gap-6 shadow-2xl shadow-black/50">
          {/* ── Icon Badge ──────────────────────────────────── */}
          <div className="size-10 rounded-full grid place-items-center border bg-white/[0.03] border-white/[0.06] text-white/40">
            <PencilIcon />
          </div>

          {/* ── Title & Description ─────────────────────────── */}
          <div className="space-y-3">
            <h2 className="text-[22px] font-heading text-white/90 tracking-[-0.01em] leading-tight">
              Sign the Contract
            </h2>
            <p className="text-[13px] text-white/35 leading-[1.65] font-body">
              Since you've read the fine lines, type your name to confirm you
              agree with <span className="text-white/55">the terms</span>.
            </p>
          </div>

          {/* ── Signature Pad ───────────────────────────────── */}
          <div className="relative bg-[#111] border border-white/[0.04] rounded-xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 min-h-[96px] flex items-center justify-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canSign && handleSign()}
                placeholder="Your full name"
                disabled={!fontLoaded || phase !== "idle"}
                autoFocus
                className="w-full bg-transparent text-[#ede8e0] text-[34px] font-signature text-center outline-none placeholder:text-white/[0.12] disabled:opacity-30 leading-none"
              />
            </div>

            {/* Signature line */}
            <div className="mx-5 h-px bg-white/[0.06]" />

            {/* Label */}
            <p className="text-center text-[9px] text-white/[0.15] uppercase tracking-[0.25em] py-2.5 font-body select-none">
              Signature
            </p>
          </div>

          {/* ── Button ──────────────────────────────────────── */}
          <button
            onClick={handleSign}
            disabled={!canSign || phase !== "idle"}
            className="
              w-full h-11 rounded-xl text-[13px] font-medium font-body
              bg-white text-[#111] cursor-pointer
              hover:bg-white/90 active:scale-[0.98]
              disabled:opacity-20 disabled:cursor-not-allowed disabled:active:scale-100
              transition-all duration-200
            "
          >
            Sign & Accept
          </button>
        </div>
      </div>

      {/* ── Modal Portal ────────────────────────────────────── */}
      {modalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 grid place-items-center p-6"
            style={{
              animation: `${closing ? "modal-backdrop-out" : "modal-backdrop-in"} 300ms ease both`,
            }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-xl"
              onClick={handleClose}
            />

            {/* Modal card */}
            <div
              className="relative w-full max-w-[560px] bg-[#1a1a1a]/95 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
              style={{
                animation: `${closing ? "modal-content-out" : "modal-content-in"} 300ms ease both`,
              }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 size-8 rounded-full grid place-items-center bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition-colors cursor-pointer z-10"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Canvas container */}
              <div
                ref={containerRef}
                className="h-[280px] flex items-center justify-center px-6"
              >
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>

              {/* Signature line */}
              <div className="mx-8 h-px bg-white/[0.06]" />

              {/* Label + status */}
              <div className="flex items-center justify-between px-8 py-4">
                <p className="text-[9px] text-white/[0.15] uppercase tracking-[0.25em] font-body select-none">
                  Signature
                </p>
                {phase === "accepted" && (
                  <p
                    className="text-[11px] text-emerald-400/80 font-medium font-body"
                    style={{ animation: "fade-in 400ms ease both" }}
                  >
                    Signed successfully
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
