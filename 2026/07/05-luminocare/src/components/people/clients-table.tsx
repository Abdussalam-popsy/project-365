import { useState } from "react";
import type { Client } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Pill, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const REGION_COLORS: Record<string, string> = {
  Arnold: "bg-blue-100 text-blue-700",
  Beeston: "bg-purple-100 text-purple-700",
  "West Bridgford": "bg-emerald-100 text-emerald-700",
};

function Avatar({ name, region }: { name: string; region: string }) {
  const initials = name
    .replace(/^(Mr|Mrs|Ms|Dr)\.?\s*/i, "")
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

export function ClientsTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.region.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Alerts</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr
                key={client.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 cursor-default"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={client.name} region={client.region} />
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                          REGION_COLORS[client.region] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {client.region}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="max-w-xs truncate">{client.address}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {client.packageSummary}
                </td>
                <td className="px-4 py-3">
                  {client.medicationSensitive ? (
                    <Badge variant="warning" className="gap-1">
                      <Pill className="h-3 w-3" /> Medication
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No clients match "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
