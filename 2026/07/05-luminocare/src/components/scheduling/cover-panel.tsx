import { useState } from "react";
import { Car, Check, Copy, MapPin, RefreshCw } from "lucide-react";
import type { Call } from "@/data/types";
import { getClient } from "@/data/mock-agency";
import { draftCoverMessage, rankCoverCandidates } from "@/lib/cover-match";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function CoverPanel({
  call,
  open,
  onOpenChange,
}: {
  call: Call | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedCarerId, setSelectedCarerId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  if (!call) return null;

  const client = getClient(call.clientId);
  if (!client) return null;

  const suggestions = rankCoverCandidates(call, client);
  const selected = suggestions.find((s) => s.carer.id === selectedCarerId);
  const message = selected
    ? draftCoverMessage(selected.carer, client, call)
    : "";

  async function copyMessage() {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-lg">
        <SheetHeader>
          <SheetTitle>Find cover</SheetTitle>
          <SheetDescription>
            {call.day} {call.time} · {client.name} · {client.region}
            {call.requiresDriver && " · Driver required"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col overflow-hidden px-5 pb-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Suggested carers</p>
            <Button variant="ghost" size="sm" className="text-xs">
              <RefreshCw className="h-3 w-3" /> Regenerate
            </Button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {suggestions.slice(0, 5).map((suggestion, i) => (
              <button
                key={suggestion.carer.id}
                type="button"
                onClick={() => {
                  setSelectedCarerId(suggestion.carer.id);
                  setSent(false);
                  setCopied(false);
                }}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-all",
                  selectedCarerId === suggestion.carer.id
                    ? "border-primary bg-accent ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/30",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {i + 1}. {suggestion.carer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.carer.region} ·{" "}
                      {suggestion.carer.weeklyHoursCap -
                        suggestion.carer.weeklyHoursScheduled}
                      h available
                    </p>
                  </div>
                  {suggestion.carer.isDriver && (
                    <Badge variant="outline">
                      <Car className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {suggestion.reasons.map((r) => (
                    <Badge key={r} variant="success" className="text-[10px]">
                      {r}
                    </Badge>
                  ))}
                  {suggestion.warnings.map((w) => (
                    <Badge key={w} variant="warning" className="text-[10px]">
                      {w}
                    </Badge>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="mb-2 text-sm font-medium">Message draft</p>
                <div className="rounded-xl border border-border bg-muted/50 p-3 text-sm leading-relaxed">
                  {message}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={copyMessage}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy message
                      </>
                    )}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setSent(true)}
                    disabled={sent}
                  >
                    {sent ? "Marked sent" : "Mark as sent"}
                  </Button>
                </div>
                {sent && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-success">
                    <Check className="h-3 w-3" />
                    Audit trail recorded (mock)
                  </p>
                )}
              </div>
            </>
          )}

          <p className="mt-4 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            Rules-based ranking · AI layer replaces this in platform
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
