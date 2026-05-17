import { useEffect, useMemo, useRef, useState } from "react";

const COLORS = [
  "#c44225", // rust
  "#d86e40", // terracotta
  "#75927f", // sage
  "#c1cfca", // mist
  "#dec5a5", // sand
] as const;

const TILE_PX = 18;
const GAP_PX = 4;
const STRIDE = TILE_PX + GAP_PX; // 22px
const ROWS = 20;

/** Deterministic Fisher-Yates — same seed + length = same output every time */
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
  const base = Array.from({ length: total }, (_, i) => COLORS[i % COLORS.length]);
  return seededShuffle(base, 0xc0ffee);
}

function layoutFromWidth(width: number) {
  const cols = Math.max(1, Math.floor((width + GAP_PX) / STRIDE));
  // Grow tiles slightly so cols * tile + gaps === container width (no right gap)
  const tileSize = (width - (cols - 1) * GAP_PX) / cols;
  return { cols, tileSize };
}

export function TileGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(() => layoutFromWidth(1280));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setLayout(layoutFromWidth(el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { cols, tileSize } = layout;
  const tiles = useMemo(() => buildTiles(cols), [cols]);
  const gridHeight = ROWS * tileSize + (ROWS - 1) * GAP_PX;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{ minHeight: gridHeight }}
    >
      <div
        style={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
          gap: `${GAP_PX}px`,
          willChange: "transform",
        }}
      >
        {tiles.map((color, i) => (
          <div
            key={i}
            style={{
              width: tileSize,
              height: tileSize,
              backgroundColor: color,
              borderRadius: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
