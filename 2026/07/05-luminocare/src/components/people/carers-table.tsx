import { useState } from "react";
import type { Carer } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Car, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const REGION_COLORS: Record<string, string> = {
  Arnold: "bg-blue-100 text-blue-700",
  Beeston: "bg-purple-100 text-purple-700",
  "West Bridgford": "bg-emerald-100 text-emerald-700",
};

const TYPE_VARIANT: Record<
  string,
  { label: string; className: string }
> = {
  permanent: { label: "Permanent", className: "bg-green-50 text-green-700 border-green-200" },
  student: { label: "Student", className: "bg-sky-50 text-sky-700 border-sky-200" },
  sponsored: { label: "Sponsored", className: "bg-orange-50 text-orange-700 border-orange-200" },
};

function Avatar({ name, region }: { name: string; region: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const color = REGION_COLORS[region] ?? "bg-muted text-muted-foreground";
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        color,
      )}
    >
      {initials}
    </div>
  );
}

function HoursBar({ scheduled, cap }: { scheduled: number; cap: number }) {
  const pct = Math.min(Math.round((scheduled / cap) * 100), 100);
  const barColor =
    pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-1.5 rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {scheduled}/{cap}h
      </span>
    </div>
  );
}

export function CarersTable({ carers }: { carers: Carer[] }) {
  const [search, setSearch] = useState("");

  const filtered = carers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.region.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search carers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Carer</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Phone</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((carer) => {
              const type = TYPE_VARIANT[carer.employmentType];
              return (
                <tr
                  key={carer.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-default"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={carer.name} region={carer.region} />
                      <span className="font-medium">{carer.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        REGION_COLORS[carer.region] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {carer.region}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        type?.className,
                      )}
                    >
                      {type?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {carer.isDriver ? (
                      <Badge variant="outline" className="gap-1">
                        <Car className="h-3 w-3" /> Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <HoursBar
                      scheduled={carer.weeklyHoursScheduled}
                      cap={carer.weeklyHoursCap}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {carer.phone}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No carers match "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
