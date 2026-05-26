import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { sampleSvgFixed } from "../pixel-mosaic/sampleSvg";
import { rippleDelayMs } from "../pixel-mosaic/rippleDelay";
import { FOOTER_COLORS } from "../pixel-mosaic/palettes";

// ─── Tunable constants ────────────────────────────────────────────────────────
const TILE_PX = 8; // sampling cell size — integer, never changes
const GAP_PX = 2; // gap between rendered tiles
const STRIDE = TILE_PX + GAP_PX;

// One-shot bloom
const BLOOM_DURATION_MS = 220; // per-tile transition duration
const BLOOM_MS_PER_UNIT = 28; // radial delay multiplier — TWEAK THIS

// Haven Logo viewBox: 0 0 88 24.2759 → aspect ratio = height / width
const SVG_ASPECT = 24.2759 / 88;

const LOGO_URL = `${import.meta.env.BASE_URL}assets/Haven Logo.svg`;

// ─── Seeded shuffle (deterministic colour assignment) ─────────────────────────
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ─── Layout helper ────────────────────────────────────────────────────────────
// Returns the grid dimensions and the exact display tile size that fills width.
// cols/rows are derived from the same STRIDE as the display positioning so the
// sampled bitmap and the rendered grid are always 1:1.
function layoutFromWidth(width: number) {
  const cols = Math.max(1, Math.floor((width + GAP_PX) / STRIDE));
  // tileSize expands/contracts slightly so cols tiles + (cols-1) gaps = width exactly
  const tileSize = (width - (cols - 1) * GAP_PX) / cols;
  const height = Math.round(width * SVG_ASPECT);
  const rows = Math.max(1, Math.floor((height + GAP_PX) / STRIDE));
  return { cols, rows, tileSize };
}

// ─── Lit cell type ────────────────────────────────────────────────────────────
interface LitCell {
  col: number;
  row: number;
  color: string;
  delay: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function HavenLogoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState<LitCell[]>([]);
  const [layout, setLayout] = useState<{
    cols: number;
    rows: number;
    tileSize: number;
  } | null>(null);

  // Scroll-into-view trigger (once only)
  const inView = useInView(containerRef, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();
  const revealed = prefersReduced || inView;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Generation counter: if a newer compute starts while an async one is in
    // flight, the stale result is discarded instead of overwriting state.
    let generation = 0;

    async function compute(width: number) {
      if (width < 1) return;
      const myGen = ++generation;

      const { cols, rows, tileSize } = layoutFromWidth(width);

      // Sample the SVG at cols×rows cells with TILE_PX as the integer cell
      // size. This ensures the sampled grid dimensions exactly match the
      // display grid — no column-count drift, no off-screen tiles.
      const { filled } = await sampleSvgFixed(LOGO_URL, cols, rows, TILE_PX);

      if (myGen !== generation) return; // stale — a newer compute won

      const centerCol = (cols - 1) / 2;
      const centerRow = (rows - 1) / 2;

      // Build colour pool deterministically — same order on every resize
      const colorPool = seededShuffle(
        Array.from(
          { length: filled.size },
          (_, i) => FOOTER_COLORS[i % FOOTER_COLORS.length],
        ),
        0xdecaf,
      );

      let ci = 0;
      const litCells: LitCell[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (filled.has(col + row * cols)) {
            litCells.push({
              col,
              row,
              color: colorPool[ci++ % colorPool.length],
              delay: rippleDelayMs(
                col,
                row,
                centerCol,
                centerRow,
                BLOOM_MS_PER_UNIT,
              ),
            });
          }
        }
      }

      setLayout({ cols, rows, tileSize });
      setCells(litCells);
    }

    // Use contentRect.width from the ResizeObserver entry — this is more
    // reliable than clientWidth (which can be 0 before layout settles).
    const ro = new ResizeObserver((entries) => {
      const width = Math.floor(entries[0].contentRect.width);
      compute(width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep a single root div with containerRef throughout — switching between
  // two return branches would detach the ref and drop the ResizeObserver.
  const tileSize = layout?.tileSize ?? 0;
  const rows = layout?.rows ?? 0;
  const gridHeight =
    rows > 0 ? rows * tileSize + (rows - 1) * GAP_PX : undefined;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{
        position: "relative",
        // While sampling, hold the logo's aspect ratio so layout doesn't jump
        height: gridHeight ?? undefined,
        aspectRatio: gridHeight ? undefined : `${1 / SVG_ASPECT}`,
      }}
      aria-hidden
    >
      {layout &&
        cells.map(({ col, row, color, delay }) => (
          <div
            key={`${col}-${row}`}
            style={{
              position: "absolute",
              left: col * (tileSize + GAP_PX),
              top: row * (tileSize + GAP_PX),
              width: tileSize,
              height: tileSize,
              backgroundColor: color,
              opacity: revealed ? 1 : 0,
              transform: revealed ? "scale(1)" : "scale(0)",
              transition: revealed
                ? `opacity ${BLOOM_DURATION_MS}ms ease, transform ${BLOOM_DURATION_MS}ms ease`
                : "none",
              transitionDelay:
                revealed && !prefersReduced ? `${delay}ms` : "0ms",
            }}
          />
        ))}
    </div>
  );
}
