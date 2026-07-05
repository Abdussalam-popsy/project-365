import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { CopilotDrawer } from "./copilot-drawer";

export function AppShell() {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onOpenCopilot={() => setCopilotOpen(true)} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet context={{ openCopilot: () => setCopilotOpen(true) }} />
      </main>
      <CopilotDrawer open={copilotOpen} onOpenChange={setCopilotOpen} />
    </div>
  );
}
