"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useTuning } from "@/lib/tuning";

const MARK_W = 45.2281;
const MARK_H = 56.2437;
const DOOR = { x: 18.0294, y: 47.1738, size: 9.015 };
const ORIGIN_X = ((DOOR.x + DOOR.size / 2) / MARK_W) * 100;
const ORIGIN_Y = ((DOOR.y + DOOR.size / 2) / MARK_H) * 100;

/** Every number the zoom uses. Tune live with the dev panel (or `?tune`), then paste "Copy values" back here. */
export const homeZoomTuning = {
  lift: { label: "Entry lift (H shows up sooner)", min: 0, max: 0.6, step: 0.01, value: 0.4 },
  enterScale: { label: "Size as it scrolls in", min: 0.4, max: 1, step: 0.01, value: 0.8 },
  size: { label: "H height, desktop (px)", min: 80, max: 320, step: 1, value: 180 },
  offsetY: { label: "Pinned position, up/down (px)", min: -240, max: 240, step: 1, value: 0 },
  runway: { label: "Scroll length (screens)", min: 1.6, max: 5, step: 0.1, value: 2.8 },
  zoomStart: { label: "Zoom starts (0–1 of pinned scroll)", min: 0, max: 0.5, step: 0.01, value: 0.06 },
  zoomEnd: { label: "Zoom ends", min: 0.3, max: 1, step: 0.01, value: 0.8 },
  curve: { label: "Zoom ease (1 = even)", min: 1, max: 3, step: 0.05, value: 2 },
  fill: { label: "White fade length", min: 0.02, max: 0.3, step: 0.01, value: 0.1 },
  glow: { label: "Glow strength", min: 0, max: 1, step: 0.01, value: 0.45 },
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));

export function HomeZoom() {
  const sectionRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && prefersReduced;

  const t = useTuning("homeZoom", "H zoom", homeZoomTuning);
  const tRef = useRef(t);
  const tuneTick = useMotionValue(0);
  useEffect(() => {
    tRef.current = t;
    tuneTick.set(tuneTick.get() + 1);
  }, [t, tuneTick]);

  const { scrollY } = useScroll();
  const sectionTop = useMotionValue(0);
  const scrollRange = useMotionValue(1);
  const viewport = useMotionValue(800);
  const maxScale = useMotionValue(80);

  useEffect(() => {
    const measure = () => {
      const section = sectionRef.current;
      const mark = markRef.current;
      if (!section || !mark) return;
      sectionTop.set(section.getBoundingClientRect().top + window.scrollY);
      scrollRange.set(Math.max(1, section.offsetHeight - window.innerHeight));
      viewport.set(window.innerHeight);

      const h = mark.offsetHeight;
      const doorPx = (h * DOOR.size) / MARK_H;
      const doorOffsetY = (ORIGIN_Y / 100 - 0.5) * h + tRef.current.offsetY;
      const halfCover = Math.max(
        window.innerWidth / 2,
        window.innerHeight / 2 + Math.abs(doorOffsetY),
      );
      maxScale.set(((2 * halfCover) / doorPx) * 1.15);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [still, t, sectionTop, scrollRange, viewport, maxScale]);

  // px scrolled past the moment the section's top reaches the top of the screen (negative before).
  const scrolled = useTransform([scrollY, sectionTop], ([y, top]: number[]) => y - top);

  const y = useTransform([scrolled, viewport, tuneTick], ([s, vh]: number[]) => {
    const entry = Math.max(-1, Math.min(0, s / vh));
    return entry * tRef.current.lift * vh + tRef.current.offsetY;
  });
  const scale = useTransform([scrolled, viewport, scrollRange, maxScale, tuneTick], ([s, vh, range, m]: number[]) => {
    const { enterScale, zoomStart, zoomEnd, curve } = tRef.current;
    if (s < 0) return enterScale + (1 - enterScale) * (1 + Math.max(-1, s / vh));
    const z = ramp(s / range, zoomStart, zoomEnd);
    return Math.pow(m, Math.pow(z, curve));
  });
  const glowOpacity = useTransform([scrolled, viewport, scrollRange, tuneTick], ([s, vh, range]: number[]) => {
    const { glow, zoomStart } = tRef.current;
    if (s < 0) return glow * clamp01(1 + s / vh);
    return glow * (1 - ramp(s / range, zoomStart, zoomStart + 0.35));
  });
  const fill = useTransform([scrolled, scrollRange, tuneTick], ([s, range]: number[]) => {
    const { zoomEnd, fill } = tRef.current;
    return ramp(s / range, zoomEnd - fill * 0.6, zoomEnd + fill * 0.4);
  });

  const height = `clamp(96px, 16vw, ${t.size}px)`;

  if (still) {
    return (
      <section aria-hidden className="flex h-[70svh] items-center justify-center bg-ink">
        <HomeMark className="text-mist" style={{ height }} />
      </section>
    );
  }

  return (
    <section ref={sectionRef} aria-hidden className="relative bg-ink" style={{ height: `${t.runway * 100}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: glowOpacity }}
          className="pointer-events-none absolute top-1/2 left-1/2 size-[min(90vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(201,181,218,0.5),transparent)]"
        />
        <motion.div
          ref={markRef}
          style={{ y, scale, height, transformOrigin: `${ORIGIN_X}% ${ORIGIN_Y}%` }}
          className="relative text-mist"
        >
          <HomeMark className="h-full" />
        </motion.div>
        <motion.div style={{ opacity: fill }} className="absolute inset-0 bg-mist" />
      </div>
    </section>
  );
}

function HomeMark({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox={`0 0 ${MARK_W} ${MARK_H}`}
      fill="currentColor"
      className={`w-auto ${className}`}
      style={style}
    >
      <path d="M0 0H8.76916V24.8732L22.614 18.4405L36.4589 24.8732V0H45.2281V56.2437H36.4589V33.8789L22.614 27.4462L8.76916 33.8789V56.2437H0V0Z" />
      <path d="M18.0294 47.1738H27.0444V56.1796H18.0294V47.1738Z" />
    </svg>
  );
}
