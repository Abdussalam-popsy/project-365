import { useEffect, useMemo, useRef, useState } from "react";

// ─── Scene config ──────────────────────────────────────────────────────────────
// Each bitmap is designed on a 16×10 cell canvas and centered in the live grid.
const SCENE_COLS = 16;
const SCENE_ROWS = 10;

const SCENE_IDS = ["idle", "house", "people"] as const;
type SceneId = (typeof SCENE_IDS)[number];

const SCENE_SVGS: Partial<Record<SceneId, string>> = {
  house: `${import.meta.env.BASE_URL}assets/scenes/house.svg`,
  people: `${import.meta.env.BASE_URL}assets/scenes/people.svg`,
};

// Background color used for non-shape tiles when a scene is active
const SCENE_BG = "#ebe5d8";

// ─── Grid config ──────────────────────────────────────────────────────────────
const COLORS = [
  "#c44225", // rust
  "#d86e40", // terracotta
  "#75927f", // sage
  "#c1cfca", // mist
  "#dec5a5", // sand
] as const;

const TILE_PX = 18;
const GAP_PX = 4;
const STRIDE = TILE_PX + GAP_PX;
const ROWS = 20;

// ─── Transition config ────────────────────────────────────────────────────────
// Ripple wave: each tile's delay = distance-from-center × RIPPLE_MS_PER_UNIT
const RIPPLE_MS_PER_UNIT = 16; // ms per tile-distance unit — TWEAK THIS
const TRANSITION_MS = 280; // each tile's color transition duration

// ─── Utils ────────────────────────────────────────────────────────────────────
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function buildTiles(cols: number): string[] {
  const total = cols * ROWS;
  const base = Array.from(
    { length: total },
    (_, i) => COLORS[i % COLORS.length],
  );
  return seededShuffle(base, 0xc0ffee);
}

function layoutFromWidth(width: number) {
  const cols = Math.max(1, Math.floor((width + GAP_PX) / STRIDE));
  const tileSize = (width - (cols - 1) * GAP_PX) / cols;
  return { cols, tileSize };
}

