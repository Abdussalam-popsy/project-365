"use client";

import { motion, useReducedMotion } from "motion/react";

type IconName = "moon" | "call" | "stack";

/** Tile colours from the palette: each icon gets its own, so the three read as a set. */
const tiles: Record<IconName, string> = {
  moon: "bg-night text-lilac",
  call: "bg-heather text-page",
  stack: "bg-orchid text-page",
};

/** A moon that rocks gently while two stars twinkle. */
function Moon({ still }: { still: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[60%]" fill="none" aria-hidden>
      <motion.path
        d="M15.5 4.5a7.5 7.5 0 1 0 4 13.6A8.5 8.5 0 0 1 15.5 4.5Z"
        fill="currentColor"
        style={{ originX: "50%", originY: "50%" }}
        animate={still ? undefined : { rotate: [-10, 8, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {[
        { cx: 19.5, cy: 5.5, delay: 0 },
        { cx: 21, cy: 10, delay: 1.1 },
      ].map((star) => (
        <motion.circle
          key={star.cx}
          cx={star.cx}
          cy={star.cy}
          r="1"
          fill="currentColor"
          animate={still ? undefined : { opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

/** A phone that rings in short bursts, with a small "missed" badge that pops after each ring. */
function Call({ still }: { still: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[60%] overflow-visible" fill="none" aria-hidden>
      <motion.path
        d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        style={{ originX: "50%", originY: "50%" }}
        animate={still ? undefined : { rotate: [0, -14, 12, -10, 8, 0, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.06, 0.12, 0.18, 0.24, 0.3, 1], ease: "easeInOut" }}
      />
      <motion.g
        animate={still ? { scale: 1 } : { scale: [0, 0, 1, 1, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.32, 0.4, 0.9, 1] }}
        style={{ originX: "20px", originY: "4px" }}
      >
        <circle cx="20" cy="4" r="3.6" fill="#c9707d" />
        <path d="m18.6 2.6 2.8 2.8m0-2.8-2.8 2.8" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

/** A stack of papers where the top sheet keeps sliding off and a new one lands. */
function Stack({ still }: { still: boolean }) {
  const sheet = "M7 5h8l3 3v11H7z";
  return (
    <svg viewBox="0 0 24 24" className="size-[62%] overflow-visible" fill="none" aria-hidden>
      <path d={sheet} transform="translate(-2.2 2.2)" fill="currentColor" opacity="0.35" />
      <path d={sheet} transform="translate(-1.1 1.1)" fill="currentColor" opacity="0.6" />
      <motion.g
        animate={still ? undefined : { x: [0, 0, 7, 7, 0], y: [0, 0, -5, -5, 0], opacity: [1, 1, 0, 0, 1], rotate: [0, 0, 14, 14, 0] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.7, 0.85, 1], ease: "easeInOut" }}
        style={{ originX: "50%", originY: "50%" }}
      >
        <path d={sheet} fill="currentColor" />
        <path d="M9.5 11h6M9.5 14h6M9.5 17h4" stroke="var(--color-heather)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      </motion.g>
    </svg>
  );
}

const icons = { moon: Moon, call: Call, stack: Stack };

/** A small rounded tile holding one looping icon, sized to sit inline with the paragraph text. */
export function ProblemIcon({ name }: { name: IconName }) {
  const still = Boolean(useReducedMotion());
  const Icon = icons[name];
  return (
    <span
      className={`mx-[0.12em] inline-grid size-[1.05em] translate-y-[0.12em] place-items-center rounded-[0.26em] shadow-[0_6px_14px_-6px_rgba(30,15,38,0.45)] ${tiles[name]}`}
      aria-hidden
    >
      <Icon still={still} />
    </span>
  );
}
