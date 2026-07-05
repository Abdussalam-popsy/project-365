import { Car, Clock, FileWarning } from "lucide-react";
import type { Candidate } from "@/data/types";
import { missingDocuments } from "@/data/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function CandidateCard({
  candidate,
  selected,
  onClick,
}: {
  candidate: Candidate;
  selected?: boolean;
  onClick: () => void;
}) {
  const missing = missingDocuments(candidate);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border bg-card p-3 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">{candidate.name}</p>
        {missing.length > 0 && (
          <FileWarning className="h-3.5 w-3.5 shrink-0 text-warning" />
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{candidate.area}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {candidate.isDriver && (
          <Badge variant="outline" className="gap-1">
            <Car className="h-3 w-3" /> Driver
          </Badge>
        )}
        {missing.length > 0 && (
          <Badge variant="warning">Missing {missing.join(", ")}</Badge>
        )}
      </div>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        {candidate.daysInStage}d in stage
      </p>
    </button>
  );
}
