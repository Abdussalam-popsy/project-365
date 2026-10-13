"use client";

import { useRef, useState } from "react";
import { useAnimationFrame, useInView, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { outcomes, type OutcomeAgent } from "@/content/outcomes";

// The clock every Outcomes variant runs on: one sample day, looping, only while on screen.

export const MINUTES = 24 * 60;
const DAY_MS = 32000;
/** A long frame (a backgrounded tab) shouldn't skip the clock ahead by hours. */
const MAX_FRAME_MS = 100;

export const lanes: OutcomeAgent[] = ["Maintenance", "Leasing", "Receptionist"];

/** One colour per agent, used for its lane, its event blocks and its name in the feed. */
export const agentColour: Record<OutcomeAgent, { text: string; dot: string; block: string; fill: string }> = {
  Maintenance: { text: "text-lilac", dot: "bg-lilac", block: "border-lilac/45 bg-lilac/[0.13]", fill: "bg-lilac/25" },
  Leasing: { text: "text-[#a9d4b8]", dot: "bg-[#a9d4b8]", block: "border-[#a9d4b8]/45 bg-[#a9d4b8]/[0.13]", fill: "bg-[#a9d4b8]/25" },
  Receptionist: { text: "text-[#e6c88f]", dot: "bg-[#e6c88f]", block: "border-[#e6c88f]/45 bg-[#e6c88f]/[0.13]", fill: "bg-[#e6c88f]/25" },
};

export function clockLabel(minute: number) {
  const m = Math.floor(minute) % MINUTES;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${h % 12 === 0 ? 12 : h % 12}:${mm}${h < 12 ? "am" : "pm"}`;
}

export function hourLabel(h: number) {
  const hh = h % 24;
  return `${hh % 12 === 0 ? 12 : hh % 12}${hh < 12 ? "am" : "pm"}`;
}

export interface SampleDay {
  ref: React.RefObject<HTMLDivElement | null>;
  /** Minutes after midnight, updated every frame. */
  minute: MotionValue<number>;
  /** Outcomes already reached today. */
  passed: number;
  /** Outcomes reached since the loop started, across days (for feed keys). */
  total: number;
  /** Loops completed; changes at midnight. */
  day: number;
  reduce: boolean;
}

/** Runs the sample day. Reduced motion: the finished day, holding still. */
export function useSampleDay(): SampleDay {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion() ?? false;
  const elapsed = useRef(0);
  const minute = useMotionValue(reduce ? MINUTES - 1 : 0);
  const [state, setState] = useState(() =>
    reduce ? { passed: outcomes.length, total: outcomes.length, day: 0 } : { passed: 0, total: 0, day: 0 },
  );
  const last = useRef(state);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    elapsed.current += Math.min(delta, MAX_FRAME_MS);
    const day = Math.floor(elapsed.current / DAY_MS);
    const now = ((elapsed.current % DAY_MS) / DAY_MS) * MINUTES;
    minute.set(now);
    const passed = outcomes.filter((o) => o.minute <= now).length;
    const total = day * outcomes.length + passed;
    if (total !== last.current.total || passed !== last.current.passed || day !== last.current.day) {
      last.current = { passed, total, day };
      setState(last.current);
    }
  });

  return { ref, minute, reduce, ...state };
}
