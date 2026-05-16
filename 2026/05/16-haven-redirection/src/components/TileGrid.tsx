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
const ROWS = 14;

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

export function TileGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(70);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setCols(Math.max(1, Math.floor(el.clientWidth / STRIDE)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tiles = useMemo(() => buildTiles(cols), [cols]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden" style={{ minHeight: ROWS * (TILE_PX + GAP_PX) }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${TILE_PX}px)`,
          gap: `${GAP_PX}px`,
          willChange: "transform",
        }}
      >
        {tiles.map((color, i) => (
          <div
            key={i}
            style={{
              width: TILE_PX,
              height: TILE_PX,
              backgroundColor: color,
              borderRadius: 3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
