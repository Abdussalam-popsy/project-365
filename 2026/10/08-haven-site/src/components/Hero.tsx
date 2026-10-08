"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { hero } from "@/content/site";
import { Button } from "./Button";
import { HavenField } from "./HavenField";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % hero.rotating.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <section className="grain relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-ink px-6 pt-32 pb-20 text-center text-white">
      <HeroBackdrop />

      <motion.p
        className="mb-6 text-[15px] text-lilac/80"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        {hero.lead}
      </motion.p>

      <motion.h1
        className="max-w-[900px] text-[38px] leading-[1.05] font-light tracking-[-0.035em] sm:text-[64px] lg:text-[80px]"
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.1, ease }}
      >
        {hero.prefix}
        <span className="relative block h-[1.15em] overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={hero.rotating[index]}
              className="absolute inset-x-0 whitespace-nowrap text-lilac"
              initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease }}
            >
              {hero.rotating[index]}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.h1>

      <motion.div
        className="mt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease }}
      >
        <Button>Book a demo</Button>
      </motion.div>

      <motion.span
        className="mt-10 block h-32 w-px origin-top bg-gradient-to-b from-white/70 to-white/0"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease }}
        aria-hidden
      />

      <motion.p
        className="mt-8 max-w-[420px] text-lg leading-snug text-white/80 sm:text-[21px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        {hero.sub}
      </motion.p>

      <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-white/55">
        <span className="grid size-4 place-items-center bg-[#f26522] text-[10px] font-semibold text-white">Y</span>
        Backed by Y Combinator
      </p>
    </section>
  );
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,#22145f_0%,#0f0833_55%,#0b062a_80%)]" />
      <HavenField className="absolute inset-0 size-full" params={{ horizon: 0.66, lineOpacity: 0.3 }} />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-[8%] mx-auto h-[38%] max-w-[760px] bg-[radial-gradient(closest-side,rgba(11,6,42,0.75),transparent)]" />
    </div>
  );
}
