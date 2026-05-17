import { useEffect, useRef, useState } from "react";

// Updates the display at most twice per second — avoids 60 React re-renders/sec
const UPDATE_INTERVAL_MS = 500;

export function FPSCounter() {
  const [fps, setFps] = useState<number | null>(null);
  const rafRef      = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef(performance.now());
  const lastDispRef = useRef(0);
  const deltasRef   = useRef<number[]>([]);

  useEffect(() => {
    function measure(now: number) {
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Rolling window of last 30 frame times
      deltasRef.current.push(delta);
      if (deltasRef.current.length > 30) deltasRef.current.shift();

      // Throttle React state update to twice per second
      if (now - lastDispRef.current >= UPDATE_INTERVAL_MS && deltasRef.current.length >= 5) {
        const avg = deltasRef.current.reduce((a, b) => a + b, 0) / deltasRef.current.length;
        setFps(Math.round(1000 / avg));
        lastDispRef.current = now;
      }

      rafRef.current = requestAnimationFrame(measure);
    }

    rafRef.current = requestAnimationFrame(measure);
    return () => { if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current); };
  }, []);

  if (fps === null) return null;

  const color = fps >= 55 ? "#22c55e" : fps >= 30 ? "#f59e0b" : "#ef4444";
  const label = fps >= 55 ? "smooth" : fps >= 30 ? "ok" : "slow";

  return (
    <div className="fixed top-4 right-4 z-[110] font-mono text-[10px]">
      <div className="flex items-center gap-1.5 rounded-full bg-neutral-900/70 px-2.5 py-1 backdrop-blur-sm">
        <div
          className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
          style={{ background: color }}
        />
        <span className="transition-colors duration-500" style={{ color }}>
          {fps} fps · {label}
        </span>
      </div>
    </div>
  );
}
