import { useEffect, useRef, useState } from "react";

export type Particle = {
  id: string;
  kind: "dot" | "doc";
  pathKey: "upper" | "lower" | "out";
  progress: number; // dots: 1→0 (left→hub), docs: 0→1 (hub→right)
};

// ─── Tuning constants ─────────────────────────────────────────────────────────
const DOT_DUR   = { idle: 2.8,  boost: 1.8  }; // seconds to cross full path
const DOC_DUR   = { idle: 2.2,  boost: 1.4  };
const SPAWN_INT = { idle: 1100, boost: 650   }; // ms between new dot spawns
const MAX_DOTS  = 6;
const MAX_DOCS  = 6;
// ─────────────────────────────────────────────────────────────────────────────

let _counter = 0;
const uid = () => `p${++_counter}`;

// Pre-seed so the pipeline looks alive immediately on mount
function seedParticles(): Particle[] {
  return [
    { id: uid(), kind: "dot", pathKey: "upper", progress: 0.88 },
    { id: uid(), kind: "dot", pathKey: "lower", progress: 0.62 },
    { id: uid(), kind: "dot", pathKey: "upper", progress: 0.35 },
    { id: uid(), kind: "dot", pathKey: "lower", progress: 0.78 },
    { id: uid(), kind: "doc", pathKey: "out",   progress: 0.18 },
    { id: uid(), kind: "doc", pathKey: "out",   progress: 0.52 },
    { id: uid(), kind: "doc", pathKey: "out",   progress: 0.82 },
  ];
}

export function useSyncPipeline(boosted: boolean) {
  const [particles, setParticles] = useState<Particle[]>(seedParticles);

  const boostedRef  = useRef(boosted);
  const lastSpawn   = useRef(performance.now() - 400); // offset so first spawn isn't immediate
  const nextPath    = useRef<"upper" | "lower">("upper");
  const lastFrame   = useRef(performance.now());
  const rafRef      = useRef<number | undefined>(undefined);

  // Keep boostedRef in sync without restarting the RAF loop
  useEffect(() => { boostedRef.current = boosted; }, [boosted]);

  useEffect(() => {
    function loop(now: number) {
      const delta    = Math.min((now - lastFrame.current) / 1000, 0.1); // cap at 100ms
      lastFrame.current = now;

      const b        = boostedRef.current;
      const dotDur   = b ? DOT_DUR.boost   : DOT_DUR.idle;
      const docDur   = b ? DOC_DUR.boost   : DOC_DUR.idle;
      const spawnInt = b ? SPAWN_INT.boost  : SPAWN_INT.idle;

      // Decide outside the updater so we don't produce side effects inside it
      const shouldSpawn = now - lastSpawn.current >= spawnInt;
      let spawnPath: "upper" | "lower" | null = null;
      if (shouldSpawn) {
        spawnPath = nextPath.current;
        nextPath.current = spawnPath === "upper" ? "lower" : "upper";
        lastSpawn.current = now;
      }

      setParticles(prev => {
        const next: Particle[]    = [];
        const newDocs: Particle[] = [];

        for (const p of prev) {
          if (p.kind === "dot") {
            const np = p.progress - delta / dotDur;
            if (np <= 0.02) {
              // Absorbed — spawn one document if within cap
              const docCount = prev.filter(x => x.kind === "doc").length + newDocs.length;
              if (docCount < MAX_DOCS) {
                newDocs.push({ id: uid(), kind: "doc", pathKey: "out", progress: 0 });
              }
            } else {
              next.push({ ...p, progress: np });
            }
          } else {
            const np = p.progress + delta / docDur;
            if (np < 0.98) {
              next.push({ ...p, progress: np });
            }
            // doc exits silently when it reaches the right edge
          }
        }

        // Spawn a fresh inbound dot
        if (spawnPath !== null) {
          const dotCount = next.filter(p => p.kind === "dot").length;
          if (dotCount < MAX_DOTS) {
            next.push({ id: uid(), kind: "dot", pathKey: spawnPath, progress: 1.0 });
          }
        }

        return [...next, ...newDocs];
      });

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, []); // runs once — reads boostedRef dynamically each frame

  return { particles };
}
