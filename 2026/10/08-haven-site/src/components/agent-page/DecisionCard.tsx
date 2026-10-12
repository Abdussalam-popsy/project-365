import type { Decision } from "@/content/agents/types";
import { MockCard } from "./ui";

/** A decision the agent prepared but won't take itself, with the buttons a person would press. */
export function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <MockCard className="px-5 py-4">
      <p className="flex items-center gap-2 text-[13px] font-medium text-plum-800/80">
        <span className="size-1.5 rounded-full bg-violet" aria-hidden />
        {decision.heading}
      </p>
      <p className="mt-2 text-[17px] text-ink">{decision.title}</p>
      <p className="mt-0.5 text-[13px] text-ink/50">{decision.meta}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-lg bg-violet px-3.5 py-1.5 text-[13px] font-medium text-white">{decision.primary}</span>
        {decision.secondary.map((label) => (
          <span key={label} className="rounded-lg border border-ink/10 px-3.5 py-1.5 text-[13px] text-ink/60">
            {label}
          </span>
        ))}
      </div>
    </MockCard>
  );
}
