"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

interface Options {
  /** Time between steps. */
  stepMs?: number;
  /** How long the finished state holds before the loop restarts. */
  holdMs?: number;
}

/**
 * Counts 0 → `steps` one step at a time, holds, then starts again, for looping mock animations.
 * It only runs while the element is on screen, and with reduced motion it jumps straight to the end and stays.
 * `cycle` changes each loop, so components can use it as a React key to replay entrance animations.
 */
export function useLoopedSequence(steps: number, { stepMs = 1000, holdMs = 2800 }: Options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [inView, setInView] = useState(false);
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) {
      setStep(steps);
      return;
    }
    if (!inView) return;
    let current = 0;
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      if (current < steps) {
        current += 1;
        setStep(current);
        timer = setTimeout(advance, stepMs);
      } else {
        timer = setTimeout(() => {
          current = 0;
          setStep(0);
          setCycle((c) => c + 1);
          timer = setTimeout(advance, stepMs);
        }, holdMs);
      }
    };
    setStep(0);
    timer = setTimeout(advance, stepMs);
    return () => clearTimeout(timer);
  }, [inView, reduce, steps, stepMs, holdMs]);

  return { ref, step, cycle };
}
