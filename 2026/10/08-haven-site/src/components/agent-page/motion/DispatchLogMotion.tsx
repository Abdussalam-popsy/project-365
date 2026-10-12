"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ChipTone, LogEvent } from "@/content/agents/types";
import { DateChip, MockCard, MockPanel } from "../ui";
import { useLoopedSequence } from "./useLoopedSequence";

const ease = [0.16, 1, 0.3, 1] as const;
const dotTones: Record<ChipTone, string> = {
  red: "bg-[#c9707d]",
  amber: "bg-[#c99a4b]",
  green: "bg-[#6aa07c]",
  violet: "bg-heather",
  neutral: "bg-ink/25",
};

/** Grey placeholder bars, standing in for a row that hasn't happened yet. */
function SkeletonRow({ wide }: { wide: boolean }) {
  return (
    <span className="flex items-center gap-2.5 py-[3px]" aria-hidden>
      <span className="h-2 w-9 rounded-full bg-ink/[0.07]" />
      <span className={`h-2 rounded-full bg-ink/[0.07] ${wide ? "w-40" : "w-28"}`} />
    </span>
  );
}

interface DispatchLogMotionProps {
  heading: string;
  title: string;
  date: string;
  events: LogEvent[];
}

/**
 * The vendor log, played on a loop: the card slides in, then each row turns from a placeholder into the
 * real event, one at a time, as the agent works through the dispatch.
 */
export function DispatchLogMotion({ heading, title, date, events }: DispatchLogMotionProps) {
  const { ref, step, cycle } = useLoopedSequence(events.length, { stepMs: 900 });

  return (
    <div ref={ref}>
      <MockPanel className="relative overflow-hidden">
        <motion.div
          key={cycle}
          initial={{ x: "45%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease }}
        >
          <MockCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink/[0.06] px-5 py-3.5">
              <span className="text-[13px] font-medium text-heather/85">{heading}</span>
              <DateChip date={date} />
            </div>
            <div className="px-5 pt-4 pb-5">
              <p className="text-[16px] text-ink">{title}</p>
              <ol className="relative mt-4 flex flex-col gap-3 border-l border-ink/10 pl-5">
                {events.map((event, i) => {
                  const shown = i < step;
                  return (
                    <li key={event.text} className="relative flex min-h-[20px] items-baseline justify-between gap-4 text-[14px]">
                      <span
                        className={`absolute top-[7px] -left-[24px] size-[7px] rounded-full ring-4 ring-white transition-colors duration-500 ${shown ? dotTones[event.tone ?? "neutral"] : "bg-ink/10"}`}
                        aria-hidden
                      />
                      <AnimatePresence mode="wait" initial={false}>
                        {shown ? (
                          <motion.span
                            key="text"
                            className="flex flex-1 items-baseline justify-between gap-4"
                            initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.45, ease }}
                          >
                            <span className="text-ink/75">{event.text}</span>
                            {event.time && <span className="shrink-0 text-[12px] text-ink/40 tabular-nums">{event.time}</span>}
                          </motion.span>
                        ) : (
                          <motion.span key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            <SkeletonRow wide={i % 2 === 0} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ol>
            </div>
          </MockCard>
        </motion.div>
      </MockPanel>
      {/* Screen readers get the whole log once, not a moving target. */}
      <ol className="sr-only">
        {events.map((event) => (
          <li key={event.text}>{[event.text, event.time].filter(Boolean).join(", ")}</li>
        ))}
      </ol>
    </div>
  );
}
