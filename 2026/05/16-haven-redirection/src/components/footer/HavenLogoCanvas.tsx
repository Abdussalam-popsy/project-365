import { useEffect, useRef } from "react";

// ─── Palette — vibrant, high-contrast against cream ───────────────────────────
const COLORS = [
  "#d86e40", // coral
  "#c44225", // rust
  "#75927f", // sage
  "#1E4D7B", // blue
  "#2D6B4A", // forest
  "#C05A2A", // orange-red
  "#c44225", // rust
  "#d86e40", // terracotta
  "#75927f", // sage
  "#c1cfca", // mist
  // "#dec5a5", // sand
] as const;

// ─── Tunable constants ────────────────────────────────────────────────────────
// ↓ GAP between pixel squares — increase for wider breathing room (like the hero TileGrid)
const GAP = 3; // px gap between squares — TWEAK THIS
const PIXEL = 8; // px per square (CSS pixels)
// ↓ Buffer zone: how far particles can escape beyond the logo bounds before they clip
const BLEED = 60; // px bleed on all 4 sides

const REPEL_R = 90;
const REPEL_R_SQ = REPEL_R * REPEL_R;
const REPEL_F = 5.5;
// Lerp strength — controls how quickly particles ease back home after repulsion.
// 0.06 = slow/floaty (~2s settle), 0.10 = crisp (~1s settle)
const LERP_T = 0.08;
const DAMP = 0.85; // velocity decay per frame
const SETTLE = 0.3; // displacement threshold to consider a particle "at rest"

// ─── SVG dimensions (viewBox 0 0 88 24.2759) ──────────────────────────────────
const SVG_RATIO = 24.2759 / 88;

type Particle = {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ci: number;
};

export function HavenLogoCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | undefined>(undefined);
  const isRunningRef = useRef(false);
  const startLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const W = wrap.clientWidth;
    const H = Math.round(W * SVG_RATIO);
    const CW = W + 2 * BLEED; // canvas width including bleed zones
    const CH = H + 2 * BLEED; // canvas height including bleed zones
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    canvas.style.width = `${CW}px`;
    canvas.style.height = `${CH}px`;

    // Set wrapper height to logo height (not canvas height) so layout spacing is correct
    wrap.style.height = `${H}px`;

    const img = new Image();
    img.onload = () => {
      // ── 1. Rasterize SVG ─────────────────────────────────────────────────
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const oct = off.getContext("2d", { willReadFrequently: true })!;
      oct.drawImage(img, 0, 0, W, H);
      const { data } = oct.getImageData(0, 0, W, H);

      // ── 2. Sample filled cells (5-point coverage) ─────────────────────────
      const particles: Particle[] = [];
      const groups: Particle[][] = COLORS.map(() => []);

      const H2 = PIXEL >> 1;
      const H4 = PIXEL >> 2;
      const H34 = H4 * 3;

      for (let y = 0; y < H; y += PIXEL) {
        for (let x = 0; x < W; x += PIXEL) {
          const pts = [
            [x + H2, y + H2],
            [x + H4, y + H4],
            [x + H34, y + H4],
            [x + H4, y + H34],
            [x + H34, y + H34],
          ];

          let hit = false;
          for (const [px, py] of pts) {
            const sx = Math.min(px | 0, W - 1);
            const sy = Math.min(py | 0, H - 1);
            if (data[(sy * W + sx) * 4 + 3] > 100) {
              hit = true;
              break;
            }
          }

          if (hit) {
            const ci = Math.floor(Math.random() * COLORS.length);
            // Home positions are offset by BLEED so they live in the centre
            // of the canvas bitmap — the bleed zone surrounds them on all sides
            const p: Particle = {
              ox: x + BLEED,
              oy: y + BLEED,
              x: x + BLEED,
              y: y + BLEED,
              vx: 0,
              vy: 0,
              ci,
            };
            particles.push(p);
            groups[ci].push(p);
          }
        }
      }

      // ── 3. Canvas context (DPR-scaled) ────────────────────────────────────
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);

      let needsDraw = true;

      // ── 4. Batch render — one fillStyle change per colour (6 max) ────────
      function render() {
        ctx.clearRect(0, 0, CW, CH);
        for (let ci = 0; ci < COLORS.length; ci++) {
          const g = groups[ci];
          if (!g.length) continue;
          ctx.fillStyle = COLORS[ci];
          for (const p of g)
            ctx.fillRect(p.x | 0, p.y | 0, PIXEL - GAP, PIXEL - GAP);
        }
      }

      // ── 5. Animation tick ─────────────────────────────────────────────────
      function tick() {
        if (!isRunningRef.current) return;
        rafRef.current = requestAnimationFrame(tick);

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const hasMoused = mx > -1000;

        let moving = needsDraw;

        for (const p of particles) {
          // Repulsion from cursor
          if (hasMoused) {
            const dx = p.x - mx;
            const dy = p.y - my;
            if (dx * dx + dy * dy < REPEL_R_SQ) {
              const d = Math.sqrt(dx * dx + dy * dy) || 1;
              const f = ((REPEL_R - d) / REPEL_R) * REPEL_F;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }

          // Decay existing velocity (no spring force — lerp handles return)
          p.vx *= DAMP;
          p.vy *= DAMP;
          p.x += p.vx;
          p.y += p.vy;

          // Smooth ease back to home — no spring oscillation, just lerp
          p.x += (p.ox - p.x) * LERP_T;
          p.y += (p.oy - p.y) * LERP_T;

          // Dirty check: moving if displaced or still has velocity
          if (
            Math.abs(p.x - p.ox) > SETTLE ||
            Math.abs(p.y - p.oy) > SETTLE ||
            Math.abs(p.vx) > 0.05 ||
            Math.abs(p.vy) > 0.05
          ) {
            moving = true;
          }
        }

        if (moving) {
          needsDraw = false;
          render();
        }

        if (!moving && !hasMoused) {
          isRunningRef.current = false;
        }
      }

      // ── 6. Start / restart ────────────────────────────────────────────────
      function startLoop() {
        if (isRunningRef.current) return;
        isRunningRef.current = true;
        needsDraw = true;
        tick();
      }

      startLoopRef.current = startLoop;
      startLoop();
    };

    img.src = `${import.meta.env.BASE_URL}assets/Haven Logo.svg`;

    return () => {
      isRunningRef.current = false;
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    // getBoundingClientRect accounts for the negative-margin position correctly
    const r = e.currentTarget.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    startLoopRef.current?.();
  }

  return (
    // position:relative + explicit height (set in useEffect) is the layout footprint.
    // The canvas is absolute, offset by -BLEED on all sides, so escaped particles
    // paint freely outside without affecting adjacent element spacing.
    <div
      ref={wrapRef}
      className="relative w-full"
      style={{ overflow: "visible" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute"
        style={{ display: "block", top: `-${BLEED}px`, left: `-${BLEED}px` }}
        // onMouseMove={handleMouseMove}
        // onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; }}
      />
    </div>
  );
}
