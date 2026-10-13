"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Chip, MockCard } from "../../agent-page/ui";
import type { Activity, ActivityStep, Channel } from "./houseActivity";

const ease = [0.16, 1, 0.3, 1] as const;
/** Gap between beats; Haven's replies sit behind a typing indicator for one beat first. */
const BEAT_MS = 950;

const channelLabel: Record<Channel, string> = { text: "Text", call: "Call", email: "Email" };

/**
 * A small window onto Haven at work: the message that came in, Haven "typing", its reply, then the outcome.
 * It plays once each time it opens; reduced motion shows the finished exchange at once.
 */
export function ActivityCard({ activity }: { activity: Activity }) {
  const reduce = useReducedMotion();
  const total = activity.steps.length;
  const [shown, setShown] = useState(reduce ? total : 0);

  useEffect(() => {
    if (reduce || shown >= total) return;
    const id = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 350 : BEAT_MS);
    return () => clearTimeout(id);
  }, [reduce, shown, total]);

  const next = activity.steps[shown];
  const typing = !reduce && next !== undefined && "from" in next && next.from === "haven";

  return (
    <MockCard className="w-[272px] px-3.5 pt-3 pb-3.5">
      <div className="flex items-center gap-2 border-b border-ink/[0.06] pb-2.5">
        <ChannelIcon channel={activity.channel} />
        <span className="text-[12px] font-medium text-ink/80">{channelLabel[activity.channel]}</span>
        <span className="mr-auto truncate text-[12px] text-ink/45">{activity.with}</span>
        <span className="text-[11px] text-ink/40 tabular-nums">{activity.time}</span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {activity.steps.slice(0, shown).map((step, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
              className={rowClass(step)}
            >
              <Step step={step} />
            </motion.div>
          ))}
          {typing && (
            <motion.div key="typing" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-end">
              <TypingDots />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MockCard>
  );
}

const rowClass = (step: ActivityStep) => ("status" in step ? "pt-0.5" : step.from === "haven" ? "flex justify-end" : "flex justify-start");

function Step({ step }: { step: ActivityStep }) {
  if ("status" in step) return <Chip chip={step.status} />;
  const haven = step.from === "haven";
  return (
    <p
      className={`max-w-[88%] rounded-2xl px-3 py-2 text-[12.5px] leading-[1.35] ${
        haven ? "rounded-br-md bg-heather text-white" : "rounded-bl-md bg-bubble text-ink/85"
      }`}
    >
      {step.text}
    </p>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1 rounded-2xl rounded-br-md bg-heather/15 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-heather"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

function ChannelIcon({ channel }: { channel: Channel }) {
  const paths: Record<Channel, string> = {
    text: "M3 4.5h10v6.5H7l-3 2.5V11H3z",
    call: "M5.5 2.5 7 5.5 5.6 6.6a7 7 0 0 0 3.8 3.8L10.5 9l3 1.5-.5 2.2A1.5 1.5 0 0 1 11.6 14 10.6 10.6 0 0 1 2 4.4a1.5 1.5 0 0 1 1.3-1.4z",
    email: "M2.5 4h11v8h-11zM2.5 4.5 8 8.5l5.5-4",
  };
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-heather">
      <path d={paths[channel]} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
