"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { StageVisual, TitledText } from "@/content/agents/types";
import { Chip, DateChip, DocIcon, MockCard, MockPanel } from "../ui";

const ease = [0.16, 1, 0.3, 1] as const;
const STAGE_MS = 3800;

interface StageStepperProps {
  stages: TitledText[];
  visuals: StageVisual[];
  /** The record shown beside the steps: a work order, a lead, a call… */
  recordTitle: string;
  recordDate?: string;
  /** What one step is called in the caption ("Stage 2 of 7", "Beat 2 of 4"). */
  stepLabel?: string;
}

/**
 * The stages as an auto-advancing accordion: one stage open at a time (so only one description is on screen),
 * a progress line under it, and the work order beside it showing that stage. Loops while on screen;
 * clicking or hovering a stage jumps to it and restarts the timer. Reduced motion: no auto-advance.
 */
export function StageStepper({ stages, visuals, recordTitle, recordDate, stepLabel = "Stage" }: StageStepperProps) {
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
    const timer = setTimeout(() => setActive((i) => (i + 1) % stages.length), STAGE_MS);
    return () => clearTimeout(timer);
  }, [active, tick, reduce, inView, paused, stages.length]);

  const select = (i: number) => {
    setActive(i);
    setTick((t) => t + 1);
  };
  const visual = visuals[active];
  const running = !reduce && inView && !paused;

  return (
    <div ref={ref} className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <ol className="border-t border-ink/10" onMouseLeave={() => setPaused(false)}>
        {stages.map((stage, i) => {
          const open = i === active;
          return (
            <li key={stage.title} className="border-b border-ink/10">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => select(i)}
                onMouseEnter={() => {
                  setPaused(true);
                  setActive(i);
                }}
                onFocus={() => select(i)}
                className="flex w-full items-baseline gap-5 py-4 text-left"
              >
                <span className={`font-mono text-[13px] transition-colors ${open ? "text-heather" : "text-ink/35"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`text-[20px] tracking-[-0.01em] transition-colors ${open ? "text-ink" : "text-ink/45"}`}>{stage.title}</span>
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
                    <p className="max-w-[460px] pb-4 pl-[46px] text-[16px] leading-relaxed text-ink/60">{stage.body}</p>
                    <div className="mb-[-1px] h-px bg-night/10">
                      <motion.div
                        key={`${active}-${tick}-${running}`}
                        className="h-px origin-left bg-heather"
                        initial={{ scaleX: running ? 0 : 1 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: running ? STAGE_MS / 1000 : 0, ease: "linear" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <MockPanel className="lg:sticky lg:top-32">
        <div className="mb-5 flex gap-1.5" aria-hidden>
          {stages.map((stage, i) => (
            <span key={stage.title} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-heather/70" : "bg-night/10"}`} />
          ))}
        </div>
        <MockCard className="px-5 py-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <DocIcon />
            <p className="mr-auto text-[16px] text-ink/85">{recordTitle}</p>
            {recordDate && <DateChip date={recordDate} />}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease }}
              className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-tray px-4 py-3.5"
            >
              <span className="text-[15px] text-ink/75">{visual.line}</span>
              <Chip chip={visual.chip} />
            </motion.div>
          </AnimatePresence>
          <p className="mt-4 text-[13px] text-ink/45">
            {stepLabel} {active + 1} of {stages.length} · {stages[active].title}
          </p>
        </MockCard>
      </MockPanel>
    </div>
  );
}
