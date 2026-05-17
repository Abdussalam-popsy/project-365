import { useEffect, useState } from "react";
import { computeGridMetrics, type GridMetrics } from "./grid-config";

function GridCanvas({ metrics }: { metrics: GridMetrics }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden>
      {metrics.marginLeft > 0 && (
        <div
          className="absolute inset-y-0 left-0 bg-coral/15"
          style={{ width: metrics.marginLeft }}
        />
      )}
      {metrics.marginRight > 0 && (
        <div
          className="absolute inset-y-0 right-0 bg-coral/15"
          style={{ width: metrics.marginRight }}
        />
      )}

      <div
        className="absolute inset-y-0 border-x border-dashed border-coral/50"
        style={{
          left: metrics.containerLeft,
          width: metrics.containerWidth,
        }}
      />

      {metrics.columns.map((col, i) => (
        <div
          key={i}
          className="absolute inset-y-0 border-x border-rust/35 bg-sage/12"
          style={{ left: col.left, width: col.width }}
        />
      ))}
    </div>
  );
}

/** Layout grid overlay for aligning to desktop / mobile specs. */
export function GridOverlay() {
  const [visible, setVisible] = useState(false);
  const [metrics, setMetrics] = useState<GridMetrics>(() =>
    computeGridMetrics(typeof window !== "undefined" ? window.innerWidth : 1280),
  );

  useEffect(() => {
    const update = () => setMetrics(computeGridMetrics(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const toggleClass = visible
    ? "bg-neutral-900 text-white opacity-100"
    : "bg-neutral-900/70 text-white opacity-0 group-hover:opacity-100";

  const labelClass = visible
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100";

  return (
    <>
      {visible && <GridCanvas metrics={metrics} />}

      <div className="group fixed bottom-0 right-0 z-[110] h-32 w-32">
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className={`rounded-full px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider shadow-md backdrop-blur-sm transition-opacity duration-300 ${toggleClass}`}
            title={visible ? "Hide layout grid" : "Show layout grid"}
          >
            {visible ? "Grid on" : "Grid"}
          </button>
          <span
            className={`pointer-events-none rounded bg-neutral-900/80 px-2 py-0.5 font-mono text-[9px] text-neutral-400 transition-opacity duration-300 ${labelClass}`}
          >
            {metrics.label}
          </span>
        </div>
      </div>
    </>
  );
}
