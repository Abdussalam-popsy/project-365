"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ChatMessage, StatusTimeline } from "@/content/agents/types";
import { ChatBubble, bubbleSide } from "../ChatThread";
import { Chip, DocIcon, MockCard, MockPanel } from "../ui";
import { useLoopedSequence } from "./useLoopedSequence";

const ease = [0.16, 1, 0.3, 1] as const;

/** The chip that applies once `shown` messages are visible: the last entry whose `from` has been reached. */
function currentStatus(order: StatusTimeline, shown: number) {
  return [...order.status].reverse().find((s) => shown >= s.from)?.chip ?? order.status[0].chip;
}

/** The "Thread" record card peeking in from the right edge, as in the client's mock. */
function ThreadPeek({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute top-[34%] -right-10 hidden w-[150px] sm:block"
      initial={false}
      animate={{ x: visible ? 0 : 60, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8, ease }}
      aria-hidden
    >
      <MockCard className="px-5 py-4">
        <p className="text-[13px] font-medium text-heather/85">Thread</p>
        <div className="mt-3 flex flex-col gap-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="flex gap-1.5">
              <span className="h-2 w-12 rounded-full bg-ink/[0.07]" />
              <span className="h-2 flex-1 rounded-full bg-ink/[0.07]" />
            </span>
          ))}
        </div>
      </MockCard>
    </motion.div>
  );
}

/**
 * Vendor and resident agree a time in Haven's thread, played on a loop: messages arrive one by one,
 * the work order's status chip updates as they do, and the thread record slides in at the edge.
 */
export function ScheduleThreadMotion({ messages, order }: { messages: ChatMessage[]; order: StatusTimeline }) {
  const { ref, step, cycle } = useLoopedSequence(messages.length, { stepMs: 1300 });
  const status = currentStatus(order, step);

  return (
    <div ref={ref}>
      <MockPanel className="relative overflow-hidden">
        <MockCard className="relative z-10 flex items-center gap-3 px-5 py-4">
          <DocIcon />
          <p className="mr-auto text-[16px] whitespace-nowrap text-ink/85">{order.title}</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={status.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
            >
              <Chip chip={status} />
            </motion.span>
          </AnimatePresence>
        </MockCard>

        <ul key={cycle} className="mt-6 flex min-h-[300px] flex-col gap-4 sm:mr-24">
          {messages.map((m, i) => (
            <motion.li
              key={i}
              className={bubbleSide(m)}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={i < step ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 12, filter: "blur(4px)" }}
              transition={{ duration: 0.6, ease }}
            >
              <ChatBubble message={m} />
            </motion.li>
          ))}
        </ul>

        <ThreadPeek visible={step >= 1} />
      </MockPanel>
      <ol className="sr-only">
        {messages.map((m, i) => (
          <li key={i}>{[m.label, m.text].filter(Boolean).join(": ")}</li>
        ))}
      </ol>
    </div>
  );
}
