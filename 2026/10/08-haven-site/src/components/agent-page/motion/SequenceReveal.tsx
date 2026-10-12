"use client";

import { motion } from "motion/react";
import { useLoopedSequence } from "./useLoopedSequence";

const ease = [0.16, 1, 0.3, 1] as const;

interface SequenceRevealProps {
  /** The pieces to reveal, in order (chat bubbles, cards, chip rows…). */
  items: React.ReactNode[];
  /** Optional class per item, e.g. to align a bubble right or offset a card. */
  itemClassNames?: string[];
  className?: string;
  stepMs?: number;
  holdMs?: number;
  /** Rendered as a <ul>/<li> list when the items are a sequence screen readers should hear as one. */
  as?: "div" | "ul";
}

/**
 * The one looping reveal every agent-page mock uses: items fade and rise in one at a time, the finished
 * state holds, everything fades back out, and it plays again. Same timing and easing everywhere, so the
 * page reads as one system. Only runs on screen; reduced motion shows the finished state.
 */
export function SequenceReveal({ items, itemClassNames = [], className = "", stepMs = 1000, holdMs = 2800, as = "div" }: SequenceRevealProps) {
  const { ref, step } = useLoopedSequence(items.length, { stepMs, holdMs });
  const Wrapper = as === "ul" ? motion.ul : motion.div;
  const Item = as === "ul" ? motion.li : motion.div;

  return (
    <div ref={ref}>
      <Wrapper className={className}>
        {items.map((item, i) => (
          <Item
            key={i}
            className={itemClassNames[i] ?? ""}
            initial={false}
            animate={i < step ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 12, filter: "blur(4px)" }}
            transition={{ duration: 0.6, ease }}
          >
            {item}
          </Item>
        ))}
      </Wrapper>
    </div>
  );
}
