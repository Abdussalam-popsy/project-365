"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import type { TitledText } from "@/content/agents/types";

const ease = [0.16, 1, 0.3, 1] as const;

interface AutoStepperProps {
  items: TitledText[];
  /** The visual beside the list, for the open item. */
  renderVisual: (active: number) => React.ReactNode;
  /** What sits before each title: a number by default, or an icon. */
  marker?: (index: number, open: boolean) => React.ReactNode;
  stepMs?: number;
  /** A play/pause button on the visual whose ring fills as the timer runs out. */
  showTimer?: boolean;
}

const numberMarker = (i: number, open: boolean) => (
  <span className={`font-mono text-[13px] transition-colors ${open ? "text-heather" : "text-ink/35"}`}>
    {String(i + 1).padStart(2, "0")}
  </span>
);

const RING_R = 17;
const RING_C = 2 * Math.PI * RING_R;

/** Play/pause, with the ring around it as the countdown to the next item. */
function TimerButton({ progress, playing, onToggle }: { progress: MotionValue<number>; playing: boolean; onToggle: () => void }) {
  const dashOffset = useTransform(progress, (p) => RING_C * (1 - p));
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Pause autoplay" : "Play autoplay"}
      className="absolute right-4 bottom-4 z-10 grid size-10 place-items-center rounded-full bg-white text-heather shadow-[0_8px_20px_-10px_rgba(30,15,38,0.45)] transition-transform hover:scale-105 sm:right-5 sm:bottom-5"
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r={RING_R} fill="none" strokeWidth="2" className="stroke-night/10" />
        <motion.circle
          cx="20"
          cy="20"
          r={RING_R}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          style={{ strokeDashoffset: dashOffset }}
          className="stroke-heather"
        />
      </svg>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden className="relative">
        {playing ? (
          <>
            <rect x="2" y="1.5" width="2.6" height="9" rx="0.8" />
            <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.8" />
          </>
        ) : (
          <path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z" />
        )}
      </svg>
    </button>
  );
}

/**
 * A list as an auto-advancing accordion: one item open at a time (so only one description is on screen),
 * a progress line under it, and a visual beside it for that item. Loops while on screen; clicking an item
 * jumps to it, hovering one (mouse only) holds it. One timer drives the line and the optional ring, and
 * pausing keeps its place. Reduced motion: no auto-advance.
 */
export function AutoStepper({ items, renderVisual, marker = numberMarker, stepMs = 3800, showTimer = false }: AutoStepperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const running = !reduce && inView && !hovering && !userPaused;

  // Run the timer from wherever it is, so a pause picks up where it left off.
  useEffect(() => {
    if (!running) return;
    const controls = animate(progress, 1, {
      duration: ((1 - progress.get()) * stepMs) / 1000,
      ease: "linear",
      onComplete: () => {
        progress.set(0);
        setActive((i) => (i + 1) % items.length);
      },
    });
    return () => controls.stop();
  }, [running, active, tick, stepMs, items.length, progress]);

  const select = (i: number) => {
    progress.set(0);
    setActive(i);
    setTick((t) => t + 1);
  };
  const lineScale = useTransform(progress, (p) => (reduce ? 1 : p));

  return (
    <div ref={ref} className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <ol className="border-t border-ink/10" onPointerLeave={() => setHovering(false)}>
        {items.map((item, i) => {
          const open = i === active;
          return (
            <li key={item.title} className="border-b border-ink/10">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => select(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  setHovering(true);
                  if (!open) select(i);
                }}
                onFocus={() => !open && select(i)}
                className="flex w-full items-center gap-5 py-4 text-left"
              >
                {marker(i, open)}
                <span className={`text-[20px] tracking-[-0.01em] transition-colors ${open ? "text-ink" : "text-ink/45"}`}>{item.title}</span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[460px] pb-4 pl-[46px] text-[16px] leading-relaxed text-ink/60">{item.body}</p>
                    <div className="mb-[-1px] h-px bg-night/10">
                      <motion.div className="h-px origin-left bg-heather" style={{ scaleX: lineScale }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
      <div className="relative lg:sticky lg:top-32">
        {renderVisual(active)}
        {showTimer && !reduce && (
          <TimerButton progress={progress} playing={!userPaused} onToggle={() => setUserPaused((p) => !p)} />
        )}
      </div>
    </div>
  );
}
