import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus } from "lucide-react";
import { candidates as allCandidates } from "@/data/mock-agency";
import { PipelineBoard } from "@/components/onboarding/pipeline-board";
import { CandidateDetail } from "@/components/onboarding/candidate-detail";
import { Button } from "@/components/ui/button";

type OutletContext = { openCopilot: () => void };

export function OnboardingPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>("p6");
  const { openCopilot } = useOutletContext<OutletContext>();
  const selected = allCandidates.find((c) => c.id === selectedId);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-8 py-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {allCandidates.filter((c) => c.stage !== "live").length} candidates
            in pipeline
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Add candidate
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex-1 overflow-x-auto p-6">
          <PipelineBoard
            candidates={allCandidates.filter((c) => c.stage !== "live")}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        {selected && (
          <CandidateDetail
            candidate={selected}
            onClose={() => setSelectedId(undefined)}
            onOpenCopilot={openCopilot}
          />
        )}
      </div>
    </div>
  );
}
