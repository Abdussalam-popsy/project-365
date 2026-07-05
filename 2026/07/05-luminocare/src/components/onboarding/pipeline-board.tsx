import type { Candidate, OnboardingStage } from "@/data/types";
import { ONBOARDING_STAGES } from "@/data/types";
import { CandidateCard } from "./candidate-card";
import { cn } from "@/lib/utils";

export function PipelineBoard({
  candidates,
  selectedId,
  onSelect,
}: {
  candidates: Candidate[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid flex-1 grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {ONBOARDING_STAGES.map((stage) => {
        const stageCandidates = candidates.filter((c) => c.stage === stage.id);
        return (
          <div
            key={stage.id}
            className="flex min-h-[420px] flex-col rounded-xl border border-border bg-muted/30"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stage.label}
              </span>
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium",
                  stageCandidates.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {stageCandidates.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
              {stageCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={selectedId === candidate.id}
                  onClick={() => onSelect(candidate.id)}
                />
              ))}
              {stageCandidates.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Empty
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type { OnboardingStage };
