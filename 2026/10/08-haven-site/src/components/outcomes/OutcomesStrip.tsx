"use client";

import { AnimatePresence, motion, useTransform } from "motion/react";
import { outcomes, outcomesNote, workingHours } from "@/content/outcomes";
import { MINUTES, agentColour as laneColour, clockLabel, lanes, useSampleDay } from "./sampleDay";

const ease = [0.16, 1, 0.3, 1] as const;
const FEED_SIZE = 5;

const pct = (minute: number) => `${(minute / MINUTES) * 100}%`;
const at = (k: number) => outcomes[((k % outcomes.length) + outcomes.length) % outcomes.length];

/** The 24 hours as three lanes, one per agent, with the hours outside the team's day shaded. */
function DayStrip({ passed, playhead }: { passed: number; playhead: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr] gap-x-4 sm:grid-cols-[96px_1fr]">
      <ul className="hidden flex-col justify-around text-[12px] sm:flex" aria-hidden>
        {lanes.map((lane) => (
          <li key={lane} className={laneColour[lane].text}>
            {lane}
          </li>
        ))}
      </ul>
      <div>
        <div className="relative h-[96px] overflow-hidden rounded-xl border border-white/[0.07]">
          <div className="absolute inset-y-0 left-0 bg-lilac/[0.07]" style={{ width: pct(workingHours.start) }} />
          <div className="absolute inset-y-0 right-0 bg-lilac/[0.07]" style={{ left: pct(workingHours.end) }} />
          <span className="absolute bottom-1.5 left-2 text-[10px] tracking-[0.12em] text-lilac/50 uppercase">After hours</span>
          <span className="absolute right-2 bottom-1.5 text-[10px] tracking-[0.12em] text-lilac/50 uppercase">After hours</span>
          {outcomes.slice(0, passed).map((o) => (
            <motion.span
              key={o.minute}
              aria-hidden
              className={`absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${laneColour[o.agent].dot}`}
              style={{ left: pct(o.minute), top: `${((lanes.indexOf(o.agent) + 1) / (lanes.length + 1)) * 100}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
            />
          ))}
          {playhead}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-white/35 tabular-nums" aria-hidden>
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>12am</span>
        </div>
      </div>
    </div>
  );
}

/**
 * A sample day playing on a loop: the clock runs through 24 hours, each outcome drops onto its agent's lane
 * as its time passes and slides into the feed. Only runs on screen; reduced motion shows the finished day.
 */
export function OutcomesStrip() {
  const { ref, minute, passed, total, reduce } = useSampleDay();

  const clock = useTransform(minute, clockLabel);
  const left = useTransform(minute, (m) => pct(m));
  // Newest first. Before the first outcome of the day, the feed shows the end of the previous one.
  const feed = Array.from({ length: FEED_SIZE }, (_, i) => total - 1 - i);

  return (
    <div ref={ref} className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-5 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-[13px] text-white/60">
          <span className="size-2 animate-pulse rounded-full bg-[#a9d4b8]" aria-hidden />
          Agents working
        </p>
        <motion.p className="text-[22px] font-light tracking-[-0.02em] text-white tabular-nums">{clock}</motion.p>
      </div>

      <DayStrip
        passed={passed}
        playhead={
          !reduce && <motion.span aria-hidden className="absolute inset-y-0 w-px bg-white/45" style={{ left }} />
        }
      />

      <ul className="mt-6 flex flex-col" aria-live="off">
        <AnimatePresence initial={false} mode="popLayout">
          {feed.map((k) => {
            const o = at(k);
            return (
              <motion.li
                key={k}
                layout
                initial={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                transition={{ duration: 0.55, ease }}
                className="grid grid-cols-[64px_1fr] items-baseline gap-x-4 gap-y-0.5 border-t border-white/[0.07] py-3 sm:grid-cols-[64px_96px_1fr_auto]"
              >
                <span className="text-[13px] text-white/40 tabular-nums">{clockLabel(o.minute)}</span>
                <span className={`text-[13px] ${laneColour[o.agent].text} max-sm:col-start-2 max-sm:row-start-2`}>{o.agent}</span>
                <span className="text-[15px] text-white/85 max-sm:col-start-2 max-sm:row-start-1">{o.text}</span>
                <span className="hidden text-[13px] text-white/35 sm:block">{o.place}</span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <p className="mt-2 border-t border-white/[0.07] pt-4 text-[12px] text-white/35">{outcomesNote}</p>
    </div>
  );
}
