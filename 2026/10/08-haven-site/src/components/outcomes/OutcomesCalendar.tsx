"use client";

import { AnimatePresence, motion, useTransform, type MotionValue } from "motion/react";
import { outcomes, outcomesNote, workingHours, type Outcome } from "@/content/outcomes";
import { MINUTES, agentColour, clockLabel, hourLabel, lanes, useSampleDay } from "./sampleDay";

const ease = [0.16, 1, 0.3, 1] as const;
const HOUR_PX = 54;
const DAY_PX = 24 * HOUR_PX;
const VIEW_PX = 440;
/** Where the now line sits in the window while the calendar scrolls with it. */
const NOW_AT = 0.55;
const MIN_BLOCK_PX = 26;

const toPx = (minute: number) => (minute / 60) * HOUR_PX;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export type CalendarLayout = "day" | "team";

const solo: Placement = { lane: 0, lanes: 1 };

/** Minutes a block occupies on screen (short events still get a readable height). */
const span = (o: Outcome) => Math.max(o.duration, (MIN_BLOCK_PX / HOUR_PX) * 60);

interface Placement {
  lane: number;
  lanes: number;
}

/**
 * Side-by-side placement for events that overlap in one column, the way calendar apps lay them out: each
 * event takes the first free lane, and every event in an overlapping group splits the width evenly.
 */
