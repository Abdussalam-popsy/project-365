"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;
const INTERVAL_MS = 2600;

/**
 * The hero's changing words: each phrase slides up and out as the next slides in, every 2.6s.
 * The box is one line tall with overflow hidden, so the swap never shifts the layout.
 * Screen readers get the first phrase once (in the heading's sr-only text), not a new one every few seconds.
 * Reduced motion: the first phrase, still.
 */
export function RotatingWords({ words }: { words: string[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  // A new set of words (day ↔ night) starts again from its first phrase.
  useEffect(() => setIndex(0), [words]);

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduce, words]);

  return (
    <span className="relative block h-[1.1em] overflow-hidden" aria-hidden>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          className="absolute inset-x-0 whitespace-nowrap"
          initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.7, ease }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
