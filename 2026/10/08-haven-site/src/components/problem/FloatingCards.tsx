"use client";

import { motion, useReducedMotion } from "motion/react";
import { Chip, DocIcon, MockCard } from "../agent-page/ui";

/** Slow up-and-down drift, offset per card so they never move in step. */
function Float({ children, delay, className }: { children: React.ReactNode; delay: number; className: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`pointer-events-none absolute hidden w-[210px] min-[1400px]:block ${className}`}
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

/**
 * Two small mock cards either side of the problem statement, only on screens wide enough for them to sit
 * beside the 760px text column without covering it: the 2am emergency
 * on the left, the leads coming in on the right. Decorative, so hidden from screen readers.
 */
export function FloatingCards() {
  return (
    <>
      <Float delay={0} className="top-[14%] left-0 -rotate-3">
        <MockCard className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <DocIcon />
            <span className="mr-auto text-[13px] text-ink/80">Unit 4B · leak</span>
            <span className="text-[12px] text-ink/40 tabular-nums">2:14am</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip chip={{ label: "Emergency", tone: "red" }} />
            <Chip chip={{ label: "Plumber dispatched", tone: "green" }} />
          </div>
        </MockCard>
      </Float>
      <Float delay={1.8} className="right-0 bottom-[12%] rotate-2">
        <MockCard className="px-4 py-3.5">
          <p className="text-[12px] font-medium text-heather/85">Leasing · tonight</p>
          <ul className="mt-2.5 flex flex-col gap-2 text-[13px] text-ink/75">
            {[
              ["Zillow lead", "replied in 8s"],
              ["Tour booked", "Sat 11am"],
              ["Application", "complete"],
            ].map(([what, detail]) => (
              <li key={what} className="flex justify-between gap-3">
                <span>{what}</span>
                <span className="text-ink/40">{detail}</span>
              </li>
            ))}
          </ul>
        </MockCard>
      </Float>
    </>
  );
}
