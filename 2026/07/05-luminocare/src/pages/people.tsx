import { NavLink } from "react-router-dom";
import { carers, clients } from "@/data/mock-agency";
import { CarersTable } from "@/components/people/carers-table";
import { ClientsTable } from "@/components/people/clients-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function PeopleCarersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">People</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Carers and clients — manual entry in pilot
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4" /> Add carer
          </Button>
        </div>
        <PeopleTabs active="carers" />
      </header>
      <div className="flex-1 p-8">
        <CarersTable carers={carers} />
      </div>
    </div>
  );
}

export function PeopleClientsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">People</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Carers and clients — manual entry in pilot
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4" /> Add client
          </Button>
        </div>
        <PeopleTabs active="clients" />
      </header>
      <div className="flex-1 p-8">
        <ClientsTable clients={clients} />
      </div>
    </div>
  );
}

function PeopleTabs({ active }: { active: "carers" | "clients" }) {
  const tabs = [
    { id: "carers" as const, label: `Carers (${carers.length})`, to: "/people/carers" },
    { id: "clients" as const, label: `Clients (${clients.length})`, to: "/people/clients" },
  ];

  return (
    <div className="mt-4 flex gap-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.to}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            active === tab.id
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
