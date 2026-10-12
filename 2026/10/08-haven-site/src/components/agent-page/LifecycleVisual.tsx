"use client";

import { motion } from "motion/react";
import type { LifecycleStep } from "@/content/agents/types";
import { Chip, DateChip, DocIcon } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;
/** Cards step left and right so the path reads as a journey, not a list. */
const offsets = ["sm:ml-0", "sm:ml-[18%]", "sm:ml-[8%]", "sm:ml-[24%]", "sm:ml-[4%]"];

/** The hero's lifecycle diagram: white work-order cards joined by a thin line, each with its stage label. */
export function LifecycleVisual({ steps }: { steps: LifecycleStep[] }) {
  return (
    <div className="relative rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-5 sm:p-8">
      <ol className="relative flex flex-col gap-3">
        {steps.map((step, i) => (
          <motion.li
            key={step.title}
            className={`relative ${offsets[i % offsets.length]}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 + i * 0.18, ease }}
          >
            <div className="mb-2 flex items-center gap-2 pl-4">
              <span className="h-4 w-px bg-white/20" aria-hidden />
              <Chip chip={step.label} onDark />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] sm:w-fit">
              <DocIcon />
              <span className="text-[15px] text-ink">{step.title}</span>
              <DateChip date={step.date} />
              {step.status && <Chip chip={step.status} />}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
