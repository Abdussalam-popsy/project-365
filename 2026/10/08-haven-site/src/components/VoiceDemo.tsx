"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Eyebrow } from "./SectionHeading";
import { Reveal } from "./Reveal";

const BAR_COUNT = 56;
const bars = Array.from({ length: BAR_COUNT }, (_, i) =>
  Math.round(25 + 75 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23))),
);

export function VoiceDemo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="voice-demo" className="grain relative overflow-hidden bg-ink px-6 py-32 text-white">
      <div className="absolute top-0 left-1/2 -z-0 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/25 blur-[140px]" />
      <Reveal className="relative mx-auto max-w-[760px] text-center">
        <Eyebrow className="text-lilac">Voice demo</Eyebrow>
        <h2 className="mt-4 text-[40px] leading-[1.05] font-light tracking-[-0.035em] sm:text-[56px]">
          Listen to Maintenance AI take a real call.
        </h2>
      </Reveal>

      <Reveal delay={0.15} className="relative mx-auto mt-16 flex max-w-[760px] items-center gap-6 border border-white/15 bg-white/[0.04] p-5 backdrop-blur">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause demo call" : "Play demo call"}
          className="grid size-14 shrink-0 place-items-center bg-violet transition-colors hover:bg-violet-soft"
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="3.5" height="12" /><rect x="9.5" y="2" width="3.5" height="12" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6z" /></svg>
          )}
        </button>
        <div className="flex h-14 flex-1 items-center gap-[3px]">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className="flex-1 bg-lilac/70"
              style={{ height: `${h}%` }}
              animate={playing ? { scaleY: [1, 0.35 + (i % 5) * 0.12, 1] } : { scaleY: 1 }}
              transition={playing ? { duration: 0.9 + (i % 7) * 0.08, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
            />
          ))}
        </div>
        <span className="hidden text-[13px] text-white/55 tabular-nums sm:block">1:42</span>
      </Reveal>
    </section>
  );
}
