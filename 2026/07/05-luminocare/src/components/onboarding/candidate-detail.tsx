import {
  Car,
  Check,
  Copy,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import type { Candidate } from "@/data/types";
import {
  missingDocuments,
  ONBOARDING_STAGES,
  stageLabel,
} from "@/data/types";
import { getCarer, getClient } from "@/data/mock-agency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

function generateBriefing(candidate: Candidate): string {
  const client = candidate.shadowClientId
    ? getClient(candidate.shadowClientId)
    : undefined;
  const carer = candidate.pairingCarerId
    ? getCarer(candidate.pairingCarerId)
    : undefined;

  if (!client || !carer) {
    return "Assign a shadow client and pairing carer to generate briefing.";
  }

  return `Shadow shift briefing — ${candidate.name}

Client: ${client.name}
Address: ${client.address}
${client.medicationSensitive ? "⚠ Medication-sensitive client\n" : ""}
Pair with: ${carer.name} (${carer.phone})
Your contact: ${candidate.phone}

Please arrive 10 mins early. Do not discuss client details outside the visit.`;
}

export function CandidateDetail({
  candidate,
  onClose,
  onOpenCopilot,
}: {
  candidate: Candidate;
  onClose: () => void;
  onOpenCopilot?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const missing = missingDocuments(candidate);
  const shadowClient = candidate.shadowClientId
    ? getClient(candidate.shadowClientId)
    : undefined;
  const pairingCarer = candidate.pairingCarerId
    ? getCarer(candidate.pairingCarerId)
    : undefined;
  const briefing = generateBriefing(candidate);

  async function copyBriefing() {
    await navigator.clipboard.writeText(briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentStageIndex = ONBOARDING_STAGES.findIndex(
    (s) => s.id === candidate.stage,
  );

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-start justify-between border-b border-border p-5">
        <div>
          <h2 className="text-lg font-semibold">{candidate.name}</h2>
          <p className="text-sm text-muted-foreground">
            {stageLabel(candidate.stage)} · {candidate.daysInStage}d in stage
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Stage progress */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pipeline
          </p>
          <div className="flex gap-1">
            {ONBOARDING_STAGES.map((stage, i) => (
              <div
                key={stage.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i <= currentStageIndex ? "bg-primary" : "bg-muted",
                )}
                title={stage.label}
              />
            ))}
          </div>
        </div>

        {/* Intake info */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Intake</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {candidate.area}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> {candidate.phone}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {candidate.email}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {candidate.isDriver && (
                <Badge variant="outline">
                  <Car className="mr-1 h-3 w-3" /> Driver
                </Badge>
              )}
              <Badge variant="outline">
                {candidate.experienceYears}yr experience
              </Badge>
            </div>
            <p className="text-muted-foreground">{candidate.availability}</p>
            {onOpenCopilot && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={onOpenCopilot}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Intake with AI
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {(["dbs", "id", "training"] as const).map((doc) => (
              <div
                key={doc}
                className="flex items-center justify-between text-sm"
              >
                <span className="uppercase">{doc}</span>
                {candidate.documents[doc] ? (
                  <Badge variant="success">
                    <Check className="mr-1 h-3 w-3" /> Received
                  </Badge>
                ) : (
                  <Badge variant="warning">Missing</Badge>
                )}
              </div>
            ))}
            {missing.length > 0 && (
              <p className="pt-1 text-xs text-warning">
                {missing.length} document{missing.length > 1 ? "s" : ""} outstanding
              </p>
            )}
          </CardContent>
        </Card>

        {/* Shadow briefing */}
        {(candidate.stage === "shadow" || candidate.stage === "training_booked") && (
          <Card className="border-primary/20 bg-accent/30">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Shadow briefing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {shadowClient && (
                <div className="text-sm">
                  <p className="font-medium">{shadowClient.name}</p>
                  <p className="text-muted-foreground">{shadowClient.address}</p>
                </div>
              )}
              {pairingCarer && (
                <p className="text-sm text-muted-foreground">
                  Pair with {pairingCarer.name} · {pairingCarer.phone}
                </p>
              )}
              <Separator />
              <pre className="whitespace-pre-wrap rounded-lg bg-card p-3 text-xs leading-relaxed text-muted-foreground">
                {briefing}
              </pre>
              <Button
                className="w-full"
                onClick={copyBriefing}
                disabled={!shadowClient || !pairingCarer}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy briefing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
