"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { TitledText } from "@/content/agents/types";

const COLUMNS = 3;
const PHASE_MS = 2600;

/**
 * Features as a tight bordered grid (the client's reference). One diagonal of cells is tinted, and the tint
 * steps across the grid on a loop, the same quiet rhythm as the other mocks. Reduced motion: it stays put.
 */
export function FeatureGrid({ items }: { items: TitledText[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !inView) return;
    const timer = setInterval(() => setPhase((p) => (p + 1) % COLUMNS), PHASE_MS);
    return () => clearInterval(timer);
  }, [reduce, inView]);

  return (
    <div ref={ref} className="mt-14 grid border-t border-l border-ink/10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => {
        const row = Math.floor(i / COLUMNS);
        const col = i % COLUMNS;
        const tinted = (row + col + phase) % COLUMNS === 0;
        return (
          <div
            key={item.title}
            className={`border-r border-b border-ink/10 px-6 py-6 transition-colors duration-700 sm:px-7 ${tinted ? "lg:bg-blush" : ""}`}
          >
            <h3 className="text-[17px] font-medium">{item.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/55">{item.body}</p>
          </div>
        );
      })}
    </div>
  );
}
