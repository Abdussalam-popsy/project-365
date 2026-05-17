import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { RiRefreshFill } from "@remixicon/react";
import {
  SYNC_VIEWBOX,
  HUB,
  PATH_IN_UPPER,
  PATH_IN_LOWER,
  PATH_CENTER,
  PATH_OUT,
} from "./sync-paths";
import { useSyncPipeline, type Particle } from "./useSyncPipeline";

// ─── Tuning ───────────────────────────────────────────────────────────────────
const RPM_IDLE = 72; // degrees/sec idle  (1 rotation per 5 s)
const RPM_BOOST = 180; // degrees/sec boost (1 rotation per 2 s)
const DOT_SIZE = 16; // px — dot diameter (screen pixels)
const DOC_W = 32; // px — doc card width
const DOC_H = 42; // px — doc card height

const HUB_LEFT = `${(HUB.x / SYNC_VIEWBOX.w) * 100}%`; // 54.9%
// HUB y = 105 / 210 = 50% — perfectly centred in the 236px container

// Convert SVG coordinate → CSS % position within the illustration container.
// Works because preserveAspectRatio="none" maps the viewBox linearly onto the container.
function svgToCSS(x: number, y: number) {
  return {
    left: `${(x / SYNC_VIEWBOX.w) * 100}%`,
    top: `${(y / SYNC_VIEWBOX.h) * 100}%`,
  };
}

