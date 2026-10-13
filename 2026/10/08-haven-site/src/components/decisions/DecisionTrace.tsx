"use client";

import { decisionEvent, decisionTrace, type TraceKind } from "@/content/decisions";
import { SequenceReveal } from "../agent-page/motion/SequenceReveal";
import { Chip, DateChip, DocIcon, MockCard, MockPanel } from "../agent-page/ui";

const kindColour: Record<TraceKind, string> = {
  Read: "text-ink/45",
  Rule: "text-heather",
  Decided: "text-[#4c7a5c]",
  Told: "text-ink/45",
};

/** A logged action with its "Why?" opened: the trace plays in step by step on the site's looping reveal. */
export function DecisionTrace() {
  return (
    <MockPanel>
      <MockCard className="px-5 py-4">
        <div className="flex items-center gap-3">
          <DocIcon />
          <p className="mr-auto text-[15px] text-ink/85">{decisionEvent.title}</p>
          <DateChip date={decisionEvent.time} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <p className="rounded-lg bg-bubble px-3 py-1.5 text-[13px] font-medium text-heather">Why?</p>
          <Chip chip={decisionEvent.chip} />
        </div>
      </MockCard>

      <div className="relative mt-4 pl-[18px]">
        {/* The thread every step hangs off. */}
        <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-heather/20" />
        <SequenceReveal
          as="ul"
          className="flex flex-col gap-2.5"
          stepMs={650}
          holdMs={4200}
          items={decisionTrace.map((step) => (
            <div key={step.text} className="relative">
              <span aria-hidden className="absolute top-1/2 -left-[17px] size-[9px] -translate-y-1/2 rounded-full border-2 border-tray bg-heather/45" />
              <MockCard className="grid grid-cols-[64px_1fr_auto] items-center gap-x-3 px-4 py-3">
                <span className={`text-[12px] font-medium tracking-[0.06em] uppercase ${kindColour[step.kind]}`}>{step.kind}</span>
                <span className="text-[14px] leading-snug text-ink/80">{step.text}</span>
                {step.scope ? <Chip chip={step.scope} /> : <span />}
              </MockCard>
            </div>
          ))}
        />
      </div>
    </MockPanel>
  );
}
