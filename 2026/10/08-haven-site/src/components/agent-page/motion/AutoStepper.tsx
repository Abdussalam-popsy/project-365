"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { TitledText } from "@/content/agents/types";

const ease = [0.16, 1, 0.3, 1] as const;

interface AutoStepperProps {
  items: TitledText[];
  /** The visual beside the list, for the open item. */
  renderVisual: (active: number) => React.ReactNode;
  /** What sits before each title: a number by default, or an icon. */
  marker?: (index: number, open: boolean) => React.ReactNode;
  stepMs?: number;
}

const numberMarker = (i: number, open: boolean) => (
  <span className={`font-mono text-[13px] transition-colors ${open ? "text-heather" : "text-ink/35"}`}>
    {String(i + 1).padStart(2, "0")}
  </span>
);

/**
 * A list as an auto-advancing accordion: one item open at a time (so only one description is on screen),
 * a progress line under it, and a visual beside it for that item. Loops while on screen; clicking or
 * hovering an item jumps to it and restarts the timer. Reduced motion: no auto-advance.
 */
export function AutoStepper({ items, renderVisual, marker = numberMarker, stepMs = 3800 }: AutoStepperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !inView || paused) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % items.length), stepMs);
    return () => clearTimeout(timer);
  }, [active, tick, reduce, inView, paused, items.length, stepMs]);

  const select = (i: number) => {
    setActive(i);
    setTick((t) => t + 1);
  };
  const running = !reduce && inView && !paused;

  return (
    <div ref={ref} className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <ol className="border-t border-ink/10" onMouseLeave={() => setPaused(false)}>
        {items.map((item, i) => {
          const open = i === active;
          return (
            <li key={item.title} className="border-b border-ink/10">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => select(i)}
                onMouseEnter={() => {
                  setPaused(true);
                  setActive(i);
                }}
                onFocus={() => select(i)}
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
                      <motion.div
                        key={`${active}-${tick}-${running}`}
                        className="h-px origin-left bg-heather"
                        initial={{ scaleX: running ? 0 : 1 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: running ? stepMs / 1000 : 0, ease: "linear" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
      {renderVisual(active)}
    </div>
  );
}
