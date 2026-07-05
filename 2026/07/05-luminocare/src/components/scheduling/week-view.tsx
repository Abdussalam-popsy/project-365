import { AlertTriangle, Car, CheckCircle2, Users, XCircle } from "lucide-react";
import type { Call } from "@/data/types";
import { getCarer, getClient } from "@/data/mock-agency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusConfig = {
  covered: {
    icon: CheckCircle2,
    label: "Covered",
    variant: "success" as const,
    row: "border-border bg-card",
  },
  gap: {
    icon: AlertTriangle,
    label: "Gap",
    variant: "warning" as const,
    row: "border-amber-200 bg-amber-50/50",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    variant: "danger" as const,
    row: "border-red-200 bg-red-50/50",
  },
};

export function CallRow({
  call,
  onFindCover,
}: {
  call: Call;
  onFindCover: (call: Call) => void;
}) {
  const client = getClient(call.clientId);
  const carers = call.carerIds.map(getCarer).filter(Boolean);
  const config = statusConfig[call.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors",
        config.row,
      )}
    >
      <div className="w-16 shrink-0">
        <p className="text-sm font-semibold tabular-nums">{call.time}</p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{client?.name ?? "Unknown client"}</p>
          <Badge variant="outline">{client?.region}</Badge>
          {call.isDouble && (
            <Badge variant="outline">
              <Users className="mr-1 h-3 w-3" /> Double
            </Badge>
          )}
          {call.requiresDriver && (
            <Badge variant="outline">
              <Car className="mr-1 h-3 w-3" /> Driver
            </Badge>
          )}
          {call.runLabel && (
            <span className="text-xs text-muted-foreground">{call.runLabel}</span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {carers.length > 0
            ? carers.map((c) => c!.name).join(" + ")
            : call.cancelledBy
              ? `Cancelled by ${call.cancelledBy}`
              : "Unassigned"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Badge variant={config.variant}>
          <Icon className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>
        {(call.status === "gap" || call.status === "cancelled") && (
          <Button size="sm" onClick={() => onFindCover(call)}>
            Find cover
          </Button>
        )}
      </div>
    </div>
  );
}

export function WeekView({
  calls,
  weekDates,
  onFindCover,
}: {
  calls: Call[];
  weekDates: { short: string; label: string }[];
  onFindCover: (call: Call) => void;
}) {
  return (
    <div className="space-y-6">
      {weekDates.map(({ short, label }) => {
        const dayCalls = calls.filter((c) => c.day === short);
        if (dayCalls.length === 0) return null;
        return (
          <section key={short}>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
              {label}
            </h3>
            <div className="space-y-2">
              {dayCalls.map((call) => (
                <CallRow key={call.id} call={call} onFindCover={onFindCover} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
