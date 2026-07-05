import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { demoAgency } from "@/data/mock-agency";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/onboarding", label: "Onboarding", icon: UserPlus },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/people/carers", label: "People", icon: Users },
];

export function Sidebar({
  onOpenCopilot,
}: {
  onOpenCopilot: () => void;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            L
          </div>
          <div>
            <p className="text-sm font-semibold">Luminocare</p>
            <p className="text-xs text-muted-foreground">{demoAgency.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onOpenCopilot}
          className="flex w-full items-center gap-3 rounded-lg border border-dashed border-primary/30 bg-accent/50 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent"
        >
          <Sparkles className="h-4 w-4" />
          AI Copilot
        </button>
        <p className="mt-2 px-1 text-[11px] text-muted-foreground">
          Prototype · mock data
        </p>
      </div>
    </aside>
  );
}
