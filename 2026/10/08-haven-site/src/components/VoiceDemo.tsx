"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SectionGlow } from "./SectionGlow";
import { SectionIntro } from "./SectionHeading";
import { Reveal } from "./Reveal";

const BAR_COUNT = 56;
const bars = Array.from({ length: BAR_COUNT }, (_, i) =>
  Math.round(25 + 75 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23))),
);

export function VoiceDemo() {
  const [playing, setPlaying] = useState(false);

  return (
    <section id="voice-demo" className="grain relative overflow-hidden bg-night px-6 py-32 text-white">
      {/* Plum glow from the brand's own family (ink → lilac). Adjust it with the Glow editor (dev tools). */}
      <SectionGlow id="voice" />
      <SectionIntro eyebrow="Voice demo" title="Listen to Maintenance AI take a real call." align="center" dark className="relative" />

      <Reveal delay={0.15} className="relative mx-auto mt-16 flex max-w-[760px] items-center gap-6 rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause demo call" : "Play demo call"}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-page text-ink transition-colors hover:bg-lilac"
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
