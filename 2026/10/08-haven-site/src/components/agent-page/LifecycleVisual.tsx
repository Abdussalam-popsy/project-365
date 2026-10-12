"use client";

import type { LifecycleStep } from "@/content/agents/types";
import { SequenceReveal } from "./motion/SequenceReveal";
import { Chip, DateChip, DocIcon, HeroPanel } from "./ui";

/** Cards step left and right so the path reads as a journey, not a list. */
const offsets = ["sm:ml-0", "sm:ml-[18%]", "sm:ml-[8%]", "sm:ml-[24%]", "sm:ml-[4%]"];

/** The hero's lifecycle diagram: white work-order cards joined by stage labels, revealed in order on a loop. */
export function LifecycleVisual({ steps }: { steps: LifecycleStep[] }) {
  return (
    <HeroPanel>
      <SequenceReveal
        as="ul"
        className="flex flex-col gap-3"
        itemClassNames={steps.map((_, i) => offsets[i % offsets.length])}
        items={steps.map((step) => (
          <>
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
          </>
        ))}
      />
    </HeroPanel>
  );
}
