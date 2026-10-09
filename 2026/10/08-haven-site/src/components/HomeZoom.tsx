"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";

const MARK_W = 45.2281;
const MARK_H = 56.2437;
const DOOR = { x: 18.0294, y: 47.1738, size: 9.015 };
const ORIGIN_X = ((DOOR.x + DOOR.size / 2) / MARK_W) * 100;
const ORIGIN_Y = ((DOOR.y + DOOR.size / 2) / MARK_H) * 100;

const SETTLE = 0.12;
const ZOOM_END = 0.8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));

export function HomeZoom() {
  const sectionRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const still = mounted && prefersReduced;
  const { scrollY } = useScroll();
  const sectionTop = useMotionValue(0);
  const scrollRange = useMotionValue(1);
  const maxScale = useMotionValue(80);

  useEffect(() => {
    const measure = () => {
      const section = sectionRef.current;
      const mark = markRef.current;
      if (!section || !mark) return;
      sectionTop.set(section.getBoundingClientRect().top + window.scrollY);
      scrollRange.set(Math.max(1, section.offsetHeight - window.innerHeight));

      const h = mark.offsetHeight;
      const doorPx = (h * DOOR.size) / MARK_H;
      const doorOffsetY = (ORIGIN_Y / 100 - 0.5) * h;
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
  }, [still, sectionTop, scrollRange, maxScale]);

  const progress = useTransform(
    [scrollY, sectionTop, scrollRange],
    ([y, top, range]: number[]) => clamp01((y - top) / range),
  );

  const scale = useTransform([progress, maxScale], ([p, m]: number[]) => {
    if (p <= SETTLE) return 0.82 + 0.18 * (p / SETTLE);
    const t = ramp(p, SETTLE, ZOOM_END);
    return Math.pow(m, t * t);
  });
  const markOpacity = useTransform(progress, (p) => ramp(p, 0, SETTLE * 0.8));
  const glowOpacity = useTransform(progress, (p) =>
    p < SETTLE ? ramp(p, 0, SETTLE) : 1 - ramp(p, SETTLE, 0.45),
  );
  const fill = useTransform(progress, (p) => ramp(p, ZOOM_END - 0.06, ZOOM_END + 0.04));

  if (still) {
    return (
      <section aria-hidden className="flex h-[70svh] items-center justify-center bg-ink">
        <HomeMark className="h-[clamp(96px,16vw,180px)] text-mist" />
      </section>
    );
  }

  return (
    <section ref={sectionRef} aria-hidden className="relative h-[280svh] bg-ink">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: glowOpacity }}
          className="pointer-events-none absolute top-1/2 left-1/2 size-[min(90vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(87,64,239,0.45),transparent)]"
        />
        <motion.div
          ref={markRef}
          style={{
            scale,
            opacity: markOpacity,
            transformOrigin: `${ORIGIN_X}% ${ORIGIN_Y}%`,
          }}
          className="relative h-[clamp(96px,16vw,180px)] text-mist"
        >
          <HomeMark className="h-full" />
        </motion.div>
        <motion.div style={{ opacity: fill }} className="absolute inset-0 bg-mist" />
      </div>
    </section>
  );
}

function HomeMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MARK_W} ${MARK_H}`}
      fill="currentColor"
      className={`w-auto ${className}`}
    >
      <path d="M0 0H8.76916V24.8732L22.614 18.4405L36.4589 24.8732V0H45.2281V56.2437H36.4589V33.8789L22.614 27.4462L8.76916 33.8789V56.2437H0V0Z" />
      <path d="M18.0294 47.1738H27.0444V56.1796H18.0294V47.1738Z" />
    </svg>
  );
}