// Rasterize an SVG scene asset and return a Set of filled cell indices.
// Index = col + row * SCENE_COLS (matches the 16×10 bitmap grid).
async function loadSceneBitmap(url: string): Promise<Set<number>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const W = SCENE_COLS * TILE_PX;
      const H = SCENE_ROWS * TILE_PX;
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const ctx = off.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);

      const filled = new Set<number>();
      const H2 = TILE_PX >> 1,
        H4 = TILE_PX >> 2,
        H34 = H4 * 3;

      for (let row = 0; row < SCENE_ROWS; row++) {
        for (let col = 0; col < SCENE_COLS; col++) {
          const x = col * TILE_PX,
            y = row * TILE_PX;
          // 5-point coverage sample — catches thin strokes and diagonal edges
          const pts: [number, number][] = [
            [x + H2, y + H2],
            [x + H4, y + H4],
            [x + H34, y + H4],
            [x + H4, y + H34],
            [x + H34, y + H34],
          ];
          for (const [px, py] of pts) {
            const sx = Math.min(px | 0, W - 1),
              sy = Math.min(py | 0, H - 1);
            if (data[(sy * W + sx) * 4 + 3] > 100) {
              filled.add(col + row * SCENE_COLS);
              break;
            }
          }
        }
      }
      resolve(filled);
    };
    img.src = url;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function TileGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(() => layoutFromWidth(1280));
  const [activeScene, setActiveScene] = useState<SceneId>("idle");
  // 2× on desktop (≥1024px): each bitmap cell covers 2×2 grid tiles
  const [sceneScale, setSceneScale] = useState(() =>
    typeof window !== "undefined" && window.innerWidth >= 1024 ? 2 : 1,
  );
  const sceneBitmaps = useRef<Map<SceneId, Set<number>>>(new Map());
  // Per-column refs for direct-DOM parallax (zero React re-renders on scroll)
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { cols, tileSize } = layout;
  const tiles = useMemo(() => buildTiles(cols), [cols]);
  const gridHeight = ROWS * tileSize + (ROWS - 1) * GAP_PX;

  // ── Layout observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setLayout(layoutFromWidth(el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Breakpoint listener for scene scale ────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setSceneScale(mq.matches ? 2 : 1);
    const handler = (e: MediaQueryListEvent) =>
      setSceneScale(e.matches ? 2 : 1);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Load scene SVG bitmaps at mount ────────────────────────────────────────
  useEffect(() => {
    for (const [id, url] of Object.entries(SCENE_SVGS) as [SceneId, string][]) {
      loadSceneBitmap(url).then((bitmap) => {
        sceneBitmaps.current.set(id, bitmap);
      });
    }
  }, []);

  // ── Scroll parallax — direct DOM, no React re-renders ─────────────────────
  // Each column drifts at a different Y speed (sine wave across column index).
  // Max drift ≈ ±8px at scroll depth of ~270px.
  useEffect(() => {
    let raf: number;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sy = window.scrollY;
        colRefs.current.forEach((el, col) => {
          if (el)
            el.style.transform = `translateY(${Math.sin(col * 0.7) * sy * 0.03}px)`;
        });
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ── Click: cycle to next scene ─────────────────────────────────────────────
  function handleClick() {
    setActiveScene((prev) => {
      const idx = SCENE_IDS.indexOf(prev);
      return SCENE_IDS[(idx + 1) % SCENE_IDS.length];
    });
  }

  // ── Per-tile helpers ───────────────────────────────────────────────────────
  const centerCol = (cols - 1) / 2;
  const centerRow = (ROWS - 1) / 2;
  // Scaled bitmap dimensions — 2× on desktop means shape covers 32×20 tiles
  const scaledCols = SCENE_COLS * sceneScale;
  const scaledRows = SCENE_ROWS * sceneScale;
  const offsetCol = Math.floor((cols - scaledCols) / 2);
  const offsetRow = Math.floor((ROWS - scaledRows) / 2);
  const currentBitmap = sceneBitmaps.current.get(activeScene);

  function isLit(col: number, row: number): boolean {
    if (!currentBitmap) return false;
    const sc = col - offsetCol,
      sr = row - offsetRow;
    if (sc < 0 || sc >= scaledCols || sr < 0 || sr >= scaledRows) return false;
    // Map scaled tile back to the original bitmap cell
    return currentBitmap.has(
      Math.floor(sc / sceneScale) + Math.floor(sr / sceneScale) * SCENE_COLS,
    );
  }

  // Ripple delay: tiles closest to center change first, outer tiles follow.
  function rippleDelay(col: number, row: number): number {
    return (
      Math.sqrt((col - centerCol) ** 2 + (row - centerRow) ** 2) *
      RIPPLE_MS_PER_UNIT
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full cursor-pointer overflow-hidden"
      style={{ minHeight: gridHeight }}
      onClick={handleClick}
    >
      <div
        style={{
          display: "flex",
          gap: `${GAP_PX}px`,
          alignItems: "flex-start",
        }}
      >
        {Array.from({ length: cols }, (_, col) => (
          <div
            key={col}
            ref={(el) => {
              colRefs.current[col] = el;
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${GAP_PX}px`,
              flexShrink: 0,
              width: tileSize,
              willChange: "transform",
            }}
          >
            {Array.from({ length: ROWS }, (_, row) => {
              const lit = isLit(col, row);
              const sceneActive = activeScene !== "idle";
              return (
                <div
                  key={row}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    backgroundColor: sceneActive
                      ? lit
                        ? tiles[col + row * cols]
                        : SCENE_BG
                      : tiles[col + row * cols],
                    borderRadius: 0,
                    transition: `background-color ${TRANSITION_MS}ms ease`,
                    transitionDelay: `${rippleDelay(col, row)}ms`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
