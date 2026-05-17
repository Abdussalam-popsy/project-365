import { useReducedMotion } from "motion/react";
import { motion } from "motion/react";
import {
  AGENT_PIXELS,
  AGENT_COLOR,
  distFromCenter,
  type AgentId,
  type Pixel,
} from "./pixel-icons";

// ─── Tuning ───────────────────────────────────────────────────────────────────
const STAGGER_STEP = 0.032; // seconds between each distance ring step
const PIXEL_DUR    = 0.22;  // seconds per pixel animation

// ─── Helpers ─────────────────────────────────────────────────────────────────
/**
 * Sorts pixels by distance from icon center (12,12) and assigns a stagger
 * delay proportional to their sorted rank. Pixels at the same distance fire
 * together, creating an outward bloom rather than a linear crawl.
 */
function sortedWithDelay(pixels: Pixel[]): { pixel: Pixel; delay: number }[] {
  // Round distance to 1 decimal to bucket near-identical rings together
  const withDist = pixels.map(pixel => ({
    pixel,
    dist: Math.round(distFromCenter(pixel) * 10) / 10,
  }));

  // Get sorted unique distances → each unique dist = one ring
  const rings = [...new Set(withDist.map(p => p.dist))].sort((a, b) => a - b);

  return withDist.map(({ pixel, dist }) => ({
    pixel,
    delay: rings.indexOf(dist) * STAGGER_STEP,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────
interface PixelIconProps {
  agentId: AgentId;
  /** Display size in px — rendered as an SVG with aspect-ratio 1:1. */
  size?: number;
}

export function PixelIcon({ agentId, size = 160 }: PixelIconProps) {
  const prefersReduced = useReducedMotion();
  const color   = AGENT_COLOR[agentId];
  const entries = sortedWithDelay(AGENT_PIXELS[agentId]);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      {entries.map(({ pixel, delay }, i) => {
        const transition = prefersReduced
          ? { duration: 0 }
          : { delay, duration: PIXEL_DUR, ease: [0.22, 1, 0.36, 1] as const };

        if (pixel.type === "rect") {
          return (
            <motion.rect
              key={i}
              x={pixel.x}
              y={pixel.y}
              width={2}
              height={2}
              fill={color}
              initial={prefersReduced ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={transition}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            />
          );
        }

        // Triangular / diagonal cut pixel
        return (
          <motion.path
            key={i}
            d={pixel.d}
            fill={color}
            initial={prefersReduced ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transition}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          />
        );
      })}
    </svg>
  );
}
