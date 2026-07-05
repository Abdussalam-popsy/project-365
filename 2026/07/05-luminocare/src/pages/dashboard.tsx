import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { calls, candidates, carers, clients } from "@/data/mock-agency";
import { missingDocuments } from "@/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function KpiBar() {
  const todayCalls = calls.filter((c) => c.day === "Mon");
  const covered = todayCalls.filter((c) => c.status === "covered").length;
  const gaps = todayCalls.filter(
    (c) => c.status === "gap" || c.status === "cancelled",
  ).length;
  const coveragePct =
    todayCalls.length > 0
      ? Math.round((covered / todayCalls.length) * 100)
      : 100;

  const kpis = [
    {
      label: "Calls today",
      value: todayCalls.length,
      sub: "Monday 6 Jul",
      color: "text-foreground",
    },
    {
      label: "Coverage",
      value: `${coveragePct}%`,
      sub: `${covered} covered`,
      color: coveragePct < 80 ? "text-danger" : "text-success",
    },
    {
      label: "Gaps today",
      value: gaps,
      sub: gaps > 0 ? "need cover" : "all clear",
      color: gaps > 0 ? "text-warning" : "text-success",
    },
    {
      label: "Active carers",
      value: carers.length,
      sub: `${clients.length} clients`,
      color: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-xl border border-border bg-card px-4 py-3"
        >
          <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
          <p className={cn("mt-1 text-2xl font-semibold tabular-nums", k.color)}>
            {k.value}
          </p>
          <p className="text-xs text-muted-foreground">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const inPipeline = candidates.filter((c) => c.stage !== "live");
  const missingDbs = candidates.filter((c) => !c.documents.dbs);
  const allGaps = calls.filter(
    (c) => c.status === "gap" || c.status === "cancelled",
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Week of 6 Jul 2026 · What needs attention today
        </p>
      </header>

      <div className="flex-1 space-y-8 p-8">
        <KpiBar />

        <div className="grid gap-4 sm:grid-cols-3">
          <Link to="/onboarding">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Onboarding
                </CardTitle>
                <UserPlus className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{inPipeline.length}</p>
                <p className="text-sm text-muted-foreground">
                  {missingDbs.length} missing DBS
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/schedule">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Needs cover
                </CardTitle>
                <XCircle className="h-4 w-4 text-danger" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{allGaps.length}</p>
                <p className="text-sm text-muted-foreground">
                  gaps & cancellations
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/people/carers">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  People
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{carers.length}</p>
                <p className="text-sm text-muted-foreground">
                  {clients.length} clients
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Attention items</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/schedule">
                View schedule <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            {allGaps.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                <span>
                  <strong>
                    {call.day} {call.time}
                  </strong>{" "}
                  — {call.status === "cancelled" ? "Cancelled" : "Gap"} · needs
                  cover
                </span>
                <Button size="sm" variant="outline" className="ml-auto" asChild>
                  <Link to="/schedule">Find cover</Link>
                </Button>
              </div>
            ))}
            {candidates
              .filter((c) => missingDocuments(c).length > 0)
              .slice(0, 3)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
                >
                  <UserPlus className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <strong>{c.name}</strong> — missing{" "}
                    {missingDocuments(c).join(", ")}
                  </span>
                  <Button size="sm" variant="outline" className="ml-auto" asChild>
                    <Link to="/onboarding">View</Link>
                  </Button>
                </div>
              ))}
            {allGaps.length === 0 &&
              candidates.filter((c) => missingDocuments(c).length > 0)
                .length === 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  All clear — no urgent items today
                </div>
              )}
          </div>
        </section>
      </div>
    </div>
  );
}
