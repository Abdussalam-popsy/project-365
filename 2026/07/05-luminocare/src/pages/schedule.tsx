import { useState } from "react";
import type { Call } from "@/data/types";
import { calls } from "@/data/mock-agency";
import { WeekView } from "@/components/scheduling/week-view";
import { CoverPanel } from "@/components/scheduling/cover-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Pilot: single fixed week starting Mon 6 Jul 2026
const WEEK_START = new Date(2026, 6, 6); // Jul 6 2026

function addWeeks(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n * 7);
  return d;
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates(monday: Date): { short: string; label: string }[] {
  return DAY_NAMES.map((short, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const label = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return { short, label };
  });
}

export function SchedulePage() {
  const [coverCall, setCoverCall] = useState<Call | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const monday = addWeeks(WEEK_START, weekOffset);
  const weekDates = getWeekDates(monday);
  const gaps = calls.filter(
    (c) => c.status === "gap" || c.status === "cancelled",
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Schedule
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatWeekLabel(monday)} · Read-only view + cover actions
              </p>
            </div>
            {gaps.length > 0 && (
              <Badge variant="danger">{gaps.length} need cover</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset((o) => o - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekOffset(0)}
              className="px-3"
            >
              This week
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeekOffset((o) => o + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <WeekView
          calls={calls}
          weekDates={weekDates}
          onFindCover={(call) => {
            setCoverCall(call);
          }}
        />
      </div>

      <CoverPanel
        call={coverCall}
        open={!!coverCall}
        onOpenChange={(open) => !open && setCoverCall(null)}
      />
    </div>
  );
}