function placeEvents(list: Outcome[]): Map<Outcome, Placement> {
  const placed = new Map<Outcome, Placement>();
  let group: Outcome[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;
  const closeGroup = () => {
    group.forEach((o) => placed.set(o, { lane: placed.get(o)!.lane, lanes: laneEnds.length }));
    group = [];
    laneEnds = [];
  };
  for (const o of list) {
    if (o.minute >= groupEnd) closeGroup();
    let lane = laneEnds.findIndex((end) => end <= o.minute);
    if (lane === -1) lane = laneEnds.push(0) - 1;
    laneEnds[lane] = o.minute + span(o);
    groupEnd = Math.max(groupEnd, o.minute + span(o));
    placed.set(o, { lane, lanes: 1 });
    group.push(o);
  }
  closeGroup();
  return placed;
}

const dayPlacements = placeEvents(outcomes);
const teamPlacements = new Map(lanes.flatMap((lane) => [...placeEvents(outcomes.filter((o) => o.agent === lane))]));

/** One outcome as a calendar event: it appears when the now line reaches it and fills as the work happens. */
function EventBlock({ outcome, minute, place, showTime }: { outcome: Outcome; minute: MotionValue<number>; place: Placement; showTime: boolean }) {
  const fill = useTransform(minute, (m) => clamp01((m - outcome.minute) / outcome.duration));
  const done = useTransform(fill, (f) => (f >= 1 ? 1 : 0));
  const colour = agentColour[outcome.agent];
  return (
    <motion.div
      className={`absolute overflow-hidden rounded-md border px-2 ${colour.block}`}
      style={{
        top: toPx(outcome.minute),
        height: toPx(span(outcome)) - 2,
        left: `calc(${(place.lane / place.lanes) * 100}% + 3px)`,
        width: `calc(${100 / place.lanes}% - 6px)`,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      <motion.span aria-hidden className={`absolute inset-x-0 top-0 h-full origin-top ${colour.fill}`} style={{ scaleY: fill }} />
      <div className="relative flex h-full items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[12px] leading-tight text-white/90">{outcome.text}</p>
        {showTime && <span className={`shrink-0 text-[11px] leading-tight tabular-nums ${colour.text}`}>{clockLabel(outcome.minute)}</span>}
        <motion.span aria-hidden className={`shrink-0 text-[11px] leading-tight ${colour.text}`} style={{ opacity: done }}>
          ✓
        </motion.span>
      </div>
    </motion.div>
  );
}

function HourLines() {
  return (
    <>
      {Array.from({ length: 24 }, (_, h) => (
        <div key={h} aria-hidden className="absolute inset-x-0 border-t border-white/[0.06]" style={{ top: h * HOUR_PX }} />
      ))}
    </>
  );
}

/**
 * A sample day as a calendar. "day": one column, like a calendar's day view, with the team's office hours
 * shaded. "team": a column for your team (office hours only) beside one per agent, so the empty nights in
 * your team's calendar sit next to the agents' full ones. The view scrolls with the now line.
 */
export function OutcomesCalendar({ layout }: { layout: CalendarLayout }) {
  const { ref, minute, passed, day, reduce } = useSampleDay();
  const scrollY = useTransform(minute, (m) => -Math.min(Math.max(toPx(m) - VIEW_PX * NOW_AT, 0), DAY_PX - VIEW_PX));
  const nowTop = useTransform(minute, toPx);
  const nowLabel = useTransform(minute, clockLabel);
  const teamStatus = useTransform(minute, (m): string =>
    m >= workingHours.start && m < workingHours.end ? "· your team is in" : "· your team is off",
  );
  const reached = outcomes.slice(0, passed);
  // Placement uses the whole day, so blocks don't shift sideways when a later overlapping one arrives.
  const placements = layout === "day" ? dayPlacements : teamPlacements;
  const columns = layout === "team" ? (["team", ...lanes] as const) : (["all"] as const);

  return (
    <div ref={ref} className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-[15px] text-white">
          Today <motion.span className="text-white/40">{teamStatus}</motion.span>
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
          {lanes.map((lane) => (
            <li key={lane} className={`flex items-center gap-1.5 ${agentColour[lane].text}`}>
              <span className={`size-1.5 rounded-full ${agentColour[lane].dot}`} aria-hidden />
              {lane}
            </li>
          ))}
        </ul>
      </div>

      {layout === "team" && (
        <div className="grid grid-cols-[44px_repeat(4,1fr)] border-b border-white/[0.07] pb-2 text-[11px] sm:grid-cols-[56px_repeat(4,1fr)] sm:text-[12px]">
          <span />
          <span className="px-1 text-white/50">Your team</span>
          {lanes.map((lane) => (
            <span key={lane} className={`truncate px-1 ${agentColour[lane].text}`}>
              {lane}
            </span>
          ))}
        </div>
      )}

      <div className="relative overflow-hidden" style={{ height: VIEW_PX }}>
        <motion.div className="absolute inset-x-0 top-0" style={{ y: reduce ? -(DAY_PX - VIEW_PX) : scrollY, height: DAY_PX }}>
          <div
            className={`grid h-full ${layout === "team" ? "grid-cols-[44px_repeat(4,1fr)] sm:grid-cols-[56px_repeat(4,1fr)]" : "grid-cols-[44px_1fr] sm:grid-cols-[56px_1fr]"}`}
          >
            {/* Hour gutter. */}
            <div className="relative">
              {Array.from({ length: 24 }, (_, h) => (
                <span key={h} className="absolute right-2 -translate-y-1/2 text-[10px] text-white/30 tabular-nums sm:text-[11px]" style={{ top: h * HOUR_PX }}>
                  {h === 0 ? "" : hourLabel(h)}
                </span>
              ))}
            </div>

            {columns.map((col) => (
              <div key={col} className="relative border-l border-white/[0.06]">
                <HourLines />
                {(col === "team" || col === "all") && (
                  <div
                    className={`absolute inset-x-1 rounded-lg ${col === "team" ? "border border-white/10 bg-white/[0.05] px-2.5 py-1.5" : "bg-white/[0.025]"}`}
                    style={{ top: toPx(workingHours.start), height: toPx(workingHours.end - workingHours.start) }}
                  >
                    <p className={`text-[11px] ${col === "team" ? "text-white/55" : "absolute right-2 top-1.5 text-white/30"}`}>
                      {col === "team" ? "Office hours" : "Your team, in the office"}
                    </p>
                  </div>
                )}
                <AnimatePresence>
                  {col !== "team" &&
                    reached
                      .filter((o) => col === "all" || o.agent === col)
                      .map((o) => <EventBlock key={`${day}-${o.minute}`} outcome={o} minute={minute} place={placements.get(o) ?? solo} showTime={layout === "day"} />)}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {!reduce && (
            <motion.div aria-hidden className="pointer-events-none absolute inset-x-0" style={{ top: nowTop }}>
              <div className="absolute left-[44px] right-0 h-px bg-[#e07a86] sm:left-[56px]" />
              <span className="absolute left-[40px] size-2 -translate-y-1/2 rounded-full bg-[#e07a86] sm:left-[52px]" />
              <motion.span className="absolute left-0 w-[40px] -translate-y-1/2 rounded bg-night pr-1 text-right text-[10px] font-medium text-[#e07a86] tabular-nums sm:w-[50px] sm:text-[11px]">
                {nowLabel}
              </motion.span>
            </motion.div>
          )}
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#141016] to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#141016] to-transparent" />
      </div>
      <p className="mt-3 border-t border-white/[0.07] px-1 pt-3 text-[12px] text-white/35">{outcomesNote}</p>
    </div>
  );
}
