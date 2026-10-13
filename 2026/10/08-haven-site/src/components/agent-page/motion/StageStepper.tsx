"use client";

import { AnimatePresence, motion } from "motion/react";
import type { StageVisual, TitledText } from "@/content/agents/types";
import { Chip, DateChip, DocIcon, MockCard, MockPanel } from "../ui";
import { AutoStepper } from "./AutoStepper";

const ease = [0.16, 1, 0.3, 1] as const;

interface StageStepperProps {
  stages: TitledText[];
  visuals: StageVisual[];
  /** The record shown beside the steps: a work order, a lead, a call… */
  recordTitle: string;
  recordDate?: string;
  /** What one step is called in the caption ("Stage 2 of 7", "Beat 2 of 4"). */
  stepLabel?: string;
}

/**
 * The stages as an auto-advancing accordion (see AutoStepper), with the work order beside it showing the
 * open stage.
 */
export function StageStepper({ stages, visuals, recordTitle, recordDate, stepLabel = "Stage" }: StageStepperProps) {
  return (
    <AutoStepper
      items={stages}
      renderVisual={(active) => {
        const visual = visuals[active];
        return (
          <MockPanel className="mock-compact">
            <div className="mb-5 flex gap-1.5" aria-hidden>
              {stages.map((stage, i) => (
                <span key={stage.title} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-heather/70" : "bg-night/10"}`} />
              ))}
            </div>
            <MockCard className="px-5 py-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <DocIcon />
                <p className="mr-auto text-[16px] text-ink/85">{recordTitle}</p>
                {recordDate && <DateChip date={recordDate} />}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease }}
                  className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-tray px-4 py-3.5"
                >
                  <span className="text-[15px] text-ink/75">{visual.line}</span>
                  <Chip chip={visual.chip} />
                </motion.div>
              </AnimatePresence>
              <p className="mt-4 text-[13px] text-ink/45">
                {stepLabel} {active + 1} of {stages.length} · {stages[active].title}
              </p>
            </MockCard>
          </MockPanel>
        );
      }}
    />
  );
}
