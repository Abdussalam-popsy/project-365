"use client";

import { motion } from "motion/react";
import type { CallSample } from "@/content/agents/types";
import { PhoneIcon } from "../PhoneIcon";
import { useLoopedSequence } from "./motion/useLoopedSequence";

const ease = [0.16, 1, 0.3, 1] as const;
const LINE_MS = 2600;
const BAR_COUNT = 42;
/** Fixed bar heights (no Math.random, so server and browser render the same markup). */
const bars = Array.from({ length: BAR_COUNT }, (_, i) => Math.round(30 + 70 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.31))));

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * A call playing "live" on a loop: the waveform moves while someone speaks (lilac for Haven, white for the caller),
 * the transcript writes itself line by line, a timer counts up, and the outcome appears when the call ends.
 * It's a simulation until there's a real recording to sync to. Reduced motion: the finished call, still.
 */
export function CallTranscript({ sample }: { sample: CallSample }) {
  const { ref, step } = useLoopedSequence(sample.lines.length, { stepMs: LINE_MS, holdMs: 3600 });
  const ended = step >= sample.lines.length;
  const speaking = ended ? null : sample.lines[step];
  const seconds = Math.round((Math.min(step, sample.lines.length) * LINE_MS) / 1000);

  return (
    <div ref={ref} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid size-11 place-items-center rounded-full bg-lilac/15 text-lilac">
          <PhoneIcon />
        </span>
        <div className="mr-auto">
          <p className="text-[16px] text-white">{sample.title}</p>
          <p className="text-[13px] text-white/45">{sample.when}</p>
        </div>
        <div className="text-right">
          {ended ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
              <p className="text-[12px] tracking-[0.12em] text-white/40 uppercase">Outcome</p>
              <p className="text-[14px] text-lilac">{sample.outcome}</p>
            </motion.div>
          ) : (
            <p className="flex items-center gap-2 text-[13px] text-white/60 tabular-nums">
              <span className="size-2 animate-pulse rounded-full bg-[#e07a86]" aria-hidden />
              Live · {clock(seconds)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex h-12 items-center gap-[3px] border-y border-white/10 py-2" aria-hidden>
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className={`flex-1 rounded-full transition-colors duration-500 ${speaking?.haven ? "bg-lilac/80" : speaking ? "bg-white/55" : "bg-white/15"}`}
            style={{ height: `${h}%` }}
            animate={speaking ? { scaleY: [0.35, 1, 0.5 + (i % 4) * 0.12, 0.35] } : { scaleY: 0.2 }}
            transition={speaking ? { duration: 0.8 + (i % 6) * 0.07, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
          />
        ))}
      </div>

      <ol className="mt-5 flex flex-col gap-4">
        {sample.lines.map((line, i) => {
          const shown = i < step || (i === step && !ended);
          const current = i === step && !ended;
          return (
            <motion.li
              key={i}
              className="grid gap-1 sm:grid-cols-[130px_1fr] sm:gap-4"
              initial={false}
              animate={shown ? { opacity: current ? 1 : 0.7, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 10, filter: "blur(4px)" }}
              transition={{ duration: 0.6, ease }}
            >
              <span className={`text-[13px] ${line.haven ? "text-lilac" : "text-white/45"}`}>{line.speaker}</span>
              <p className={`text-[15px] leading-relaxed ${line.haven ? "text-white" : "text-white/75"}`}>{line.text}</p>
            </motion.li>
          );
        })}
      </ol>

      <p className="mt-6 flex justify-between border-t border-white/10 pt-4 text-[12px] text-white/35">
        <span>{sample.note}</span>
        {sample.duration && <span className="tabular-nums">{sample.duration}</span>}
      </p>
    </div>
  );
}