// ─── Reduced-motion static fallback ──────────────────────────────────────────
function StaticFallback() {
  return (
    <div className="relative h-[236px] overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 438 210"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={PATH_IN_UPPER}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.75"
        />
        <path
          d={PATH_IN_LOWER}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.75"
        />
        <path
          d={PATH_CENTER}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.75"
        />
        <path
          d={PATH_OUT}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.75"
        />
      </svg>

      {/* Static dot hints */}
      {[svgToCSS(80, 50), svgToCSS(150, 162)].map((pos, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md"
          style={{ ...pos, width: DOT_SIZE, height: DOT_SIZE }}
        />
      ))}

      {/* Static doc stub */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center gap-1.5 rounded border border-white/20 bg-white/[0.08] px-1.5 backdrop-blur-md"
        style={{ ...svgToCSS(350, 105), width: DOC_W, height: DOC_H }}
      >
        <div
          style={{
            height: 0.75,
            background: "rgba(255,255,255,0.40)",
            borderRadius: 1,
          }}
        />
        <div
          style={{
            height: 0.75,
            width: "75%",
            background: "rgba(255,255,255,0.25)",
            borderRadius: 1,
          }}
        />
        <div
          style={{
            height: 0.75,
            background: "rgba(255,255,255,0.25)",
            borderRadius: 1,
          }}
        />
      </div>

      {/* Hub — static box + icon */}
      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-lg border border-white/20 bg-white/[0.08] backdrop-blur-md"
        style={{ left: HUB_LEFT, top: "50%" }}
      >
        <RiRefreshFill className="h-6 w-6 text-white/60" />
      </div>
    </div>
  );
}

// ─── Main illustration ────────────────────────────────────────────────────────
export function SyncIllustration() {
  const [boosted, setBoosted] = useState(false);
  const { particles } = useSyncPipeline(boosted);
  const prefersReduced = useReducedMotion();

  // Invisible SVG path refs — used only for getPointAtLength
  const upperRef = useRef<SVGPathElement>(null);
  const lowerRef = useRef<SVGPathElement>(null);
  const outRef = useRef<SVGPathElement>(null);

  // Icon-only rotation via MotionValue — zero re-renders, box stays static
  const iconRotate = useMotionValue(0);
  const boostedRef = useRef(boosted);
  useEffect(() => {
    boostedRef.current = boosted;
  }, [boosted]);

  useAnimationFrame((_, delta) => {
    const rpm = boostedRef.current ? RPM_BOOST : RPM_IDLE;
    iconRotate.set((iconRotate.get() + rpm * (delta / 1000)) % 360);
  });

  if (prefersReduced) return <StaticFallback />;

  // Map a particle's progress → CSS percentage position
  function getPos(p: Particle) {
    const el =
      p.pathKey === "upper"
        ? upperRef.current
        : p.pathKey === "lower"
          ? lowerRef.current
          : outRef.current;
    if (!el) return svgToCSS(HUB.x, HUB.y);
    const len = el.getTotalLength();
    const pt = el.getPointAtLength(p.progress * len);
    return svgToCSS(pt.x, pt.y);
  }

  const pathOpacity = boosted ? 0.32 : 0.14;
  const centerOpacity = boosted ? 0.16 : 0.07;
  const dotBorder = boosted
    ? "rgba(255,255,255,0.55)"
    : "rgba(255,255,255,0.32)";
  const dotFill = boosted ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.12)";
  const docBorder = boosted
    ? "rgba(255,255,255,0.45)"
    : "rgba(255,255,255,0.26)";

  return (
    <div
      className="relative h-[236px] overflow-hidden"
      onMouseEnter={() => setBoosted(true)}
      onMouseLeave={() => setBoosted(false)}
    >
      {/* ── SVG: track lines + invisible path refs ── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 438 210"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Invisible refs for getPointAtLength — no stroke, no fill */}
        <path ref={upperRef} d={PATH_IN_UPPER} fill="none" stroke="none" />
        <path ref={lowerRef} d={PATH_IN_LOWER} fill="none" stroke="none" />
        <path ref={outRef} d={PATH_OUT} fill="none" stroke="none" />

        {/* Visible track lines */}
        <path
          d={PATH_IN_UPPER}
          fill="none"
          stroke={`rgba(255,255,255,${pathOpacity})`}
          strokeWidth="0.75"
          style={{ transition: "stroke 500ms ease" }}
        />
        <path
          d={PATH_IN_LOWER}
          fill="none"
          stroke={`rgba(255,255,255,${pathOpacity})`}
          strokeWidth="0.75"
          style={{ transition: "stroke 500ms ease" }}
        />
        <path
          d={PATH_CENTER}
          fill="none"
          stroke={`rgba(255,255,255,${centerOpacity})`}
          strokeWidth="0.75"
          style={{ transition: "stroke 500ms ease" }}
        />
        <path
          d={PATH_OUT}
          fill="none"
          stroke={`rgba(255,255,255,${pathOpacity})`}
          strokeWidth="0.75"
          style={{ transition: "stroke 500ms ease" }}
        />
      </svg>

      {/* ── Particles — DOM elements so they're perfect circles ── */}
      {particles.map((p) => {
        const pos = getPos(p);

        if (p.kind === "dot") {
          return (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                ...pos,
                width: DOT_SIZE,
                height: DOT_SIZE,
                border: `1px solid ${dotBorder}`,
                background: dotFill,
                backdropFilter: "blur(8px)",
                zIndex: 5,
                transition: "border-color 500ms ease, background 500ms ease",
              }}
            />
          );
        }

        // "doc" — glass card with 3 line stubs
        return (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center gap-1"
            style={{
              ...pos,
              width: DOC_W,
              height: DOC_H,
              borderRadius: 4,
              border: `1px solid ${docBorder}`,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              padding: "0 6px",
              zIndex: 5,
              transition: "border-color 500ms ease",
            }}
          >
            <div
              style={{
                height: 0.75,
                background: "rgba(255,255,255,0.42)",
                borderRadius: 1,
              }}
            />
            <div
              style={{
                height: 0.75,
                width: "75%",
                background: "rgba(255,255,255,0.26)",
                borderRadius: 1,
              }}
            />
            <div
              style={{
                height: 0.75,
                background: "rgba(255,255,255,0.26)",
                borderRadius: 1,
              }}
            />
          </div>
        );
      })}

      {/* ── Hub — static glass box, only the icon inside rotates ── */}
      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-lg border border-white/20 bg-white/[0.08] backdrop-blur-md"
        style={{ left: HUB_LEFT, top: "50%" }}
      >
        <motion.div style={{ rotate: iconRotate }}>
          <RiRefreshFill className="h-6 w-6 text-white" />
        </motion.div>
      </div>
    </div>
  );
}
